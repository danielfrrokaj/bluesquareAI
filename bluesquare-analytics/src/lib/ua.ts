// Minimal browser / OS detection. Order matters: Edge and Opera also contain "Chrome".

const BROWSERS: [RegExp, string][] = [
  [/Edg(e|A|iOS)?\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/SamsungBrowser/, "Samsung Internet"],
  [/Firefox|FxiOS/, "Firefox"],
  [/Chrome|CriOS/, "Chrome"],
  [/Safari/, "Safari"],
];

const OSES: [RegExp, string][] = [
  [/iPhone|iPad|iPod/, "iOS"],
  [/Android/, "Android"],
  [/Windows/, "Windows"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/CrOS/, "ChromeOS"],
  [/Linux/, "Linux"],
];

export const BOT_RE = /bot|crawl|spider|slurp|facebookexternalhit|preview|lighthouse|headlesschrome|phantom|curl|wget|python|axios|node-fetch/i;

const match = (ua: string, list: [RegExp, string][]) => list.find(([re]) => re.test(ua))?.[1] ?? "Other";

export function parseUserAgent(ua: string) {
  return { browser: match(ua, BROWSERS), os: match(ua, OSES) };
}

/** Device class from the screen width the tracker reports (more reliable than the UA). */
export function deviceFor(width: unknown, ua: string): string {
  const w = typeof width === "number" ? width : 0;
  if (w > 0) return w < 768 ? "Mobile" : w < 1100 ? "Tablet" : "Desktop";
  return /Mobi|Android|iPhone/.test(ua) ? "Mobile" : "Desktop";
}
