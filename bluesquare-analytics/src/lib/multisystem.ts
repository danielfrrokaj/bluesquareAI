import "server-only";
import { query } from "./db";
import { addNote, createLead, existingPhoneKeys, phoneKey, type LeadStatus } from "./sales";
import { toSource } from "./sales-import";

// MultiSystem (multisystem.al): the "Leads · LuxHotel Sales" table, read with an API key scoped to it.
// The key can only list and read rows of that table (see /api/v1/openapi.json with it), so it lives here.
const ROWS_URL = "https://multisystem.al/api/v1/tables/64a2ffcf-dc66-4dae-a8dd-e14f6e6d3256/rows";
const API_KEY = "ms_live_4Yiqy78MJPm3e2R5Q2jgeTYXqSX02eE2gz5y3zXSzg0";
const PAGE_SIZE = 100; // the API's maximum
const MAX_PAGES = 50;

// Response keys are stable generated ids; the titles (in comments) can be renamed in MultiSystem without breaking this.
const F = {
  ref: "f_476e8677", // ID (autoid)
  dueDate: "f_c515548d", // Due Date
  hotel: "f_65e6e570", // Hotel
  phone: "f_f03d93b8", // Phone
  notes: "f_9463d923", // Shenimet (richtext)
  city: "f_9215a310", // Qyteti
  rooms: "f_bdfcf8d8", // Rooms
  called: "f_8e500998", // Telefonuar?
  interested: "f_46cfb97b", // I interesuar?
  demoSent: "f_82f16b49", // Derguar Demo?
  lrSent: "f_2f46065f", // Derguar LR?
  status: "f_62251c0f", // Satus: Pending | Lost | Won
  source: "f_83ad8744", // Nga erdhi?: Instagram, Telefon, Whatsapp, Facebook, Website, ChatGPT, AI Generated, TikTok
} as const;

type Row = { id: string; created_at: string; fields: Record<string, unknown> };

const text = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const flag = (v: unknown) => v === true;
const status = (v: unknown): LeadStatus => (v === "Won" ? "won" : v === "Lost" ? "lost" : "open");

/** Every row of the Leads table, page by page. */
async function readRows(): Promise<Row[] | string> {
  const rows: Row[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    let res: Response;
    try {
      res = await fetch(`${ROWS_URL}?page=${page}&limit=${PAGE_SIZE}`, {
        headers: { Authorization: `Bearer ${API_KEY}`, Accept: "application/json" },
        cache: "no-store", redirect: "error", signal: AbortSignal.timeout(20_000),
      });
    } catch {
      return "MultiSystem couldn't be reached. Try again in a moment.";
    }
    if (res.status === 401 || res.status === 403) return "MultiSystem refused the API key; it may have been revoked or lost access to the Leads table.";
    if (!res.ok) return `MultiSystem answered with an error (${res.status}). Try again in a moment.`;
    const body = (await res.json().catch(() => null)) as { data?: Row[]; meta?: { pages?: number } } | null;
    if (!Array.isArray(body?.data)) return "MultiSystem sent an unexpected answer.";
    rows.push(...body.data.filter((r) => typeof r?.id === "string" && r.fields && typeof r.fields === "object"));
    if (page >= (body.meta?.pages ?? page)) break;
  }
  return rows;
}

export type MultiSystemResult = { read: number; created: number; already: number; duplicates: number; empty: number };

/**
 * Adds the MultiSystem leads that aren't in Sales yet. A row imported before (by its MultiSystem id) or whose phone
 * already belongs to a lead is skipped, so pressing the button again only brings in new rows.
 */
export async function importMultiSystemLeads(userId: string): Promise<MultiSystemResult | string> {
  const rows = await readRows();
  if (typeof rows === "string") return rows;
  const imported = new Set(
    (await query<{ external_id: string }>("select external_id from sales_leads where external_id like 'multisystem:%'")).map((r) => r.external_id),
  );
  const keys = rows.map((r) => phoneKey(text(r.fields[F.phone])));
  const existing = await existingPhoneKeys(keys.filter((k): k is string => !!k));
  const seen = new Set<string>();
  const result: MultiSystemResult = { read: rows.length, created: 0, already: 0, duplicates: 0, empty: 0 };

  for (const [n, row] of rows.entries()) {
    const f = row.fields;
    const externalId = `multisystem:${row.id}`;
    if (imported.has(externalId)) { result.already++; continue; }
    const hotel = text(f[F.hotel]), phone = text(f[F.phone]);
    if (!hotel && !phone) { result.empty++; continue; }
    const key = keys[n];
    if (key && (existing.has(key) || seen.has(key))) { result.duplicates++; continue; }
    if (key) seen.add(key);
    const rooms = typeof f[F.rooms] === "number" ? Math.round(f[F.rooms] as number) : NaN;
    const due = text(f[F.dueDate]);
    const leadId = await createLead(
      {
        ref: text(f[F.ref]), hotel, contact: null, phone, email: null, city: text(f[F.city]), property_type: null,
        rooms: rooms >= 0 && rooms < 100000 ? rooms : null, current_system: null, source: toSource(text(f[F.source]) ?? undefined),
        due_date: due && /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : null, owner_id: null,
        called: flag(f[F.called]), interested: flag(f[F.interested]), demo_sent: flag(f[F.demoSent]), lr_sent: flag(f[F.lrSent]),
        status: status(f[F.status]), external_id: externalId, created_at: Number.isFinite(Date.parse(row.created_at)) ? row.created_at : null,
      },
      userId,
    );
    const notes = text(f[F.notes]);
    if (notes) await addNote(leadId, userId, "note", notes.slice(0, 5000));
    await addNote(leadId, userId, "event", "Imported from MultiSystem");
    result.created++;
  }
  return result;
}
