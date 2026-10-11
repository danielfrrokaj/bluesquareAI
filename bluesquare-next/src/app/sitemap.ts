import type { MetadataRoute } from "next";
import { productSlugs } from "@/content/data";
import { localePath } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

const routes: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/solutions", priority: 0.9, changeFrequency: "monthly" },
  { path: "/projects", priority: 0.9, changeFrequency: "monthly" },
  ...productSlugs.map((slug) => ({ path: `/projects/${slug}`, priority: 0.8, changeFrequency: "monthly" as const })),
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
  { path: "/careers", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
];

const url = (p: string) => `${SITE_URL}${p === "/" ? "" : p}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.flatMap(({ path, priority, changeFrequency }) =>
    (["en", "sq"] as const).map((lang) => ({
      url: url(localePath(lang, path)),
      lastModified,
      changeFrequency,
      priority: lang === "en" ? priority : Math.max(priority - 0.1, 0.1),
      alternates: { languages: { en: url(localePath("en", path)), sq: url(localePath("sq", path)) } },
    })),
  );
}
