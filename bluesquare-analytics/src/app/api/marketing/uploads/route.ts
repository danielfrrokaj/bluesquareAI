import { currentUser } from "@/lib/auth";
import { createPost, readPostInput } from "@/lib/marketing";
import { CHUNK, MAX_SIZE, startUpload, storageReady } from "@/lib/media-store";

export const dynamic = "force-dynamic";

/** Starts an upload: saves the post and returns where the browser sends the file, in chunks. */
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in again." }, { status: 401 });
  if (!storageReady()) return Response.json({ error: "Media storage isn't configured (MEDIA_BUCKET)." }, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const mime = typeof body.mime === "string" ? body.mime.toLowerCase().slice(0, 100) : "";
  const size = Number(body.size);
  const name = typeof body.name === "string" ? body.name.slice(0, 200) : "";
  const kind = mime.startsWith("image/") ? "image" : mime.startsWith("video/") ? "video" : null;
  if (!kind) return Response.json({ error: "Choose an image or a video." }, { status: 400 });
  if (!Number.isInteger(size) || size <= 0 || size > MAX_SIZE) return Response.json({ error: "Files can be up to 2 GB." }, { status: 400 });
  const input = readPostInput(body);
  if (typeof input === "string") return Response.json({ error: input }, { status: 400 });

  const { id, key } = await createPost({ ...input, kind, mime, size, originalName: name, userId: user.id });
  const uploadUrl = await startUpload(key, mime, size, req.headers.get("origin"), `/api/marketing/uploads/${id}`);
  return Response.json({ id, uploadUrl, chunk: CHUNK });
}
