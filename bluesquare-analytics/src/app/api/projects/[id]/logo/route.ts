import { currentUser } from "@/lib/auth";
import { getProjectLogo } from "@/lib/projects";
import { logoResponse } from "@/lib/logo";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await currentUser())) return new Response("Unauthorized", { status: 401 });
  return logoResponse(await getProjectLogo((await params).id));
}
