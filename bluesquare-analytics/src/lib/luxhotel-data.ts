/** Shared, credential-free LuxHotel contract and monitoring calculations. */
export type Hotel = {
  id: string;
  name: string;
  vendor_id: string;
  registered_at: string;
  location: { address: string | null; city: string | null; country: string | null };
  owner: { name: string | null; email: string | null } | null;
  staff_count: number;
  channel_manager_connected: boolean;
  rooms: { physical: number; room_types: number };
  bookings_count: number;
  channels: { ota: string; title: string; active: boolean }[];
  subscription: { status: string; plan: string | null; expires_at: string | null; suspended: boolean };
  modules: { messages: boolean; housekeeping: boolean; online_checkin: boolean };
};

export type HotelDetail = Hotel & {
  room_types: { id: string; name: string; rooms: number; max_adults: number; max_children: number }[];
  rate_plans_count: number;
  onboarding: { desired_channels: string[]; discovery_source: string | null };
};

export type HotelList = { count: number; generated_at: string; hotels: Hotel[] };
export type LuxRead<T> = {
  status: "ready" | "stale" | "error" | "unconfigured";
  data: T | null;
  message: string | null;
  checkedAt: string;
  retryAt: string;
};
export type HotelFilter = "all" | "attention" | "active" | "trial" | "expired" | "none";
export type ConnectionFilter = "all" | "connected" | "disconnected";
export type HotelSort = "newest" | "oldest" | "name" | "rooms" | "bookings";

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid_response");
  return value as Record<string, unknown>;
}
function str(value: unknown): string {
  if (typeof value !== "string") throw new Error("invalid_response");
  return value;
}
function nullable(value: unknown): string | null { return value === null ? null : str(value); }
function count(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) throw new Error("invalid_response");
  return value;
}
function bool(value: unknown): boolean {
  if (typeof value !== "boolean") throw new Error("invalid_response");
  return value;
}
function date(value: unknown): string {
  const result = str(value);
  if (!Number.isFinite(Date.parse(result))) throw new Error("invalid_response");
  return result;
}
function array(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error("invalid_response");
  return value;
}

/** Fail visibly on a changed/malformed contract, rather than presenting missing counts as zero. */
export function parseHotel(value: unknown): Hotel {
  const h = record(value), loc = record(h.location), rooms = record(h.rooms);
  const sub = record(h.subscription), modules = record(h.modules);
  const owner = h.owner === null ? null : record(h.owner);
  const id = str(h.id);
  if (!id || !str(h.name).trim()) throw new Error("invalid_response");
  return {
    id, name: str(h.name), vendor_id: str(h.vendor_id), registered_at: date(h.registered_at),
    location: { address: nullable(loc.address), city: nullable(loc.city), country: nullable(loc.country) },
    owner: owner ? { name: nullable(owner.name), email: nullable(owner.email) } : null,
    staff_count: count(h.staff_count), channel_manager_connected: bool(h.channel_manager_connected),
    rooms: { physical: count(rooms.physical), room_types: count(rooms.room_types) },
    bookings_count: count(h.bookings_count),
    channels: array(h.channels).map(value => {
      const c = record(value);
      return { ota: str(c.ota), title: str(c.title), active: bool(c.active) };
    }),
    subscription: { status: str(sub.status), plan: nullable(sub.plan), expires_at: sub.expires_at === null ? null : date(sub.expires_at), suspended: bool(sub.suspended) },
    modules: { messages: bool(modules.messages), housekeeping: bool(modules.housekeeping), online_checkin: bool(modules.online_checkin) },
  };
}

export function parseHotelList(value: unknown): HotelList {
  const data = record(value), hotels = array(data.hotels).map(parseHotel);
  if (count(data.count) !== hotels.length || new Set(hotels.map(h => h.id)).size !== hotels.length) throw new Error("invalid_response");
  return { count: hotels.length, generated_at: date(data.generated_at), hotels };
}

export function parseHotelDetail(value: unknown): HotelDetail {
  const h = record(value), onboarding = record(h.onboarding);
  return { ...parseHotel(value), rate_plans_count: count(h.rate_plans_count),
    room_types: array(h.room_types).map(value => {
      const room = record(value);
      return { id: str(room.id), name: str(room.name), rooms: count(room.rooms), max_adults: count(room.max_adults), max_children: count(room.max_children) };
    }),
    onboarding: { desired_channels: array(onboarding.desired_channels).map(str), discovery_source: nullable(onboarding.discovery_source) },
  };
}

