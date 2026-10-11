import type { Metadata } from "next";
import { COMPANY } from "./site";
import { localePath, ogLocale, type Locale } from "./i18n";

type PageMeta = {
  lang: Locale;
  /** Locale-neutral path, e.g. "/about" */
  path: string;
  title: string;
  description: string;
  image?: { url: string; width: number; height: number; alt: string };
  /** Use the title as-is instead of appending the brand. */
  absoluteTitle?: boolean;
};

const DEFAULT_IMAGE = { url: "/og-image.png", width: 1200, height: 630, alt: COMPANY.name };

export function pageMetadata({ lang, path, title, description, image, absoluteTitle }: PageMeta): Metadata {
  const url = localePath(lang, path);
  const img = image ?? DEFAULT_IMAGE;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: localePath("en", path),
        sq: localePath("sq", path),
        "x-default": localePath("en", path),
      },
    },
    openGraph: {
      type: "website",
      siteName: COMPANY.name,
      url,
      title,
      description,
      locale: ogLocale[lang],
      alternateLocale: ogLocale[lang === "en" ? "sq" : "en"],
      images: [img],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [img.url],
    },
  };
}
