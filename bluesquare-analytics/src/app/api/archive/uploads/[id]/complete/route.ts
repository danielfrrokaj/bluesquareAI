import { revalidatePath } from "next/cache";
import { currentUser } from "@/lib/auth";
import { canOpenArchiveTab } from "@/lib/departments";
import { getFile, markFileReady } from "@/lib/archive";
import { storedSize } from "@/lib/media-store";

export const dynamic = "force-dynamic";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in again." }, { status: 401 });
  if (!canOpenArchiveTab(user, "files")) return Response.json({ error: "You can't upload to the Archive." }, { status: 403 });
  const file = await getFile((await params).id);
  if (!file || file.created_by !== user.id) return Response.json({ error: "Upload not found." }, { status: 404 });
  if ((await storedSize(file.media_key)) !== file.size) return Response.json({ error: "The file didn't arrive completely. Try again." }, { status: 409 });
  await markFileReady(file.id);
  revalidatePath("/archive");
  return Response.json({ ok: true });
}
