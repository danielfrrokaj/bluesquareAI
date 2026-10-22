import "server-only";
import { decrypt, encrypt } from "./crypto";
import { getSetting, setSetting } from "./finance";

// Chatwoot (Cloud or self-hosted): the shared inboxes behind Inbox. An admin connects it on the Inbox page with an agent's
// access token, stored encrypted; locally CHATWOOT_URL, CHATWOOT_ACCOUNT_ID and CHATWOOT_API_TOKEN stand in for that.
// Everything is sent as the agent who owns the token.

const KEY = "chatwoot";
type Stored = { url: string; accountId: number; token: string; tokenHint: string; agentName: string; connectedAt: string };
type Connection = { url: string; accountId: number; token: string };

export class ChatwootError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function connection(): Promise<Connection | null> {
  const s = await getSetting<Stored | null>(KEY);
  const token = s?.token ? decrypt(s.token) : null;
  if (s && token) return { url: s.url, accountId: s.accountId, token };
  const env = { url: process.env.CHATWOOT_URL?.trim() || "https://app.chatwoot.com", accountId: Number(process.env.CHATWOOT_ACCOUNT_ID), token: process.env.CHATWOOT_API_TOKEN?.trim() ?? "" };
  return env.token && env.accountId > 0 ? env : null;
}

export type ChatwootStatus = { connected: boolean; url: string | null; accountId: number | null; tokenHint: string | null; agentName: string | null; fromEnv: boolean };

export async function chatwootStatus(): Promise<ChatwootStatus> {
  const s = await getSetting<Stored | null>(KEY);
  if (s?.token) return { connected: true, url: s.url, accountId: s.accountId, tokenHint: s.tokenHint, agentName: s.agentName, fromEnv: false };
  const c = await connection();
  return { connected: !!c, url: c?.url ?? null, accountId: c?.accountId ?? null, tokenHint: c ? c.token.slice(-4) : null, agentName: null, fromEnv: !!c };
}

