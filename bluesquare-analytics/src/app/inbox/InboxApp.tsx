"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CannedResponse, Conversation, ConversationPage, ConvStatus, Inbox, Label } from "@/lib/chatwoot";
import { Avatar, Icon, Menu, shortTime } from "./parts";
import { Thread } from "./Thread";
import s from "./inbox.module.css";

export type Scope = { key: string; title: string; inboxIds: number[] | "none" };
export type InboxUser = { id: string; name: string };
export type ScopeGroup = { id: string; name: string; inboxIds: number[] };
export type Directory = { inboxes: Inbox[]; teams: { id: number; name: string }[]; labels: Label[]; canned: CannedResponse[]; me: InboxUser; users: InboxUser[] };
type Status = ConvStatus | "all";
type Assignee = "all" | "me" | "unassigned";

const STATUSES: [Status, string][] = [["open", "Open"], ["pending", "Pending"], ["snoozed", "Snoozed"], ["resolved", "Resolved"], ["all", "All"]];
const LIST_EVERY = 12_000;

const byActivity = (a: Conversation, b: Conversation) => b.lastActivity - a.lastActivity;
const query = (scope: Scope, status: Status, assignee: Assignee, page: number) =>
  new URLSearchParams({ inboxes: scope.inboxIds === "none" ? "none" : scope.inboxIds.join(","), status, assignee, page: String(page) });

