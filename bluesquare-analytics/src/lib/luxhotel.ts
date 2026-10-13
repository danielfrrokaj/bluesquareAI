import "server-only";
import { createHash } from "node:crypto";
import { parseHotelDetail, parseHotelList, type HotelDetail, type HotelList, type LuxRead } from "./luxhotel-data";

const BASE_URL = "https://us-central1-pms-channex-2030.cloudfunctions.net/hotelsApi";
const CACHE_MS = 60_000;
type Entry = { until: number; result: Promise<LuxRead<unknown>>; lastData: unknown };
const shared = globalThis as typeof globalThis & { __luxhotelCache?: Map<string, Entry> };

/** Cache successes and failures; coalesce simultaneous reads, including manual refreshes. */
async function read<T>(path: string, parse: (value: unknown) => T): Promise<LuxRead<T>> {
  const key = process.env.LUXHOTEL_API_KEY?.trim();
  const now = Date.now();
  const checkedAt = new Date(now).toISOString();
  if (!key) return { status: "unconfigured", data: null, message: "The LuxHotel connection has not been configured. Ask an administrator to connect it.", checkedAt, retryAt: new Date(now + CACHE_MS).toISOString() };
  // A credential change must never reuse a previous credential's cached response.
  const cacheKey = createHash("sha256").update(key).digest("hex") + path;
  const cache = shared.__luxhotelCache ??= new Map();
  const previous = cache.get(cacheKey);
  if (previous && previous.until > now) return previous.result as Promise<LuxRead<T>>;
  const entry: Entry = { until: now + CACHE_MS, result: Promise.resolve(null as never), lastData: previous?.lastData ?? null };
  cache.set(cacheKey, entry);
  if (cache.size > 100) {
    // Keep active requests in the cache so another caller cannot duplicate them.
    for (const [id, cached] of cache) if (id !== cacheKey && cached.until <= now) { cache.delete(id); if (cache.size <= 100) break; }
  }
  entry.result = (async (): Promise<LuxRead<T>> => {
    let httpStatus = 0;
    try {
      const response = await fetch(BASE_URL + path, {
        headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
        cache: "no-store", redirect: "error", signal: AbortSignal.timeout(25_000),
      });
      httpStatus = response.status;
      if (!response.ok) throw new Error("upstream_error");
      const data = parse(await response.json());
      entry.lastData = data;
      entry.until = Date.now() + CACHE_MS;
      return { status: "ready", data, message: null, checkedAt: new Date().toISOString(), retryAt: new Date(entry.until).toISOString() };
    } catch {
      entry.until = Date.now() + CACHE_MS;
      // Rejected credentials and removed properties must not continue exposing cached data.
      if (httpStatus === 401 || httpStatus === 403 || httpStatus === 404) entry.lastData = null;
      const message = httpStatus === 401 || httpStatus === 403 ? "LuxHotel rejected the connection credentials. Ask an administrator to check the API key."
        : httpStatus === 404 ? "This property is no longer available on LuxHotel."
        : httpStatus === 429 ? "LuxHotel is receiving too many requests. Refresh will be available in one minute."
        : "LuxHotel could not be reached or returned an incomplete response. The next refresh will retry.";
      return { status: entry.lastData ? "stale" : "error", data: entry.lastData as T | null, message, checkedAt, retryAt: new Date(entry.until).toISOString() };
    }
  })();
  return entry.result as Promise<LuxRead<T>>;
}

export const getLuxHotels = () => read<HotelList>("/hotels", parseHotelList);
export const getLuxHotel = (id: string) => read<HotelDetail>(`/hotels/${encodeURIComponent(id)}`, value => {
  const hotel = parseHotelDetail(value);
  if (hotel.id !== id) throw new Error("invalid_response");
  return hotel;
});
