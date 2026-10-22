import "server-only";
import { randomUUID } from "node:crypto";
import { query } from "./db";
import { STEPS, type NoteKind, type Step } from "./sales-fields";
import { phoneKey } from "./format";

export { phoneKey };

export type LeadStatus = "open" | "won" | "lost";

export type Lead = {
  id: string;
  ref: string | null;
  hotel: string | null;
  contact: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  property_type: string | null;
  rooms: number | null;
  current_system: string | null;
  source: string | null;
  due_date: string | null;
  called: boolean;
  interested: boolean;
  demo_sent: boolean;
  lr_sent: boolean;
  status: LeadStatus;
  products: string[];
  monthly_value: number | null;
  lost_reason: string | null;
  owner_id: string | null;
  owner_name: string | null;
  extra: Record<string, string>;
  created_at: string;
  closed_at: string | null;
  last_note: string | null;
  last_activity: string | null;
};

/** What to call a lead: its property, else its contact, else its phone. */
export const leadTitle = (l: Pick<Lead, "hotel" | "contact" | "phone">) => l.hotel || l.contact || l.phone || "Unnamed lead";

/** The furthest checklist step reached. */
export function stage(l: Pick<Lead, Step | "status">): { key: string; label: string } {
  if (l.status === "won") return { key: "won", label: "Won" };
  if (l.status === "lost") return { key: "lost", label: "Lost" };
  for (const s of ["lr_sent", "demo_sent", "interested", "called"] as Step[]) if (l[s]) return { key: s, label: STEPS[s] };
  return { key: "new", label: "New" };
}


/** WhatsApp needs the international number; Albanian 06x… numbers get 355. */
export function whatsappNumber(phone: string | null): string | null {
  let d = (phone ?? "").replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("00")) d = d.slice(2);
  else if (/^06\d{8}$/.test(d)) d = `355${d.slice(1)}`;
  return d.length >= 8 ? d : null;
}

const SELECT = `
  select l.id, l.ref, l.hotel, l.contact, l.phone, l.email, l.city, l.property_type, l.rooms, l.current_system, l.source,
         to_char(l.due_date, 'YYYY-MM-DD') as due_date, l.called, l.interested, l.demo_sent, l.lr_sent, l.status, l.products,
         l.monthly_value::float8 as monthly_value, l.lost_reason, l.owner_id, u.name as owner_name, l.extra,
         l.created_at::text, l.closed_at::text,
         (select body from sales_notes n where n.lead_id = l.id and n.kind in ('note', 'call', 'meeting') order by n.created_at desc limit 1) as last_note,
         greatest(l.updated_at, (select max(created_at) from sales_notes n where n.lead_id = l.id))::text as last_activity
  from sales_leads l left join users u on u.id = l.owner_id`;

export type LeadFilter = {
  status: LeadStatus;
  q?: string;
  stage?: string;
  source?: string;
  owner?: string;
  due?: "overdue" | "today" | "week" | "none";
  sort?: LeadSort;
  dir?: SortDir; // the column's own direction when left out
};

/** What the lead lists can be sorted by (their column headers), and the direction each starts in when clicked. */
export const LEAD_SORTS = {
  property: { sql: "lower(coalesce(nullif(l.hotel, ''), nullif(l.contact, ''), l.phone))", dir: "asc" },
  city: { sql: "lower(nullif(l.city, ''))", dir: "asc" },
  rooms: { sql: "l.rooms", dir: "desc" },
  // The furthest checklist step reached, as `stage` names it.
  progress: { sql: "case when l.lr_sent then 4 when l.demo_sent then 3 when l.interested then 2 when l.called then 1 else 0 end", dir: "desc" },
  followup: { sql: "l.due_date", dir: "asc" },
  source: { sql: "lower(nullif(l.source, ''))", dir: "asc" },
  added: { sql: "l.created_at", dir: "desc" },
  value: { sql: "l.monthly_value", dir: "desc" },
  reason: { sql: "lower(nullif(l.lost_reason, ''))", dir: "asc" },
  closed: { sql: "l.closed_at", dir: "desc" },
  owner: { sql: "lower(u.name)", dir: "asc" },
} as const;
export type LeadSort = keyof typeof LEAD_SORTS;
export type SortDir = "asc" | "desc";
export const isLeadSort = (v: unknown): v is LeadSort => typeof v === "string" && v in LEAD_SORTS;

