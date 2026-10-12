import { currentUser } from "@/lib/auth";
import { getPost } from "@/lib/marketing";
import { writeChunk } from "@/lib/media-store";

export const dynamic = "force-dynamic";

/** Local storage only: one chunk of an upload, placed by its Content-Range ("bytes a-b/total"). */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const post = await getPost((await params).id);
  if (!post || post.status !== "uploading" || post.created_by !== user.id) return new Response("Not found", { status: 404 });
  const m = req.headers.get("content-range")?.match(/^bytes (\d+)-(\d+)\/(\d+)$/);
  if (!m || Number(m[3]) !== post.size) return new Response("Bad Content-Range", { status: 400 });
  const data = new Uint8Array(await req.arrayBuffer());
  if (data.length !== Number(m[2]) - Number(m[1]) + 1) return new Response("Chunk size mismatch", { status: 400 });
  await writeChunk(post.media_key, Number(m[1]), data);
  return new Response(null, { status: 204 });
}
