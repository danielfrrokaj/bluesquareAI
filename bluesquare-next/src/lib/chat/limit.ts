// A light per-instance guard against runaway clients. Best effort: Cloud Run instances don't share it,
// which is fine for keeping one visitor from hammering the AI, not for hard quotas.

const hits = new Map<string, number[]>();

/** True when `key` stays within `max` calls per `windowMs`; false blocks the call. */
export function withinLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const kept = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (kept.length >= max) {
    hits.set(key, kept);
    return false;
  }
  kept.push(now);
  hits.set(key, kept);
  if (hits.size > 10_000) hits.clear(); // never grow without bound
  return true;
}

/** The caller's address as Cloud Run reports it. */
export const clientKey = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
