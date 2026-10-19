import "server-only";
import { after } from "next/server";
import { query } from "./db";
import { getLuxHotel, getLuxHotels } from "./luxhotel";
import { parseHotelDetail, parseHotelList, type HotelDetail, type HotelList, type LuxRead } from "./luxhotel-data";

// LuxHotel's properties, saved in our database so the pages open instantly, and refreshed in the background.
// /hotels counts every booking on LuxHotel (~18k reads there per call), so the background copy is refreshed every ten
// minutes; pressing Refresh asks again at most once a minute. A property's details refresh when someone opens it.

const SYNC_KEY = "lux_hotels_sync"; // app_settings: { attempted_at, error }
const LIST = "/hotels";

type Row = { data: unknown; fetched_at: string };
const load = async (path: string) => (await query<Row>("select data, fetched_at::text as fetched_at from lux_cache where path = $1", [path]))[0] ?? null;
const save = (path: string, data: unknown) =>
  query(
    `insert into lux_cache (path, data, fetched_at) values ($1, $2::jsonb, now())
     on conflict (path) do update set data = excluded.data, fetched_at = now()`,
    [path, JSON.stringify(data)],
  );
const iso = (pgTime: string) => new Date(pgTime).toISOString();
const inAMinute = () => new Date(Date.now() + 60_000).toISOString();

/** Copies every property from LuxHotel: at most every ten minutes, or every minute when someone presses Refresh. */
export async function syncHotels(force = false): Promise<void> {
  if (!process.env.LUXHOTEL_API_KEY?.trim()) return;
  const claimed = await query(
    `insert into app_settings (key, value) values ($1, jsonb_build_object('attempted_at', now(), 'error', null))
     on conflict (key) do update set value = excluded.value, updated_at = now()
       where (app_settings.value->>'attempted_at')::timestamptz <= now() - $2::interval
     returning key`,
    [SYNC_KEY, force ? "1 minute" : "10 minutes"],
  );
  if (!claimed.length) return;
  const read = await getLuxHotels();
  if (read.status === "ready" && read.data) await save(LIST, read.data);
  else await query("update app_settings set value = value || jsonb_build_object('error', $2::text) where key = $1", [SYNC_KEY, read.message]);
}

/** Every property, from the saved copy. LuxHotel is asked directly only the first time, before anything is saved. */
export async function savedHotels(): Promise<LuxRead<HotelList>> {
  const [row, [state]] = await Promise.all([
    load(LIST),
    query<{ error: string | null }>("select value->>'error' as error from app_settings where key = $1", [SYNC_KEY]),
  ]);
  if (row) {
    try {
      // The last background refresh failing shows as a saved snapshot, with why.
      const error = state?.error ?? null;
      return { status: error ? "stale" : "ready", data: parseHotelList(row.data), message: error, checkedAt: iso(row.fetched_at), retryAt: inAMinute() };
    } catch {
      // Saved under an older contract: read it fresh below.
    }
  }
  const live = await getLuxHotels();
  if (live.status === "ready" && live.data) await save(LIST, live.data);
  return live;
}

/** One property's details, from the saved copy when there is one; refreshed after the page is sent when older than a minute. */
export async function savedHotel(id: string): Promise<LuxRead<HotelDetail>> {
  const path = `${LIST}/${id}`;
  const row = await load(path);
  if (row) {
    try {
      const data = parseHotelDetail(row.data);
      if (data.id === id) {
        if (Date.now() - Date.parse(iso(row.fetched_at)) > 60_000) {
          const refresh = () => refreshHotel(id).catch(() => console.error("LuxHotel property refresh failed"));
          try {
            after(refresh);
          } catch {
            void refresh(); // outside a request (e.g. a script): refresh right away instead
          }
        }
        return { status: "ready", data, message: null, checkedAt: iso(row.fetched_at), retryAt: inAMinute() };
      }
    } catch {
      // Saved under an older contract: read it fresh below.
    }
  }
  return refreshHotel(id);
}

async function refreshHotel(id: string): Promise<LuxRead<HotelDetail>> {
  const live = await getLuxHotel(id);
  if (live.status === "ready" && live.data) await save(`${LIST}/${id}`, live.data);
  return live;
}
