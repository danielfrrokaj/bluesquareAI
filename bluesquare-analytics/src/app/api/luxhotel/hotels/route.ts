import { currentUser } from "@/lib/auth";
import { getLuxHotels } from "@/lib/luxhotel";

export const dynamic = "force-dynamic";
export async function GET() {
  if (!await currentUser()) return Response.json({ error: "Sign in to view LuxHotel." }, { status: 401 });
  return Response.json(await getLuxHotels(), { headers: { "Cache-Control": "private, no-store" } });
}
