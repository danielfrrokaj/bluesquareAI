import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { query } from "./db";
import { getSaved, listNotifications, listSaved, markAllRead, markRead, syncLuxFeeds, syncState, unreadCounts } from "./lux-feeds";
import { savedHotel, savedHotels, syncHotels } from "./lux-properties";

// A throwaway embedded database. The connection opens on the first query, so this is in time.
const dir = mkdtempSync(join(tmpdir(), "bsa-lux-feeds-"));
process.env.PGLITE_DIR = dir;
delete process.env.DATABASE_URL;
process.env.LUXHOTEL_API_KEY = "feeds-test-key";
after(() => rmSync(dir, { recursive: true, force: true }));

const iso = (offsetMs: number) => new Date(Date.now() + offsetMs).toISOString();
const chat = (updated: string, messages = 1) => ({
  id: "chat-1", vendor_id: null, user: { email: "staff@example.test", role: "owner" }, started_at: "2026-01-01T10:00:00.000Z", updated_at: updated,
  messages: Array.from({ length: messages }, (_, i) => ({ question: `Q${i}`, answer: "A", needs_human: false, has_screenshot: false, asked_at: null })),
  feedback: [],
});
const request = (id: string, created: string) => ({ id, name: "Ana", email: null, phone: null, property_name: null, message: "Hi", created_at: created });
const feed = (key: string, items: unknown[]) => ({ count: items.length, generated_at: iso(0), next_cursor: null, [key]: items });

// What LuxHotel answers, per feed; technical issues aren't published yet.
let served: Record<string, unknown[] | null> = {};
globalThis.fetch = async (url) => {
  const kind = new URL(String(url)).pathname.split("/").pop()!;
  const items = served[kind];
  return items ? Response.json(feed(kind.replace("-", "_"), items)) : new Response(null, { status: 404 });
};
// The sync runs at most once a minute; a test moves the last attempt back to let it run again.
const sync = async () => {
  await query("update app_settings set value = jsonb_set(value, '{attempted_at}', to_jsonb(now() - interval '2 minutes')) where key = 'lux_feeds_sync'");
  await syncLuxFeeds();
};

test("records are saved, unread per person from when notifications start, and read when opened", async () => {
  await query("insert into users (id, username, name, password_hash) values ('u1', 'anna', 'Anna', 'x'), ('u2', 'ben', 'Ben', 'x')");
  // Ben joins long after: nothing from before then is unread for him.
  await query("update users set created_at = '2100-01-01' where id = 'u2'");

  // First sync: what LuxHotel already holds starts read, and the unpublished feed is reported.
  served = { "ai-chats": [chat("2026-01-01T10:05:00.000Z")], "web-requests": [request("old", "2026-02-01T09:00:00.000Z")], "technical-issues": null };
  await syncLuxFeeds();
  assert.equal((await listSaved("web-requests", "u1", 1)).total, 1);
  assert.equal((await unreadCounts("u1")).total, 0);
  assert.equal((await syncState()).error, "not_published");

  // A new request arrives: unread for Anna, not for Ben.
  served["web-requests"] = [request("new", iso(1000)), request("old", "2026-02-01T09:00:00.000Z")];
  await sync();
  assert.deepEqual(await unreadCounts("u1"), { total: 1, "ai-chats": 0, "web-requests": 1, "technical-issues": 0 });
  assert.equal((await unreadCounts("u2")).total, 0);

  // A new message in an old conversation makes it unread again, and its saved copy has the new message.
  served["ai-chats"] = [chat(iso(2000), 2)];
  await sync();
  assert.equal((await unreadCounts("u1"))["ai-chats"], 1);
  assert.equal((await getSaved("ai-chats", "chat-1", "u1"))!.item.messages.length, 2);

  // Opening the chat reads it; the request is still waiting in the notifications.
  await markRead("u1", "ai-chats", "chat-1");
  assert.equal((await getSaved("ai-chats", "chat-1", "u1"))!.unread, false);
  assert.deepEqual((await listNotifications("u1", true)).map((n) => n.item.id), ["new"]);

  // Mark all as read empties the bell; records stay saved even once LuxHotel stops listing them.
  await markAllRead("u1");
  assert.equal((await unreadCounts("u1")).total, 0);
  served["web-requests"] = [];
  await sync();
  assert.equal((await listSaved("web-requests", "u1", 1)).total, 2);
});

// ---------- Properties ----------

const hotel = (id: string) => ({
  id, name: `Property ${id}`, vendor_id: `account-${id}`, registered_at: "2026-10-01T00:00:00Z",
  location: { address: null, city: "Tirana", country: "Albania" }, owner: null, staff_count: 2, channel_manager_connected: true,
  rooms: { physical: 10, room_types: 2 }, bookings_count: 5, channels: [],
  subscription: { status: "active", plan: null, expires_at: null, suspended: false }, modules: { messages: false, housekeeping: false, online_checkin: false },
});
const forget = () => (globalThis as typeof globalThis & { __luxhotelCache?: Map<string, unknown> }).__luxhotelCache?.clear();
const moveHotelsSyncBack = (minutes: number) =>
  query(`update app_settings set value = jsonb_set(value, '{attempted_at}', to_jsonb(now() - interval '${minutes} minutes')) where key = 'lux_hotels_sync'`);

test("properties load from the saved copy, refresh every ten minutes (Refresh: every minute), and keep the copy on failure", async () => {
  let calls = 0;
  let failing = false;
  globalThis.fetch = async (url) => {
    calls++;
    if (failing) return new Response("down", { status: 500 });
    const path = new URL(String(url)).pathname;
    if (path.endsWith("/hotels")) return Response.json({ count: 2, generated_at: iso(0), hotels: [hotel("a"), hotel("b")] });
    return Response.json({ ...hotel("a"), room_types: [], rate_plans_count: 0, onboarding: { desired_channels: [], discovery_source: null } });
  };

  // First visit: nothing saved yet, so LuxHotel is asked and the answer saved. Then it opens from the copy.
  assert.equal((await savedHotels()).data?.count, 2);
  assert.equal(calls, 1);
  forget();
  assert.equal((await savedHotels()).status, "ready");
  assert.equal(calls, 1);

  // The background copy: at most every ten minutes; Refresh: at most every minute.
  await syncHotels();
  assert.equal(calls, 2);
  forget(); await syncHotels(); await syncHotels(true);
  assert.equal(calls, 2);
  await moveHotelsSyncBack(2);
  forget(); await syncHotels(true);
  assert.equal(calls, 3);

  // LuxHotel down: the saved copy stays, shown as a saved snapshot with why.
  await moveHotelsSyncBack(11);
  failing = true; forget();
  await syncHotels();
  const stale = await savedHotels();
  assert.equal(stale.status, "stale");
  assert.equal(stale.data?.count, 2);
  assert.ok(stale.message);

  // A property's details: asked once, then from the copy.
  failing = false; forget();
  const before = calls;
  assert.equal((await savedHotel("a")).data?.id, "a");
  assert.equal((await savedHotel("a")).status, "ready");
  assert.equal(calls, before + 1);
});

