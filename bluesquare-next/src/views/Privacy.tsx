import type { Metadata } from "next";
import { getDictionary } from "@/content";
import type { Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { graph, webPageSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";

const PATH = "/privacy";

export function privacyMetadata(lang: Locale): Metadata {
  const t = getDictionary(lang).privacy;
  return pageMetadata({ lang, path: PATH, title: t.metaTitle, description: t.metaDescription });
}

export function PrivacyPage({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const pr = t.privacy;
  return (
    <>
      <JsonLd
        data={graph(webPageSchema({ lang, path: PATH, name: pr.metaTitle, description: pr.metaDescription, crumbs: [{ name: pr.title, path: PATH }] }))}
      />
      <PageHero lang={lang} title={pr.title} lead={pr.updated} crumbs={[{ name: pr.title, path: PATH }]} />
      <section className="section">
        <div className="container prose">
          {pr.sections.map((s) => (
            <section key={s.title}>
              <h2>{s.title}</h2>
              <p>{s.text}</p>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
