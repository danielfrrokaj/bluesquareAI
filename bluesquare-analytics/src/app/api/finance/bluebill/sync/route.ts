import { timingSafeEqual } from "node:crypto";
import { syncInvoices } from "@/lib/bluebill";

export const dynamic = "force-dynamic";

/**
 * For a scheduler (e.g. Cloud Scheduler every 15 minutes):
 *   POST /api/finance/bluebill/sync   Authorization: Bearer $CRON_SECRET
 * Disabled unless CRON_SECRET is set.
 */
export async function POST(req: Request) {
  const expected = process.env.CRON_SECRET?.trim();
  const given = req.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1] ?? "";
  if (!expected || given.length !== expected.length || !timingSafeEqual(Buffer.from(given), Buffer.from(expected))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await syncInvoices({ full: new URL(req.url).searchParams.get("full") === "1" });
  return Response.json(result, { status: result.ok ? 200 : 502 });
}