export const number = (value: number) => new Intl.NumberFormat("en-GB").format(value);
export const percentage = (value: number, total: number) => total ? Math.round(value / total * 100) : 0;
export const hotelLocation = (hotel: Hotel) => [hotel.location.city, hotel.location.country].filter(Boolean).join(", ") || "Location not provided";
export const dateLabel = (value: string | null) => value ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value)) : "Not provided";
export const timeLabel = (value: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(new Date(value)) + " UTC";
export const channelLabel = (value: string) => ({ BookingCom: "Booking.com", booking_com: "Booking.com", AirBNB: "Airbnb", airbnb: "Airbnb", GoogleHotelARI: "Google Hotels", google_hotel: "Google Hotels" }[value] ?? value.replaceAll("_", " "));
export const planLabel = (value: string | null) => value === "with_channel_manager" ? "With channel manager" : value === "without_channel_manager" ? "Without channel manager" : value || "No plan";
export const subscriptionLabel = (hotel: Hotel) => hotel.subscription.suspended ? "Suspended" : ({ active: "Active", trial: "Trial", expired: "Expired", none: "No subscription" }[hotel.subscription.status] ?? hotel.subscription.status);

export function attentionReasons(hotel: Hotel, now: number): string[] {
  const reasons: string[] = [];
  const s = hotel.subscription;
  if (s.suspended) reasons.push("Service suspended");
  if (s.status === "expired") reasons.push("Subscription expired");
  if (s.status === "none") reasons.push("No subscription");
  if (!hotel.channel_manager_connected && s.plan === "with_channel_manager") reasons.push("Channel manager disconnected");
  if (s.expires_at && ["active", "trial"].includes(s.status)) {
    const remaining = Date.parse(s.expires_at) - now;
    if (remaining <= 0) reasons.push("Subscription period ended");
    else if (remaining <= 7 * 86400000) reasons.push("Subscription ends within 7 days");
  }
  if (!hotel.rooms.physical) reasons.push("No rooms configured");
  return reasons;
}

export function summarizeHotels(hotels: Hotel[], now: number) {
  const sum = (get: (hotel: Hotel) => number) => hotels.reduce((n, h) => n + get(h), 0);
  return {
    total: hotels.length,
    accounts: new Set(hotels.map(h => h.vendor_id)).size,
    rooms: sum(h => h.rooms.physical),
    active: hotels.filter(h => h.subscription.status === "active" && !h.subscription.suspended).length,
    trial: hotels.filter(h => h.subscription.status === "trial" && !h.subscription.suspended).length,
    attention: hotels.filter(h => attentionReasons(h, now).length > 0).length,
    connected: hotels.filter(h => h.channel_manager_connected).length,
    channels: sum(h => h.channels.filter(c => c.active).length),
    channelHotels: hotels.filter(h => h.channels.some(c => c.active)).length,
    channelMix: channelMix(hotels),
    messages: hotels.filter(h => h.modules.messages).length,
    housekeeping: hotels.filter(h => h.modules.housekeeping).length,
    online_checkin: hotels.filter(h => h.modules.online_checkin).length,
  };
}

/** Active connections per channel, largest first; OTA spellings that name the same channel are merged. */
export function channelMix(hotels: Hotel[]) {
  const counts = new Map<string, number>();
  for (const c of hotels.flatMap(h => h.channels)) if (c.active) counts.set(channelLabel(c.ota), (counts.get(channelLabel(c.ota)) ?? 0) + 1);
  return [...counts].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function selectHotels(hotels: Hotel[], options: { query: string; filter: HotelFilter; connection: ConnectionFilter; sort: HotelSort; now: number }) {
  const query = options.query.trim().toLocaleLowerCase();
  return hotels.filter(h => {
    const searchable = [h.name, h.location.city, h.location.country, h.owner?.name, h.owner?.email].filter(Boolean).join(" ").toLocaleLowerCase();
    const status = options.filter === "all" || (options.filter === "attention" ? attentionReasons(h, options.now).length > 0 : h.subscription.status === options.filter && (!(["active", "trial"].includes(options.filter)) || !h.subscription.suspended));
    const connection = options.connection === "all" || h.channel_manager_connected === (options.connection === "connected");
    return searchable.includes(query) && status && connection;
  }).sort((a, b) => {
    if (options.sort === "name") return a.name.localeCompare(b.name);
    if (options.sort === "rooms") return b.rooms.physical - a.rooms.physical || a.name.localeCompare(b.name);
    if (options.sort === "bookings") return b.bookings_count - a.bookings_count || a.name.localeCompare(b.name);
    return (Date.parse(b.registered_at) - Date.parse(a.registered_at)) * (options.sort === "oldest" ? -1 : 1);
  });
}

export function registrationMonths(hotels: Hotel[], now: number) {
  const current = new Date(now);
  return Array.from({ length: 6 }, (_, index) => {
    const start = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - 5 + index, 1));
    const next = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
    return { key: start.toISOString().slice(0, 7), label: new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(start),
      count: hotels.filter(h => Date.parse(h.registered_at) >= +start && Date.parse(h.registered_at) < +next && Date.parse(h.registered_at) <= now).length };
  });
}
