import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeDraft } from "./lead-ai";

test("keeps what the text said, trimmed, and lists what was filled", () => {
  const { draft, filled } = normalizeDraft({ hotel: " Hotel Riviera ", contact: "Arben", phone: "069 234 5678", rooms: "32", due_date: "2026-10-20" });
  assert.equal(draft.hotel, "Hotel Riviera");
  assert.equal(draft.rooms, "32");
  assert.deepEqual(filled, ["hotel", "contact", "phone", "rooms", "due_date"]);
  assert.equal(draft.email, "");
});

test("only the form's own choices, real dates, whole rooms and a plausible email get through", () => {
  const { draft, filled } = normalizeDraft({
    property_type: "villa", source: "TikTok", due_date: "next Tuesday", rooms: "about 30", email: "not an email", city: "–",
  });
  assert.equal(draft.property_type, "Villa"); // matched case-insensitively to the list
  assert.equal(draft.source, ""); // not one of the sources
  assert.equal(draft.due_date, "");
  assert.equal(draft.rooms, "");
  assert.equal(draft.email, "");
  assert.equal(draft.city, ""); // "–" means missing
  assert.deepEqual(filled, ["property_type"]);
  assert.equal(normalizeDraft({ rooms: 0 }).draft.rooms, "");
  assert.equal(normalizeDraft({ rooms: 14 }).draft.rooms, "14");
});

test("ignores anything that isn't text and caps lengths", () => {
  const { draft } = normalizeDraft({ hotel: { evil: true }, note: "x".repeat(5000), phone: null });
  assert.equal(draft.hotel, "");
  assert.equal(draft.phone, "");
  assert.equal(draft.note.length, 1000);
});
