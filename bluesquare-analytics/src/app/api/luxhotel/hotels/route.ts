import { currentUser } from "@/lib/auth";
import { savedHotels, syncHotels } from "@/lib/lux-properties";

export const dynamic = "force-dynamic";
/** The saved properties; `?refresh=1` (the Refresh button) first asks LuxHotel again, at most once a minute. */
export async function GET(req: Request) {
  if (!await currentUser()) return Response.json({ error: "Sign in to view LuxHotel." }, { status: 401 });
  if (new URL(req.url).searchParams.get("refresh") === "1") await syncHotels(true);
  return Response.json(await savedHotels(), { headers: { "Cache-Control": "private, no-store" } });
}
