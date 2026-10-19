const nf = new Intl.NumberFormat("en-US");
export const num = (n: number) => nf.format(n);

/** 0 -> "–", 42 -> "42s", 125 -> "2m 05s", 3720 -> "1h 02m" */
export function duration(seconds: number): string {
  if (!seconds) return "–";
  const s = Math.round(seconds);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${String(s % 60).padStart(2, "0")}s`;
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
}

const regions = new Intl.DisplayNames(["en"], { type: "region" });

export function countryName(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "Unknown";
  try {
    return regions.of(code) ?? code;
  } catch {
    return code;
  }
}

/** "AL" -> 🇦🇱 (regional indicator symbols) */
export function flag(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "🌐";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export const pct = (part: number, total: number) => (total ? Math.round((part / total) * 100) : 0);

const moneyFormats = new Map<string, Intl.NumberFormat>();

/** 12000 -> "EUR 12,000"; 12.5 -> "EUR 12.50" */
export function money(n: number, currency = "EUR"): string {
  const whole = Number.isInteger(Math.round(n * 100) / 100);
  const key = `${currency}|${whole}`;
  let f = moneyFormats.get(key);
  if (!f) {
    f = new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "code", minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 });
    moneyFormats.set(key, f);
  }
  return f.format(n).replace(/ /g, " ");
}

/** Short form for chart axes: 1250000 -> "1.3M" */
export function compact(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

/** Signed percentage change, or null when there's no base: (120, 100) -> "+20%" */
export function change(current: number, previous: number): string | null {
  if (!previous) return null;
  const p = Math.round(((current - previous) / previous) * 100);
  return `${p > 0 ? "+" : ""}${p}%`;
}

/** "12,000.50" or "12000,5" -> 12000.5; null when not a number. */
export function parseAmount(raw: string): number | null {
  const s = raw.replace(/\s/g, "");
  const normalized = /,\d{1,2}$/.test(s) && !s.includes(".") ? s.replace(",", ".") : s.replace(/,/g, "");
  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const n = Number(normalized);
  return Number.isFinite(n) && Math.abs(n) < 1e12 ? n : null;
}

/** Last 9 digits: the same number written as 067…, +35567… or 0035567… matches. */
export const phoneKey = (phone: string | null | undefined) => {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits.length >= 6 ? digits.slice(-9) : null;
};
