import type { Metadata } from "next";
import { getDictionary } from "@/content";
import { productSlugs } from "@/content/data";
import { localePath, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, graph, productSchema, webPageSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { ProductCard } from "@/components/ProductCard";
import { CtaBand } from "@/components/CtaBand";

const PATH = "/projects";

export function projectsMetadata(lang: Locale): Metadata {
  const t = getDictionary(lang).projects;
  return pageMetadata({ lang, path: PATH, title: t.metaTitle, description: t.metaDescription });
}

export function ProjectsPage({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const s = t.projects;

  const list = {
    "@type": "ItemList",
    itemListElement: productSlugs.map((slug, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(localePath(lang, `/projects/${slug}`)),
      name: t.products[slug].name,
    })),
  };

  return (
    <>
      <JsonLd
        data={graph(
          webPageSchema({
            lang,
            path: PATH,
            type: "CollectionPage",
            name: s.metaTitle,
            description: s.metaDescription,
            crumbs: [{ name: t.nav.projects, path: PATH }],
            extra: { mainEntity: list },
          }),
          productSlugs.map((slug) => productSchema(lang, slug)),
        )}
      />

      <PageHero lang={lang} title={s.title} lead={s.lead} crumbs={[{ name: t.nav.projects, path: PATH }]} />

      <section className="section">
        <div className="container">
          <div className="grid grid--3">
            {productSlugs.map((slug) => (
              <ProductCard key={slug} lang={lang} slug={slug} headingLevel={2} />
            ))}
          </div>
        </div>
      </section>

      <CtaBand lang={lang} title={s.ctaTitle} text={s.ctaText} button={s.ctaButton} />
    </>
  );
}
