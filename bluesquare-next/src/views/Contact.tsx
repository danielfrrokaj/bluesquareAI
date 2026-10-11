import type { Metadata } from "next";
import { getDictionary } from "@/content";
import { serviceIds } from "@/content/data";
import type { Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { ORG_ID, graph, webPageSchema } from "@/lib/schema";
import { COMPANY } from "@/lib/site";
import { Icon3D } from "@/components/Icon3D";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";

const PATH = "/contact";
const { lat, lng } = COMPANY.geo;
const MAP_SRC = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.006}%2C${lat - 0.003}%2C${lng + 0.006}%2C${lat + 0.003}&layer=mapnik&marker=${lat}%2C${lng}`;

export function contactMetadata(lang: Locale): Metadata {
  const t = getDictionary(lang).contact;
  return pageMetadata({ lang, path: PATH, title: t.metaTitle, description: t.metaDescription });
}

export function ContactPage({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const c = t.contact;

  return (
    <>
      <JsonLd
        data={graph(
          webPageSchema({
            lang,
            path: PATH,
            type: "ContactPage",
            name: c.metaTitle,
            description: c.metaDescription,
            crumbs: [{ name: t.nav.contact, path: PATH }],
            extra: { mainEntity: { "@id": ORG_ID } },
          }),
        )}
      />

      <PageHero lang={lang} title={c.title} lead={c.lead} crumbs={[{ name: t.nav.contact, path: PATH }]} />

      <section className="section">
        <div className="container contact-grid">
          <div className="card">
            <h2>{c.formTitle}</h2>
            <p className="muted">{c.formText}</p>
            <ContactForm labels={c} topics={serviceIds.map((id) => t.services[id].title)} />
          </div>

          <div>
            <h2>{c.detailsTitle}</h2>
            <ul className="contact-list">
              <li>
                <Icon3D name="location" size={48} />
                <div>
                  <strong>{c.office}</strong>
                  <address>
                    {COMPANY.address.street}, {COMPANY.address.postalCode} {COMPANY.address.locality}, {COMPANY.address.countryName[lang]}
                  </address>
                  <a href={COMPANY.mapsUrl} target="_blank" rel="noopener">
                    {c.directions} ↗
                  </a>
                </div>
              </li>
              <li>
                <Icon3D name="support" size={48} />
                <div>
                  <strong>{t.common.email}</strong>
                  <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
                  <strong className="contact-list__gap">{t.common.phone}</strong>
                  <a href={COMPANY.phoneHref}>{COMPANY.phone}</a>
                </div>
              </li>
              <li>
                <Icon3D name="security" size={48} />
                <div>
                  <strong>{t.common.nuis}</strong>
                  {COMPANY.nuis}
                </div>
              </li>
            </ul>
            <iframe className="map" src={MAP_SRC} title={c.mapTitle} loading="lazy" referrerPolicy="no-referrer" />
          </div>
        </div>
      </section>
    </>
  );
}
