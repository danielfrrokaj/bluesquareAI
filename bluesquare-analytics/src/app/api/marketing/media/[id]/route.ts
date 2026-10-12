import { currentUser } from "@/lib/auth";
import { getPost } from "@/lib/marketing";
import { mediaResponse } from "@/lib/media-store";

export const dynamic = "force-dynamic";

/** The uploaded image or video, for signed-in users; supports Range so videos can seek. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await currentUser())) return new Response("Unauthorized", { status: 401 });
  const post = await getPost((await params).id);
  if (!post || post.status !== "ready") return new Response("Not found", { status: 404 });
  return mediaResponse(post.media_key, post.mime, post.size, req.headers.get("range"));
}
