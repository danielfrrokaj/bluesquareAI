import Link from "next/link";
import type { Metadata } from "next";
import { getDictionary } from "@/content";
import { serviceIcons, serviceIds, serviceProduct, type IconName } from "@/content/data";
import { localePath, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { ORG_ID, absoluteUrl, graph, webPageSchema } from "@/lib/schema";
import { Icon3D } from "@/components/Icon3D";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { SectionHead } from "@/components/SectionHead";
import { CtaBand } from "@/components/CtaBand";

const PATH = "/solutions";
const industryIcons: IconName[] = ["hotel", "discover", "retail", "clinic"];

export function solutionsMetadata(lang: Locale): Metadata {
  const t = getDictionary(lang).solutions;
  return pageMetadata({ lang, path: PATH, title: t.metaTitle, description: t.metaDescription });
}

export function SolutionsPage({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const s = t.solutions;
  const p = (path: string) => localePath(lang, path);
  const pageUrl = absoluteUrl(p(PATH));

  const services = serviceIds.map((id, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Service",
      "@id": `${pageUrl}#${id}`,
      name: t.services[id].title,
      description: t.services[id].text,
      serviceType: t.services[id].title,
      provider: { "@id": ORG_ID },
      areaServed: { "@type": "Country", name: "Albania" },
      url: `${pageUrl}#${id}`,
    },
  }));

  return (
    <>
      <JsonLd
        data={graph(
          webPageSchema({
            lang,
            path: PATH,
            name: s.metaTitle,
            description: s.metaDescription,
            crumbs: [{ name: t.nav.solutions, path: PATH }],
            extra: { mainEntity: { "@type": "ItemList", itemListElement: services } },
          }),
        )}
      />

      <PageHero lang={lang} title={s.title} lead={s.lead} crumbs={[{ name: t.nav.solutions, path: PATH }]} />

      <div className="container">
        {serviceIds.map((id, i) => {
          const svc = t.services[id];
          const product = serviceProduct[id];
          return (
            <section key={id} id={id} className={`service split${i % 2 ? " split--reverse" : ""}`} aria-labelledby={`${id}-title`}>
              <div>
                <h2 id={`${id}-title`}>{svc.title}</h2>
                <p className="lead">{svc.text}</p>
                <ul className="checklist">
                  {svc.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
                {product && svc.productCta && (
                  <Link href={p(`/projects/${product}`)} className="btn btn--secondary">
                    {svc.productCta} →
                  </Link>
                )}
              </div>
              <div className="media-icon">
                <Icon3D name={serviceIcons[id]} size={220} />
              </div>
            </section>
          );
        })}
      </div>

      <section className="section section--alt" aria-labelledby="industries-title">
        <div className="container">
          <SectionHead id="industries-title" title={s.industriesTitle} />
          <ul className="grid grid--4">
            {s.industries.map((ind, i) => (
              <li key={ind.title} className="card">
                <Icon3D name={industryIcons[i]} size={64} />
                <h3 className="card__title">{ind.title}</h3>
                <p className="muted">{ind.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand lang={lang} title={s.ctaTitle} text={s.ctaText} button={s.ctaButton} />
    </>
  );
}
