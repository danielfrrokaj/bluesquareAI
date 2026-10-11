import type { Metadata } from "next";
import { getDictionary } from "@/content";
import type { IconName } from "@/content/data";
import type { Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { graph, webPageSchema } from "@/lib/schema";
import { COMPANY } from "@/lib/site";
import { Icon3D } from "@/components/Icon3D";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { SectionHead } from "@/components/SectionHead";

const PATH = "/careers";
const lookIcons: IconName[] = ["discover", "support", "build"];

export function careersMetadata(lang: Locale): Metadata {
  const t = getDictionary(lang).careers;
  return pageMetadata({ lang, path: PATH, title: t.metaTitle, description: t.metaDescription });
}

export function CareersPage({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const c = t.careers;
  const mail = `mailto:${COMPANY.email}?subject=${encodeURIComponent(`${c.eyebrow}: CV`)}`;

  return (
    <>
      <JsonLd
        data={graph(
          webPageSchema({ lang, path: PATH, name: c.metaTitle, description: c.metaDescription, crumbs: [{ name: t.nav.careers, path: PATH }] }),
        )}
      />

      <PageHero lang={lang} title={c.title} lead={c.lead} crumbs={[{ name: t.nav.careers, path: PATH }]} />

      <section className="section">
        <div className="container">
          <div className="notice">
            <Icon3D name="team" size={96} />
            <div>
              <h2>{c.emptyTitle}</h2>
              <p>{c.emptyText}</p>
              <p className="muted">{c.applyText}</p>
              <a href={mail} className="btn btn--primary">
                {c.applyButton}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="look-title">
        <div className="container">
          <SectionHead id="look-title" title={c.lookTitle} />
          <ul className="grid grid--3">
            {c.look.map((item, i) => (
              <li key={item.title} className="card">
                <Icon3D name={lookIcons[i]} size={64} />
                <h3 className="card__title">{item.title}</h3>
                <p className="muted">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
