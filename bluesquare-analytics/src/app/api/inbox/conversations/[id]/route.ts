import { listMessages, markRead, type Message } from "@/lib/chatwoot";
import { leadFor, sendersFor, withAssignees } from "@/lib/inbox";
import { chatwootFailure, conversationFor, inboxUser } from "@/lib/inbox-access";

export const dynamic = "force-dynamic";

// How many messages a conversation opens with; "Show earlier messages" loads older pages.
const INITIAL = 10;

/** Outgoing messages sent from the CRM get the CRM user who wrote them as the sender. */
async function named(messages: Message[]): Promise<Message[]> {
  const senders = await sendersFor(messages.map((m) => m.id));
  return messages.map((m) => {
    const by = senders.get(m.id);
    return by ? { ...m, sender: { id: m.sender?.id ?? 0, name: by.name, avatar: by.avatar } } : m;
  });
}

/**
 * A conversation with its latest messages and the Sales lead of its contact; ?read=1 also marks it read (the person is
 * looking at it). ?before=<message id> answers only the messages before that one.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await inboxUser();
  if (!user) return Response.json({ error: "Sign in again." }, { status: 401 });
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return Response.json({ error: "Unknown conversation." }, { status: 404 });
  const sp = new URL(req.url).searchParams;
  try {
    const before = Number(sp.get("before"));
    if (before > 0) {
      await conversationFor(user, id); // the inbox grants must reach it
      return Response.json({ messages: await named(await listMessages(id, before)) });
    }
    const [conversation, recent] = await Promise.all([conversationFor(user, id).then((c) => withAssignees([c])).then(([c]) => c), listMessages(id)]);
    if (sp.get("read") === "1" && conversation.unread > 0) await markRead(id).catch(() => null);
    // A conversation opens on its last few messages; earlier ones load on demand. No need to carry a long history.
    const messages = recent.slice(-INITIAL);
    return Response.json({
      conversation: { ...conversation, unread: sp.get("read") === "1" ? 0 : conversation.unread },
      messages: await named(messages),
      hasOlder: recent.length > messages.length,
      lead: await leadFor(conversation.contact),
    });
  } catch (err) {
    return chatwootFailure(err);
  }
}
