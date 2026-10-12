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

// ---------- Filters ----------
// Clicking a row in a report narrows the whole report to it. Each filter is a page-view column;
// `fallback` is the value shown (and matched) when the column is empty. Clicks carry only some of
// these columns; for the others, clicks are matched through the visitors of the filtered page views.

export const FILTERS = {
  page: { label: "Page", column: "path", fallback: "/", onClicks: true },
  host: { label: "Domain", column: "host", fallback: "(unknown)", onClicks: true },
  country: { label: "Country", column: "country", fallback: "??", onClicks: true },
  referrer: { label: "Referrer", column: "referrer", fallback: "Direct", onClicks: false },
  device: { label: "Device", column: "device", fallback: "Unknown", onClicks: false },
  browser: { label: "Browser", column: "browser", fallback: "Other", onClicks: false },
  os: { label: "OS", column: "os", fallback: "Other", onClicks: false },
} as const;
export type FilterKey = keyof typeof FILTERS;
export type Filters = Partial<Record<FilterKey, string>>;

export function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const f: Filters = {};
  for (const key of Object.keys(FILTERS) as FilterKey[]) {
    const v = sp[key];
    if (typeof v === "string" && v && v.length <= 500) f[key] = v;
  }
  return f;
}

// $1 = site id, $2 = time zone, $3 = whole days back from today; filter values follow.
// The range starts at local midnight so every day in a report is complete.
const START = `((date_trunc('day', now() at time zone $2) - $3::int * interval '1 day') at time zone $2)`;
const IN_RANGE = `site_id = $1 and ts >= ${START}`;

/** WHERE clauses for page views and clicks, with their shared parameters. */
function scope(siteId: string, range: RangeKey, f: Filters = {}) {
  const params: unknown[] = [siteId, TZ(), RANGES[range].back];
  const pv = [IN_RANGE];
  const cl = [IN_RANGE];
  const viaVisitors: string[] = [];
  for (const key of Object.keys(f) as FilterKey[]) {
    const def = FILTERS[key];
    params.push(f[key]);
    const cond = `coalesce(${def.column}, '${def.fallback}') = $${params.length}`;
    pv.push(cond);
    (def.onClicks ? cl : viaVisitors).push(cond);
  }
  if (viaVisitors.length) cl.push(`visitor in (select visitor from pageviews where ${[IN_RANGE, ...viaVisitors].join(" and ")})`);
  return { pv: pv.join(" and "), cl: cl.join(" and "), params };
}

export type Summary = { views: number; visitors: number; avgSeconds: number; totalSeconds: number; clicks: number; live: number };

