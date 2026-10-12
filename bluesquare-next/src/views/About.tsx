import Image from "next/image";
import type { Metadata } from "next";
import { getDictionary } from "@/content";
import type { IconName } from "@/content/data";
import type { Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { ORG_ID, graph, webPageSchema } from "@/lib/schema";
import { COMPANY } from "@/lib/site";
import { Icon3D } from "@/components/Icon3D";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { SectionHead } from "@/components/SectionHead";
import { CtaBand } from "@/components/CtaBand";

const PATH = "/about";
const valueIcons: IconName[] = ["security", "build", "team"];

export function aboutMetadata(lang: Locale): Metadata {
  const t = getDictionary(lang).about;
  return pageMetadata({ lang, path: PATH, title: t.metaTitle, description: t.metaDescription });
}

export function AboutPage({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const a = t.about;

  return (
    <>
      <JsonLd
        data={graph(
          webPageSchema({
            lang,
            path: PATH,
            type: "AboutPage",
            name: a.metaTitle,
            description: a.metaDescription,
            crumbs: [{ name: t.nav.about, path: PATH }],
            extra: { mainEntity: { "@id": ORG_ID } },
          }),
        )}
      />

      <PageHero lang={lang} title={a.title} lead={a.lead} crumbs={[{ name: t.nav.about, path: PATH }]} />

      <section className="section" aria-labelledby="story-title">
        <div className="container split">
          <div>
            <h2 id="story-title">{a.storyTitle}</h2>
            {a.story.map((para) => (
              <p key={para} className="lead">
                {para}
              </p>
            ))}
          </div>
          <ul className="grid">
            {a.values.map((v, i) => (
              <li key={v.title} className="card feature">
                <Icon3D name={valueIcons[i]} size={56} />
                <div>
                  <h3>{v.title}</h3>
                  <p>{v.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="team-title">
        <div className="container">
          <SectionHead id="team-title" title={a.teamTitle} />
          <ul className="grid grid--3">
            {COMPANY.team.map((member, i) => (
              <li key={member.slug} className="card person" id={member.slug}>
                {member.image ? (
                  <Image src={member.image} alt={member.name} width={120} height={150} className="person__photo" sizes="120px" />
                ) : (
                  <div className="person__initials" aria-hidden="true">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                )}
                <div>
                  <h3 className="card__title">{member.name}</h3>
                  <p className="person__role">{a.team[i].role}</p>
                  <p className="muted">{a.team[i].bio}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="infra-title">
        <div className="container split">
          <div>
            <h2 id="infra-title">{a.infraTitle}</h2>
            <p className="lead">{a.infraText}</p>
          </div>
          <div className="media-icon">
            <Icon3D name="cloud" size={220} />
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="details-title" id="company-details">
        <div className="container split">
          <div>
            <h2 id="details-title">{a.detailsTitle}</h2>
            <p className="lead">{a.detailsText}</p>
          </div>
          <dl className="facts">
            <dt>{t.common.companyName}</dt>
            <dd>{COMPANY.name}</dd>
            <dt>{t.common.nuis}</dt>
            <dd>{COMPANY.nuis}</dd>
            <dt>{t.common.founded}</dt>
            <dd>{COMPANY.foundingYear}</dd>
            <dt>{t.common.address}</dt>
            <dd>
              {COMPANY.address.street}, {COMPANY.address.locality}, {COMPANY.address.countryName[lang]}
            </dd>
            <dt>{t.common.email}</dt>
            <dd>
              <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
            </dd>
            <dt>{t.common.phone}</dt>
            <dd>
              <a href={COMPANY.phoneHref}>{COMPANY.phone}</a>
            </dd>
          </dl>
        </div>
      </section>

      <CtaBand lang={lang} />
    </>
  );
}
