// Chatwoot's webhook for the website's API channel: this URL (with ?key=CHAT_WEBHOOK_SECRET) is what the
// channel is registered with in Chatwoot. Chatwoot POSTs every event here — message_created,
// conversation_status_changed and the rest. The widget itself polls for new messages, so today the hook
// verifies, logs and acknowledges; anything push-based (live agent replies, typing) would start from here.

export const dynamic = "force-dynamic";

const authorized = (req: Request) => {
  const secret = process.env.CHAT_WEBHOOK_SECRET?.trim();
  return !!secret && new URL(req.url).searchParams.get("key") === secret;
};

export async function POST(req: Request) {
  if (!authorized(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const event = (await req.json().catch(() => null)) as { event?: string; id?: number; conversation?: { id?: number } } | null;
  if (!event?.event) return Response.json({ error: "no event" }, { status: 400 });
  // Shows up in Cloud Run logs; useful when wiring new behaviour to an event.
  console.log(`[chat webhook] ${event.event} conversation=${event.conversation?.id ?? event.id ?? "?"}`);
  return Response.json({ ok: true });
}

/** Lets a browser (or Chatwoot's "verify") see that the endpoint is alive without the secret. */
export function GET() {
  return Response.json({ ok: true, service: "bluesquare-chat-webhook" });
}