export async function summary(siteId: string, range: RangeKey, f: Filters = {}): Promise<Summary> {
  const s = scope(siteId, range, f);
  const [[pv], [cl], [live]] = await Promise.all([
    query<{ views: number; visitors: number; avg_seconds: number | null; total_seconds: number }>(
      `select count(*)::int as views, count(distinct visitor)::int as visitors,
              round(avg(nullif(seconds, 0)))::int as avg_seconds, coalesce(sum(seconds), 0)::int as total_seconds
       from pageviews where ${s.pv}`,
      s.params,
    ),
    query<{ clicks: number }>(`select count(*)::int as clicks from clicks where ${s.cl}`, s.params),
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
export async function activity(siteId: string, range: RangeKey, f: Filters = {}): Promise<ActivityRow[]> {
  const hourly = range === "today";
  const unit = hourly ? "hour" : "day";
  const series = hourly
    ? `generate_series(date_trunc('day', now() at time zone $2), date_trunc('hour', now() at time zone $2), interval '1 hour')`
    : `generate_series(date_trunc('day', now() at time zone $2) - $3::int * interval '1 day', date_trunc('day', now() at time zone $2), interval '1 day')`;
  const s = scope(siteId, range, f);
  const rows = await query<{ bucket: string; views: number; visitors: number; clicks: number; avg_seconds: number | null }>(
    `with b as (select ${series} as bucket),
     pv as (
       select date_trunc('${unit}', ts at time zone $2) as bucket, count(*)::int as views,
              count(distinct visitor)::int as visitors, round(avg(nullif(seconds, 0)))::int as avg_seconds
       from pageviews where ${s.pv} group by 1),
     cl as (
       select date_trunc('${unit}', ts at time zone $2) as bucket, count(*)::int as clicks
       from clicks where ${s.cl} group by 1)
     select to_char(b.bucket, '${hourly ? "YYYY-MM-DD HH24:00" : "YYYY-MM-DD"}') as bucket,
            coalesce(pv.views, 0) as views, coalesce(pv.visitors, 0) as visitors,
            coalesce(cl.clicks, 0) as clicks, pv.avg_seconds
     from b left join pv using (bucket) left join cl using (bucket)
     order by b.bucket`,
    s.params,
  );
  return rows.map((r) => ({ bucket: r.bucket, views: r.views, visitors: r.visitors, clicks: r.clicks, avgSeconds: r.avg_seconds ?? 0 }));
}

export type PageRow = { path: string; views: number; visitors: number; avgSeconds: number; totalSeconds: number };

export async function topPages(siteId: string, range: RangeKey, limit = 50, f: Filters = {}): Promise<PageRow[]> {
  const s = scope(siteId, range, f);
  const rows = await query<{ path: string; views: number; visitors: number; avg_seconds: number | null; total_seconds: number }>(
    `select path, count(*)::int as views, count(distinct visitor)::int as visitors,
            round(avg(nullif(seconds, 0)))::int as avg_seconds, coalesce(sum(seconds), 0)::int as total_seconds
     from pageviews where ${s.pv} group by path order by views desc, path limit ${Math.floor(limit)}`,
    s.params,
  );
  return rows.map((r) => ({ path: r.path, views: r.views, visitors: r.visitors, avgSeconds: r.avg_seconds ?? 0, totalSeconds: r.total_seconds }));
}

export type CountRow = { key: string; visitors: number; views: number };

async function breakdown(key: FilterKey, siteId: string, range: RangeKey, f: Filters, limit = 50): Promise<CountRow[]> {
  const { column, fallback } = FILTERS[key];
  const s = scope(siteId, range, f);
  return query<CountRow>(
    `select coalesce(${column}, '${fallback}') as key, count(distinct visitor)::int as visitors, count(*)::int as views
     from pageviews where ${s.pv} group by 1 order by visitors desc, views desc limit ${Math.floor(limit)}`,
    s.params,
  );
}

export const countries = (siteId: string, range: RangeKey, f: Filters = {}) => breakdown("country", siteId, range, f);
export const referrers = (siteId: string, range: RangeKey, f: Filters = {}) => breakdown("referrer", siteId, range, f);
export const devices = (siteId: string, range: RangeKey, f: Filters = {}) => breakdown("device", siteId, range, f, 10);
export const browsers = (siteId: string, range: RangeKey, f: Filters = {}) => breakdown("browser", siteId, range, f, 10);
export const systems = (siteId: string, range: RangeKey, f: Filters = {}) => breakdown("os", siteId, range, f, 10);
export const hosts = (siteId: string, range: RangeKey, f: Filters = {}) => breakdown("host", siteId, range, f, 20);

export type ClickRow = { label: string; href: string | null; clicks: number; visitors: number };

export async function topClicks(siteId: string, range: RangeKey, limit = 50, f: Filters = {}): Promise<ClickRow[]> {
  const s = scope(siteId, range, f);
  return query<ClickRow>(
    `select coalesce(nullif(label, ''), '(no text)') as label, href, count(*)::int as clicks, count(distinct visitor)::int as visitors
     from clicks where ${s.cl} group by 1, 2 order by clicks desc limit ${Math.floor(limit)}`,
    s.params,
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
