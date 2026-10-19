import { currentUser } from "@/lib/auth";
import { savedHotel } from "@/lib/lux-properties";

export const dynamic = "force-dynamic";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await currentUser()) return Response.json({ error: "Sign in to view LuxHotel." }, { status: 401 });
  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) return Response.json({ error: "Invalid property." }, { status: 400 });
  return Response.json(await savedHotel(id), { headers: { "Cache-Control": "private, no-store" } });
}
