import { currentUser } from "@/lib/auth";
import { getFile } from "@/lib/archive";
import { mediaResponse } from "@/lib/media-store";

export const dynamic = "force-dynamic";

// Shown in the browser only for types that can't run script in our origin; everything else downloads.
const INLINE = /^(image\/(png|jpe?g|gif|webp|avif)|application\/pdf|video\/|audio\/|text\/plain$)/;

/** A stored file for signed-in users. ?download forces a download; Range is supported for media. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await currentUser())) return new Response("Unauthorized", { status: 401 });
  const file = await getFile((await params).id);
  if (!file || file.status !== "ready") return new Response("Not found", { status: 404 });
  const inline = INLINE.test(file.mime) && !new URL(req.url).searchParams.has("download");
  const res = await mediaResponse(file.media_key, inline ? file.mime : "application/octet-stream", file.size, req.headers.get("range"));
  res.headers.set("Content-Disposition", `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(file.name)}`);
  res.headers.set("X-Content-Type-Options", "nosniff");
  return res;
}
