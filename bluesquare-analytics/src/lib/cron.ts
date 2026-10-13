import "server-only";
import { timingSafeEqual } from "node:crypto";

/** True when the request carries "Authorization: Bearer $CRON_SECRET". Always false while CRON_SECRET is unset. */
export function isCronRequest(req: Request): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  const given = req.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1] ?? "";
  return !!expected && given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}
