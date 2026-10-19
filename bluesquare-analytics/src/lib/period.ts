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

/** Day `day` of a month, or its last day when the month is shorter: ("2027-02", 31) -> "2027-02-28". */
export const dayOfMonth = (month: string, day: number) => `${month}-${String(Math.min(day, daysInMonth(month))).padStart(2, "0")}`;

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
  "3m": "3 months",
  "6m": "6 months",
  ytd: "This year",
  all: "All",
} as const;
export type PeriodKey = keyof typeof PERIODS | "12m" | "custom";

/**
 * A period covers whole days: from <= date <= to. `month` is set when it is exactly one calendar
 * month (this month, last month or one picked with the month stepper).
 */
export type Period = { key: PeriodKey; from: string; to: string; label: string; month?: string };

/** Day the "All" period starts: before any bookkeeping in this app. */
const BEGINNING = "2000-01-01";

export function parsePeriod(sp: { period?: string; from?: string; to?: string; month?: string }): Period {
  const t = today();
  const m = monthOf(t);
  const end = (month: string) => `${month}-${String(daysInMonth(month)).padStart(2, "0")}`;
  if (sp.period === "custom" && isDate(sp.from) && isDate(sp.to) && sp.from <= sp.to) {
    return { key: "custom", from: sp.from, to: sp.to, label: `${sp.from} – ${sp.to}` };
  }
  // A month picked with the stepper (never past the current one).
  if (isMonth(sp.month) && sp.month <= m && (!sp.period || sp.period === "month")) {
    const key = sp.month === m ? "month" : sp.month === addMonths(m, -1) ? "last-month" : "custom";
    return { key, from: `${sp.month}-01`, to: sp.month === m ? t : end(sp.month), label: monthLabel(sp.month), month: sp.month };
  }
  switch (sp.period) {
    case "last-month": {
      const lm = addMonths(m, -1);
      return { key: "last-month", from: `${lm}-01`, to: end(lm), label: monthLabel(lm), month: lm };
    }
    case "3m":
      return { key: "3m", from: `${addMonths(m, -2)}-01`, to: t, label: "Last 3 months" };
    case "6m":
      return { key: "6m", from: `${addMonths(m, -5)}-01`, to: t, label: "Last 6 months" };
    case "ytd":
      return { key: "ytd", from: `${t.slice(0, 4)}-01-01`, to: t, label: `This year (${t.slice(0, 4)})` };
    case "12m":
      return { key: "12m", from: `${addMonths(m, -11)}-01`, to: t, label: "Last 12 months" };
    case "all":
      return { key: "all", from: BEGINNING, to: t, label: "All time" };
    default:
      return { key: "month", from: `${m}-01`, to: t, label: monthLabel(m), month: m };
  }
}

/** For lists that aren't limited by date: a period only when the link asks for one ("all", or none, means every date). */
export function optionalPeriod(sp: { period?: string; from?: string; to?: string; month?: string }): Period | null {
  return (sp.period && sp.period !== "all") || sp.month ? parsePeriod(sp) : null;
}
