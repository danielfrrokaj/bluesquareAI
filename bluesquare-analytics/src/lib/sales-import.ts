import "server-only";
import { randomUUID } from "node:crypto";
import { query } from "./db";
import { aiEnabled, generateJson } from "./ai";
import { addNote, createLead, existingPhoneKeys, phoneKey, type LeadStatus } from "./sales";
import { LEAD_FIELDS, SOURCES, PROPERTY_TYPES, isLeadField, type LeadField } from "./sales-fields";

// Bulk import: a pasted or uploaded table is parsed, its columns are mapped to lead fields (by Gemini
// when configured, else by name), the user checks the mapping, then the rows become leads.
// Free text that isn't a table (e.g. a record copied from another app) is read by Gemini directly.

export const MAX_ROWS = 5000;
const MAX_TEXT = 2_000_000;
const MAX_FREE_TEXT = 40_000;

export type Mapping = Record<string, LeadField | "">; // column -> field ("" = keep as extra info)
export type Analysis = {
  id: string;
  mode: "table" | "extracted";
  headers: string[];
  sample: string[][];
  total: number;
  mapping: Mapping;
  ai: "used" | "off" | "failed";
};

// ---------- Parsing ----------

/** Splits delimited text, honoring quotes ("a, b" stays one cell; "" is a quote). */
function splitRows(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"' && cell === "") quoted = true;
    else if (c === delimiter) { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.map((r) => r.map((v) => v.trim())).filter((r) => r.some((v) => v !== ""));
}

/** A table when most lines split into the same number (2+) of cells by tab, semicolon or comma. */
export function parseTable(text: string): { headers: string[]; rows: string[][] } | null {
  if (text.split(/\r?\n/).filter((l) => l.trim()).length < 2) return null;
  for (const d of ["\t", ";", ","]) {
    // Count cells the way they'll be read: a delimiter inside "quotes" (e.g. a comma in a note) isn't a column break.
    const counts = splitRows(text.slice(0, 20_000), d).slice(0, 20).map((r) => r.length);
    if (counts.length < 2 || counts[0] < 2) continue;
    if (counts.filter((n) => n === counts[0]).length / counts.length < 0.6 && d !== "\t") continue;
    const all = splitRows(text, d);
    const width = all[0].length;
    if (width < 2 || all.length < 2) continue;
    const headers = all[0].map((h, i) => h || `Column ${i + 1}`);
    return { headers, rows: all.slice(1).map((r) => headers.map((_, i) => r[i] ?? "")) };
  }
  return null;
}

// ---------- Mapping by name (no AI) ----------

const plain = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ë/gi, "e").replace(/ç/gi, "c").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// First match wins, and each field is used once: specific names come before broad ones ("Telefonuar?" is "called", not "phone").
const RULES: [LeadField, RegExp][] = [
  ["called", /\b(telefonuar|thirrur|called|contacted)\b/],
  ["interested", /\b(interes\w*)\b/],
  ["demo_sent", /\bdemo\b/],
  ["lr_sent", /\blr\b/],
  ["due_date", /\b(due|follow ?up|afat\w*|next (call|contact)|data e (radhes|ardhshme))\b/],
  ["status", /\b(s?t?atus\w*|satus|gjendja|stage|faza)\b/],
  ["source", /\b(source|burim\w*|nga erdhi|channel|kanal\w*|lead source)\b/],
  ["notes", /\b(shenim\w*|notes?|koment\w*|comments?|pershkrim\w*|description)\b/],
  ["rooms", /\b(rooms?|dhoma\w*|nr dhom\w*|units?|kapacitet\w*)\b/],
  ["email", /\b(e ?mail|email)\b/],
  ["phone", /\b(phone|tel\w*|cel\w*|mobil\w*|nr tel|numri)\b/],
  ["city", /\b(city|qytet\w*|location|vendndodhj\w*|zona|town)\b/],
  ["property_type", /\b(type|lloj\w*|property type|kategori\w*)\b/],
  ["current_system", /\b(pms|channel manager|system\w*|sistem\w*|software)\b/],
  ["contact", /\b(contact|kontakt\w*|person\w*|pronar\w*|owner|manager|emri i personit)\b/],
  ["hotel", /\b(hotel\w*|property|prona|business|biznes\w*|name|emri|struktur\w*)\b/],
  ["ref", /^(id|nr|no|#|ref\w*)$/],
];

export function mapByName(headers: string[]): Mapping {
  const used = new Set<LeadField>();
  const mapping: Mapping = {};
  for (const h of headers) {
    const p = plain(h);
    const hit = RULES.find(([f, re]) => !used.has(f) && re.test(p));
    mapping[h] = hit ? hit[0] : "";
    if (hit) used.add(hit[0]);
  }
  return mapping;
}

// ---------- Mapping and extraction with Gemini ----------

const FIELD_HELP = Object.entries(LEAD_FIELDS)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n");

async function mapWithAi(headers: string[], rows: string[][]): Promise<Mapping> {
  const sample = rows.slice(0, 8);
  const prompt = `You map spreadsheet columns to fields of a CRM for selling hotel software (PMS, channel manager).
Columns may be in English or Albanian. Map each column to the single best field, or to "" when none fits.
Use each field at most once. A yes/no column like "Telefonuar?" means "called", not "phone".

Fields:
${FIELD_HELP}

Columns with sample values:
${headers.map((h, i) => `- ${JSON.stringify(h)}: ${JSON.stringify(sample.map((r) => r[i]).filter(Boolean).slice(0, 5))}`).join("\n")}`;
  const res = await generateJson<{ columns: { column: string; field: string }[] }>(prompt, {
    type: "object",
    properties: {
      columns: {
        type: "array",
        items: {
          type: "object",
          properties: { column: { type: "string" }, field: { type: "string", enum: ["", ...Object.keys(LEAD_FIELDS)] } },
          required: ["column", "field"],
        },
      },
    },
    required: ["columns"],
  });
  const mapping: Mapping = Object.fromEntries(headers.map((h) => [h, ""]));
  const used = new Set<string>();
  for (const { column, field } of res.columns) {
    if (column in mapping && isLeadField(field) && !used.has(field)) {
      mapping[column] = field;
      used.add(field);
    }
  }
  return mapping;
}

/** Reads leads out of free text (one or more records in any layout). */
async function extractWithAi(text: string): Promise<{ headers: string[]; rows: string[][] }> {
  const fields = Object.keys(LEAD_FIELDS) as LeadField[];
  const prompt = `Extract every sales lead from the text below for a CRM that sells hotel software (PMS, channel manager).
The text may be in English or Albanian, copied from a form, a list or a message. Keep values as written, except:
- called, interested, demo_sent, lr_sent: "yes" or "no" (Po = yes, Jo = no)
- due_date: YYYY-MM-DD
- status: "open", "won" or "lost" (Pending / in progress = open)
Use "" for anything missing; "–" means missing.

Fields:
${FIELD_HELP}

Text:
"""
${text.slice(0, MAX_FREE_TEXT)}
"""`;
  const res = await generateJson<{ leads: Record<string, string>[] }>(prompt, {
    type: "object",
    properties: {
      leads: {
        type: "array",
        items: { type: "object", properties: Object.fromEntries(fields.map((f) => [f, { type: "string" }])) },
      },
    },
    required: ["leads"],
  });
  const headers = fields.map((f) => LEAD_FIELDS[f]);
  return { headers, rows: res.leads.slice(0, MAX_ROWS).map((l) => fields.map((f) => String(l[f] ?? "").trim())) };
}

// ---------- Analyze ----------

export async function analyze(text: string, userId: string): Promise<Analysis | string> {
  if (!text.trim()) return "Paste rows from a spreadsheet, or upload a CSV file.";
  if (text.length > MAX_TEXT) return "That's too much at once: up to about 2 MB of text.";
  let mode: Analysis["mode"] = "table";
  let ai: Analysis["ai"] = aiEnabled() ? "used" : "off";
  let table = parseTable(text);
  let mapping: Mapping;

  if (!table) {
    if (!aiEnabled()) return "This doesn't look like a table. Paste rows with a header row (copied from Excel or Google Sheets), or set GEMINI_API_KEY to import free-form text.";
    try {
      table = await extractWithAi(text);
    } catch (err) {
      console.error("Lead extraction failed", err);
      return "Gemini couldn't read this text. Try again, or paste it as a table with a header row.";
    }
    if (!table.rows.length) return "No leads were found in this text.";
    mode = "extracted";
    const fields = Object.keys(LEAD_FIELDS) as LeadField[];
    mapping = Object.fromEntries(table.headers.map((h, i) => [h, fields[i]]));
  } else {
    if (table.rows.length > MAX_ROWS) return `Up to ${MAX_ROWS} rows per import; this has ${table.rows.length}.`;
    mapping = mapByName(table.headers);
    if (ai === "used") {
      try {
        mapping = await mapWithAi(table.headers, table.rows);
      } catch (err) {
        console.error("AI column mapping failed", err);
        ai = "failed";
      }
    }
  }

  const id = randomUUID();
  // Old drafts of this user are dropped; only the latest analysis can be imported.
  await query("delete from sales_imports where created_by = $1 or created_at < now() - interval '1 day'", [userId]);
  await query("insert into sales_imports (id, created_by, mode, headers, rows) values ($1, $2, $3, $4::jsonb, $5::jsonb)", [
    id, userId, mode, JSON.stringify(table.headers), JSON.stringify(table.rows),
  ]);
  return { id, mode, headers: table.headers, sample: table.rows.slice(0, 5), total: table.rows.length, mapping, ai };
}

// ---------- Values ----------

const EMPTY = /^(-|–|—|n\/?a|null|none|\?)$/i;
const clean = (v: string | undefined) => {
  const s = (v ?? "").trim();
  return !s || EMPTY.test(s) ? null : s;
};

export function toBool(v: string | undefined): boolean {
  const s = plain(clean(v) ?? "");
  return /^(y|yes|po|true|1|x|ok|done|sent|derguar|telefonuar|interesuar|po \w+)$/.test(s) || /^(✓|✔|☑)/.test((v ?? "").trim());
}

/** YYYY-MM-DD from ISO, d/m/y or d.m.y (day first, as in Albania), or an Excel serial day number. */
export function toDate(v: string | undefined): string | null {
  const s = clean(v);
  if (!s) return null;
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return iso(+m[1], +m[2], +m[3]);
  m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (m) return iso(m[3].length === 2 ? 2000 + +m[3] : +m[3], +m[2], +m[1]);
  if (/^\d{5}$/.test(s)) {
    const d = new Date(Date.UTC(1899, 11, 30) + +s * 86400000);
    return d.toISOString().slice(0, 10);
  }
  return null;
}
function iso(y: number, mo: number, d: number) {
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function toStatus(v: string | undefined): LeadStatus {
  const s = plain(clean(v) ?? "");
  if (/\b(won|win|fitu\w*|klient\w*|customer|signed|nenshkru\w*|active|aktiv\w*|closed won)\b/.test(s)) return "won";
  if (/\b(lost|humb\w*|refuz\w*|rejected|cancel\w*|anull\w*|nuk do|not interested|closed lost|dead)\b/.test(s)) return "lost";
  return "open";
}

const pick = (v: string | null, options: string[]) => (v ? (options.find((o) => plain(o) === plain(v)) ?? v) : null);

function toSource(v: string | undefined): string | null {
  const s = clean(v);
  if (!s) return null;
  const p = plain(s);
  if (/^(telefon\w*|phone|call)$/.test(p)) return "Phone";
  if (/(web|faqe)/.test(p)) return "Website";
  if (/(rekomand|referral|referim|mik)/.test(p)) return "Referral";
  if (/(fb|facebook)/.test(p)) return "Facebook";
  if (/(insta|ig)/.test(p)) return "Instagram";
  if (/booking/.test(p)) return "Booking.com";
  return pick(s, SOURCES);
}

// ---------- Import ----------

export type ImportResult = { created: number; duplicates: number; empty: number };

export async function runImport(id: string, userId: string, mapping: Mapping, ownerId: string | null): Promise<ImportResult | string> {
  const [draft] = await query<{ headers: string[]; rows: string[][] }>("select headers, rows from sales_imports where id = $1 and created_by = $2", [id, userId]);
  if (!draft) return "This import expired. Paste the data again.";
  const col = (field: LeadField) => draft.headers.findIndex((h) => mapping[h] === field);
  const idx = Object.fromEntries((Object.keys(LEAD_FIELDS) as LeadField[]).map((f) => [f, col(f)])) as Record<LeadField, number>;
  const get = (row: string[], f: LeadField) => (idx[f] >= 0 ? row[idx[f]] : undefined);
  const extraCols = draft.headers.map((h, i) => [h, i] as const).filter(([h]) => !mapping[h]);

  const keys = draft.rows.map((r) => phoneKey(clean(get(r, "phone"))));
  const existing = await existingPhoneKeys(keys.filter((k): k is string => !!k));
  const seen = new Set<string>();
  const result: ImportResult = { created: 0, duplicates: 0, empty: 0 };

  for (const [n, row] of draft.rows.entries()) {
    const hotel = clean(get(row, "hotel")), contact = clean(get(row, "contact")), phone = clean(get(row, "phone"));
    if (!hotel && !contact && !phone) { result.empty++; continue; }
    const key = keys[n];
    if (key && (existing.has(key) || seen.has(key))) { result.duplicates++; continue; }
    if (key) seen.add(key);
    const rooms = Number.parseInt((clean(get(row, "rooms")) ?? "").replace(/\D/g, ""), 10);
    const extra = Object.fromEntries(extraCols.map(([h, i]) => [h, clean(row[i])]).filter((e): e is [string, string] => !!e[1]));
    const leadId = await createLead(
      {
        ref: clean(get(row, "ref")), hotel, contact, phone, email: clean(get(row, "email")), city: clean(get(row, "city")),
        property_type: pick(clean(get(row, "property_type")), PROPERTY_TYPES), rooms: Number.isFinite(rooms) && rooms < 100000 ? rooms : null,
        current_system: clean(get(row, "current_system")), source: toSource(get(row, "source")), due_date: toDate(get(row, "due_date")),
        owner_id: ownerId, called: toBool(get(row, "called")), interested: toBool(get(row, "interested")),
        demo_sent: toBool(get(row, "demo_sent")), lr_sent: toBool(get(row, "lr_sent")), status: toStatus(get(row, "status")), extra,
      },
      userId,
    );
    const notes = clean(get(row, "notes"));
    if (notes) await addNote(leadId, userId, "note", notes.slice(0, 5000));
    await addNote(leadId, userId, "event", "Imported");
    result.created++;
  }
  await query("delete from sales_imports where id = $1", [id]);
  return result;
}