async function call<T>(c: Connection, path: string, init: { method?: string; json?: unknown; form?: FormData } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${c.url}/api/v1${path}`, {
      method: init.method ?? (init.json !== undefined || init.form ? "POST" : "GET"),
      headers: { api_access_token: c.token, Accept: "application/json", ...(init.json !== undefined && { "Content-Type": "application/json" }) },
      body: init.form ?? (init.json !== undefined ? JSON.stringify(init.json) : undefined),
      cache: "no-store",
      signal: AbortSignal.timeout(init.form ? 120_000 : 20_000),
    });
  } catch {
    throw new ChatwootError("Chatwoot couldn't be reached. Try again in a moment.", 0);
  }
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = res.status === 401 ? "Chatwoot rejected the access token. An admin can reconnect it on the Inbox page."
      : body?.message || body?.error || (Array.isArray(body?.errors) ? body.errors.join(", ") : null) || `Chatwoot answered ${res.status}.`;
    throw new ChatwootError(String(message), res.status);
  }
  return body as T;
}

/** A call on the connected account: `path` is relative to /accounts/<id>. */
async function api<T>(path: string, init?: Parameters<typeof call>[2]): Promise<T> {
  const c = await connection();
  if (!c) throw new ChatwootError("Chatwoot isn't connected yet.", 0);
  return call<T>(c, `/accounts/${c.accountId}${path}`, init);
}

// ---------- Connection ----------

/** Checks the token against the account, then stores it encrypted. */
export async function connectChatwoot(url: string, accountId: number, token: string) {
  const c = { url: url.replace(/\/+$/, ""), accountId, token };
  const profile = await call<{ name: string; accounts?: { id: number }[] }>(c, "/profile");
  if (profile.accounts && !profile.accounts.some((a) => a.id === accountId)) throw new ChatwootError(`This token has no access to account ${accountId}.`, 403);
  await call(c, `/accounts/${accountId}/inboxes`);
  await setSetting(KEY, { url: c.url, accountId, token: encrypt(token), tokenHint: token.slice(-4), agentName: profile.name, connectedAt: new Date().toISOString() } satisfies Stored);
  cache.clear();
}

export async function disconnectChatwoot() {
  await setSetting(KEY, null);
  cache.clear();
}

// Lists that rarely change (inboxes, agents, labels…) are kept for a minute per server.
const cache = new Map<string, { until: number; value: Promise<unknown> }>();
function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.until > Date.now()) return hit.value as Promise<T>;
  const value = load();
  cache.set(key, { until: Date.now() + 60_000, value });
  value.catch(() => cache.delete(key));
  return value;
}
export const forgetCached = (key: string) => cache.delete(key);

// ---------- Shapes sent to the browser ----------

export type Channel = "whatsapp" | "instagram" | "facebook" | "web" | "email" | "telegram" | "sms" | "line" | "api";
export type Inbox = { id: number; name: string; channel: Channel; detail: string | null; avatar: string | null };
export type Person = { id: number; name: string; avatar: string | null };
export type Contact = Person & { phone: string | null; email: string | null; location: string | null; company: string | null };
export type ConvStatus = "open" | "pending" | "resolved" | "snoozed";
export type Priority = "urgent" | "high" | "medium" | "low";
export type FileType = "image" | "audio" | "video" | "file" | "location" | "contact" | "fallback";
export type Attachment = { id: number; type: FileType; url: string; thumb: string | null; name: string; size: number | null };
export type Message = {
  id: number; kind: "incoming" | "outgoing" | "activity"; private: boolean; content: string | null; createdAt: number;
  status: "sent" | "delivered" | "read" | "failed" | "progress"; error: string | null; sender: Person | null; attachments: Attachment[];
};
/** Who handles the conversation: a CRM user, kept by the CRM itself (lib/inbox.ts), not by Chatwoot. */
export type Assignee = { id: string; name: string; avatar: string | null };
export type Conversation = {
  id: number; inboxId: number; status: ConvStatus; priority: Priority | null; unread: number; lastActivity: number; contact: Contact;
  assignee: Assignee | null; team: { id: number; name: string } | null; labels: string[]; muted: boolean; canReply: boolean;
  snoozedUntil: number | null; preview: { text: string; incoming: boolean; attachment: FileType | null; private: boolean } | null;
};
export type Agent = Person & { email: string; available: boolean };
export type Label = { id: number; title: string; color: string };
export type CannedResponse = { id: number; shortCode: string; content: string };

/* eslint-disable @typescript-eslint/no-explicit-any -- Chatwoot's JSON, narrowed right here */
const CHANNELS: Record<string, Channel> = {
  "Channel::Whatsapp": "whatsapp", "Channel::Instagram": "instagram", "Channel::FacebookPage": "facebook", "Channel::WebWidget": "web",
  "Channel::Email": "email", "Channel::Telegram": "telegram", "Channel::Sms": "sms", "Channel::TwilioSms": "sms", "Channel::Line": "line", "Channel::Api": "api",
};
const text = (v: any): string | null => (typeof v === "string" && v.trim() ? v : null);
const person = (p: any): Person | null => (p?.id ? { id: p.id, name: text(p.available_name) ?? text(p.name) ?? "Unknown", avatar: text(p.thumbnail) ?? text(p.avatar_url) } : null);

const toInbox = (i: any): Inbox => ({
  id: i.id, name: i.name, channel: CHANNELS[i.channel_type] ?? "api",
  detail: text(i.phone_number) ?? text(i.email) ?? text(i.website_url)?.replace(/^https?:\/\//, "") ?? null, avatar: text(i.avatar_url),
});

export const toContact = (c: any): Contact => ({
  ...(person(c) ?? { id: c?.id ?? 0, name: "Unknown", avatar: null }),
  name: text(c?.name) ?? text(c?.phone_number) ?? text(c?.email) ?? "Unknown",
  phone: text(c?.phone_number), email: text(c?.email),
  location: [c?.additional_attributes?.city, c?.additional_attributes?.country].filter(Boolean).join(", ") || null,
  company: text(c?.additional_attributes?.company_name),
});

const fileName = (url: string) => decodeURIComponent(url.split("?")[0].split("/").pop() ?? "file");
const toAttachment = (a: any): Attachment => ({
  id: a.id, type: (["image", "audio", "video", "file", "location", "contact"].includes(a.file_type) ? a.file_type : "fallback") as FileType,
  url: a.data_url ?? a.external_url ?? "", thumb: text(a.thumb_url), name: text(a.fallback_title) ?? (a.data_url ? fileName(a.data_url) : "Attachment"),
  size: typeof a.file_size === "number" ? a.file_size : null,
});

export const toMessage = (m: any): Message => ({
  id: m.id, kind: m.message_type === 0 ? "incoming" : m.message_type === 2 ? "activity" : "outgoing", private: !!m.private,
  content: text(m.content), createdAt: m.created_at, status: m.status ?? "sent", error: text(m.content_attributes?.external_error),
  sender: person(m.sender), attachments: (m.attachments ?? []).map(toAttachment),
});

const toConversation = (c: any): Conversation => {
  const last = c.last_non_activity_message ?? c.messages?.at(-1) ?? null;
  return {
    id: c.id, inboxId: c.inbox_id, status: c.status, priority: c.priority ?? null, unread: c.unread_count ?? 0,
    lastActivity: c.last_activity_at ?? c.timestamp ?? 0, contact: toContact(c.meta?.sender), assignee: null,
    team: c.meta?.team?.id ? { id: c.meta.team.id, name: c.meta.team.name } : null, labels: c.labels ?? [], muted: !!c.muted,
    canReply: c.can_reply !== false, snoozedUntil: c.snoozed_until ? Date.parse(c.snoozed_until) / 1000 || null : null,
    preview: last ? {
      text: text(last.content) ?? "", incoming: last.message_type === 0, private: !!last.private,
      attachment: last.attachments?.[0] ? toAttachment(last.attachments[0]).type : null,
    } : null,
  };
};

// ---------- Account lists ----------

export const listInboxes = () => cached("inboxes", async () => (await api<{ payload: any[] }>("/inboxes")).payload.map(toInbox));
export const listAgents = () => cached("agents", async () =>
  (await api<any[]>("/agents")).map((a): Agent => ({ ...person(a)!, email: a.email, available: a.availability_status === "online" })));
export const listTeams = () => cached("teams", async () => (await api<any[]>("/teams")).map((t) => ({ id: t.id as number, name: t.name as string })));
export const listLabels = () => cached("labels", async () =>
  (await api<{ payload: any[] }>("/labels")).payload.map((l): Label => ({ id: l.id, title: l.title, color: l.color || "#4a84d0" })));
export const listCanned = () => cached("canned", async () =>
  (await api<any[]>("/canned_responses")).map((r): CannedResponse => ({ id: r.id, shortCode: r.short_code, content: r.content })));
/** The agent the token belongs to: "Mine" means assigned to them. */
export const profile = () => cached("profile", async () => {
  const c = await connection();
  if (!c) throw new ChatwootError("Chatwoot isn't connected yet.", 0);
  return person(await call<any>(c, "/profile"))!;
});

export async function createLabel(title: string, color: string) {
  await api("/labels", { json: { title, color, show_on_sidebar: true } });
  forgetCached("labels");
}

// ---------- Conversations ----------

export type ListQuery = { inboxIds: number[]; status: ConvStatus | "all"; page: number };
export type ConversationPage = { conversations: Conversation[]; counts: { all: number }; hasMore: boolean };

/** One page (25) of conversations, newest activity first. A group (several inboxes) goes through Chatwoot's filter API. */
export async function listConversations(q: ListQuery): Promise<ConversationPage> {
  let data: { meta: any; payload: any[] };
  if (q.inboxIds.length > 1) {
    const rules: any[] = [{ attribute_key: "inbox_id", filter_operator: "equal_to", values: q.inboxIds }];
    if (q.status !== "all") rules.push({ attribute_key: "status", filter_operator: "equal_to", values: [q.status] });
    const payload = rules.map((r, i) => ({ ...r, query_operator: i < rules.length - 1 ? "and" : null }));
    data = await api(`/conversations/filter?page=${q.page}`, { json: { payload } });
  } else {
    const p = new URLSearchParams({ status: q.status, assignee_type: "all", page: String(q.page) });
    if (q.inboxIds[0]) p.set("inbox_id", String(q.inboxIds[0]));
    data = (await api<{ data: { meta: any; payload: any[] } }>(`/conversations?${p}`)).data;
  }
  const all = data.meta?.all_count ?? 0;
  return { conversations: data.payload.map(toConversation), counts: { all }, hasMore: q.page * 25 < all };
}

/** Open conversations with unread messages, per inbox (from the most recent 75). */
export async function unreadByInbox(): Promise<Record<number, number>> {
  const out: Record<number, number> = {};
  for (let page = 1; page <= 3; page++) {
    const { data } = await api<{ data: { meta: any; payload: any[] } }>(`/conversations?status=open&assignee_type=all&page=${page}`);
    for (const c of data.payload) if (c.unread_count > 0) out[c.inbox_id] = (out[c.inbox_id] ?? 0) + 1;
    if (data.payload.length < 25) break;
  }
  return out;
}

export const getConversation = async (id: number) => toConversation(await api<any>(`/conversations/${id}`));

/** Up to 20 messages, oldest first: the latest, or those before message `before`. */
export async function listMessages(id: number, before?: number): Promise<Message[]> {
  const { payload } = await api<{ payload: any[] }>(`/conversations/${id}/messages${before ? `?before=${before}` : ""}`);
  return payload.map(toMessage);
}

/** A reply or private note, with files (images, voice, documents) when given. */
export async function sendMessage(id: number, m: { content: string; private: boolean; files: File[] }): Promise<Message> {
  if (!m.files.length) return toMessage(await api(`/conversations/${id}/messages`, { json: { content: m.content, message_type: "outgoing", private: m.private } }));
  const form = new FormData();
  if (m.content) form.set("content", m.content);
  form.set("message_type", "outgoing");
  form.set("private", String(m.private));
  for (const f of m.files) form.append("attachments[]", f, f.name);
  return toMessage(await api(`/conversations/${id}/messages`, { form }));
}

export const deleteMessage = (id: number, messageId: number) => api(`/conversations/${id}/messages/${messageId}`, { method: "DELETE" });

/** Open, pending, resolved, or snoozed until a time (unix seconds). */
export const setStatus = (id: number, status: ConvStatus, snoozedUntil?: number) =>
  api(`/conversations/${id}/toggle_status`, { json: { status, ...(snoozedUntil && { snoozed_until: snoozedUntil }) } });
export const setPriority = (id: number, priority: Priority | null) => api(`/conversations/${id}/toggle_priority`, { json: { priority: priority ?? "none" } });
/** An agent or team; null unassigns. */
export const assign = (id: number, to: { agentId: number | null } | { teamId: number | null }) =>
  api(`/conversations/${id}/assignments`, { json: "agentId" in to ? { assignee_id: to.agentId ?? 0 } : { team_id: to.teamId ?? 0 } });
export const setLabels = (id: number, labels: string[]) => api(`/conversations/${id}/labels`, { json: { labels } });
export const setMuted = (id: number, muted: boolean) => api(`/conversations/${id}/${muted ? "mute" : "unmute"}`, { json: {} });
export const markRead = (id: number) => api(`/conversations/${id}/update_last_seen`, { json: {} });
export const setTyping = (id: number, on: boolean) => api(`/conversations/${id}/toggle_typing_status`, { json: { typing_status: on ? "on" : "off" } });

// ---------- Contacts ----------

export const getContact = async (id: number) => toContact((await api<{ payload: any }>(`/contacts/${id}`)).payload);
export const updateContact = (id: number, c: { name: string; email: string | null; phone: string | null }) =>
  api(`/contacts/${id}`, { method: "PUT", json: { name: c.name, email: c.email ?? "", phone_number: c.phone ?? "" } });
/** The contact's other conversations, newest first. */
export async function contactConversations(id: number): Promise<Conversation[]> {
  const { payload } = await api<{ payload: any[] }>(`/contacts/${id}/conversations`);
  return payload.map(toConversation).sort((a, b) => b.lastActivity - a.lastActivity);
}
