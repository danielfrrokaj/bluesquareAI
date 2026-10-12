import { revalidatePath } from "next/cache";
import { currentUser } from "@/lib/auth";
import { getTask, setTaskScreenshot } from "@/lib/projects";
import { mediaResponse, putMedia, removeMedia, storageReady, storedSize } from "@/lib/media-store";

export const dynamic = "force-dynamic";

const MAX = 15 * 1024 * 1024;
type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  if (!(await currentUser())) return new Response("Unauthorized", { status: 401 });
  const task = await getTask(Number((await params).id));
  if (!task?.screenshot_key || !task.screenshot_mime) return new Response("Not found", { status: 404 });
  const size = await storedSize(task.screenshot_key);
  if (size === null) return new Response("Not found", { status: 404 });
  return mediaResponse(task.screenshot_key, task.screenshot_mime, size, req.headers.get("range"));
}

/** Replaces the task's screenshot (multipart field "file", an image up to 15 MB). */
export async function POST(req: Request, { params }: Ctx) {
  if (!(await currentUser())) return Response.json({ error: "Sign in again." }, { status: 401 });
  if (!storageReady()) return Response.json({ error: "File storage isn't configured (MEDIA_BUCKET)." }, { status: 503 });
  const task = await getTask(Number((await params).id));
  if (!task) return Response.json({ error: "Task not found." }, { status: 404 });
  const file = (await req.formData().catch(() => null))?.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) return Response.json({ error: "Choose an image." }, { status: 400 });
  if (file.size > MAX) return Response.json({ error: "Screenshots can be up to 15 MB." }, { status: 400 });
  const ext = file.type.split("/")[1]?.replace(/[^a-z0-9]/g, "").slice(0, 8) || "png";
  const key = `tasks/${task.id}-${Date.now()}.${ext}`;
  await putMedia(key, file.type, new Uint8Array(await file.arrayBuffer()));
  if (task.screenshot_key) await removeMedia(task.screenshot_key).catch(() => {});
  await setTaskScreenshot(task.id, { key, mime: file.type });
  revalidatePath("/projects", "layout");
  return Response.json({ ok: true });
}

export async function DELETE(_: Request, { params }: Ctx) {
  if (!(await currentUser())) return Response.json({ error: "Sign in again." }, { status: 401 });
  const task = await getTask(Number((await params).id));
  if (!task) return Response.json({ error: "Task not found." }, { status: 404 });
  if (task.screenshot_key) await removeMedia(task.screenshot_key).catch(() => {});
  await setTaskScreenshot(task.id, null);
  revalidatePath("/projects", "layout");
  return Response.json({ ok: true });
}
