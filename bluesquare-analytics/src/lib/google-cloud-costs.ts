// Pure billing calculations. Amounts stay in USD and never enter the EUR ledger.
import { addMonths, daysInMonth, monthOf, type Period } from "./period";

export type BillingSource = { name: string; projectId: string; datasetId: string; billingAccountId: string };
export type CloudCostDay = { date: string; projectId: string; projectName: string; currency: string; cost: number; credits: number; exportedAt: string };
export type BillingRead = {
  source: BillingSource;
  status: "ready" | "waiting" | "error";
  message: string;
  rows: CloudCostDay[];
  checkedAt: string;
};

export function parseBillingSources(raw: string | undefined): BillingSource[] {
  if (!raw?.trim()) return [];
  const values: unknown = JSON.parse(raw);
  if (!Array.isArray(values) || values.length > 10) throw new Error("Invalid billing sources configuration.");
  const accounts = new Set<string>();
  return values.map((value: unknown) => {
    const s = value as Partial<BillingSource> | null;
    if (!s || typeof s.name !== "string" || !s.name.trim() || s.name.length > 100
      || typeof s.projectId !== "string" || !/^[a-z][a-z0-9-]{4,62}$/.test(s.projectId)
      || typeof s.datasetId !== "string" || !/^[A-Za-z_][A-Za-z0-9_]{0,1023}$/.test(s.datasetId)
      || typeof s.billingAccountId !== "string" || !/^[A-F0-9]{6}-[A-F0-9]{6}-[A-F0-9]{6}$/.test(s.billingAccountId)
      || accounts.has(s.billingAccountId)) throw new Error("Invalid or duplicated billing source.");
    accounts.add(s.billingAccountId);
    return s as BillingSource;
  });
}

export const dateOffset = (date: string, days: number) => {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

const net = (row: CloudCostDay) => row.cost + row.credits;
const sum = (rows: CloudCostDay[]) => rows.reduce((total, row) => total + net(row), 0);
const latest = (values: string[]) => values.length ? values.reduce((a, b) => a > b ? a : b) : null;

function accountForecast(read: BillingRead, today: string) {
  const month = monthOf(today);
  const first = `${month}-01`;
  const rows = read.rows.filter(r => r.date <= today);
  const last = latest(rows.map(r => r.date));
  const missing = (reason: string) => ({ daily: null, expected: null, through: null, reason });
  if (read.status !== "ready" || !last) return missing("Waiting for billing data.");
  if (last < dateOffset(today, -2)) return missing("Waiting for recent usage; the export may still be catching up.");

  // Exclude the latest observed day: its services can still be reporting costs.
  const through = dateOffset(last < today ? last : today, -1);
  const start = dateOffset(through, -6);
  const dates = new Set(rows.map(r => r.date));
  if (through < first || start < first) return missing("Forecast starts after seven full days of this month's usage.");
  for (let date = first; date <= through; date = dateOffset(date, 1)) {
    if (!dates.has(date)) return missing("Waiting for a continuous month-to-date export before forecasting.");
  }
  const daily = Math.max(0, sum(rows.filter(r => r.date >= start && r.date <= through)) / 7);
  const accounted = sum(rows.filter(r => r.date >= first && r.date <= through));
  const actual = sum(rows.filter(r => r.date >= first));
  const expected = Math.max(0, actual, accounted + daily * (daysInMonth(month) - Number(through.slice(8))));
  return { daily, expected, through, reason: "Seven-day net usage pace; latest day excluded." };
}

export function cloudCostSummary(reads: BillingRead[], period: Pick<Period, "from" | "to">, today: string) {
  const month = monthOf(today);
  const ready = reads.filter(r => r.status === "ready");
  const rows = ready.flatMap(r => r.rows);
  const selected = rows.filter(r => r.date >= period.from && r.date <= period.to);
  const current = rows.filter(r => monthOf(r.date) === month && r.date <= today);
  const forecasts = reads.map(read => ({ ...read, forecast: accountForecast(read, today) }));
  const complete = reads.length > 0 && ready.length === reads.length;
  const periodPartial = !complete || ready.some(read => {
    const dates = read.rows.map(r => r.date).sort();
    return !dates.length || dates[0] > period.from || dates[dates.length - 1] < (period.to < today ? period.to : today);
  });
  const canForecast = complete && forecasts.every(r => r.forecast.expected !== null);
  const groups = new Map<string, { id: string; name: string; account: string; cost: number; credits: number; total: number }>();
  for (const read of ready) {
    for (const row of read.rows.filter(r => r.date >= period.from && r.date <= period.to)) {
      const id = `${read.source.billingAccountId}:${row.projectId}`;
      const group = groups.get(id) ?? { id, name: row.projectName, account: read.source.name, cost: 0, credits: 0, total: 0 };
      group.cost += row.cost;
      group.credits += row.credits;
      group.total += net(row);
      groups.set(id, group);
    }
  }
  const daily = canForecast ? forecasts.reduce((total, r) => total + r.forecast.daily!, 0) : null;
  return {
    month, complete, periodPartial, hasData: ready.length > 0, readyCount: ready.length,
    periodTotal: ready.length ? sum(selected) : null,
    monthTotal: current.length ? sum(current) : null,
    expected: canForecast ? forecasts.reduce((total, r) => total + r.forecast.expected!, 0) : null,
    daily,
    next: Array.from({ length: 3 }, (_, i) => {
      const nextMonth = addMonths(month, i + 1);
      return { month: nextMonth, expense: daily === null ? null : daily * daysInMonth(nextMonth) };
    }),
    projects: [...groups.values()].sort((a, b) => b.total - a.total),
    accounts: forecasts.map(read => ({
      source: read.source, status: read.status, message: read.message, checkedAt: read.checkedAt,
      lastUsage: latest(read.rows.map(r => r.date)),
      lastExport: latest(read.rows.map(r => r.exportedAt)),
      forecast: read.forecast,
    })),
  };
}

export type CloudCostSummary = ReturnType<typeof cloudCostSummary>;
