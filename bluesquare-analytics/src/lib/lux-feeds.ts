import "server-only";
import { query } from "./db";
import { FeedError, fetchFeedPage } from "./luxhotel";
import { FEED_KINDS, type FeedItem, type FeedKind } from "./luxhotel-data";

// LuxHotel's AI chats, website requests and technical issues, copied into our database (kept even if removed there),
// with what each person has read. The pages and the notification bell read only from here.

const SYNC_KEY = "lux_feeds_sync"; // app_settings: { attempted_at, error }
const SINCE_KEY = "lux_notifications_since"; // app_settings: when notifications started; older records begin read
const MAX_PAGES = 200; // of 50: most checks stop after the first, finding nothing new

/** When a record started on LuxHotel, and when it last changed (an AI chat changes with each new message). */
function times(kind: FeedKind, item: FeedItem[FeedKind]): { created: string | null; changed: string | null } {
  if (kind === "ai-chats") {
    const chat = item as FeedItem["ai-chats"];
    const last = chat.messages.map((m) => m.asked_at).filter((t): t is string => !!t).sort().at(-1) ?? null;
    return { created: chat.started_at, changed: chat.updated_at ?? last ?? chat.started_at };
  }
  const at = (item as FeedItem["web-requests"] | FeedItem["technical-issues"]).created_at;
  return { created: at, changed: at };
}

/**
 * Copies new and changed records from LuxHotel, at most once a minute across every request and server instance (the
 * attempt is claimed in the database first, as the Channex sync does). Each feed is read newest first until a page
 * brings nothing new (AI chats: at least their 200 most recent). Pages call it before reading; every other page runs it after responding.
 */
export async function syncLuxFeeds(): Promise<void> {
  if (!process.env.LUXHOTEL_API_KEY?.trim()) return;
  const claimed = await query(
    `insert into app_settings (key, value) values ($1, jsonb_build_object('attempted_at', now(), 'error', null))
     on conflict (key) do update set value = excluded.value, updated_at = now()
       where (app_settings.value->>'attempted_at')::timestamptz <= now() - interval '1 minute'
     returning key`,
    [SYNC_KEY],
  );
  if (!claimed.length) return;
  // Notifications start with the first sync: records already on LuxHotel then don't all arrive as unread.
  await query("insert into app_settings (key, value) values ($1, to_jsonb(now())) on conflict do nothing", [SINCE_KEY]);
  let error: FeedError["reason"] | null = null;
  for (const kind of FEED_KINDS) {
    try {
      await syncFeed(kind);
    } catch (err) {
      error = err instanceof FeedError ? err.reason : "unavailable";
      if (!(err instanceof FeedError)) console.error("LuxHotel feed could not be saved", kind);
    }
  }
  if (error) await query("update app_settings set value = value || jsonb_build_object('error', $2::text) where key = $1", [SYNC_KEY, error]);
}

async function syncFeed(kind: FeedKind) {
  let cursor: string | undefined;
  for (let page = 0; page < MAX_PAGES; page++) {
    const { items, next_cursor } = await fetchFeedPage(kind, cursor);
    const known = new Map(
      (await query<{ id: string; changed: number | null }>(
        "select id, (extract(epoch from changed_at) * 1000)::float8 as changed from lux_records where kind = $1 and id = any($2)",
        [kind, items.map((i) => i.id)],
      )).map((r) => [r.id, r.changed]),
    );
    let fresh = 0;
    for (const item of items) {
      const { created, changed } = times(kind, item);
      if (known.has(item.id) && known.get(item.id) === (changed ? Date.parse(changed) : null)) continue;
      fresh++;
      await query(
        `insert into lux_records (kind, id, data, created_at, changed_at) values ($1, $2, $3::jsonb, $4, $5)
         on conflict (kind, id) do update set data = excluded.data, created_at = excluded.created_at, changed_at = excluded.changed_at, synced_at = now()`,
        [kind, item.id, JSON.stringify(item), created, changed],
      );
    }
    // A new message can land in an older conversation, so AI chats always check their 200 most recent (4 pages).
    if ((!fresh && !(kind === "ai-chats" && page < 3)) || !next_cursor) return;
    cursor = next_cursor;
  }
}

export type SyncState = { configured: boolean; attemptedAt: string | null; error: FeedError["reason"] | null };

export async function syncState(): Promise<SyncState> {
  const [row] = await query<{ attempted_at: string | null; error: FeedError["reason"] | null }>(
    "select value->>'attempted_at' as attempted_at, value->>'error' as error from app_settings where key = $1",
    [SYNC_KEY],
  );
  return { configured: !!process.env.LUXHOTEL_API_KEY?.trim(), attemptedAt: row?.attempted_at ?? null, error: row?.error ?? null };
}

