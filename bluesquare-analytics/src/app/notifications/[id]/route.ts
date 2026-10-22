import { currentUser } from "@/lib/auth";
import { openPersonal } from "@/lib/notifications";

export const dynamic = "force-dynamic";

/**
 * A relative redirect: the browser resolves it against the address it's on. (`req.url` behind Cloud Run is the
 * container's own address, http://0.0.0.0:8080, so an absolute URL built from it would send people there.)
 */
const goTo = (path: string) => new Response(null, { status: 303, headers: { Location: path, "Cache-Control": "no-store" } });

/** Opens one of the person's notifications: marks it read, then goes where it leads (back to the list if nowhere). */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return goTo("/login");
  const href = await openPersonal(user.id, (await params).id);
  // Only paths inside this app (they're written by the app, but never follow one elsewhere).
  return goTo(href && href.startsWith("/") && !href.startsWith("//") ? href : "/notifications");
}
