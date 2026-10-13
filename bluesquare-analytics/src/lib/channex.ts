import "server-only";
import { randomUUID } from "node:crypto";
import { query } from "./db";
import { getLuxHotels } from "./luxhotel";
import { addMonths } from "./period";
import { billingProperty, channexInvoice, invoiceBasis, type BillingProperty, type ChannexCategory } from "./channex-pricing";

const SYNC_KEY = "channex_sync"; // app_settings: { attempted_at, error }
const SYNC_EVERY_MS = 24 * 60 * 60 * 1000;

/**
 * Reads LuxHotel at most once every 24 hours and stores a snapshot. The attempt is claimed in the database
 * before calling, so simultaneous page loads and server instances never call twice, and a failed attempt
 * waits its 24 hours too.
 */
export async function syncChannex(): Promise<void> {
  if (!process.env.LUXHOTEL_API_KEY?.trim()) return;
  const claimed = await query(
    `insert into app_settings (key, value) values ($1, jsonb_build_object('attempted_at', now(), 'error', null))
     on conflict (key) do update set value = excluded.value, updated_at = now()
       where (app_settings.value->>'attempted_at')::timestamptz <= now() - interval '24 hours'
     returning key`, [SYNC_KEY]);
  if (!claimed.length) return;
  let error: string | null;
  try {
    error = await takeSnapshot();
  } catch {
    console.error("Channex snapshot could not be saved");
    error = "The LuxHotel data could not be saved.";
  }
  if (error) await query("update app_settings set value = value || jsonb_build_object('error', $2::text) where key = $1", [SYNC_KEY, error]);
}

async function takeSnapshot(): Promise<string | null> {
  const read = await getLuxHotels();
  if (read.status !== "ready" || !read.data) return read.message ?? "LuxHotel could not be reached.";
  const properties = read.data.hotels.map(billingProperty);
  // LuxHotel answers with empty channel lists, rather than failing, when it can't reach the channel
  // manager. Saving that would make every property look unbilled.
  const [last] = await query<{ properties: BillingProperty[] }>("select properties from channex_snapshots order by taken_at desc limit 1");
  if (last?.properties.some(p => p.channels.length) && !properties.some(p => p.channels.length)) {
    return "LuxHotel returned no channel connections at all, most likely because the channel manager was unreachable. The previous snapshot is kept.";
  }
  await query("insert into channex_snapshots (id, generated_at, properties) values ($1, $2, $3::jsonb)",
    [randomUUID(), read.data.generated_at, JSON.stringify(properties)]);
  return null;
}

const iso = (value: Date | string) => new Date(value).toISOString();

export async function getChannexReport() {
  await syncChannex();
  const [[state], index, categoryRows] = await Promise.all([
    query<{ attempted_at: Date | string; error: string | null }>(
      "select (value->>'attempted_at')::timestamptz as attempted_at, value->>'error' as error from app_settings where key = $1", [SYNC_KEY]),
    query<{ id: string; taken_at: Date | string }>("select id, taken_at from channex_snapshots order by taken_at"),
    query<{ hotel_id: string; category: ChannexCategory }>("select hotel_id, category from channex_categories"),
  ]);
  const snapshots = index.map(r => ({ id: r.id, takenAt: iso(r.taken_at) }));
  // Channex's billing dates are UTC.
  const month = new Date().toISOString().slice(0, 7);
  const months = Array.from({ length: 12 }, (_, i) => addMonths(month, -i));
  const bases = months.map(m => ({ month: m, basis: invoiceBasis(snapshots, m) }));
  const latest = snapshots.at(-1) ?? null;
  const ids = [...new Set([latest, ...bases.map(b => b.basis)].flatMap(s => s ? [s.id] : []))];
  const loaded = ids.length ? await query<{ id: string; properties: BillingProperty[] }>(
    "select id, properties from channex_snapshots where id in (select jsonb_array_elements_text($1::jsonb))", [JSON.stringify(ids)]) : [];
  const properties = new Map(loaded.map(r => [r.id, r.properties]));
  const categories: Record<string, ChannexCategory> = Object.fromEntries(categoryRows.map(r => [r.hotel_id, r.category]));
  const invoice = (s: { id: string; takenAt: string }) => ({ takenAt: s.takenAt, ...channexInvoice(properties.get(s.id) ?? [], categories) });
  const history = bases.flatMap(b => b.basis ? [{ month: b.month, ...invoice(b.basis) }] : []);
  const attemptedAt = state ? iso(state.attempted_at) : null;
  return {
    configured: !!process.env.LUXHOTEL_API_KEY?.trim(),
    attemptedAt,
    nextSyncAt: attemptedAt ? new Date(Date.parse(attemptedAt) + SYNC_EVERY_MS).toISOString() : null,
    syncError: state?.error ?? null,
    month,
    current: history[0]?.month === month ? history[0] : null,
    // Next month's invoice, if nothing changes before its 1st.
    next: latest ? { month: addMonths(month, 1), ...invoice(latest) } : null,
    history,
  };
}

export type ChannexReport = Awaited<ReturnType<typeof getChannexReport>>;

export async function setChannexCategory(hotelId: string, category: ChannexCategory, userId: string) {
  await query(
    `insert into channex_categories (hotel_id, category, updated_by) values ($1, $2, $3)
     on conflict (hotel_id) do update set category = excluded.category, updated_by = excluded.updated_by, updated_at = now()`,
    [hotelId, category, userId]);
}
