import { currentUser } from "@/lib/auth";
import { getSiteLogo } from "@/lib/sites";
import { logoResponse } from "@/lib/logo";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await currentUser())) return new Response("Unauthorized", { status: 401 });
  return logoResponse(await getSiteLogo((await params).id));
}
