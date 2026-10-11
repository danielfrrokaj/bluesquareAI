import Link from "next/link";
import type { Metadata } from "next";
import { getDictionary } from "@/content";
import { productSlugs, products, type ProductSlug } from "@/content/data";
import { localePath, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { graph, productSchema, webPageSchema } from "@/lib/schema";
import { Icon3D } from "@/components/Icon3D";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { SectionHead } from "@/components/SectionHead";
import { ProductCard } from "@/components/ProductCard";
import { CtaBand } from "@/components/CtaBand";

export function productMetadata(lang: Locale, slug: ProductSlug): Metadata {
  const copy = getDictionary(lang).products[slug];
  return pageMetadata({
    lang,
    path: `/projects/${slug}`,
    title: copy.metaTitle,
    description: copy.metaDescription,
  });
}

export function ProductPage({ lang, slug }: { lang: Locale; slug: ProductSlug }) {
  const t = getDictionary(lang);
  const copy = t.products[slug];
  const facts = products[slug];
  const path = `/projects/${slug}`;
  const p = (to: string) => localePath(lang, to);
  const crumbs = [
    { name: t.nav.projects, path: "/projects" },
    { name: copy.name, path },
  ];
  const related = productSlugs.filter((s) => s !== slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={graph(
          webPageSchema({
            lang,
            path,
            type: "ItemPage",
            name: copy.metaTitle,
            description: copy.metaDescription,
            crumbs,
            extra: { mainEntity: { "@id": productSchema(lang, slug)["@id"] } },
          }),
          productSchema(lang, slug),
        )}
      />

      <PageHero lang={lang} title={copy.name} lead={copy.tagline} crumbs={crumbs}>
        <div className="btn-row">
          <Link href={p("/contact")} className="btn btn--light">
            {t.common.askDemo}
          </Link>
          {facts.url && (
            <a href={facts.url} className="btn btn--outline-light" target="_blank" rel="noopener">
              {t.common.visitSite} ↗
            </a>
          )}
        </div>
      </PageHero>

      {copy.stats && (
        <div className="container">
          <ul className="stats stats--overlap">
            {copy.stats.map((s) => (
              <li key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section className="section" aria-labelledby="overview-title">
        <div className="container split">
          <div>
            <h2 id="overview-title">{copy.overviewTitle}</h2>
            {copy.overview.map((para) => (
              <p key={para} className="lead">
                {para}
              </p>
            ))}
          </div>
          <div className="media-icon">
            <Icon3D name={facts.icon} size={220} priority />
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="features-title">
        <div className="container">
          <SectionHead id="features-title" title={copy.featuresTitle} />
          <ul className={`grid ${copy.features.length % 3 === 0 ? "grid--3" : "grid--2"}`}>
            {copy.features.map((f) => (
              <li key={f.title} className="card">
                <h3 className="card__title">{f.title}</h3>
                <p className="muted">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {copy.list && copy.listTitle && (
        <section className="section" aria-labelledby="list-title">
          <div className="container">
            <SectionHead id="list-title" title={copy.listTitle} />
            <ul className="grid grid--3">
              {copy.list.map((f) => (
                <li key={f.title} className="card">
                  <h3 className="card__title">{f.title}</h3>
                  <p className="muted">{f.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {copy.steps && copy.stepsTitle && (
        <section className="section section--alt" aria-labelledby="steps-title">
          <div className="container">
            <SectionHead id="steps-title" title={copy.stepsTitle} />
            <ol className="grid grid--4 steps">
              {copy.steps.map((step, i) => (
                <li key={step.title} className="step">
                  <span className="step__num">0{i + 1}</span>
                  <h3>{step.title}</h3>
                  <p className="muted">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="related-title">
        <div className="container">
          <SectionHead id="related-title" title={t.projects.otherTitle} />
          <div className="grid grid--3">
            {related.map((s) => (
              <ProductCard key={s} lang={lang} slug={s} />
            ))}
          </div>
        </div>
      </section>

      <CtaBand lang={lang} />
    </>
  );
}
