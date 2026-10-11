import "server-only";
import { query } from "./db";

export const RANGES = {
  today: { label: "Today", back: 0 },
  "7d": { label: "Last 7 days", back: 6 },
  "30d": { label: "Last 30 days", back: 29 },
  "90d": { label: "Last 90 days", back: 89 },
} as const;
export type RangeKey = keyof typeof RANGES;

export function parseRange(value: string | undefined): RangeKey {
  return value && value in RANGES ? (value as RangeKey) : "7d";
}

const TZ = () => process.env.REPORT_TIMEZONE || "Europe/Tirane";

// $1 = site id, $2 = time zone, $3 = whole days back from today.
// The range starts at local midnight so every day in a report is complete.
const START = `((date_trunc('day', now() at time zone $2) - $3::int * interval '1 day') at time zone $2)`;
const IN_RANGE = `site_id = $1 and ts >= ${START}`;

const params = (siteId: string, range: RangeKey) => [siteId, TZ(), RANGES[range].back];

export type Summary = { views: number; visitors: number; avgSeconds: number; totalSeconds: number; clicks: number; live: number };

export async function summary(siteId: string, range: RangeKey): Promise<Summary> {
  const p = params(siteId, range);
  const [[pv], [cl], [live]] = await Promise.all([
    query<{ views: number; visitors: number; avg_seconds: number | null; total_seconds: number }>(
      `select count(*)::int as views, count(distinct visitor)::int as visitors,
              round(avg(nullif(seconds, 0)))::int as avg_seconds, coalesce(sum(seconds), 0)::int as total_seconds
       from pageviews where ${IN_RANGE}`,
      p,
    ),
    query<{ clicks: number }>(`select count(*)::int as clicks from clicks where ${IN_RANGE}`, p),
    query<{ live: number }>(
      `select count(distinct visitor)::int as live from pageviews where site_id = $1 and ts > now() - interval '5 minutes'`,
      [siteId],
    ),
  ]);
  return {
    views: pv.views,
    visitors: pv.visitors,
    avgSeconds: pv.avg_seconds ?? 0,
    totalSeconds: pv.total_seconds,
    clicks: cl.clicks,
    live: live.live,
  };
}

export type ActivityRow = { bucket: string; views: number; visitors: number; clicks: number; avgSeconds: number };

/** Activity per hour (today) or per day, with empty buckets filled in. */
export async function activity(siteId: string, range: RangeKey): Promise<ActivityRow[]> {
  const hourly = range === "today";
  const unit = hourly ? "hour" : "day";
  const series = hourly
    ? `generate_series(date_trunc('day', now() at time zone $2), date_trunc('hour', now() at time zone $2), interval '1 hour')`
    : `generate_series(date_trunc('day', now() at time zone $2) - $3::int * interval '1 day', date_trunc('day', now() at time zone $2), interval '1 day')`;
  const rows = await query<{ bucket: string; views: number; visitors: number; clicks: number; avg_seconds: number | null }>(
    `with b as (select ${series} as bucket),
     pv as (
       select date_trunc('${unit}', ts at time zone $2) as bucket, count(*)::int as views,
              count(distinct visitor)::int as visitors, round(avg(nullif(seconds, 0)))::int as avg_seconds
       from pageviews where ${IN_RANGE} group by 1),
     cl as (
       select date_trunc('${unit}', ts at time zone $2) as bucket, count(*)::int as clicks
       from clicks where ${IN_RANGE} group by 1)
     select to_char(b.bucket, '${hourly ? "YYYY-MM-DD HH24:00" : "YYYY-MM-DD"}') as bucket,
            coalesce(pv.views, 0) as views, coalesce(pv.visitors, 0) as visitors,
            coalesce(cl.clicks, 0) as clicks, pv.avg_seconds
     from b left join pv using (bucket) left join cl using (bucket)
     order by b.bucket`,
    params(siteId, range),
  );
  return rows.map((r) => ({ bucket: r.bucket, views: r.views, visitors: r.visitors, clicks: r.clicks, avgSeconds: r.avg_seconds ?? 0 }));
}

export type PageRow = { path: string; views: number; visitors: number; avgSeconds: number; totalSeconds: number };

export async function topPages(siteId: string, range: RangeKey, limit = 50): Promise<PageRow[]> {
  const rows = await query<{ path: string; views: number; visitors: number; avg_seconds: number | null; total_seconds: number }>(
    `select path, count(*)::int as views, count(distinct visitor)::int as visitors,
            round(avg(nullif(seconds, 0)))::int as avg_seconds, coalesce(sum(seconds), 0)::int as total_seconds
     from pageviews where ${IN_RANGE} group by path order by views desc, path limit ${limit}`,
    params(siteId, range),
  );
  return rows.map((r) => ({ path: r.path, views: r.views, visitors: r.visitors, avgSeconds: r.avg_seconds ?? 0, totalSeconds: r.total_seconds }));
}

export type CountRow = { key: string; visitors: number; views: number };

async function breakdown(column: string, siteId: string, range: RangeKey, fallback: string, limit = 50): Promise<CountRow[]> {
  return query<CountRow>(
    `select coalesce(${column}, '${fallback}') as key, count(distinct visitor)::int as visitors, count(*)::int as views
     from pageviews where ${IN_RANGE} group by 1 order by visitors desc, views desc limit ${limit}`,
    params(siteId, range),
  );
}

export const countries = (siteId: string, range: RangeKey) => breakdown("country", siteId, range, "??");
export const referrers = (siteId: string, range: RangeKey) => breakdown("referrer", siteId, range, "Direct");
export const devices = (siteId: string, range: RangeKey) => breakdown("device", siteId, range, "Unknown", 10);
export const browsers = (siteId: string, range: RangeKey) => breakdown("browser", siteId, range, "Other", 10);
export const systems = (siteId: string, range: RangeKey) => breakdown("os", siteId, range, "Other", 10);

export type ClickRow = { label: string; href: string | null; clicks: number; visitors: number };

export async function topClicks(siteId: string, range: RangeKey, limit = 50): Promise<ClickRow[]> {
  return query<ClickRow>(
    `select coalesce(nullif(label, ''), '(no text)') as label, href, count(*)::int as clicks, count(distinct visitor)::int as visitors
     from clicks where ${IN_RANGE} group by 1, 2 order by clicks desc limit ${limit}`,
    params(siteId, range),
  );
}

/** Overview numbers for the site list. */
export async function siteTotals(range: RangeKey): Promise<Record<string, { views: number; visitors: number }>> {
  const rows = await query<{ site_id: string; views: number; visitors: number }>(
    `select site_id, count(*)::int as views, count(distinct visitor)::int as visitors
     from pageviews
     where ts >= ((date_trunc('day', now() at time zone $1) - $2::int * interval '1 day') at time zone $1)
     group by site_id`,
    [TZ(), RANGES[range].back],
  );
  return Object.fromEntries(rows.map((r) => [r.site_id, { views: r.views, visitors: r.visitors }]));
}
