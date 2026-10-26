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

// ---------- Record feeds: AI chats, website requests, technical issues ----------
// Newest first and paginated (next_cursor), unlike /hotels. Screenshots in AI chats are only flagged, never linked.

export type FeedKind = "ai-chats" | "web-requests" | "technical-issues";
export const FEED_KINDS: FeedKind[] = ["ai-chats", "web-requests", "technical-issues"];
export const isFeedKind = (v: unknown): v is FeedKind => typeof v === "string" && (FEED_KINDS as string[]).includes(v);

export type AiChat = {
  id: string;
  vendor_id: string | null;
  user: { email: string | null; role: string | null };
  started_at: string | null;
  updated_at: string | null;
  messages: { question: string | null; answer: string | null; needs_human: boolean; has_screenshot: boolean; asked_at: string | null }[];
  feedback: { vote: "up" | "down"; comment: string | null; at: string | null }[];
};
export type WebRequest = {
  id: string; name: string | null; email: string | null; phone: string | null; property_name: string | null; message: string | null;
  created_at: string | null;
};
export type TechnicalIssue = {
  id: string; description: string | null; priority: string | null; due_date: string | null; reported_by: { email: string | null };
  vendor_id: string | null; hotel_id: string | null; page_url: string | null; created_at: string | null;
};
export type FeedItem = { "ai-chats": AiChat; "web-requests": WebRequest; "technical-issues": TechnicalIssue };
export type FeedPage<T> = { count: number; generated_at: string; next_cursor: string | null; items: T[] };

const nullableDate = (value: unknown): string | null => (value === null ? null : date(value));
const id = (value: unknown) => {
  const result = str(value);
  if (!result) throw new Error("invalid_response");
  return result;
};

export function parseAiChat(value: unknown): AiChat {
  const c = record(value), user = record(c.user);
  return {
    id: id(c.id), vendor_id: nullable(c.vendor_id), user: { email: nullable(user.email), role: nullable(user.role) },
    started_at: nullableDate(c.started_at), updated_at: nullableDate(c.updated_at),
    messages: array(c.messages).map((item) => {
      const m = record(item);
      return { question: nullable(m.question), answer: nullable(m.answer), needs_human: bool(m.needs_human), has_screenshot: bool(m.has_screenshot), asked_at: nullableDate(m.asked_at) };
    }),
    feedback: array(c.feedback).map((item) => {
      const f = record(item);
      if (f.vote !== "up" && f.vote !== "down") throw new Error("invalid_response");
      return { vote: f.vote, comment: nullable(f.comment), at: nullableDate(f.at) };
    }),
  };
}

export function parseWebRequest(value: unknown): WebRequest {
  const r = record(value);
  return {
    id: id(r.id), name: nullable(r.name), email: nullable(r.email), phone: nullable(r.phone), property_name: nullable(r.property_name),
    message: nullable(r.message), created_at: nullableDate(r.created_at),
  };
}

export function parseTechnicalIssue(value: unknown): TechnicalIssue {
  const t = record(value), by = record(t.reported_by);
  return {
    id: id(t.id), description: nullable(t.description), priority: nullable(t.priority),
    // Passed through from the ticket as stored, so anything but a string reads as no due date.
    due_date: typeof t.due_date === "string" && t.due_date ? t.due_date : null,
    reported_by: { email: nullable(by.email) }, vendor_id: nullable(t.vendor_id), hotel_id: nullable(t.hotel_id),
    page_url: nullable(t.page_url), created_at: nullableDate(t.created_at),
  };
}

const FEED_PARSERS: { [K in FeedKind]: { key: string; parse: (value: unknown) => FeedItem[K] } } = {
  "ai-chats": { key: "ai_chats", parse: parseAiChat },
  "web-requests": { key: "web_requests", parse: parseWebRequest },
  "technical-issues": { key: "technical_issues", parse: parseTechnicalIssue },
};


