// English lives at the root ("/about"), Albanian under "/sq" ("/sq/about").
// Both versions are real, crawlable URLs linked with hreflang.

export const locales = ["en", "sq"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** "/about" -> "/sq/about" for Albanian, unchanged for English. */
export function localePath(lang: Locale, path: string): string {
  const clean = path === "" ? "/" : path;
  if (lang === defaultLocale) return clean;
  return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
}

/** Strips the locale prefix: "/sq/about" -> "/about". */
export function basePath(pathname: string): string {
  const match = pathname.match(/^\/sq(?=\/|$)(.*)$/);
  if (!match) return pathname || "/";
  return match[1] || "/";
}

export function localeFromPath(pathname: string): Locale {
  return /^\/sq(\/|$)/.test(pathname) ? "sq" : "en";
}

export const htmlLang: Record<Locale, string> = { en: "en", sq: "sq" };
export const ogLocale: Record<Locale, string> = { en: "en_US", sq: "sq_AL" };
