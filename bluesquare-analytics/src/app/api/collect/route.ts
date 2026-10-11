import { query } from "@/lib/db";
import { clientIp, countryFor } from "@/lib/geo";
import { originAllowed, siteDomain } from "@/lib/sites";
import { BOT_RE, deviceFor, parseUserAgent } from "@/lib/ua";
import { visitorId } from "@/lib/visitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const done = (status = 204) => new Response(null, { status, headers: CORS });

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : null);
const isId = (v: unknown): v is string => typeof v === "string" && /^[\w-]{8,64}$/.test(v);

export function OPTIONS() {
  return done();
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > 4096) return done(413);

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw);
  } catch {
    return done(400);
  }

  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || BOT_RE.test(ua)) return done();

  const siteId = str(data.s, 64);
  const domain = siteId ? await siteDomain(siteId) : null;
  if (!siteId || !domain) return done(404);
  if (!originAllowed(req.headers.get("origin"), domain)) return done(403);

  // Time on page only updates an existing view; keep the highest value, cap at 1 hour.
  if (data.t === "dur") {
    const sec = Number(data.sec);
    if (!isId(data.id) || !Number.isFinite(sec) || sec <= 0) return done(400);
    await query("update pageviews set seconds = greatest(seconds, $3) where id = $1 and site_id = $2", [
      data.id,
      siteId,
      Math.min(Math.round(sec), 3600),
    ]);
    return done();
  }

  const ip = clientIp(req.headers);
  const [country, visitor] = await Promise.all([countryFor(req.headers, ip), visitorId(siteId, ip, ua)]);
  const path = str(data.p, 500) || "/";

  if (data.t === "pv") {
    if (!isId(data.id)) return done(400);
    const { browser, os } = parseUserAgent(ua);
    const referrer = str(data.r, 255) || null;
    await query(
      `insert into pageviews (id, site_id, path, referrer, country, device, browser, os, visitor)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9) on conflict (id) do nothing`,
      [data.id, siteId, path, referrer, country, deviceFor(data.w, ua), browser, os, visitor],
    );
    return done();
  }

  if (data.t === "click") {
    await query("insert into clicks (site_id, path, label, href, country, visitor) values ($1, $2, $3, $4, $5, $6)", [
      siteId,
      path,
      str(data.l, 100),
      str(data.h, 300),
      country,
      visitor,
    ]);
    return done();
  }

  return done(400);
}
