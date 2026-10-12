import "server-only";
import { BigQuery, type Job } from "@google-cloud/bigquery";
import { monthOf, today, TZ, type Period } from "./period";
import { cloudCostSummary, parseBillingSources, type BillingRead, type BillingSource, type CloudCostDay } from "./google-cloud-costs";

const shared = globalThis as typeof globalThis & {
  __cloudBillingCache?: Map<string, { until: number; value: Promise<BillingRead[]> }>;
};

/** Read-only, parameterized query; sum credits per line so repeated credits never multiply cost. */
export function billingQuery(table: string) {
  if (!/^[a-z][a-z0-9-]+\.[A-Za-z_][A-Za-z0-9_]*\.gcp_billing_export_(?:resource_)?v1_[A-Fa-f0-9_-]+$/.test(table)) {
    throw new Error("Invalid billing table.");
  }
  return `SELECT
    CAST(DATE(usage_start_time, @timezone) AS STRING) AS day,
    COALESCE(project.id, '') AS project_id,
    COALESCE(NULLIF(project.name, ''), project.id, 'Unallocated account costs') AS project_name,
    currency,
    SUM(CAST(cost AS NUMERIC)) AS gross,
    SUM(IFNULL((SELECT SUM(CAST(c.amount AS NUMERIC)) FROM UNNEST(credits) c), 0)) AS credits,
    FORMAT_TIMESTAMP('%Y-%m-%dT%H:%M:%SZ', MAX(export_time), 'UTC') AS last_export
  FROM \`${table}\`
  WHERE usage_start_time >= TIMESTAMP(@from, @timezone)
    AND usage_start_time < TIMESTAMP(DATE_ADD(DATE(@to), INTERVAL 1 DAY), @timezone)
    AND billing_account_id = @account
  GROUP BY 1, 2, 3, 4
  ORDER BY 1, 2`;
}

function decodeRow(value: Record<string, unknown>): CloudCostDay {
  if (value.gross == null || value.credits == null) throw new Error("invalid_billing_rows");
  const row = {
    date: String(value.day), projectId: String(value.project_id ?? ""), projectName: String(value.project_name),
    currency: String(value.currency), cost: Number(value.gross), credits: Number(value.credits), exportedAt: String(value.last_export),
  };
  if (row.currency !== "USD") throw new Error("unsupported_currency");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date) || !Number.isFinite(row.cost) || !Number.isFinite(row.credits)
    || !Number.isFinite(Date.parse(row.exportedAt))) throw new Error("invalid_billing_rows");
  return row;
}

async function readSource(source: BillingSource, from: string, to: string, timezone: string): Promise<BillingRead> {
  const result = (status: BillingRead["status"], message: string, rows: CloudCostDay[] = []): BillingRead =>
    ({ source, status, message, rows, checkedAt: new Date().toISOString() });
  let job: Job | undefined;
  try {
    // Application Default Credentials locally; attached service account on Cloud Run.
    const client = new BigQuery({ projectId: source.projectId, location: "EU", autoRetry: false });
    const [tables] = await client.dataset(source.datasetId).getTables();
    const suffix = source.billingAccountId.replaceAll("-", "_");
    const matches = (prefix: string) => tables.find(t => t.id === `${prefix}${suffix}` || t.id === `${prefix}${source.billingAccountId}`);
    // If both exports are enabled, read only standard: they contain the same costs.
    const table = matches("gcp_billing_export_v1_") ?? matches("gcp_billing_export_resource_v1_");
    if (!table) return result("waiting", "Waiting for first export");

    const maximumBytesBilled = process.env.GOOGLE_CLOUD_BILLING_MAX_BYTES || "1073741824";
    if (!/^\d+$/.test(maximumBytesBilled) || Number(maximumBytesBilled) <= 0) throw new Error("invalid_query_limit");
    [job] = await client.createQueryJob({
      query: billingQuery(`${source.projectId}.${source.datasetId}.${table.id}`),
      params: { from, to, timezone, account: source.billingAccountId },
      useLegacySql: false, useQueryCache: true, maximumBytesBilled, jobTimeoutMs: 20000,
      labels: { purpose: "finance_cloud_forecast" },
    });
    const rows: CloudCostDay[] = [];
    let pageToken: string | undefined;
    const deadline = Date.now() + 25000;
    do {
      const [page, next, response] = await job.getQueryResults({ autoPaginate: false, maxResults: 2000, timeoutMs: 10000, pageToken });
      if (Number(response?.totalRows ?? 0) > 100000) throw new Error("too_many_billing_rows");
      if (response?.jobComplete !== false) rows.push(...page.map(decodeRow));
      pageToken = next?.pageToken;
      if (response?.jobComplete !== false && !pageToken) break;
      if (Date.now() > deadline) throw new Error("billing_query_timeout");
    } while (true);
    return rows.length ? result("ready", "Connected", rows) : result("waiting", "Export is enabled; waiting for usage rows");
  } catch (error) {
    if (job) await job.cancel().catch(() => undefined);
    const code = (error as { code?: number }).code;
    const reason = error instanceof Error ? error.message : "";
    // Avoid logging credential-bearing SDK request objects or exposing them to members.
    console.error("Cloud Billing read failed", { project: source.projectId, code: code ?? "unknown" });
    const message = reason === "unsupported_currency" ? "This export uses a currency other than USD; costs are excluded."
      : code === 401 || code === 403 ? "Billing access unavailable. Check the app's Google Cloud credentials and dataset permissions."
      : code === 404 ? "Billing dataset or export table was not found."
      : "Billing data is temporarily unavailable. The next refresh will retry.";
    return result("error", message);
  }
}

export async function getGoogleCloudReport(period: Pick<Period, "from" | "to">) {
  const date = today();
  let sources: BillingSource[];
  try { sources = parseBillingSources(process.env.GOOGLE_CLOUD_BILLING_SOURCES); }
  catch { return { ...cloudCostSummary([], period, date), configurationError: true }; }
  if (!sources.length) return { ...cloudCostSummary([], period, date), configurationError: false };
  const currentStart = `${monthOf(date)}-01`;
  // Selected history plus the current month needed by the forecast, even on historical filters.
  const from = period.from < currentStart ? period.from : currentStart;
  const to = date;
  const key = JSON.stringify([sources, from, to, TZ(), process.env.GOOGLE_CLOUD_BILLING_MAX_BYTES]);
  const cache = shared.__cloudBillingCache ??= new Map<string, { until: number; value: Promise<BillingRead[]> }>();
  let entry = cache.get(key);
  if (!entry || entry.until < Date.now()) {
    // Keep arbitrary custom periods from growing process memory without limit.
    for (const [cacheKey, cached] of cache) if (cached.until < Date.now()) cache.delete(cacheKey);
    if (cache.size >= 20) cache.delete(cache.keys().next().value!);
    entry = { until: Date.now() + 15 * 60 * 1000, value: Promise.all(sources.map(s => readSource(s, from, to, TZ()))) };
    cache.set(key, entry);
    const value = await entry.value;
    if (value.some(r => r.status !== "ready")) entry.until = Date.now() + 60 * 1000;
  }
  return { ...cloudCostSummary(await entry.value, period, date), configurationError: false };
}
