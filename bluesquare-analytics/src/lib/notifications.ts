import "server-only";
import { randomUUID } from "node:crypto";
import { query } from "./db";
import { canAccess, canOpenFinanceTab, type Department } from "./departments";
import { money } from "./format";
import { today, TZ } from "./period";
import { isPlatform, PLATFORMS } from "./platforms";

// Personal notifications (LuxHotel's records notify through lux-feeds). Events are sent as they happen, never to whoever
// caused them; reminders for the day are written by sendReminders, once per person and day.

export type NotificationKind = "transaction" | "task" | "deadlines" | "followups" | "publish";
export const NOTIFICATION_LABELS: Record<NotificationKind, string> = {
  transaction: "Transaction", task: "Task", deadlines: "Deadlines", followups: "Follow-ups", publish: "Publishing",
};

export type Notification = {
  id: string; kind: NotificationKind; title: string; body: string; href: string | null;
  actorName: string | null; createdAt: string; unread: boolean;
};

type Recipient = { id: string; role: string; departments: string[] | null };
type Draft = {
  kind: NotificationKind; title: string; body?: string;
  href?: string | null | ((user: Recipient) => string | null); // per person, e.g. by which Finance tabs they have
  key?: string; // reminders: one per person and key
};

/** "A, B and 3 more" */
function names(list: string[], shown = 2) {
  if (list.length <= shown + 1) return list.join(", ").replace(/, ([^,]*)$/, " and $1");
  return `${list.slice(0, shown).join(", ")} and ${list.length - shown} more`;
}

/**
 * Notifies each of `to` who is active and may open `department` (where it leads), except `actorId`, who caused it.
 * With a `key`, a person gets it once: sent again only when its text changes, and then it's unread again.
 */
export async function notify(to: (string | null | undefined)[], department: Department, n: Draft, actorId: string | null = null) {
  const ids = [...new Set(to.filter((id): id is string => !!id && id !== actorId))];
  if (!ids.length) return;
  const users = await query<Recipient>("select id, role, departments from users where active and id = any($1::text[])", [ids]);
  const recipients = users.filter((u) => canAccess(u, department));
  if (!recipients.length) return;
  const values: unknown[] = [];
  const rows = recipients.map((u) => {
    const href = typeof n.href === "function" ? n.href(u) : n.href ?? null;
    const at = values.push(randomUUID(), u.id, n.kind, n.title, n.body ?? "", href, actorId, n.key ?? null) - 8;
    return `(${Array.from({ length: 8 }, (_, i) => `$${at + i + 1}`).join(", ")})`;
  });
  const changed = "(notifications.title, notifications.body) is distinct from (excluded.title, excluded.body)";
  await query(
    `insert into notifications (id, user_id, kind, title, body, href, actor_id, dedupe_key) values ${rows.join(", ")}
     on conflict (user_id, dedupe_key) do update set title = excluded.title, body = excluded.body, href = excluded.href,
       created_at = case when ${changed} then now() else notifications.created_at end,
       read_at = case when ${changed} then null else notifications.read_at end`,
    values,
  );
}

// ---------- Reading ----------

export async function listPersonal(userId: string, unreadOnly: boolean, limit = 60): Promise<Notification[]> {
  const rows = await query<{ id: string; kind: NotificationKind; title: string; body: string; href: string | null; actor_name: string | null; created_at: string; unread: boolean }>(
    `select n.id, n.kind, n.title, n.body, n.href, u.name as actor_name, n.read_at is null as unread,
            to_char(n.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at
     from notifications n left join users u on u.id = n.actor_id
     where n.user_id = $1 ${unreadOnly ? "and n.read_at is null" : ""}
     order by n.created_at desc limit ${Math.floor(limit)}`,
    [userId],
  );
  return rows.map((r) => ({ id: r.id, kind: r.kind, title: r.title, body: r.body, href: r.href, actorName: r.actor_name, createdAt: r.created_at, unread: !!r.unread }));
}

export async function personalUnread(userId: string): Promise<number> {
  const [{ n }] = await query<{ n: number }>("select count(*)::int as n from notifications where user_id = $1 and read_at is null", [userId]);
  return n;
}

/** Marks one read and returns where it leads (null when it doesn't, or isn't this person's). */
export async function openPersonal(userId: string, id: string): Promise<string | null> {
  const [row] = await query<{ href: string | null }>(
    "update notifications set read_at = coalesce(read_at, now()) where id = $1 and user_id = $2 returning href",
    [id, userId],
  );
  return row?.href ?? null;
}

export const markAllPersonalRead = (userId: string) =>
  query("update notifications set read_at = now() where user_id = $1 and read_at is null", [userId]);

// ---------- Events ----------

type Reviewed = { id: string; type: string; amount: number; description: string; owner_id: string | null };

