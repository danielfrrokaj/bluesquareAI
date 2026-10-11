import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { query } from "./db";

// Anonymous visitor id: hash(daily salt + site + ip + user agent).
// The salt is random, rotates every day and old ones are deleted, so ids
// cannot be traced back to an IP or linked across days. No cookies needed.

let cache: { day: string; salt: string } | null = null;

async function dailySalt(): Promise<string> {
  const day = new Date().toISOString().slice(0, 10);
  if (cache?.day === day) return cache.salt;
  await query("insert into salts (day, salt) values ($1, $2) on conflict (day) do nothing", [day, randomBytes(32).toString("hex")]);
  await query("delete from salts where day < ($1::date - 1)", [day]);
  const [row] = await query<{ salt: string }>("select salt from salts where day = $1", [day]);
  cache = { day, salt: row.salt };
  return row.salt;
}

export async function visitorId(siteId: string, ip: string | null, ua: string): Promise<string> {
  const salt = await dailySalt();
  return createHash("sha256").update(`${salt}|${siteId}|${ip ?? ""}|${ua}`).digest("hex").slice(0, 32);
}
