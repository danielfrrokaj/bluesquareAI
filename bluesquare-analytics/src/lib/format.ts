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
