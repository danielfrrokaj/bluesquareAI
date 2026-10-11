import Link from "next/link";
import { getDictionary } from "@/content";
import { products, type ProductSlug } from "@/content/data";
import { localePath, type Locale } from "@/lib/i18n";
import { Icon3D } from "./Icon3D";

export function ProductCard({ lang, slug, headingLevel = 3 }: { lang: Locale; slug: ProductSlug; headingLevel?: 2 | 3 }) {
  const t = getDictionary(lang);
  const copy = t.products[slug];
  const H = `h${headingLevel}` as const;
  return (
    <article className="card card--link product-card">
      <Icon3D name={products[slug].icon} size={72} />
      <H className="card__title">
        <Link href={localePath(lang, `/projects/${slug}`)} className="stretched-link">
          {copy.name}
        </Link>
      </H>
      <p>{copy.tagline}</p>
      <span className="card__more" aria-hidden="true">
        {t.common.viewProject} →
      </span>
    </article>
  );
}
