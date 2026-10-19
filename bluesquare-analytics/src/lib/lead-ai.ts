import "server-only";
import { generateJson } from "./ai";
import { isDate } from "./period";
import { PROPERTY_TYPES, SOURCES } from "./sales-fields";

// One lead from free text (a WhatsApp message, an email, call notes) with Gemini, for the "AI import" form. The result
// only pre-fills the lead form: nothing is saved until the person checks it and adds the lead.

export const DRAFT_FIELDS = ["hotel", "contact", "phone", "email", "city", "property_type", "rooms", "current_system", "source", "due_date", "note"] as const;
export type DraftField = (typeof DRAFT_FIELDS)[number];
export type LeadDraft = Record<DraftField, string>; // "" when the text doesn't say
export const MAX_LEAD_TEXT = 8000;

const LIMITS: Record<DraftField, number> = {
  hotel: 120, contact: 120, phone: 40, email: 160, city: 80, property_type: 40, rooms: 6, current_system: 120, source: 60, due_date: 10, note: 1000,
};
const pick = (value: string, choices: string[]) => choices.find((c) => c.toLowerCase() === value.toLowerCase()) ?? "";

/** Gemini's answer made safe for the form: known choices only, real dates, whole rooms, a plausible email. */
export function normalizeDraft(raw: Partial<Record<string, unknown>>): { draft: LeadDraft; filled: DraftField[] } {
  const text = (f: DraftField) => (typeof raw[f] === "string" || typeof raw[f] === "number" ? String(raw[f]).trim() : "").replace(/^[-–—]$/, "").slice(0, LIMITS[f]);
  const draft = Object.fromEntries(DRAFT_FIELDS.map((f) => [f, text(f)])) as LeadDraft;
  draft.property_type = pick(draft.property_type, PROPERTY_TYPES);
  draft.source = pick(draft.source, SOURCES);
  if (!isDate(draft.due_date)) draft.due_date = "";
  const rooms = Number(draft.rooms);
  draft.rooms = Number.isInteger(rooms) && rooms > 0 && rooms <= 100000 ? String(rooms) : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) draft.email = "";
  return { draft, filled: DRAFT_FIELDS.filter((f) => draft[f]) };
}

export async function extractLead(text: string, date: string): Promise<{ draft: LeadDraft; filled: DraftField[] }> {
  const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
  const prompt = `You fill in one sales lead for a company selling hotel software (PMS, channel manager, booking engine) in Albania.
The text below is about one property: a message, an email, a form or someone's call notes, in Albanian or English.
Take only what the text says; never guess. Use "" for anything it doesn't say.

- hotel: the property's name. contact: the person to talk to. phone and email as written. city: the town (e.g. Dhërmi, Sarandë).
- property_type: one of ${PROPERTY_TYPES.join(", ")}; "" if unclear.
- rooms: a whole number of rooms or units, else "".
- current_system: the PMS, channel manager or method they use now (e.g. Excel, Booking.com extranet, none).
- source: how they found us, one of ${SOURCES.join(", ")}; "" if not said.
- due_date: when to contact them next, as YYYY-MM-DD, only if the text gives a time. Today is ${weekday} ${date}; resolve
  "tomorrow"/"nesër", weekdays ("të hënën" = Monday) and "next week" from today.
- note: one to three short sentences in the text's language: what they want or said, and the next step. No contact details.

Text:
"""
${text.slice(0, MAX_LEAD_TEXT)}
"""`;
  const raw = await generateJson<Record<string, unknown>>(prompt, {
    type: "object",
    properties: Object.fromEntries(DRAFT_FIELDS.map((f) => [f, { type: "string" }])),
    required: [...DRAFT_FIELDS],
  });
  return normalizeDraft(raw);
}
