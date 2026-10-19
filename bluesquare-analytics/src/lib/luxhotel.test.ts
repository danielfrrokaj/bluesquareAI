import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { attentionReasons, channelMix, parseFeedPage, parseHotelDetail, parseHotelList, registrationMonths, selectHotels, summarizeHotels, type Hotel } from "./luxhotel-data";
import { FeedError, fetchFeedPage, getLuxHotel, getLuxHotels } from "./luxhotel";

const NOW = Date.parse("2026-10-13T12:00:00Z");
function hotel(overrides: Partial<Hotel> = {}): Hotel {
  return { id: "hotel-1", name: "Test property", vendor_id: "account-1", registered_at: "2026-10-01T00:00:00Z",
    location: { address: null, city: "Tirana", country: "Albania" }, owner: null, staff_count: 5,
    channel_manager_connected: true, rooms: { physical: 20, room_types: 4 }, bookings_count: 100,
    channels: [{ ota: "BookingCom", title: "Test channel", active: true }],
    subscription: { status: "active", plan: "with_channel_manager", expires_at: "2026-11-01T00:00:00Z", suspended: false },
    modules: { messages: true, housekeeping: false, online_checkin: false }, ...overrides };
}
const list = (hotels = [hotel()]) => ({ count: hotels.length, generated_at: new Date(NOW).toISOString(), hotels });
const detail = () => ({ ...hotel(), room_types: [{ id: "room-1", name: "Double", rooms: 20, max_adults: 2, max_children: 0 }], rate_plans_count: 3, onboarding: { desired_channels: ["booking_com"], discovery_source: null } });

test("validates list/detail contracts, preserving nulls and valid zero values", () => {
  assert.equal(parseHotelList(list()).count, 1);
  assert.equal(parseHotelList(list([])).count, 0);
  assert.equal(parseHotelList(list([hotel({ bookings_count: 0 })])).hotels[0].bookings_count, 0);
  assert.equal(parseHotelDetail(detail()).room_types[0].max_children, 0);
  assert.equal(parseHotelDetail(detail()).owner, null);
});

test("rejects incomplete counts, duplicate properties, invalid dates and malformed fields", () => {
  assert.throws(() => parseHotelList({ ...list(), count: 2 }));
  assert.throws(() => parseHotelList(list([hotel(), hotel()])));
  assert.throws(() => parseHotelList(list([hotel({ registered_at: "not-a-date" })])));
  assert.throws(() => parseHotelList({ ...list(), hotels: [{ ...hotel(), bookings_count: "100" }] }));
  assert.throws(() => parseHotelList({ ...list(), hotels: [{ ...hotel(), modules: {} }] }));
});

test("portfolio totals deduplicate business accounts and exclude suspended active subscriptions", () => {
  const h = hotel();
  const summary = summarizeHotels([h, hotel({ id: "hotel-2", subscription: { ...h.subscription, suspended: true }, channels: [{ ota: "AirBNB", title: "Airbnb", active: false }] })], NOW);
  assert.equal(summary.accounts, 1);
  assert.equal(summary.total, 2);
  assert.equal(summary.rooms, 40);
  assert.equal(summary.active, 1);
  assert.equal(summary.channels, 1);
  assert.equal(summary.channelHotels, 1);
  assert.equal(summary.messages, 2);
});

test("channel mix merges OTA spellings, ignores inactive channels and sorts by count", () => {
  const mix = channelMix([
    hotel({ channels: [{ ota: "BookingCom", title: "A", active: true }, { ota: "AirBNB", title: "B", active: true }] }),
    hotel({ id: "hotel-2", channels: [{ ota: "booking_com", title: "C", active: true }, { ota: "Expedia", title: "D", active: false }] }),
  ]);
  assert.deepEqual(mix, [{ label: "Booking.com", count: 2 }, { label: "Airbnb", count: 1 }]);
});

test("attention uses plan-aware connections, renewal boundaries and configuration", () => {
  const h = hotel();
  assert.deepEqual(attentionReasons(hotel({ channels: [] }), NOW), []);
  assert.deepEqual(attentionReasons(hotel({ channel_manager_connected: false, subscription: { ...h.subscription, plan: "without_channel_manager" } }), NOW), []);
  assert.ok(attentionReasons(hotel({ channel_manager_connected: false }), NOW).includes("Channel manager disconnected"));
  assert.ok(attentionReasons(hotel({ subscription: { ...h.subscription, expires_at: new Date(NOW + 7 * 86400000).toISOString() } }), NOW).includes("Subscription ends within 7 days"));
  assert.deepEqual(attentionReasons(hotel({ subscription: { ...h.subscription, expires_at: new Date(NOW + 7 * 86400000 + 1).toISOString() } }), NOW), []);
  assert.ok(attentionReasons(hotel({ subscription: { ...h.subscription, expires_at: new Date(NOW).toISOString() } }), NOW).includes("Subscription period ended"));
  assert.equal(attentionReasons(hotel({ rooms: { physical: 0, room_types: 0 }, subscription: { ...h.subscription, status: "none", expires_at: null } }), NOW).length, 2);
});