export function parseFeedPage<K extends FeedKind>(kind: K, value: unknown): FeedPage<FeedItem[K]> {
  const page = record(value);
  const items = array(page[FEED_PARSERS[kind].key]).map(FEED_PARSERS[kind].parse);
  if (count(page.count) !== items.length) throw new Error("invalid_response");
  return { count: items.length, generated_at: date(page.generated_at), next_cursor: page.next_cursor === null ? null : id(page.next_cursor), items };
}

export const FEED_LABELS: Record<FeedKind, string> = { "ai-chats": "AI chat", "web-requests": "Website request", "technical-issues": "Technical issue" };

/** A record's own page. */
export const recordHref = (kind: FeedKind, id: string) => `/luxhotel/${kind}/${encodeURIComponent(id)}`;

const clip = (text: string | null, max: number) => (text && text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

/** One line to name a record in lists and notifications, and a second with who or what. */
export function recordSummary(kind: FeedKind, item: FeedItem[FeedKind]): { title: string; detail: string | null } {
  if (kind === "ai-chats") {
    const c = item as AiChat;
    return { title: clip(c.messages.find((m) => m.question)?.question ?? null, 140) ?? "(no question)", detail: c.user.email };
  }
  if (kind === "web-requests") {
    const r = item as WebRequest;
    return { title: `${r.name ?? "No name"}${r.property_name ? ` · ${r.property_name}` : ""}`, detail: clip(r.message, 140) };
  }
  const t = item as TechnicalIssue;
  return { title: clip(t.description, 140) ?? "(no description)", detail: t.reported_by.email };
}


// ---------- Subscription invoices and payments ----------
// Each property pays a subscription; LuxHotel bills it with invoices, each paid through a POK link or recorded as
// cash/bank. These parse the billing endpoints; the authenticated calls live in lib/lux-billing.ts.

export type InvoiceStatus = "sent" | "paid" | "void";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type PaymentMethod = "pok" | "cash" | "bank_transfer";
export type Currency = "EUR" | "ALL";

export type LineItem = { key: string; label: string; description: string | null; amount: number };
export type Payment = {
  id: string; invoice_id: string; hotel_id: string; vendor_id: string;
  amount: number; currency: string; status: PaymentStatus; method: PaymentMethod;
  payment_url: string | null; failure_reason: string | null; note: string | null;
  created_at: string; updated_at: string;
};
export type Invoice = {
  id: string; number: string; hotel_id: string; vendor_id: string;
  billed_to: { hotel_name: string | null; legal_name: string | null; tax_id: string | null; email: string | null };
  status: InvoiceStatus; removed: boolean; includes_base_plan: boolean; plan: string;
  period: { start: string; end: string }; room_count: number | null;
  line_items: LineItem[]; subtotal: number; tax: number; total: number; currency: string;
  paid_at: string | null; payment_method: PaymentMethod | null; payment_url: string | null;
  fiscal_status: string | null; pdf_url: string | null; notes: string | null;
  created_at: string; updated_at: string;
  payments?: Payment[]; // present on GET /invoices/{id}, GET /hotels/{id}/invoices and POST responses
};
export type InvoicePage = { count: number; generated_at: string; next_cursor: string | null; invoices: Invoice[] };
export type PaymentPage = { count: number; generated_at: string; next_cursor: string | null; payments: Payment[] };

const num = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error("invalid_response");
  return value;
};
const oneOf = <T extends string>(value: unknown, allowed: readonly T[]): T => {
  const s = str(value);
  if (!(allowed as readonly string[]).includes(s)) throw new Error("invalid_response");
  return s as T;
};

export function parsePayment(value: unknown): Payment {
  const p = record(value);
  return {
    id: id(p.id), invoice_id: id(p.invoice_id), hotel_id: str(p.hotel_id), vendor_id: str(p.vendor_id),
    amount: num(p.amount), currency: str(p.currency),
    status: oneOf(p.status, ["pending", "completed", "failed", "refunded"] as const),
    method: oneOf(p.method, ["pok", "cash", "bank_transfer"] as const),
    payment_url: nullable(p.payment_url), failure_reason: nullable(p.failure_reason), note: nullable(p.note),
    created_at: date(p.created_at), updated_at: date(p.updated_at),
  };
}