/** Inbox: the conversations of the picked inboxes, and the open one beside them. */
export function InboxApp({ scope, groups, unread, directory, initial, open, tools }: {
  scope: Scope; groups: ScopeGroup[]; unread: Record<number, number>; directory: Directory; initial: ConversationPage; open: number | null; tools?: React.ReactNode;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("open");
  const [assignee, setAssignee] = useState<Assignee>("all");
  const [page, setPage] = useState(initial);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(open);
  const [search, setSearch] = useState("");
  const filters = useRef({ status, assignee });
  filters.current = { status, assignee };
  const inboxById = useMemo(() => new Map(directory.inboxes.map((i) => [i.id, i])), [directory.inboxes]);

  /** Reloads the first page; later pages already loaded stay, updated where the first page has them. */
  const refresh = useCallback(async (reset = false) => {
    const { status: st, assignee: as } = filters.current;
    if (reset) setLoading(true);
    try {
      const res = await fetch(`/api/inbox/conversations?${query(scope, st, as, 1)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Inbox couldn't load.");
      // Ignore an answer for filters that have changed since.
      if (filters.current.status !== st || filters.current.assignee !== as) return;
      setError(null);
      setPage((prev) => {
        if (reset) return data;
        const fresh = new Map((data.conversations as Conversation[]).map((c) => [c.id, c]));
        // Kept from later pages: only what's older than the whole first page (an empty first page keeps nothing).
        const oldest = fresh.size ? Math.min(...[...fresh.values()].map((f) => f.lastActivity)) : -Infinity;
        const older = prev.conversations.filter((c) => !fresh.has(c.id) && c.lastActivity < oldest);
        return { ...data, conversations: [...fresh.values(), ...older].sort(byActivity), hasMore: older.length ? prev.hasMore : data.hasMore };
      });
      if (reset) setPages(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Inbox couldn't load.");
    } finally {
      if (reset) setLoading(false);
    }
  }, [scope]);

  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    void refresh(true);
  }, [status, assignee, refresh]);

  // New conversations and messages appear on their own while the tab is visible.
  useEffect(() => {
    const tick = () => document.visibilityState === "visible" && void refresh();
    const timer = window.setInterval(tick, LIST_EVERY);
    document.addEventListener("visibilitychange", tick);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", tick); };
  }, [refresh]);

  // The open conversation is in the address, so it can be bookmarked, shared or reloaded.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (selected) url.searchParams.set("c", String(selected));
    else url.searchParams.delete("c");
    window.history.replaceState(window.history.state, "", url);
  }, [selected]);

  const loadMore = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inbox/conversations?${query(scope, status, assignee, pages + 1)}`, { cache: "no-store" });
      const data: ConversationPage = await res.json();
      if (!res.ok) throw new Error((data as unknown as { error: string }).error);
      setPage((prev) => {
        const seen = new Set(prev.conversations.map((c) => c.id));
        return { ...data, conversations: [...prev.conversations, ...data.conversations.filter((c) => !seen.has(c.id))] };
      });
      setPages((p) => p + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Inbox couldn't load more.");
    } finally {
      setLoading(false);
    }
  };

  /** A conversation changed in the thread (status, assignee, a sent message…): the list follows. */
  const updated = useCallback((c: Conversation) => {
    setPage((prev) => {
      const fits = (status === "all" || c.status === status) && (assignee === "all" || (assignee === "me" ? c.assignee?.id === directory.me.id : !c.assignee));
      const rest = prev.conversations.filter((x) => x.id !== c.id);
      return { ...prev, conversations: fits || c.id === selected ? [...rest, c].sort(byActivity) : rest };
    });
  }, [status, assignee, directory.me.id, selected]);

  const q = search.trim().toLowerCase();
  const shown = q
    ? page.conversations.filter((c) => [c.contact.name, c.contact.phone, c.contact.email, c.preview?.text, ...c.labels].some((v) => v?.toLowerCase().includes(q)))
    : page.conversations;
  const current = page.conversations.find((c) => c.id === selected) ?? null;

  return (
    <div className={`${s.app}${selected ? ` ${s.hasThread}` : ""}`}>
      <section className={s.listPane} aria-label="Conversations">
        <header className={s.listHead}>
          <div className={s.listTitle}>
            <ScopePicker scope={scope} groups={groups} inboxes={directory.inboxes} unread={unread} go={(href) => router.push(href)} />
            {tools}
          </div>
          <label className={s.search}>
            <Icon name="search" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search names, numbers, messages…" aria-label="Search conversations" />
          </label>
          <div className={s.segments} role="tablist" aria-label="Status">
            {STATUSES.map(([key, label]) => (
              <button key={key} type="button" role="tab" aria-selected={status === key} onClick={() => setStatus(key)}>{label}</button>
            ))}
          </div>
          <div className={s.assignees} role="tablist" aria-label="Assigned to">
            {([["all", "All", page.counts.all], ["me", "Mine", null], ["unassigned", "Unassigned", null]] as const).map(([key, label, n]) => (
              <button key={key} type="button" role="tab" aria-selected={assignee === key} onClick={() => setAssignee(key)}>
                {label}{n !== null && <b>{n}</b>}
              </button>
            ))}
          </div>
        </header>

        <div className={s.list}>
          {error && <p className={s.listError} role="alert">{error}</p>}
          {loading && !page.conversations.length && <div className={s.skeletons}>{Array.from({ length: 6 }, (_, i) => <i key={i} />)}</div>}
          {!loading && !shown.length && (
            <div className={s.emptyList}>
              <Icon name="inbox" size={34} />
              <strong>{q ? "No conversation matches" : status === "open" ? "All caught up" : "Nothing here"}</strong>
              <span>{q ? "Search looks through the conversations loaded below." : scope.inboxIds === "none" ? "This group has no inboxes yet." : "New messages appear here on their own."}</span>
            </div>
          )}
          <ul>
            {shown.map((c) => {
              const inbox = inboxById.get(c.inboxId);
              return (
                <li key={c.id}>
                  <button type="button" className={`${s.item}${c.id === selected ? ` ${s.itemOn}` : ""}${c.unread ? ` ${s.itemUnread}` : ""}`} onClick={() => setSelected(c.id)}>
                    <Avatar person={c.contact} size={44} channel={inbox?.channel} />
                    <span className={s.itemBody}>
                      <span className={s.itemTop}>
                        <strong>{c.contact.name}</strong>
                        <time>{shortTime(c.lastActivity)}</time>
                      </span>
                      <span className={s.itemPreview}>
                        {c.preview?.private && <em className={s.noteTag}>Note</em>}
                        {c.preview && !c.preview.incoming && !c.preview.private && <span className={s.you}>You: </span>}
                        {c.preview?.attachment && !c.preview.text ? <i>{ATTACHMENT_LABELS[c.preview.attachment] ?? "Attachment"}</i> : c.preview?.text || <i>No messages yet</i>}
                      </span>
                      <span className={s.itemMeta}>
                        {inbox && scope.inboxIds !== "none" && scope.inboxIds.length !== 1 && <span className={s.inboxChip}>{inbox.name}</span>}
                        {c.priority && <span className={`${s.priority} ${s[`p_${c.priority}`]}`}>{c.priority}</span>}
                        {c.labels.slice(0, 2).map((l) => <span key={l} className={s.labelChip}>{l}</span>)}
                        {c.assignee && <span className={s.assigneeChip} title={`Assigned to ${c.assignee.name}`}><Avatar person={c.assignee} size={16} /></span>}
                        {c.unread > 0 && <b className={s.unread}>{c.unread}</b>}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {page.hasMore && !q && (
            <button type="button" className={s.more} onClick={loadMore} disabled={loading}>{loading ? "Loading…" : "Load more"}</button>
          )}
        </div>
      </section>

      {selected ? (
        <Thread key={selected} id={selected} summary={current} directory={directory} onChange={updated} onClose={() => setSelected(null)} />
      ) : (
        <section className={s.placeholder}>
          <div>
            <Icon name="inbox" size={42} />
            <h2>Pick a conversation</h2>
            <p>Reply on WhatsApp, Instagram and your website chat from one place. Messages, pictures and voice notes arrive here as they come in.</p>
          </div>
        </section>
      )}
    </div>
  );
}

/** The list's title is also the switch between everything, a group, and a single channel — keeps the sidebar short. */
function ScopePicker({ scope, groups, inboxes, unread, go }: {
  scope: Scope; groups: ScopeGroup[]; inboxes: Inbox[]; unread: Record<number, number>; go: (href: string) => void;
}) {
  const unreadOf = (ids: number[]) => ids.reduce((n, i) => n + (unread[i] ?? 0), 0);
  const badge = (n: number) => (n > 0 ? <b className={s.menuBadge}>{n}</b> : null);
  return (
    <Menu
      label="Choose which inboxes to show" align="left" className={s.scopePick}
      icon={<><h1>{scope.title}</h1><i className={s.chev} /></>}
      items={[
        {
          key: "all", checked: scope.key === "all", onSelect: () => go("/inbox"),
          label: <><Icon name="inbox" size={16} /> All conversations{badge(unreadOf(inboxes.map((i) => i.id)))}</>,
        },
        ...groups.map((g) => ({
          key: `g:${g.id}`, checked: scope.key === `g:${g.id}`, onSelect: () => go(`/inbox?scope=g:${g.id}`),
          label: <><Icon name="folder" size={16} /> {g.name}{badge(unreadOf(g.inboxIds))}</>,
        })),
        ...(groups.length && inboxes.length ? ["divider" as const] : []),
        ...inboxes.map((i) => ({
          key: `i:${i.id}`, checked: scope.key === `i:${i.id}`, onSelect: () => go(`/inbox?scope=i:${i.id}`),
          label: (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/icons/channels/${i.channel}.svg`} alt="" width={16} height={16} />
              <span className={s.menuEllipsis}>{i.name}</span>
              {badge(unreadOf([i.id]))}
            </>
          ),
        })),
      ]}
    />
  );
}

export const ATTACHMENT_LABELS: Record<string, string> = {
  image: "📷 Photo", audio: "🎤 Voice message", video: "🎬 Video", file: "📎 File", location: "📍 Location", contact: "👤 Contact", fallback: "Attachment",
};