/** The Register confirmed or cancelled these: each person whose money it is hears about theirs (one note per person). */
export async function notifyReviewed(rows: Reviewed[], outcome: "confirmed" | "cancelled", actorId: string) {
  const byOwner = new Map<string, Reviewed[]>();
  for (const r of rows) if (r.owner_id) byOwner.set(r.owner_id, [...(byOwner.get(r.owner_id) ?? []), r]);
  for (const [owner, list] of byOwner) {
    const one = list.length === 1 ? list[0] : null;
    // Members see a transaction in Transactions, else their own money in the Register.
    const href = (u: Recipient) =>
      canOpenFinanceTab(u, "transactions") ? (one ? `/finance/transactions/${one.id}` : `/finance/transactions?user=${owner}&status=${outcome}`)
      : canOpenFinanceTab(u, "register") ? "/finance/register" : null;
    await notify([owner], "finance", {
      kind: "transaction",
      title: one ? `Your ${one.type} was ${outcome}` : `${list.length} of your transactions were ${outcome}`,
      body: one ? `${one.description} · ${money(one.amount)}` : `${names(list.map((r) => r.description))} · ${money(list.reduce((s, r) => s + r.amount, 0))} in all`,
      href,
    }, actorId);
  }
}

const dayLabel = (date: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));

/** Someone gave a task to someone else: the assignee hears who, and what. */
export const notifyTaskAssigned = (task: { id: number; title: string; dueDate: string | null; assigneeId: string | null }, actor: { id: string; name: string }, reassigned: boolean) =>
  notify([task.assigneeId], "projects", {
    kind: "task",
    title: `${actor.name} ${reassigned ? "assigned you" : "gave you"} task #${task.id}`,
    body: task.title + (task.dueDate ? ` · due ${dayLabel(task.dueDate)}` : ""),
    href: "/projects?who=me",
  }, actor.id);

// ---------- Reminders for the day ----------

const tasks = (n: number) => `${n} task${n === 1 ? "" : "s"}`;
/** "2 tasks overdue, 1 due today" */
export const deadlineTitle = (overdue: number, dueToday: number) =>
  !overdue ? `${tasks(dueToday)} due today` : dueToday ? `${tasks(overdue)} overdue, ${dueToday} due today` : `${tasks(overdue)} overdue`;

const shared = globalThis as typeof globalThis & { __remindersAt?: number };

/**
 * Today's follow-ups (to each lead's owner), tasks due today or overdue (to whoever they're assigned to, else whoever
 * created them) and media to publish (to everyone who may open Marketing). Checked at most every ten minutes per
 * server; a reminder already sent today only changes when its list does.
 */
export async function sendReminders(force = false) {
  if (!force && shared.__remindersAt && Date.now() - shared.__remindersAt < 10 * 60_000) return;
  shared.__remindersAt = Date.now();
  const date = today();
  const [followups, deadlines, posts] = await Promise.all([
    query<{ owner_id: string; leads: string[] }>(
      `select owner_id, array_agg(coalesce(nullif(hotel, ''), nullif(contact, ''), 'a lead') order by created_at) as leads
       from sales_leads where status = 'open' and due_date = $1::date and owner_id is not null group by owner_id`,
      [date],
    ),
    // Oldest deadline first, so the overdue ones lead.
    query<{ user_id: string; titles: string[]; overdue: number; assigned: boolean }>(
      `select coalesce(assignee_id, created_by) as user_id, array_agg(title order by due_date, id) as titles,
              count(*) filter (where due_date < $1::date)::int as overdue, bool_and(assignee_id is not null) as assigned
       from pm_tasks where status <> 'done' and due_date <= $1::date and coalesce(assignee_id, created_by) is not null
       group by 1`,
      [date],
    ),
    query<{ id: string; title: string; original_name: string; platforms: string[]; time: string }>(
      `select id, title, original_name, platforms, to_char(publish_at at time zone $2, 'HH24:MI') as time
       from mk_posts where status = 'ready' and (publish_at at time zone $2)::date = $1::date order by publish_at`,
      [date, TZ()],
    ),
  ]);
  for (const f of followups) {
    await notify([f.owner_id], "sales", {
      kind: "followups", key: `followups:${date}`,
      title: f.leads.length === 1 ? "1 follow-up due today" : `${f.leads.length} follow-ups due today`,
      body: names(f.leads, 3), href: "/sales/follow-ups",
    });
  }
  for (const d of deadlines) {
    await notify([d.user_id], "projects", {
      kind: "deadlines", key: `deadlines:${date}`,
      title: deadlineTitle(d.overdue, d.titles.length - d.overdue),
      // "Mine" lists only tasks assigned to them, so unassigned ones they created need the whole list.
      body: names(d.titles, 3), href: d.assigned ? "/projects?who=me&view=list" : "/projects?view=list",
    });
  }
  if (!posts.length) return;
  const everyone = (await query<{ id: string }>("select id from users where active")).map((u) => u.id);
  for (const p of posts) {
    const where = p.platforms.filter(isPlatform).map((k) => PLATFORMS[k].label);
    await notify(everyone, "marketing", {
      kind: "publish", key: `publish:${p.id}:${date}`,
      title: `Publish today: ${p.title || p.original_name}`,
      body: [p.time, where.length ? `on ${names(where, 3)}` : "no network picked yet"].join(" · "),
      href: "/marketing/plan",
    });
  }
}