test("search/status/connection filters compose, sort numerically, and preserve source order", () => {
  const source = [hotel({ name: "Alpha", bookings_count: 50 }), hotel({ id: "hotel-2", name: "Beta", bookings_count: 100, channel_manager_connected: false, owner: { name: "Owner", email: "owner@example.test" } })];
  const options = { query: "", filter: "all" as const, connection: "all" as const, sort: "bookings" as const, now: NOW };
  assert.equal(selectHotels(source, options)[0].name, "Beta");
  assert.equal(source[0].name, "Alpha");
  assert.equal(selectHotels(source, { ...options, query: " OWNER@EXAMPLE.TEST ", filter: "attention", connection: "disconnected" }).length, 1);
  assert.equal(selectHotels(source, { ...options, query: "Owner", connection: "connected" }).length, 0);
});

test("registration months cross year boundaries and exclude future registrations", () => {
  const months = registrationMonths([hotel({ registered_at: "2025-12-31T23:59:59Z" }), hotel({ id: "2", registered_at: "2026-01-01T00:00:00Z" }), hotel({ id: "3", registered_at: "2026-01-30T00:00:00Z" })], Date.parse("2026-01-13T12:00:00Z"));
  assert.equal(months[0].key, "2025-08");
  assert.equal(months[4].count, 1);
  assert.equal(months[5].count, 1);
});

const originalFetch = globalThis.fetch;
const originalNow = Date.now;
const originalKey = process.env.LUXHOTEL_API_KEY;
const cache = () => (globalThis as typeof globalThis & { __luxhotelCache?: Map<string, unknown> }).__luxhotelCache;
afterEach(() => {
  globalThis.fetch = originalFetch;
  Date.now = originalNow;
  if (originalKey === undefined) delete process.env.LUXHOTEL_API_KEY;
  else process.env.LUXHOTEL_API_KEY = originalKey;
  cache()?.clear();
});

test("server keeps credentials in the header and coalesces requests for a minute", async () => {
  process.env.LUXHOTEL_API_KEY = "test-secret";
  let calls = 0;
  let time = NOW;
  Date.now = () => time;
  globalThis.fetch = async (url, init) => {
    calls++;
    assert.equal(String(url), "https://us-central1-pms-channex-2030.cloudfunctions.net/hotelsApi/hotels");
    assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer test-secret");
    assert.equal(init?.redirect, "error");
    assert.equal(init?.cache, "no-store");
    return Response.json(list());
  };
  const [first, second] = await Promise.all([getLuxHotels(), getLuxHotels()]);
  assert.equal(calls, 1);
  assert.equal(first, second);
  assert.ok(!JSON.stringify(first).includes("test-secret"));
  time += 59_999;
  await getLuxHotels();
  assert.equal(calls, 1);
  time++;
  await getLuxHotels();
  assert.equal(calls, 2);
});

test("upstream failures retain an explicitly stale snapshot and throttle retries", async () => {
  process.env.LUXHOTEL_API_KEY = "test-secret";
  let time = NOW, calls = 0;
  Date.now = () => time;
  globalThis.fetch = async () => { calls++; return calls === 1 ? Response.json(list()) : new Response("unavailable", { status: 500 }); };
  await getLuxHotels();
  time += 60_000;
  const failed = await getLuxHotels();
  assert.equal(failed.status, "stale");
  assert.equal(failed.data?.count, 1);
  assert.equal(failed.data?.generated_at, new Date(NOW).toISOString());
  await getLuxHotels();
  assert.equal(calls, 2);
});

test("auth rejection clears stale data and key rotation does not reuse previous cache", async () => {
  process.env.LUXHOTEL_API_KEY = "old-test-key";
  let time = NOW;
  Date.now = () => time;
  globalThis.fetch = async () => Response.json(list());
  await getLuxHotels();
  time += 60_000;
  globalThis.fetch = async () => new Response(null, { status: 401 });
  const rejected = await getLuxHotels();
  assert.equal(rejected.status, "error");
  assert.equal(rejected.data, null);
  process.env.LUXHOTEL_API_KEY = "new-test-key";
  globalThis.fetch = async () => Response.json(list([]));
  const rotated = await getLuxHotels();
  assert.equal(rotated.status, "ready");
  assert.equal(rotated.data?.count, 0);
});

