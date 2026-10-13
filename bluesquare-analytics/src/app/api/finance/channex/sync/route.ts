import { isCronRequest } from "@/lib/cron";
import { syncChannex } from "@/lib/channex";

export const dynamic = "force-dynamic";

/**
 * For a scheduler, so a snapshot is taken every day even when nobody opens Finance → Channex:
 *   POST /api/finance/channex/sync   Authorization: Bearer $CRON_SECRET
 * LuxHotel is still read at most once every 24 hours and calls in between do nothing, so schedule it
 * hourly: a daily job firing a moment before the 24 hours are up would skip a whole day.
 */
export async function POST(req: Request) {
  if (!isCronRequest(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  await syncChannex();
  return Response.json({ ok: true });
}
