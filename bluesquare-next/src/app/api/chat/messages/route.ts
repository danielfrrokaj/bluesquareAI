import { botTurn } from "@/lib/chat/ai";
import {
  botState, chatConfigured, ChatError, handOff, history, sendBotReply, sendVisitorMessage, visitorMessages, type ChatMessage, type ChatSession,
} from "@/lib/chat/chatwoot";
import { clientKey, withinLimit } from "@/lib/chat/limit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function session(sp: URLSearchParams | Record<string, unknown>): ChatSession | null {
  const get = (k: string) => (sp instanceof URLSearchParams ? sp.get(k) : (sp as Record<string, unknown>)[k]);
  const contact = String(get("contact") ?? "").trim();
  const conversation = Number(get("conversation"));
  // Contact identifiers are Chatwoot-issued UUIDs; anything else never reaches Chatwoot.
  if (!/^[a-zA-Z0-9-]{8,64}$/.test(contact) || !Number.isInteger(conversation) || conversation <= 0) return null;
  return { contact, conversation };
}

const stale = (err: unknown) =>
  err instanceof ChatError && (err.status === 404 || err.status === 401) ? Response.json({ error: "stale" }, { status: 404 }) : null;

/** The conversation so far: ?contact=…&conversation=…&after=<message id> answers only what's newer. */
export async function GET(req: Request) {
  if (!chatConfigured()) return Response.json({ error: "unconfigured" }, { status: 503 });
  const sp = new URL(req.url).searchParams;
  const s = session(sp);
  if (!s) return Response.json({ error: "stale" }, { status: 404 });
  try {
    const after = Number(sp.get("after")) || 0;
    const messages = (await visitorMessages(s)).filter((m) => m.id > after);
    return Response.json({ messages });
  } catch (err) {
    const gone = stale(err);
    if (gone) return gone;
    if (err instanceof ChatError) return Response.json({ error: "The chat couldn't load." }, { status: 502 });
    throw err;
  }
}

/** The visitor's message; while the AI handles the conversation, its reply comes back in the same answer. */
export async function POST(req: Request) {
  if (!chatConfigured()) return Response.json({ error: "unconfigured" }, { status: 503 });
  if (!withinLimit(`m:${clientKey(req)}`, 20, 5 * 60_000)) return Response.json({ error: "Slow down a little — try again in a minute." }, { status: 429 });
  const body = await req.json().catch(() => null);
  const s = body && session(body);
  if (!s) return Response.json({ error: "stale" }, { status: 404 });
  const text = String(body.text ?? "").trim().slice(0, 4000);
  const lang = body.lang === "sq" ? "sq" : "en";
  if (!text) return Response.json({ error: "Write a message first." }, { status: 400 });

  try {
    const sent = await sendVisitorMessage(s, text);
    const messages: ChatMessage[] = sent ? [sent] : [];

    // After a handoff the AI stays quiet for good; the team answers from the CRM's Inbox.
    const state = await botState(s.conversation).catch(() => ({ bot: false }));
    if (!state.bot) return Response.json({ messages, human: true });

    try {
      const past = await history(s.conversation).catch(() => messages);
      const turn = await botTurn(past.length ? past : messages, lang);
      if (turn.handoff) await handOff(s.conversation).catch(() => null);
      const reply = await sendBotReply(s.conversation, turn.reply);
      if (reply) messages.push(reply);
      return Response.json({ messages, human: turn.handoff });
    } catch {
      // The AI failed: the message is already with the team, so the visitor just isn't left hanging.
      await handOff(s.conversation).catch(() => null);
      return Response.json({ messages, human: true, note: "ai-unavailable" });
    }
  } catch (err) {
    const gone = stale(err);
    if (gone) return gone;
    if (err instanceof ChatError) return Response.json({ error: "The message couldn't be sent. Try again." }, { status: 502 });
    throw err;
  }
}
