import { sendMessage } from "@/lib/chatwoot";
import { allowedInboxIds } from "@/lib/departments";
import { recordSender } from "@/lib/inbox";
import { chatwootFailure, conversationFor, inboxUser } from "@/lib/inbox-access";

export const dynamic = "force-dynamic";

const MAX_FILES = 10;
const MAX_BYTES = 25 * 1024 * 1024; // all files together; Cloud Run takes at most 32 MB per request

/** Sends a reply or a private note: multipart with `content`, `private` ("1") and any number of `files`. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await inboxUser();
  if (!user) return Response.json({ error: "Sign in again." }, { status: 401 });
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return Response.json({ error: "Unknown conversation." }, { status: 404 });
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "The message couldn't be read. Try again." }, { status: 400 });
  }
  const content = String(form.get("content") ?? "").trim().slice(0, 20_000);
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!content && !files.length) return Response.json({ error: "Write a message or attach a file." }, { status: 400 });
  if (files.length > MAX_FILES) return Response.json({ error: `Send at most ${MAX_FILES} files at once.` }, { status: 400 });
  if (files.reduce((n, f) => n + f.size, 0) > MAX_BYTES) return Response.json({ error: "Files can be up to 25 MB together." }, { status: 413 });
  try {
    if (allowedInboxIds(user)) await conversationFor(user, id); // granted only certain inboxes: this must be one of them
    const message = await sendMessage(id, { content, private: form.get("private") === "1", files });
    // Chatwoot credits every API message to the one connected agent; the CRM remembers who really wrote it.
    await recordSender(message.id, id, user).catch(() => null);
    return Response.json({ message: { ...message, sender: { id: message.sender?.id ?? 0, name: user.name, avatar: null } } });
  } catch (err) {
    return chatwootFailure(err);
  }
}