function where(f: LeadFilter, today: string) {
  const parts = ["l.status = $1"];
  const params: unknown[] = [f.status];
  const add = (sql: string, v: unknown) => {
    params.push(v);
    parts.push(sql.replaceAll("?", `$${params.length}`));
  };
  if (f.q) {
    const like = `%${f.q.replace(/[\\%_]/g, "\\$&")}%`;
    add(`(coalesce(l.hotel,'') || ' ' || coalesce(l.contact,'') || ' ' || coalesce(l.phone,'') || ' ' || coalesce(l.city,'') || ' ' || coalesce(l.email,'') || ' ' || coalesce(l.ref,'')) ilike ?`, like);
  }
  if (f.source) add("l.source = ?", f.source);
  if (f.owner === "none") parts.push("l.owner_id is null");
  else if (f.owner) add("l.owner_id = ?", f.owner);
  if (f.stage === "new") parts.push("not (l.called or l.interested or l.demo_sent or l.lr_sent)");
  else if (f.stage && f.stage in STEPS) parts.push(`l.${f.stage}`);
  if (f.due === "overdue") add("l.due_date < ?::date", today);
  else if (f.due === "today") add("l.due_date = ?::date", today);
  else if (f.due === "week") add("l.due_date <= ?::date + 7", today);
  else if (f.due === "none") parts.push("l.due_date is null");
  return { sql: `where ${parts.join(" and ")}`, params };
}

/** Empty values last in either direction; ties newest first, then by id so pages never overlap. */
function orderBy(f: LeadFilter) {
  const sort = LEAD_SORTS[f.sort ?? "followup"];
  return `${sort.sql} ${f.dir === "asc" || f.dir === "desc" ? f.dir : sort.dir} nulls last, l.created_at desc, l.id`;
}

export async function listLeads(f: LeadFilter, today: string, limit = 100, offset = 0): Promise<Lead[]> {
  const w = where(f, today);
  return query<Lead>(`${SELECT} ${w.sql} order by ${orderBy(f)} limit ${Math.floor(limit)} offset ${Math.floor(offset)}`, w.params);
}

export async function countLeads(f: LeadFilter, today: string): Promise<number> {
  const w = where(f, today);
  const [{ n }] = await query<{ n: number }>(`select count(*)::int as n from sales_leads l ${w.sql}`, w.params);
  return n;
}

export async function getLead(id: string): Promise<Lead | null> {
  const [lead] = await query<Lead>(`${SELECT} where l.id = $1`, [id]);
  return lead ?? null;
}

export type SalesStats = {
  open: number; due: number; overdue: number; interested: number;
  wonMonth: number; mrrMonth: number; customers: number; mrr: number; rooms: number; winRate: number | null; lost: number;
};

export async function salesStats(today: string): Promise<SalesStats> {
  const [r] = await query<SalesStats & { won90: number; lost90: number }>(
    `select count(*) filter (where status = 'open')::int as open,
            count(*) filter (where status = 'open' and due_date <= $1::date)::int as due,
            count(*) filter (where status = 'open' and due_date < $1::date)::int as overdue,
            count(*) filter (where status = 'open' and interested)::int as interested,
            count(*) filter (where status = 'won' and closed_at >= date_trunc('month', $1::date))::int as "wonMonth",
            coalesce(sum(monthly_value) filter (where status = 'won' and closed_at >= date_trunc('month', $1::date)), 0)::float8 as "mrrMonth",
            count(*) filter (where status = 'won')::int as customers,
            coalesce(sum(monthly_value) filter (where status = 'won'), 0)::float8 as mrr,
            coalesce(sum(rooms) filter (where status = 'won'), 0)::int as rooms,
            count(*) filter (where status = 'lost')::int as lost,
            count(*) filter (where status = 'won' and closed_at >= $1::date - 90)::int as won90,
            count(*) filter (where status = 'lost' and closed_at >= $1::date - 90)::int as lost90
     from sales_leads`,
    [today],
  );
  const closed = r.won90 + r.lost90;
  return { ...r, winRate: closed ? Math.round((r.won90 / closed) * 100) : null };
}

export const leadSources = () =>
  query<{ source: string }>("select distinct source from sales_leads where source is not null order by source").then((r) => r.map((x) => x.source));

// ---------- Changes ----------

export type LeadInput = {
  ref?: string | null; hotel: string | null; contact: string | null; phone: string | null; email: string | null; city: string | null;
  property_type: string | null; rooms: number | null; current_system: string | null; source: string | null; due_date: string | null;
  owner_id: string | null;
};

