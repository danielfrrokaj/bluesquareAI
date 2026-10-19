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
  // Founders first and larger, then the rest of the team, each with its role and bio in this language.
  const people = COMPANY.team.map((member, i) => ({ ...member, ...a.team[i] }));

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

      <section className="section" aria-labelledby="team-title">
        <div className="container">
          <SectionHead id="team-title" title={a.teamTitle} />
          <ul className="team__founders">
            {people.filter((p) => p.founder).map((p) => <Person key={p.slug} person={p} size={208} />)}
          </ul>
          <ul className="team__members">
            {people.filter((p) => !p.founder).map((p) => <Person key={p.slug} person={p} size={104} />)}
          </ul>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="story-title">
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

type TeamMember = { name: string; slug: string; image: string | null; linkedin: string | null; role: string; bio: string };

/** A square portrait (or initials) framed by the logo's two corner brackets, then name, role and bio. */
function Person({ person, size }: { person: TeamMember; size: number }) {
  return (
    <li className="person" id={person.slug}>
      <div className="person__frame">
        {person.image ? (
          <Image src={person.image} alt={person.name} width={size} height={size} sizes={`${size}px`} className="person__photo" />
        ) : (
          <span className="person__initials" aria-hidden="true">
            {person.name.split(" ").map((n) => n[0]).join("")}
          </span>
        )}
      </div>
      <div>
        <div className="person__name">
          <h3>{person.name}</h3>
          {person.linkedin && (
            <a href={person.linkedin} className="person__linkedin" target="_blank" rel="noopener noreferrer" aria-label={`${person.name} on LinkedIn`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
              </svg>
            </a>
          )}
        </div>
        <p className="person__role">{person.role}</p>
        <p className="person__bio">{person.bio}</p>
      </div>
    </li>
  );
}
