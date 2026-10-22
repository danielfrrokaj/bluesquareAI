import { isAdmin, requireAuth } from "@/lib/auth";
import { allowedInboxIds, canAccess } from "@/lib/departments";
import { listUsers } from "@/lib/users";
import {
  chatwootStatus, ChatwootError, listCanned, listConversations, listInboxes, listLabels, listTeams, unreadByInbox,
  type ConversationPage, type Inbox,
} from "@/lib/chatwoot";
import { listGroups, withAssignees, GROUP_COLORS, type InboxGroup } from "@/lib/inbox";
import { Shell, type SubLink } from "@/components/Shell";
import { Modal } from "@/components/Modal";
import { ActionForm } from "@/components/ActionForm";
import { connectInbox, disconnectInbox, removeInboxGroup, saveInboxGroup } from "./actions";
import { CHANNEL_NAMES } from "./channels";
import { InboxApp, type Directory, type Scope } from "./InboxApp";
import s from "./inbox.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inbox" };

const EMPTY: ConversationPage = { conversations: [], counts: { all: 0 }, hasMore: false };

type SP = { scope?: string; c?: string };

/** Which inboxes the page shows: everything this user may see, one admin-made group, or one inbox. */
function resolveScope(sp: SP, inboxes: Inbox[], groups: InboxGroup[], allowed: number[] | null): Scope {
  const [kind, id] = (sp.scope ?? "all").split(":");
  if (kind === "g") {
    const g = groups.find((x) => x.id === id);
    const ids = g?.inboxIds.filter((i) => inboxes.some((x) => x.id === i)) ?? [];
    if (g) return { key: `g:${g.id}`, title: g.name, inboxIds: ids.length ? ids : "none" };
  }
  if (kind === "i") {
    const inbox = inboxes.find((x) => x.id === Number(id));
    if (inbox) return { key: `i:${inbox.id}`, title: inbox.name, inboxIds: [inbox.id] };
  }
  // "All" means all of this user's inboxes; with none left (grants to inboxes that are gone) it shows nothing.
  return { key: "all", title: "All conversations", inboxIds: allowed === null ? [] : allowed.length ? allowed : "none" };
}

export default async function InboxPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireAuth();
  const admin = isAdmin(user);
  const status = await chatwootStatus();
  if (!status.connected) {
    return (
      <Shell department="inbox">
        <Connect admin={admin} />
      </Shell>
    );
  }

  const sp = await searchParams;
  let directory: Directory;
  let groups: InboxGroup[];
  let unread: Record<number, number>;
  const allowed = allowedInboxIds(user);
  try {
    const [inboxes, teams, labels, canned, everyone, g, u] = await Promise.all([
      listInboxes(), listTeams(), listLabels(), listCanned(), listUsers(), listGroups(), unreadByInbox().catch(() => ({})),
    ]);
    const users = everyone.filter((x) => x.active && canAccess(x, "inbox")).map((x) => ({ id: x.id, name: x.name }));
    // Members granted only certain inbox accounts see just those, everywhere on the page.
    const mine = allowed === null ? inboxes : inboxes.filter((i) => allowed.includes(i.id));
    directory = { inboxes: mine, teams, labels, canned, me: { id: user.id, name: user.name }, users };
    groups = g;
    unread = Object.fromEntries(Object.entries(u).filter(([id]) => mine.some((i) => i.id === Number(id))));
  } catch (err) {
    if (!(err instanceof ChatwootError)) throw err;
    return (
      <Shell department="inbox">
        <section className="panel">
          <h1>Inbox</h1>
          <p className="muted">{err.message}</p>
          {admin && status.fromEnv === false && <Settings status={status} inboxes={[]} groups={[]} />}
        </section>
      </Shell>
    );
  }

  const scope = resolveScope(sp, directory.inboxes, groups, allowed);
  const initial = await listConversations({ inboxIds: scope.inboxIds === "none" ? [-1] : scope.inboxIds, status: "open", page: 1 })
    .then(async (p) => ({ ...p, conversations: await withAssignees(p.conversations) }))
    .catch(() => EMPTY);
  const open = Number(sp.c);

  // The sidebar stays short: everything and the groups. Single inboxes are picked from the list's own title menu.
  // A group with no inbox this user may see stays out of their navigation.
  const visibleGroups = groups.filter((g) => g.inboxIds.some((i) => directory.inboxes.some((x) => x.id === i)));
  const badge = (ids: number[]) => ids.reduce((n, i) => n + (unread[i] ?? 0), 0) || undefined;
  const current = scope.key === "all" || visibleGroups.some((g) => scope.key === `g:${g.id}`) ? scope.key : "all";
  const subnav: SubLink[] = [
    { href: "/inbox", label: "All conversations", icon: "inbox", current: current === "all", badge: badge(directory.inboxes.map((i) => i.id)) },
    ...visibleGroups.map((g): SubLink => ({ href: `/inbox?scope=g:${g.id}`, label: g.name, icon: "folder", current: current === `g:${g.id}`, badge: badge(g.inboxIds) })),
  ];

  return (
    <Shell department="inbox" subnav={subnav} full>
      <InboxApp
        key={scope.key} scope={scope} groups={visibleGroups} unread={unread} directory={directory} initial={initial}
        open={Number.isInteger(open) && open > 0 ? open : null}
        tools={admin ? <Settings status={status} inboxes={directory.inboxes} groups={groups} /> : undefined}
      />
    </Shell>
  );
}

