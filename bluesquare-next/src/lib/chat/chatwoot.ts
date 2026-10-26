// The website chat lives in a Chatwoot **API channel**: visitors write through Chatwoot's public client API
// (no token), the AI's and the team's replies go out through the application API, and the team answers from
// the CRM's Inbox. Chatwoot pushes events to /api/chat/webhook, which is the URL the channel is created with.
//
// Server env: CHATWOOT_URL (default https://app.chatwoot.com), CHATWOOT_ACCOUNT_ID, CHATWOOT_API_TOKEN,
// CHATWOOT_INBOX_IDENTIFIER (the API channel's identifier), CHAT_WEBHOOK_SECRET, GEMINI_API_KEY.

const URL_BASE = () => (process.env.CHATWOOT_URL?.trim() || "https://app.chatwoot.com").replace(/\/+$/, "");

export const chatConfigured = () =>
  !!(process.env.CHATWOOT_INBOX_IDENTIFIER?.trim() && process.env.CHATWOOT_ACCOUNT_ID && process.env.CHATWOOT_API_TOKEN?.trim());

export class ChatError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function call<T>(path: string, init: { method?: string; json?: unknown; token?: string } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${URL_BASE()}${path}`, {
      method: init.method ?? (init.json !== undefined ? "POST" : "GET"),
      headers: {
        Accept: "application/json",
        ...(init.json !== undefined && { "Content-Type": "application/json" }),
        ...(init.token && { api_access_token: init.token }),
      },
      body: init.json !== undefined ? JSON.stringify(init.json) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new ChatError("The chat service couldn't be reached.", 0);
  }
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ChatError(`Chatwoot answered ${res.status}.`, res.status);
  return body as T;
}

/** Public client API, scoped to the website's inbox: what the visitor's browser acts as. */
const pub = <T>(path: string, json?: unknown) =>
  call<T>(`/public/api/v1/inboxes/${process.env.CHATWOOT_INBOX_IDENTIFIER?.trim()}${path}`, { json });

/** Application API with the agent token: the AI's replies and conversation state. */
const app = <T>(path: string, init: { method?: string; json?: unknown } = {}) =>
  call<T>(`/api/v1/accounts/${Number(process.env.CHATWOOT_ACCOUNT_ID)}${path}`, { ...init, token: process.env.CHATWOOT_API_TOKEN?.trim() });

// ---------- What the widget sees ----------

export type ChatMessage = {
  id: number;
  role: "visitor" | "assistant" | "agent";
  text: string;
  at: number; // unix seconds
  agentName: string | null;
};

export type ChatSession = { contact: string; conversation: number };

/* eslint-disable @typescript-eslint/no-explicit-any -- Chatwoot's JSON, narrowed right here */
const toMessage = (m: any): ChatMessage | null => {
  if (m.private || m.message_type === 2 || m.message_type === 3) return null; // notes, activity, templates stay internal
  const text = typeof m.content === "string" ? m.content.trim() : "";
  if (!text) return null;
  const mine = m.message_type === 0;
  const bot = !mine && m.content_attributes?.bsa_bot === true;
  return {
    id: m.id,
    role: mine ? "visitor" : bot ? "assistant" : "agent",
    text,
    at: m.created_at,
    agentName: !mine && !bot ? (m.sender?.available_name || m.sender?.name || null) : null,
  };
};

export const toMessages = (list: any[]): ChatMessage[] =>
  list.map(toMessage).filter((m): m is ChatMessage => m !== null).sort((a, b) => a.at - b.at || a.id - b.id);

// ---------- Visitor side (client API) ----------

/** A fresh contact + conversation for this browser. */
export async function openSession(lang: string): Promise<ChatSession> {
  const contact = await pub<any>(`/contacts`, { name: lang === "sq" ? "Vizitor i faqes" : "Website visitor" });
  const source = String(contact.source_id);
  const conversation = await pub<any>(`/contacts/${source}/conversations`, {});
  return { contact: source, conversation: Number(conversation.id) };
}

/** The conversation's messages as the widget shows them; throws 404 when the session is stale. */
export async function visitorMessages(s: ChatSession): Promise<ChatMessage[]> {
  const list = await call<any>(`/public/api/v1/inboxes/${process.env.CHATWOOT_INBOX_IDENTIFIER?.trim()}/contacts/${encodeURIComponent(s.contact)}/conversations/${s.conversation}/messages`);
  return toMessages(Array.isArray(list) ? list : []);
}

/** The visitor's message, entering Chatwoot as an incoming message from their contact. */
export async function sendVisitorMessage(s: ChatSession, text: string): Promise<ChatMessage | null> {
  const m = await pub<any>(`/contacts/${encodeURIComponent(s.contact)}/conversations/${s.conversation}/messages`, { content: text });
  return toMessage({ ...m, message_type: 0 });
}

// ---------- Our side (application API) ----------

type BotState = { bot: boolean };

/** Whether the AI still answers this conversation (a handoff turns it off for good). */
export async function botState(conversationId: number): Promise<BotState> {
  const c = await app<any>(`/conversations/${conversationId}`);
  return { bot: c?.custom_attributes?.bsa_bot !== "off" };
}

/** Hands the conversation to the team: the AI goes quiet and the conversation is marked for a person. */
export async function handOff(conversationId: number) {
  await app(`/conversations/${conversationId}/custom_attributes`, { json: { custom_attributes: { bsa_bot: "off" } } });
  await app(`/conversations/${conversationId}/toggle_priority`, { json: { priority: "high" } }).catch(() => null);
}

/** The AI's reply, marked so the widget and the CRM can tell it from a person's. */
export async function sendBotReply(conversationId: number, text: string): Promise<ChatMessage | null> {
  const m = await app<any>(`/conversations/${conversationId}/messages`, {
    json: { content: text, message_type: "outgoing", private: false, content_attributes: { bsa_bot: true } },
  });
  return toMessage({ ...m, message_type: 1, content_attributes: { ...(m?.content_attributes ?? {}), bsa_bot: true } });
}

/** Recent turns for the AI's context, oldest first. */
export async function history(conversationId: number, keep = 12): Promise<ChatMessage[]> {
  const { payload } = await app<{ payload: any[] }>(`/conversations/${conversationId}/messages`);
  return toMessages(payload ?? []).slice(-keep);
}