// ---------- Reading, with each person's unread state ----------

/** The person's starting point: the later of when notifications started and when their account was created. */
const BASELINE = `greatest(
  coalesce((select (value #>> '{}')::timestamptz from app_settings where key = '${SINCE_KEY}'), now()),
  (select created_at from users where id = $1))`;
const UNREAD = `r.changed_at > greatest(${BASELINE}, coalesce(x.read_at, '-infinity'::timestamptz))`;
const READS = "left join lux_reads x on x.user_id = $1 and x.kind = r.kind and x.record_id = r.id";

export type Saved<K extends FeedKind> = { kind: K; item: FeedItem[K]; unread: boolean; changedAt: string | null };

const PAGE = 50;

/** One page of a feed, newest first, with the person's unread flags. */
export async function listSaved<K extends FeedKind>(kind: K, userId: string, page: number): Promise<{ rows: Saved<K>[]; more: boolean; total: number }> {
  const [rows, [{ total }]] = await Promise.all([
    query<{ data: FeedItem[K]; unread: boolean; changed_at: string | null }>(
      `select r.data, ${UNREAD} as unread, r.changed_at::text as changed_at from lux_records r ${READS}
       where r.kind = $2 order by r.created_at desc nulls last, r.id limit ${PAGE + 1} offset $3`,
      [userId, kind, (page - 1) * PAGE],
    ),
    query<{ total: number }>("select count(*)::int as total from lux_records where kind = $1", [kind]),
  ]);
  return { rows: rows.slice(0, PAGE).map((r) => ({ kind, item: r.data, unread: !!r.unread, changedAt: r.changed_at })), more: rows.length > PAGE, total };
}

export async function getSaved<K extends FeedKind>(kind: K, id: string, userId: string): Promise<Saved<K> | null> {
  const [row] = await query<{ data: FeedItem[K]; unread: boolean; changed_at: string | null }>(
    `select r.data, ${UNREAD} as unread, r.changed_at::text as changed_at from lux_records r ${READS} where r.kind = $2 and r.id = $3`,
    [userId, kind, id],
  );
  return row ? { kind, item: row.data, unread: !!row.unread, changedAt: row.changed_at } : null;
}

/** The latest records across every feed, changed most recently first (only unread ones, with `unreadOnly`). */
export async function listNotifications(userId: string, unreadOnly: boolean, limit = 60): Promise<Saved<FeedKind>[]> {
  const rows = await query<{ kind: FeedKind; data: FeedItem[FeedKind]; unread: boolean; changed_at: string | null }>(
    `select r.kind, r.data, ${UNREAD} as unread, r.changed_at::text as changed_at from lux_records r ${READS}
     ${unreadOnly ? `where ${UNREAD}` : ""} order by r.changed_at desc nulls last limit ${Math.floor(limit)}`,
    [userId],
  );
  return rows.map((r) => ({ kind: r.kind, item: r.data, unread: !!r.unread, changedAt: r.changed_at }));
}

export type UnreadCounts = { total: number } & Record<FeedKind, number>;

export async function unreadCounts(userId: string): Promise<UnreadCounts> {
  const rows = await query<{ kind: FeedKind; n: number }>(
    `select r.kind, count(*)::int as n from lux_records r ${READS} where ${UNREAD} group by r.kind`,
    [userId],
  );
  const counts = { total: 0, "ai-chats": 0, "web-requests": 0, "technical-issues": 0 } as UnreadCounts;
  for (const r of rows) {
    counts[r.kind] = r.n;
    counts.total += r.n;
  }
  return counts;
}

/**
 * Reading stores "read up to this version": the later of now and the record's last change on LuxHotel, so a clock running
 * ahead there can't leave a record unread after it was opened.
 */
export const markRead = (userId: string, kind: FeedKind, id: string) =>
  query(
    `insert into lux_reads (user_id, kind, record_id, read_at)
     select $1, $2, $3, greatest(now(), coalesce((select changed_at from lux_records where kind = $2 and id = $3), now()))
     on conflict (user_id, kind, record_id) do update set read_at = excluded.read_at`,
    [userId, kind, id],
  );

/** Marks every unread record read for this person (one feed's, with `kind`). */
export const markAllRead = (userId: string, kind?: FeedKind) =>
  query(
    `insert into lux_reads (user_id, kind, record_id, read_at)
     select $1, r.kind, r.id, greatest(now(), r.changed_at) from lux_records r ${READS} where ${UNREAD} ${kind ? "and r.kind = $2" : ""}
     on conflict (user_id, kind, record_id) do update set read_at = excluded.read_at`,
    kind ? [userId, kind] : [userId],
  );