export function parseInvoice(value: unknown): Invoice {
  const v = record(value), to = record(v.billed_to), period = record(v.period);
  return {
    id: id(v.id), number: str(v.number), hotel_id: str(v.hotel_id), vendor_id: str(v.vendor_id),
    billed_to: { hotel_name: nullable(to.hotel_name), legal_name: nullable(to.legal_name), tax_id: nullable(to.tax_id), email: nullable(to.email) },
    status: oneOf(v.status, ["sent", "paid", "void"] as const), removed: bool(v.removed),
    includes_base_plan: bool(v.includes_base_plan), plan: str(v.plan),
    period: { start: date(period.start), end: date(period.end) }, room_count: v.room_count === null ? null : count(v.room_count),
    line_items: array(v.line_items).map((item) => {
      const l = record(item);
      return { key: str(l.key), label: str(l.label), description: nullable(l.description), amount: num(l.amount) };
    }),
    subtotal: num(v.subtotal), tax: num(v.tax), total: num(v.total), currency: str(v.currency),
    paid_at: nullableDate(v.paid_at),
    payment_method: v.payment_method === null ? null : oneOf(v.payment_method, ["pok", "cash", "bank_transfer"] as const),
    payment_url: nullable(v.payment_url), fiscal_status: nullable(v.fiscal_status), pdf_url: nullable(v.pdf_url), notes: nullable(v.notes),
    created_at: date(v.created_at), updated_at: date(v.updated_at),
    payments: v.payments === undefined ? undefined : array(v.payments).map(parsePayment),
  };
}

export function parseInvoicePage(value: unknown): InvoicePage {
  const page = record(value), invoices = array(page.invoices).map(parseInvoice);
  if (count(page.count) !== invoices.length) throw new Error("invalid_response");
  return { count: invoices.length, generated_at: date(page.generated_at), next_cursor: page.next_cursor === null ? null : id(page.next_cursor), invoices };
}

export function parsePaymentPage(value: unknown): PaymentPage {
  const page = record(value), payments = array(page.payments).map(parsePayment);
  if (count(page.count) !== payments.length) throw new Error("invalid_response");
  return { count: payments.length, generated_at: date(page.generated_at), next_cursor: page.next_cursor === null ? null : id(page.next_cursor), payments };
}

/** GET /hotels/{id}/invoices: one hotel's invoices, each with its payments, not paged. */
export function parseHotelInvoices(value: unknown): Invoice[] {
  const page = record(value);
  return array(page.invoices).map(parseInvoice);
}

// ---------- Billing labels and formatting ----------

/** An amount with its currency, e.g. "44.00 EUR". Amounts aren't converted, only labelled. */
export const money = (amount: number, currency: string) =>
  `${new Intl.NumberFormat("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} ${currency}`;

export const invoiceStatusLabel: Record<InvoiceStatus, string> = { sent: "Awaiting payment", paid: "Paid", void: "Void" };
export const paymentStatusLabel: Record<PaymentStatus, string> = { pending: "Pending", completed: "Completed", failed: "Failed", refunded: "Refunded" };
export const methodLabel: Record<PaymentMethod, string> = { pok: "POK link", cash: "Cash", bank_transfer: "Bank transfer" };
export const fiscalLabel = (value: string | null) =>
  value === null ? "—" : ({ fiscalized: "Fiscalized", draft: "Draft", processing: "Processing", error: "Failed" }[value] ?? value);

