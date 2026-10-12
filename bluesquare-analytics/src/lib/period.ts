// Calendar helpers for finance reports. Dates are plain "YYYY-MM-DD" strings in the report time zone.

export const TZ = () => process.env.REPORT_TIMEZONE || "Europe/Tirane";

/** Today in the report time zone, "YYYY-MM-DD". */
export const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: TZ() }).format(new Date());

/** "2026-10-11" -> "2026-10" */
export const monthOf = (date: string) => date.slice(0, 7);

/** "2026-10" + 2 -> "2026-12"; also accepts negative steps. */
export function addMonths(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number);
  const i = y * 12 + (m - 1) + n;
  return `${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}`;
}

export const daysInMonth = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
};

/** Months from `from` to `to`, both inclusive. */
export function monthRange(from: string, to: string): string[] {
  const out: string[] = [];
  for (let m = from; m <= to && out.length < 240; m = addMonths(m, 1)) out.push(m);
  return out;
}

const monthFmt = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
const monthShort = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
/** "2026-10" -> "Oct 2026" */
export const monthLabel = (month: string) => monthFmt.format(new Date(`${month}-01T00:00:00Z`));
/** "2026-10" -> "Oct" */
export const monthShortLabel = (month: string) => monthShort.format(new Date(`${month}-01T00:00:00Z`));

export const isMonth = (v: unknown): v is string => typeof v === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(v);
export const isDate = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));

export const PERIODS = {
  month: "This month",
  "last-month": "Last month",
  "3m": "Last 3 months",
  ytd: "This year",
  "12m": "Last 12 months",
} as const;
export type PeriodKey = keyof typeof PERIODS | "custom";

/** A period covers whole days: from <= date <= to. */
export type Period = { key: PeriodKey; from: string; to: string; label: string };

export function parsePeriod(sp: { period?: string; from?: string; to?: string }): Period {
  const t = today();
  const m = monthOf(t);
  const end = (month: string) => `${month}-${String(daysInMonth(month)).padStart(2, "0")}`;
  if (sp.period === "custom" && isDate(sp.from) && isDate(sp.to) && sp.from <= sp.to) {
    return { key: "custom", from: sp.from, to: sp.to, label: `${sp.from} – ${sp.to}` };
  }
  switch (sp.period) {
    case "last-month": {
      const lm = addMonths(m, -1);
      return { key: "last-month", from: `${lm}-01`, to: end(lm), label: monthLabel(lm) };
    }
    case "3m":
      return { key: "3m", from: `${addMonths(m, -2)}-01`, to: t, label: PERIODS["3m"] };
    case "ytd":
      return { key: "ytd", from: `${t.slice(0, 4)}-01-01`, to: t, label: PERIODS.ytd };
    case "12m":
      return { key: "12m", from: `${addMonths(m, -11)}-01`, to: t, label: PERIODS["12m"] };
    default:
      return { key: "month", from: `${m}-01`, to: t, label: monthLabel(m) };
  }
}
