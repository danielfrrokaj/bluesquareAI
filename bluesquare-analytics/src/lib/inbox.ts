import "server-only";
import { randomUUID } from "node:crypto";
import { query } from "./db";
import { createLead, phoneKey } from "./sales";
import type { Assignee, Channel, Contact, Conversation } from "./chatwoot";

// What Inbox keeps itself: groups of Chatwoot inboxes, and the link from a chat's contact to a Sales lead.

export const GROUP_COLORS = ["blue", "green", "violet", "amber", "rose", "teal"] as const;
export type GroupColor = (typeof GROUP_COLORS)[number];
export const isGroupColor = (v: unknown): v is GroupColor => GROUP_COLORS.includes(v as GroupColor);
export type InboxGroup = { id: string; name: string; color: GroupColor; inboxIds: number[] };

export const listGroups = () =>
  query<InboxGroup>(`select id, name, color, inbox_ids as "inboxIds" from inbox_groups order by position, lower(name)`);

export async function saveGroup(g: { id?: string; name: string; color: GroupColor; inboxIds: number[] }): Promise<string> {
  if (g.id) {
    await query("update inbox_groups set name = $2, color = $3, inbox_ids = $4 where id = $1", [g.id, g.name, g.color, g.inboxIds]);
    return g.id;
  }
  const id = randomUUID();
  await query(
    "insert into inbox_groups (id, name, color, inbox_ids, position) values ($1, $2, $3, $4, (select coalesce(max(position), 0) + 1 from inbox_groups))",
    [id, g.name, g.color, g.inboxIds],
  );
  return id;
}

export const deleteGroup = (id: string) => query("delete from inbox_groups where id = $1", [id]);

// ---------- Who handles what ----------
// Chatwoot attributes every API message and assignment to the one connected agent, so the CRM keeps its own
// record of which of OUR users handles a conversation and who wrote each message sent from here.

const AVATAR = "case when u.avatar is null then null else '/api/users/' || u.id || '/avatar?v=' || u.avatar_version end as avatar";

/** Hands the conversation to a CRM user (null: nobody). */
export async function assignConversation(conversationId: number, userId: string | null, by: string) {
  if (!userId) return void (await query("delete from inbox_assignments where conversation_id = $1", [conversationId]));
  await query(
    `insert into inbox_assignments (conversation_id, user_id, assigned_by) values ($1, $2, $3)
     on conflict (conversation_id) do update set user_id = excluded.user_id, assigned_by = excluded.assigned_by, at = now()`,
    [conversationId, userId, by],
  );
}

export async function assigneesFor(ids: number[]): Promise<Map<number, Assignee>> {
  if (!ids.length) return new Map();
  const rows = await query<Assignee & { conversation_id: number }>(
    `select a.conversation_id, u.id, u.name, ${AVATAR}
     from inbox_assignments a join users u on u.id = a.user_id where a.conversation_id = any($1::bigint[])`,
    [ids],
  );
  return new Map(rows.map((r) => [Number(r.conversation_id), { id: r.id, name: r.name, avatar: r.avatar }]));
}

/** The same conversations with the CRM's assignees on them. */
export async function withAssignees(conversations: Conversation[]): Promise<Conversation[]> {
  const map = await assigneesFor(conversations.map((c) => c.id));
  return conversations.map((c) => ({ ...c, assignee: map.get(c.id) ?? null }));
}

export const recordSender = (messageId: number, conversationId: number, user: { id: string; name: string }) =>
  query(
    "insert into inbox_senders (message_id, conversation_id, user_id, name) values ($1, $2, $3, $4) on conflict do nothing",
    [messageId, conversationId, user.id, user.name],
  );

/** Who in the CRM wrote each of these messages: name and picture, by message id. */
export async function sendersFor(messageIds: number[]): Promise<Map<number, { name: string; avatar: string | null }>> {
  if (!messageIds.length) return new Map();
  const rows = await query<{ message_id: number; name: string; avatar: string | null }>(
    `select s.message_id, coalesce(u.name, s.name) as name, ${AVATAR}
     from inbox_senders s left join users u on u.id = s.user_id where s.message_id = any($1::bigint[])`,
    [messageIds],
  );
  return new Map(rows.map((r) => [Number(r.message_id), { name: r.name, avatar: r.avatar }]));
}

// ---------- Sales leads ----------

export type LeadLink = { id: string; title: string; status: string };

/** The lead this chat contact is: added from this contact before, or with the same phone or email. */
export async function leadFor(contact: Pick<Contact, "id" | "phone" | "email">): Promise<LeadLink | null> {
  const [lead] = await query<LeadLink>(
    `select id, coalesce(nullif(hotel, ''), nullif(contact, ''), phone, 'Lead') as title, status from sales_leads
     where external_id = $1 or ($2::text is not null and phone_key = $2) or ($3::text is not null and lower(email) = lower($3))
     order by (external_id = $1) desc, status = 'open' desc, created_at desc limit 1`,
    [`chatwoot:${contact.id}`, phoneKey(contact.phone), contact.email],
  );
  return lead ?? null;
}

const CHANNEL_SOURCES: Record<Channel, string> = {
  whatsapp: "WhatsApp", instagram: "Instagram", facebook: "Facebook", web: "Website chat", email: "Email", telegram: "Telegram", sms: "SMS", line: "LINE", api: "Inbox",
};

/** A Sales lead for a chat contact, owned by whoever adds it. */
export const addLeadFor = (contact: Contact, channel: Channel, ownerId: string) =>
  createLead({
    hotel: contact.company, contact: contact.name, phone: contact.phone, email: contact.email, city: contact.location, property_type: null, rooms: null,
    current_system: null, source: CHANNEL_SOURCES[channel], due_date: null, owner_id: ownerId, external_id: `chatwoot:${contact.id}`,
  }, ownerId);
