"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { basePath, localePath, locales, type Locale } from "@/lib/i18n";
import { GlobeIcon } from "./icons";

const names: Record<Locale, string> = { en: "English", sq: "Shqip" };

/** Links to the same page in each language. */
export function LangSwitch({ lang, label }: { lang: Locale; label: string }) {
  const path = basePath(usePathname() ?? "/");
  return (
    <nav className="lang" aria-label={label}>
      <GlobeIcon />
      {locales.map((l) => (
        <Link
          key={l}
          href={localePath(l, path)}
          hrefLang={l}
          lang={l}
          className="lang__link"
          aria-current={l === lang ? "true" : undefined}
        >
          {names[l]}
        </Link>
      ))}
    </nav>
  );
}