test("missing configuration, malformed data, and mismatched detail IDs fail visibly", async () => {
  delete process.env.LUXHOTEL_API_KEY;
  globalThis.fetch = async () => { throw new Error("must-not-fetch"); };
  assert.equal((await getLuxHotels()).status, "unconfigured");
  process.env.LUXHOTEL_API_KEY = "test-key";
  globalThis.fetch = async () => Response.json({ count: 0 });
  assert.equal((await getLuxHotels()).status, "error");
  globalThis.fetch = async () => Response.json(detail());
  assert.equal((await getLuxHotel("another-id")).status, "error");
});

// ---------- Record feeds (shapes as built in pms-2030 functions/src/partnerApi) ----------

const chat = { id: "chat-1", vendor_id: "account-1", user: { email: "staff@example.test", role: "owner" }, started_at: "2026-10-15T09:00:00.000Z",
  updated_at: "2026-10-15T09:05:00.000Z",
  messages: [{ question: "How do I add a room?", answer: "Open Rooms.", needs_human: false, has_screenshot: true, asked_at: "2026-10-15T09:00:00.000Z" },
    { question: "It fails", answer: "Let me get a colleague.", needs_human: true, has_screenshot: false, asked_at: null }],
  feedback: [{ vote: "down", comment: null, at: "2026-10-15T09:06:00.000Z" }] };
const request = { id: "req-1", name: "Ana", email: null, phone: "069 000 0000", property_name: "Vila", message: "Call me", created_at: "2026-10-15T10:00:00.000Z" };
const issue = { id: "tick-1", description: "Calendar blank", priority: "high", due_date: { _seconds: 1 }, reported_by: { email: null }, vendor_id: null,
  hotel_id: "hotel-1", page_url: "/calendar", created_at: "2026-10-15T11:00:00.000Z" };
const feed = (key: string, items: unknown[], next: string | null = null) => ({ count: items.length, generated_at: "2026-10-16T00:00:00.000Z", next_cursor: next, [key]: items });

test("feeds parse each record type, keeping nulls and flags, and reject a changed contract", () => {
  const chats = parseFeedPage("ai-chats", feed("ai_chats", [chat], "chat-1"));
  assert.equal(chats.next_cursor, "chat-1");
  assert.equal(chats.items[0].messages[0].has_screenshot, true);
  assert.equal(chats.items[0].messages[1].needs_human, true);
  assert.equal(chats.items[0].messages[1].asked_at, null);
  assert.equal(chats.items[0].feedback[0].vote, "down");
  assert.equal(parseFeedPage("web-requests", feed("web_requests", [request])).items[0].email, null);
  // A due date stored as anything but text reads as none instead of failing the whole page.
  assert.equal(parseFeedPage("technical-issues", feed("technical_issues", [issue])).items[0].due_date, null);
  assert.throws(() => parseFeedPage("ai-chats", { ...feed("ai_chats", [chat]), count: 2 }));
  assert.throws(() => parseFeedPage("ai-chats", feed("web_requests", [chat])));
  assert.throws(() => parseFeedPage("ai-chats", feed("ai_chats", [{ ...chat, feedback: [{ vote: "meh", comment: null, at: null }] }])));
  assert.throws(() => parseFeedPage("web-requests", feed("web_requests", [{ ...request, created_at: "yesterday" }])));
});

test("feed pages are read 50 at a time with a cursor, and each failure has its reason", async () => {
  process.env.LUXHOTEL_API_KEY = "feed-test-key";
  const urls: string[] = [];
  globalThis.fetch = async (url) => { urls.push(String(url)); return Response.json(feed("web_requests", [request])); };
  assert.equal((await fetchFeedPage("web-requests", "req-0")).items[0].id, "req-1");
  assert.ok(urls[0].endsWith("/web-requests?limit=50&cursor=req-0"));
  const reason = async (status: number) => {
    globalThis.fetch = async () => new Response(null, { status });
    return fetchFeedPage("technical-issues").then(() => "ok", (e: unknown) => (e instanceof FeedError ? e.reason : "other"));
  };
  assert.equal(await reason(404), "not_published");
  assert.equal(await reason(401), "rejected");
  assert.equal(await reason(500), "unavailable");
  globalThis.fetch = async () => Response.json({ broken: true });
  assert.equal(await fetchFeedPage("ai-chats").then(() => "ok", (e: unknown) => (e as FeedError).reason), "unavailable");
  delete process.env.LUXHOTEL_API_KEY;
  assert.equal(await fetchFeedPage("ai-chats").then(() => "ok", (e: unknown) => (e as FeedError).reason), "unconfigured");
});
