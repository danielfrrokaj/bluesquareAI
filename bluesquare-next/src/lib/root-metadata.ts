import type { Metadata, Viewport } from "next";
import { getDictionary } from "@/content";
import type { Locale } from "./i18n";
import { COMPANY, SITE_URL } from "./site";

export function rootMetadata(lang: Locale): Metadata {
  const t = getDictionary(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.homeTitle, template: `%s | ${COMPANY.name}` },
    description: t.meta.homeDescription,
    applicationName: COMPANY.name,
    authors: [{ name: COMPANY.name, url: SITE_URL }],
    creator: COMPANY.name,
    publisher: COMPANY.name,
    category: "technology",
    formatDetection: { telephone: false, email: false, address: false },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/logo-mark.svg", type: "image/svg+xml" },
      ],
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.webmanifest",
  };
}

export const rootViewport: Viewport = {
  themeColor: "#061238",
  width: "device-width",
  initialScale: 1,
};
