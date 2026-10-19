import "server-only";
import { query } from "./db";
import { isDate } from "./period";
import { createLead, phoneKey, type LeadInput, type LeadStatus } from "./sales";

// Leads sent by a program through the API (POST /api/sales/leads), e.g. a Claude automation that finds hotels to contact.
// Each is checked like a lead typed in Sales, and skipped when the system already has it, so the same hotel can be sent
// twice without being contacted twice.

export const MAX_LEADS_PER_CALL = 100;

export type IntakeResult =
  | { index: number; status: "created"; id: string }
  | { index: number; status: "new" } // dry run: would be created
  // id: the lead already in Sales; same_as_index: an earlier lead in this call (with no id on a dry run)
  | { index: number; status: "duplicate"; match: Match; lead_status: LeadStatus; id?: string; same_as_index?: number }
  | { index: number; status: "invalid"; error: string };
type Match = "external_id" | "phone" | "email" | "name";

// Lead fields and their longest length; longer text is cut, not refused.
const TEXT = { hotel: 120, contact: 120, phone: 40, email: 160, city: 80, property_type: 40, current_system: 120, source: 60 } as const;
// Shown on the lead under these labels.
const DETAILS = { website: ["Website", 300], address: ["Address", 300], notes: ["Notes", 2000] } as const;
const MAX_EXTRA = 12;

type Candidate = { input: LeadInput; extra: Record<string, string>; externalId: string | null };

const text = (v: unknown, max: number) => (typeof v === "string" || typeof v === "number" ? String(v).trim().slice(0, max) || null : null);
const lower = (v: string | null) => v?.toLowerCase() ?? "";

/** One lead from the request, or why it can't be one. */
function read(raw: unknown, addedBy: string): Candidate | string {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return "Each lead must be an object.";
  const r = raw as Record<string, unknown>;
  const input: LeadInput = {
    hotel: text(r.hotel, TEXT.hotel), contact: text(r.contact, TEXT.contact), phone: text(r.phone, TEXT.phone),
    email: text(r.email, TEXT.email)?.toLowerCase() ?? null, city: text(r.city, TEXT.city), property_type: text(r.property_type, TEXT.property_type),
    rooms: null, current_system: text(r.current_system, TEXT.current_system), source: text(r.source, TEXT.source) ?? "Claude",
    due_date: text(r.due_date, 10), owner_id: null,
  };
  if (!input.hotel && !input.contact && !input.phone) return "Give at least hotel, contact or phone.";
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) return `"${input.email}" isn't an email address.`;
  if (input.due_date && !isDate(input.due_date)) return "due_date must be a date as YYYY-MM-DD.";
  if (r.rooms !== undefined && r.rooms !== null && r.rooms !== "") {
    const n = Number(r.rooms);
    if (!Number.isInteger(n) || n < 0 || n > 100000) return "rooms must be a whole number.";
    input.rooms = n;
  }
  const extra: Record<string, string> = {};
  for (const [key, [label, max]] of Object.entries(DETAILS)) {
    const value = text(r[key], max);
    if (value) extra[label] = value;
  }
  if (r.extra !== undefined && (typeof r.extra !== "object" || r.extra === null || Array.isArray(r.extra))) return "extra must be an object of text values.";
  for (const [key, v] of Object.entries((r.extra as Record<string, unknown>) ?? {}).slice(0, MAX_EXTRA)) {
    const label = key.trim().slice(0, 40);
    const value = text(v, 500);
    if (label && value && !(label in extra)) extra[label] = value;
  }
  extra["Added by"] = addedBy;
  const externalId = text(r.external_id, 200);
  // Prefixed so ids from the API never collide with those of other imports (e.g. multisystem:…).
  return { input, extra, externalId: externalId ? `api:${externalId}` : null };
}

type Known = { id: string | null; index?: number; status: LeadStatus; phone_key: string | null; email: string; external_id: string | null; hotel: string; city: string };

/** The lead this one would repeat: same external id, phone, email, or name in the same city (or where either has none). */
function findMatch(c: Candidate, known: Known[]): { lead: Known; match: Match } | null {
  const phone = phoneKey(c.input.phone);
  const name = lower(c.input.hotel);
  const city = lower(c.input.city);
  const checks: [Match, (k: Known) => boolean][] = [
    ["external_id", (k) => !!c.externalId && k.external_id === c.externalId],
    ["phone", (k) => !!phone && k.phone_key === phone],
    ["email", (k) => !!c.input.email && k.email === c.input.email],
    ["name", (k) => !!name && k.hotel === name && (!city || !k.city || k.city === city)],
  ];
  for (const [match, test] of checks) {
    const lead = known.find(test);
    if (lead) return { lead, match };
  }
  return null;
}

/** Creates the new leads (or, on a dry run, only says which would be new) and reports on each, in the order sent. */
export async function intakeLeads(items: unknown[], o: { addedBy: string; dryRun: boolean }): Promise<IntakeResult[]> {
  const candidates = items.map((raw) => read(raw, o.addedBy));
  const valid = candidates.filter((c): c is Candidate => typeof c !== "string");
  const known = await query<Known>(
    `select id, status, phone_key, lower(coalesce(email, '')) as email, external_id, lower(coalesce(hotel, '')) as hotel,
            lower(coalesce(city, '')) as city
     from sales_leads
     where phone_key = any($1) or lower(email) = any($2) or external_id = any($3) or lower(hotel) = any($4)`,
    [
      valid.map((c) => phoneKey(c.input.phone)).filter(Boolean), valid.map((c) => c.input.email).filter(Boolean),
      valid.map((c) => c.externalId).filter(Boolean), valid.map((c) => lower(c.input.hotel)).filter(Boolean),
    ],
  );
  const results: IntakeResult[] = [];
  for (const [index, c] of candidates.entries()) {
    if (typeof c === "string") {
      results.push({ index, status: "invalid", error: c });
      continue;
    }
    const found = findMatch(c, known);
    if (found) {
      const { id, index: same } = found.lead;
      results.push({ index, status: "duplicate", match: found.match, lead_status: found.lead.status, ...(id && { id }), ...(same !== undefined && { same_as_index: same }) });
      continue;
    }
    const id = o.dryRun ? null : await createLead({ ...c.input, extra: c.extra, external_id: c.externalId }, null);
    results.push(id ? { index, status: "created", id } : { index, status: "new" });
    // Later leads in the same call are checked against this one too.
    known.push({
      id, index, status: "open", phone_key: phoneKey(c.input.phone), email: c.input.email ?? "", external_id: c.externalId,
      hotel: lower(c.input.hotel), city: lower(c.input.city),
    });
  }
  return results;
}