const INPUT_COLS = ["ref", "hotel", "contact", "phone", "email", "city", "property_type", "rooms", "current_system", "source", "due_date", "owner_id"] as const;

export async function createLead(
  input: LeadInput & Partial<Record<Step, boolean>> & {
    status?: LeadStatus; extra?: Record<string, string>;
    external_id?: string | null; // the row's id in the system it was imported from
    created_at?: string | null; // when it was created there; now by default
  },
  userId: string | null,
): Promise<string> {
  const id = randomUUID();
  const steps = Object.keys(STEPS) as Step[];
  await query(
    `insert into sales_leads (id, ${INPUT_COLS.join(", ")}, phone_key, ${steps.join(", ")}, status, extra, created_by, closed_at, external_id, created_at)
     values ($1, ${INPUT_COLS.map((_, i) => `$${i + 2}`).join(", ")}, $${INPUT_COLS.length + 2},
             ${steps.map((_, i) => `$${INPUT_COLS.length + 3 + i}`).join(", ")},
             $${INPUT_COLS.length + 7}, $${INPUT_COLS.length + 8}::jsonb, $${INPUT_COLS.length + 9},
             case when $${INPUT_COLS.length + 7} = 'open' then null else now() end,
             $${INPUT_COLS.length + 10}, coalesce($${INPUT_COLS.length + 11}::timestamptz, now()))`,
    [
      id, ...INPUT_COLS.map((c) => input[c] ?? null), phoneKey(input.phone), ...steps.map((s) => !!input[s]),
      input.status ?? "open", JSON.stringify(input.extra ?? {}), userId, input.external_id ?? null, input.created_at ?? null,
    ],
  );
  return id;
}

export const updateLead = (id: string, input: LeadInput) =>
  query(
    `update sales_leads set ${INPUT_COLS.map((c, i) => `${c} = $${i + 2}`).join(", ")}, phone_key = $${INPUT_COLS.length + 2}, updated_at = now()
     where id = $1`,
    [id, ...INPUT_COLS.map((c) => input[c] ?? null), phoneKey(input.phone)],
  );

export const setStep = (id: string, step: Step, on: boolean) =>
  query(`update sales_leads set ${step} = $2, updated_at = now() where id = $1`, [id, on]);

export const setFollowUp = (id: string, date: string | null) =>
  query("update sales_leads set due_date = $2, updated_at = now() where id = $1", [id, date]);

export const markWon = (id: string, products: string[], monthlyValue: number | null) =>
  query(
    `update sales_leads set status = 'won', products = $2, monthly_value = $3, lost_reason = null, due_date = null,
            closed_at = now(), updated_at = now() where id = $1`,
    [id, products, monthlyValue],
  );

export const markLost = (id: string, reason: string) =>
  query(
    "update sales_leads set status = 'lost', lost_reason = $2, due_date = null, closed_at = now(), updated_at = now() where id = $1",
    [id, reason],
  );

export const reopen = (id: string) =>
  query("update sales_leads set status = 'open', closed_at = null, lost_reason = null, updated_at = now() where id = $1", [id]);

export const deleteLead = (id: string) => query("delete from sales_leads where id = $1", [id]);

/** Leads already holding these phone numbers (by phone key). */
export async function existingPhoneKeys(keys: string[]): Promise<Set<string>> {
  if (!keys.length) return new Set();
  const rows = await query<{ phone_key: string }>("select phone_key from sales_leads where phone_key = any($1)", [keys]);
  return new Set(rows.map((r) => r.phone_key));
}

// ---------- Notes & activity ----------

export type Note = { id: string; kind: string; body: string; created_at: string; user_id: string | null; user_name: string | null; user_avatar: number | null };

export const listNotes = (leadId: string) =>
  query<Note>(
    `select n.id, n.kind, n.body, n.created_at::text, n.user_id, u.name as user_name,
            case when u.avatar is null then null else u.avatar_version end as user_avatar
     from sales_notes n left join users u on u.id = n.user_id
     where n.lead_id = $1 order by n.created_at desc`,
    [leadId],
  );

export async function addNote(leadId: string, userId: string | null, kind: NoteKind | "event", body: string) {
  await query("insert into sales_notes (id, lead_id, user_id, kind, body) values ($1, $2, $3, $4, $5)", [randomUUID(), leadId, userId, kind, body]);
  await query("update sales_leads set updated_at = now() where id = $1", [leadId]);
}

export const deleteNote = (id: string, leadId: string) => query("delete from sales_notes where id = $1 and lead_id = $2", [id, leadId]);
