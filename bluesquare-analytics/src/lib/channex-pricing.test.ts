import assert from "node:assert/strict";
import { test } from "node:test";
import { channexInvoice, duplicateConnections, invoiceBasis, type BillingProperty } from "./channex-pricing";

const property = (overrides: Partial<BillingProperty> = {}): BillingProperty =>
  ({ id: "p1", name: "Property", units: 10, channels: ["BookingCom"], chat: false, ...overrides });
const amount = (invoice: ReturnType<typeof channexInvoice>, label: string) => invoice.lines.find(l => l.label === label)!.amount;

test("an empty portfolio still pays the platform fee", () => {
  assert.equal(channexInvoice([], {}).total, 130);
});

test("hotels pay per property, whatever their size; uncategorised properties are hotels", () => {
  const invoice = channexInvoice([property({ units: 1 }), property({ id: "p2", units: 80 })], {});
  assert.equal(invoice.hotels, 2);
  assert.equal(amount(invoice, "Channel Manager · Hotels"), 14);
  assert.equal(invoice.total, 144);
  assert.ok(invoice.properties.every(p => !p.categorySet && p.category === "hotel" && p.cost === 7));
});

test("vacation rentals pay per physical unit", () => {
  const invoice = channexInvoice([property({ units: 3 }), property({ id: "p2", units: 4 })], { p1: "vacation_rental", p2: "vacation_rental" });
  assert.equal(invoice.hotels, 0);
  assert.equal(invoice.rentals, 2);
  assert.equal(invoice.units, 7);
  assert.equal(amount(invoice, "Channel Manager · Vacation rentals"), 3.5);
  assert.equal(invoice.total, 133.5);
  assert.deepEqual(invoice.properties.map(p => p.cost), [2, 1.5]);
});

test("properties without an active channel connection are not billed", () => {
  const invoice = channexInvoice([property({ channels: [] }), property({ id: "p2", channels: [], chat: true, units: 5 })], { p2: "vacation_rental" });
  assert.equal(invoice.unbilled, 2);
  assert.equal(invoice.total, 130);
  assert.ok(invoice.properties.every(p => !p.billed && p.cost === 0));
});

test("Chat & Reviews is added only where the messages module is on", () => {
  const invoice = channexInvoice([property({ chat: true }), property({ id: "p2" }), property({ id: "p3", units: 6, chat: true })], { p3: "vacation_rental" });
  assert.equal(amount(invoice, "Chat & Reviews · Hotels"), 7);
  assert.equal(amount(invoice, "Chat & Reviews · Vacation rentals"), 3);
  assert.equal(invoice.total, 130 + 14 + 3 + 7 + 3);
  assert.equal(invoice.properties.find(p => p.id === "p3")!.cost, 6);
});

test("each extra connection to the same OTA costs $1", () => {
  assert.equal(duplicateConnections(["BookingCom", "AirBNB", "BookingCom", "BookingCom"]), 2);
  const invoice = channexInvoice([property({ channels: ["BookingCom", "BookingCom", "AirBNB"] })], {});
  assert.equal(amount(invoice, "Duplicate channel connections"), 1);
  assert.equal(invoice.properties[0].cost, 8);
  assert.equal(invoice.total, 138);
});

test("volume tiers apply from 500 hotels and 2,000 rental units", () => {
  const hotels = Array.from({ length: 500 }, (_, i) => property({ id: `h${i}` }));
  assert.equal(amount(channexInvoice(hotels, {}), "Channel Manager · Hotels"), 3000);
  assert.equal(amount(channexInvoice(hotels.slice(1), {}), "Channel Manager · Hotels"), 499 * 7);
  const rentals = { v: "vacation_rental" as const };
  assert.equal(amount(channexInvoice([property({ id: "v", units: 1999 })], rentals), "Channel Manager · Vacation rentals"), 999.5);
  assert.equal(amount(channexInvoice([property({ id: "v", units: 2000 })], rentals), "Channel Manager · Vacation rentals"), 900);
  assert.equal(amount(channexInvoice([property({ id: "v", units: 7000 })], rentals), "Channel Manager · Vacation rentals"), 2100);
});

test("a month's invoice follows the last snapshot taken by the end of its 1st (UTC)", () => {
  const snapshots = ["2026-09-20T10:00:00.000Z", "2026-10-01T23:59:00.000Z", "2026-10-02T00:00:00.000Z", "2026-10-15T08:00:00.000Z"].map(takenAt => ({ takenAt }));
  assert.equal(invoiceBasis(snapshots, "2026-10")?.takenAt, "2026-10-01T23:59:00.000Z");
  assert.equal(invoiceBasis(snapshots, "2026-11")?.takenAt, "2026-10-15T08:00:00.000Z");
  // Before the first snapshot ever, the month's first snapshot is the best estimate.
  assert.equal(invoiceBasis(snapshots.slice(2), "2026-10")?.takenAt, "2026-10-02T00:00:00.000Z");
  assert.equal(invoiceBasis(snapshots, "2026-08"), null);
});
