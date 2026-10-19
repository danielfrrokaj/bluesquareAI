import { currentUser } from "@/lib/auth";
import { canOpenArchiveTab } from "@/lib/departments";
import { cleanFolder, createFile } from "@/lib/archive";
import { CHUNK, MAX_SIZE, startUpload, storageReady } from "@/lib/media-store";

export const dynamic = "force-dynamic";

/** Starts a file upload; the browser then PUTs chunks to the returned URL (see media-store). */
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in again." }, { status: 401 });
  if (!canOpenArchiveTab(user, "files")) return Response.json({ error: "You can't upload to the Archive." }, { status: 403 });
  if (!storageReady()) return Response.json({ error: "File storage isn't configured (MEDIA_BUCKET)." }, { status: 503 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";
  const size = Number(body.size);
  const mime = (typeof body.mime === "string" && body.mime ? body.mime : "application/octet-stream").slice(0, 120);
  if (!name) return Response.json({ error: "The file needs a name." }, { status: 400 });
  if (!Number.isInteger(size) || size <= 0 || size > MAX_SIZE) return Response.json({ error: "Files can be up to 2 GB (and not empty)." }, { status: 400 });
  const { id, key } = await createFile({
    name, mime, size, folder: cleanFolder(body.folder), note: typeof body.note === "string" ? body.note.slice(0, 1000) : "", userId: user.id,
  });
  const uploadUrl = await startUpload(key, mime, size, req.headers.get("origin"), `/api/archive/uploads/${id}`);
  return Response.json({ id, uploadUrl, chunk: CHUNK });
}
