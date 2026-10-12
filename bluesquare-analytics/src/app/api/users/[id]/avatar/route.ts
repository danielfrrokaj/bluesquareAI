import { currentUser } from "@/lib/auth";
import { getAvatar } from "@/lib/users";
import { logoResponse } from "@/lib/logo";

export const dynamic = "force-dynamic";

/** A user's profile photo, for signed-in users. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await currentUser())) return new Response("Unauthorized", { status: 401 });
  return logoResponse(await getAvatar((await params).id));
}
