import { revalidatePath } from "next/cache";
import { currentUser } from "@/lib/auth";
import { getPost, markReady } from "@/lib/marketing";
import { storedSize } from "@/lib/media-store";

export const dynamic = "force-dynamic";

/** Marks an upload done once the whole file is in storage. */
export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in again." }, { status: 401 });
  const post = await getPost((await params).id);
  if (!post || post.created_by !== user.id) return Response.json({ error: "Upload not found." }, { status: 404 });
  if ((await storedSize(post.media_key)) !== post.size) return Response.json({ error: "The file didn't arrive completely. Try again." }, { status: 409 });
  await markReady(post.id);
  revalidatePath("/marketing");
  return Response.json({ ok: true });
}
