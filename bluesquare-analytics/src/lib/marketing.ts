import "server-only";
import { randomUUID } from "node:crypto";
import { query } from "./db";
import { isPlatform, type Platform } from "./platforms";

export { PLATFORMS, isPlatform, type Platform } from "./platforms";

const TZ = () => process.env.REPORT_TIMEZONE || "Europe/Tirane";

// ---------- Ideas ----------

export const IDEA_COLORS = ["yellow", "blue", "green", "pink"] as const;
export type IdeaColor = (typeof IDEA_COLORS)[number];

export type Idea = { id: string; body: string; color: IdeaColor; pinned: boolean; created_by: string | null; author: string | null; created_at: string };

export const listIdeas = () =>
  query<Idea>(
    `select i.id, i.body, i.color, i.pinned, i.created_by, u.name as author, to_char(i.created_at at time zone $1, 'DD Mon') as created_at
     from mk_ideas i left join users u on u.id = i.created_by
     order by i.pinned desc, i.created_at desc`,
    [TZ()],
  );

export async function createIdea(body: string, color: IdeaColor, pinned: boolean, userId: string) {
  await query("insert into mk_ideas (id, body, color, pinned, created_by) values ($1, $2, $3, $4, $5)", [randomUUID(), body, color, pinned, userId]);
}

export const getIdea = async (id: string) => (await query<{ id: string; created_by: string | null }>("select id, created_by from mk_ideas where id = $1", [id]))[0] ?? null;
export const setIdeaPinned = (id: string, pinned: boolean) => query("update mk_ideas set pinned = $2 where id = $1", [id, pinned]);
export const deleteIdea = (id: string) => query("delete from mk_ideas where id = $1", [id]);

// ---------- Posts (media) ----------

export type Post = {
  id: string; title: string; caption: string; platforms: Platform[];
  publish_at: string | null; // ISO, for the date input and sorting
  publish_local: string | null; // "YYYY-MM-DDTHH:MM" in the report time zone, for <input type="datetime-local">
  publish_day: string | null; // "YYYY-MM-DD" in the report time zone
  publish_label: string | null; // "Tue 14 Oct, 10:00"
  kind: "image" | "video"; mime: string; size: number; original_name: string; media_key: string;
  status: "uploading" | "ready"; created_by: string | null; author: string | null;
};

const POST_SELECT = `
  select p.id, p.title, p.caption, p.platforms, p.publish_at::text as publish_at,
         to_char(p.publish_at at time zone $1, 'YYYY-MM-DD"T"HH24:MI') as publish_local,
         to_char(p.publish_at at time zone $1, 'YYYY-MM-DD') as publish_day,
         to_char(p.publish_at at time zone $1, 'Dy DD Mon, HH24:MI') as publish_label,
         p.kind, p.mime, p.size::float8 as size, p.original_name, p.media_key, p.status, p.created_by, u.name as author
  from mk_posts p left join users u on u.id = p.created_by`;

/** Ready posts: scheduled ones by date, then unscheduled newest first. */
export const listPosts = () =>
  query<Post>(`${POST_SELECT} where p.status = 'ready' order by p.publish_at desc nulls first, p.created_at desc`, [TZ()]);

export async function getPost(id: string): Promise<Post | null> {
  const [row] = await query<Post>(`${POST_SELECT} where p.id = $2`, [TZ(), id]);
  return row ?? null;
}

/** Posts planned in [from, to] (local dates), for the calendar. */
export const postsBetween = (from: string, to: string) =>
  query<Post>(
    `${POST_SELECT} where p.status = 'ready' and (p.publish_at at time zone $1)::date between $2::date and $3::date order by p.publish_at`,
    [TZ(), from, to],
  );

export type PostInput = { title: string; caption: string; platforms: Platform[]; publishLocal: string | null };

/** "2026-10-14T10:00" in the report time zone -> timestamptz, inside the query (null stays null). */
const PUBLISH = (n: number) => `(($${n}::text)::timestamp at time zone '${TZ().replace(/'/g, "")}')`;

export async function createPost(p: PostInput & { kind: "image" | "video"; mime: string; size: number; originalName: string; userId: string }) {
  const id = randomUUID();
  const ext = (p.originalName.match(/\.([a-z0-9]{1,8})$/i)?.[1] ?? p.mime.split("/")[1] ?? "bin").toLowerCase();
  const key = `marketing/${id}.${ext}`;
  await query(
    `insert into mk_posts (id, title, caption, platforms, publish_at, kind, mime, size, original_name, media_key, created_by)
     values ($1, $2, $3, $4, ${PUBLISH(5)}, $6, $7, $8, $9, $10, $11)`,
    [id, p.title, p.caption, p.platforms, p.publishLocal, p.kind, p.mime, p.size, p.originalName, key, p.userId],
  );
  return { id, key };
}

export const markReady = (id: string) => query("update mk_posts set status = 'ready' where id = $1", [id]);

export const updatePost = (id: string, p: PostInput) =>
  query(`update mk_posts set title = $2, caption = $3, platforms = $4, publish_at = ${PUBLISH(5)} where id = $1`, [
    id, p.title, p.caption, p.platforms, p.publishLocal,
  ]);

export const deletePostRow = (id: string) => query("delete from mk_posts where id = $1", [id]);

/** Uploads abandoned for over a day (closed tab, lost connection). */
export const staleUploads = () =>
  query<{ id: string; media_key: string }>("select id, media_key from mk_posts where status = 'uploading' and created_at < now() - interval '1 day'");

/** Validates title, caption, networks and "YYYY-MM-DDTHH:MM" publish time from a form or JSON. */
export function readPostInput(v: { title?: unknown; caption?: unknown; platforms?: unknown; publish?: unknown }): PostInput | string {
  const text = (x: unknown, max: number) => (typeof x === "string" ? x.trim().slice(0, max) : "");
  const platforms = (Array.isArray(v.platforms) ? v.platforms : []).filter(isPlatform);
  const publish = text(v.publish, 16);
  if (publish && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(publish)) return "Pick a valid publish date and time.";
  return { title: text(v.title, 120), caption: text(v.caption, 2200), platforms: [...new Set(platforms)], publishLocal: publish || null };
}