/** The status tone used for the shared .status--ok/warn/bad classes. */
export const invoiceTone = (s: InvoiceStatus): "ok" | "warn" | "muted" => (s === "paid" ? "ok" : s === "void" ? "muted" : "warn");
export const paymentTone = (s: PaymentStatus): "ok" | "warn" | "bad" | "muted" =>
  s === "completed" ? "ok" : s === "failed" ? "bad" : s === "refunded" ? "muted" : "warn";

export const periodLabel = (period: { start: string; end: string }) => `${dateLabel(period.start)} – ${dateLabel(period.end)}`;

// ---------- Billing board: hotels grouped by how their subscription stands ----------

export type BillingColumn = "unpaid" | "active" | "expiring" | "expired";
export type HotelBilling = {
  hotel: Hotel;
  column: BillingColumn;
  daysLeft: number | null;
  lastPayment: { at: string; amount: number; currency: string } | null;
  pending: { id: string; number: string; total: number; currency: string } | null;
};
export type BillingKpis = { invoices: number; unpaid: number; paid: number; revenueEur: number };
export type BillingSummary = { kpis: BillingKpis; hotels: HotelBilling[] };

/** The board columns, in display order, with the dot colour each uses. */
export const BILLING_COLUMNS: { key: BillingColumn; label: string; tone: "bad" | "ok" | "warn" | "muted" }[] = [
  { key: "unpaid", label: "Unpaid", tone: "bad" },
  { key: "active", label: "Active", tone: "ok" },
  { key: "expiring", label: "Expiring soon", tone: "warn" },
  { key: "expired", label: "Expired", tone: "muted" },
];

const EXPIRING_DAYS = 7;

/**
 * Places every hotel in one column and totals the invoices. `allPerEur` (ALL per 1 EUR) converts ALL invoices so the
 * paid-revenue total is in one currency; without it, ALL invoices are summed at face value.
 */
export function summarizeBilling(hotels: Hotel[], invoices: Invoice[], now: number, allPerEur: number | null): BillingSummary {
  const live = invoices.filter((i) => !i.removed);
  const byHotel = new Map<string, Invoice[]>();
  for (const invoice of live) byHotel.set(invoice.hotel_id, [...(byHotel.get(invoice.hotel_id) ?? []), invoice]);
  const toEur = (amount: number, currency: string) => (currency === "ALL" && allPerEur ? amount / allPerEur : amount);

  const billed = hotels.map((hotel): HotelBilling => {
    const list = byHotel.get(hotel.id) ?? [];
    const paid = list.filter((i) => i.status === "paid" && i.paid_at).sort((a, b) => Date.parse(b.paid_at!) - Date.parse(a.paid_at!));
    const pendingInvoice = list.filter((i) => i.status === "sent").sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0];
    const subscription = hotel.subscription;
    const daysLeft = subscription.expires_at ? Math.ceil((Date.parse(subscription.expires_at) - now) / 86_400_000) : null;
    const column: BillingColumn =
      subscription.suspended || pendingInvoice || subscription.status === "none" ? "unpaid"
      : subscription.status === "expired" || (daysLeft !== null && daysLeft < 0) ? "expired"
      : daysLeft !== null && daysLeft <= EXPIRING_DAYS ? "expiring"
      : "active";
    return {
      hotel, column, daysLeft,
      lastPayment: paid[0] ? { at: paid[0].paid_at!, amount: paid[0].total, currency: paid[0].currency } : null,
      pending: pendingInvoice ? { id: pendingInvoice.id, number: pendingInvoice.number, total: pendingInvoice.total, currency: pendingInvoice.currency } : null,
    };
  });

  return {
    kpis: {
      invoices: live.length,
      unpaid: live.filter((i) => i.status === "sent").length,
      paid: live.filter((i) => i.status === "paid").length,
      revenueEur: live.filter((i) => i.status === "paid").reduce((sum, i) => sum + toEur(i.total, i.currency), 0),
    },
    hotels: billed,
  };
}

/** A whole-euro total like "€4,163.24", for the paid-revenue card. */
export const eur = (amount: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(amount);
