import { currentUser } from "@/lib/auth";
import { openPersonal } from "@/lib/notifications";

export const dynamic = "force-dynamic";

/** Opens one of the person's notifications: marks it read, then goes where it leads (back to the list if nowhere). */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return Response.redirect(new URL("/login", req.url), 303);
  const href = await openPersonal(user.id, (await params).id);
  // Only paths inside this app (they're written by the app, but never follow one elsewhere).
  const target = href && href.startsWith("/") && !href.startsWith("//") ? href : "/notifications";
  return Response.redirect(new URL(target, req.url), 303);
}
