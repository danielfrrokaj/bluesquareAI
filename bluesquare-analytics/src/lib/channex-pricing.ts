// Channex WhiteLabel costs (https://channex.io/pricing), in USD excluding VAT. Pure: no database, no network.
import type { Hotel } from "./luxhotel-data";

/**
 * Channex bills by the property_type set on each property: hotel types per property, vacation-rental types
 * (apartment, villa, holiday_home…) per unit. LuxHotel's API doesn't report it, so an admin records it here;
 * a property with none is billed as a hotel, as Channex does when property_type is unset.
 */
export type ChannexCategory = "hotel" | "vacation_rental";
export const isChannexCategory = (v: unknown): v is ChannexCategory => v === "hotel" || v === "vacation_rental";

/** What one daily snapshot keeps of a LuxHotel property: only what billing needs (no owner details). */
export type BillingProperty = {
  id: string;
  name: string;
  units: number;        // physical rooms = Channex's count_of_rooms summed over room types
  channels: string[];   // OTA of each active channel connection, duplicates included
  chat: boolean;        // LuxHotel's messages module, i.e. Channex Chat & Reviews
};
export type Snapshot = { takenAt: string; properties: BillingProperty[] };

export const billingProperty = (h: Hotel): BillingProperty => ({
  id: h.id, name: h.name, units: h.rooms.physical,
  channels: h.channels.filter(c => c.active).map(c => c.ota), chat: h.modules.messages,
});

export const PLATFORM_FEE = 130;
export const DUPLICATE_CONNECTION_FEE = 1;
// Volume tiers, highest first. The page doesn't say whether a tier reprices the whole count or only the
// excess; the whole count is used (we are far below the first threshold either way).
export const HOTEL_TIERS = [{ from: 2000, rate: 4 }, { from: 1000, rate: 5 }, { from: 500, rate: 6 }, { from: 0, rate: 7 }];
export const RENTAL_TIERS = [{ from: 7000, rate: 0.3 }, { from: 4000, rate: 0.4 }, { from: 2000, rate: 0.45 }, { from: 0, rate: 0.5 }];

const rate = (tiers: { from: number; rate: number }[], count: number) => tiers.find(t => count >= t.from)!.rate;
const cents = (n: number) => Math.round(n * 100) / 100;
const total = <T>(items: T[], get: (item: T) => number) => items.reduce((n, item) => n + get(item), 0);

/** $1 for each connection beyond the first to the same OTA, per property. */
export const duplicateConnections = (channels: string[]) => channels.length - new Set(channels).size;

export function channexInvoice(properties: BillingProperty[], categories: Record<string, ChannexCategory>) {
  const rows = properties.map(p => ({
    ...p,
    category: categories[p.id] ?? "hotel" as ChannexCategory,
    categorySet: Object.hasOwn(categories, p.id),
    // Only properties with at least one active channel connection are billed.
    billed: p.channels.length > 0,
    duplicates: duplicateConnections(p.channels),
  }));
  const billed = rows.filter(r => r.billed);
  const hotels = billed.filter(r => r.category === "hotel");
  const rentals = billed.filter(r => r.category === "vacation_rental");
  const units = total(rentals, r => r.units);
  const chatHotels = hotels.filter(r => r.chat).length;
  const chatUnits = total(rentals.filter(r => r.chat), r => r.units);
  const duplicates = total(billed, r => r.duplicates);
  const rates = {
    hotel: rate(HOTEL_TIERS, hotels.length), unit: rate(RENTAL_TIERS, units),
    chatHotel: rate(HOTEL_TIERS, chatHotels), chatUnit: rate(RENTAL_TIERS, chatUnits),
  };
  const line = (label: string, quantity: number, unit: string, price: number) => ({ label, quantity, unit, rate: price, amount: cents(quantity * price) });
  const lines = [
    line("Platform fee", 1, "month", PLATFORM_FEE),
    line("Channel Manager · Hotels", hotels.length, "property", rates.hotel),
    line("Channel Manager · Vacation rentals", units, "unit", rates.unit),
    line("Chat & Reviews · Hotels", chatHotels, "property", rates.chatHotel),
    line("Chat & Reviews · Vacation rentals", chatUnits, "unit", rates.chatUnit),
    line("Duplicate channel connections", duplicates, "connection", DUPLICATE_CONNECTION_FEE),
  ];
  const cost = (r: (typeof rows)[number]) => !r.billed ? 0 : cents(r.duplicates * DUPLICATE_CONNECTION_FEE + (r.category === "hotel"
    ? rates.hotel + (r.chat ? rates.chatHotel : 0)
    : r.units * (rates.unit + (r.chat ? rates.chatUnit : 0))));
  return {
    lines,
    total: cents(total(lines, l => l.amount)),
    hotels: hotels.length, rentals: rentals.length, units, unbilled: rows.length - billed.length,
    properties: rows.map(r => ({ ...r, cost: cost(r) }))
      .sort((a, b) => b.cost - a.cost || a.name.localeCompare(b.name)),
  };
}

export type ChannexInvoice = ReturnType<typeof channexInvoice>;

/**
 * Channex charges on the 1st of each month, in advance, for the properties live then; properties added or
 * removed later wait for the next invoice. So a month's invoice follows the last snapshot taken by the end of
 * its 1st (UTC), or, before the first snapshot ever, the month's first one. `snapshots` is oldest first.
 */
export function invoiceBasis<T extends { takenAt: string }>(snapshots: T[], month: string): T | null {
  const cutoff = new Date(`${month}-02T00:00:00Z`).toISOString();
  return snapshots.findLast(s => s.takenAt < cutoff) ?? snapshots.find(s => s.takenAt.startsWith(month)) ?? null;
}