/** Admin: inbox groups and the Chatwoot connection, behind one small gear. */
function Settings({ status, inboxes, groups }: { status: Awaited<ReturnType<typeof chatwootStatus>>; inboxes: Inbox[]; groups: InboxGroup[] }) {
  return (
    <Modal trigger="Manage" title="Inbox settings" triggerClassName="btn btn--small">
      <div className={s.settings}>
        <section>
          <h3>Groups</h3>
          <p className="muted">A group shows several inboxes as one list, e.g. every channel of one brand. Everyone sees the same groups.</p>
          {groups.map((g) => <GroupForm key={g.id} group={g} inboxes={inboxes} />)}
          <details className={s.groupNew}>
            <summary>New group</summary>
            <GroupForm inboxes={inboxes} />
          </details>
        </section>
        <section>
          <h3>Connection</h3>
          {status.fromEnv ? (
            <p className="muted">Connected through the server&apos;s environment (CHATWOOT_URL, CHATWOOT_ACCOUNT_ID, CHATWOOT_API_TOKEN).</p>
          ) : (
            <>
              <p className="muted">
                Chatwoot account {status.accountId} at {status.url}, as {status.agentName ?? "unknown"} · token ····{status.tokenHint}. Replies are sent from this agent.
              </p>
              <ActionForm action={disconnectInbox} submit="Disconnect Chatwoot" pending="Disconnecting…" danger className="form form--row" />
            </>
          )}
        </section>
      </div>
    </Modal>
  );
}

function GroupForm({ group, inboxes }: { group?: InboxGroup; inboxes: Inbox[] }) {
  return (
    <div className={s.group}>
      <ActionForm action={saveInboxGroup} submit={group ? "Save group" : "Create group"} className={`form ${s.groupForm}`}>
      {group && <input type="hidden" name="id" value={group.id} />}
      <div className={s.groupTop}>
        <label className="field"><span>Name</span><input name="name" defaultValue={group?.name ?? ""} required maxLength={60} placeholder="LuxHotel channels" /></label>
        <label className="field">
          <span>Colour</span>
          <select name="color" defaultValue={group?.color ?? "blue"}>
            {GROUP_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>
      <fieldset className={s.groupInboxes}>
        <legend>Inboxes</legend>
        {inboxes.map((i) => (
          <label key={i.id} className="check check--small">
            <input type="checkbox" name="inbox" value={i.id} defaultChecked={group?.inboxIds.includes(i.id)} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/icons/channels/${i.channel}.svg`} alt="" width={16} height={16} /> {i.name} <small className="muted">({CHANNEL_NAMES[i.channel]})</small>
          </label>
        ))}
      </fieldset>
      </ActionForm>
      {group && (
        <ActionForm action={removeInboxGroup} submit="Delete group" pending="Deleting…" danger className="form form--row">
          <input type="hidden" name="id" value={group.id} />
        </ActionForm>
      )}
    </div>
  );
}

function Connect({ admin }: { admin: boolean }) {
  return (
    <section className={`panel ${s.connect}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/inbox.png" alt="" width={72} height={72} />
      <h1>Connect your inboxes</h1>
      <p className="muted">
        Inbox brings WhatsApp, Instagram, Messenger and your website chat into the CRM through Chatwoot: read and answer every
        conversation here, with pictures, files and voice messages, and turn chats into Sales leads.
      </p>
      {admin ? (
        <ActionForm action={connectInbox} submit="Connect Chatwoot" className="form">
          <label className="field"><span>Chatwoot address</span><input name="url" defaultValue="https://app.chatwoot.com" required /></label>
          <label className="field"><span>Account ID</span><input name="account_id" inputMode="numeric" required placeholder="193036" /></label>
          <label className="field"><span>Access token</span><input name="token" type="password" required placeholder="From Chatwoot → Profile settings → Access token" /></label>
          <p className="muted">The token is stored encrypted. Messages you send here go out under that agent&apos;s name.</p>
        </ActionForm>
      ) : (
        <p>An admin needs to connect Chatwoot first, under Inbox.</p>
      )}
    </section>
  );
}
