import { chatConfigured, ChatError, openSession } from "@/lib/chat/chatwoot";
import { clientKey, withinLimit } from "@/lib/chat/limit";

export const dynamic = "force-dynamic";

/** A new chat for this browser: its Chatwoot contact and conversation, kept by the widget in localStorage. */
export async function POST(req: Request) {
  if (!chatConfigured()) return Response.json({ error: "unconfigured" }, { status: 503 });
  if (!withinLimit(`s:${clientKey(req)}`, 10, 60 * 60_000)) return Response.json({ error: "Too many new chats. Try again later." }, { status: 429 });
  const lang = (await req.json().catch(() => ({})))?.lang === "sq" ? "sq" : "en";
  try {
    return Response.json(await openSession(lang));
  } catch (err) {
    if (err instanceof ChatError) return Response.json({ error: "The chat couldn't start. Try again in a moment." }, { status: 502 });
    throw err;
  }
}
