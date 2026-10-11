import Link from "next/link";
import type { Metadata } from "next";
import { getDictionary } from "@/content";
import { productSlugs, products, serviceIcons, serviceIds, type IconName } from "@/content/data";
import { localePath, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { graph, webPageSchema } from "@/lib/schema";
import { Icon3D } from "@/components/Icon3D";
import { JsonLd } from "@/components/JsonLd";
import { SectionHead } from "@/components/SectionHead";
import { ProductCard } from "@/components/ProductCard";
import { CtaBand } from "@/components/CtaBand";

export function homeMetadata(lang: Locale): Metadata {
  const t = getDictionary(lang);
  return pageMetadata({ lang, path: "/", title: t.meta.homeTitle, description: t.meta.homeDescription, absoluteTitle: true });
}

const heroIcons: IconName[] = ["hotel", "mobile", "dashboard", "crm"];
const processIcons: IconName[] = ["discover", "design", "build", "support"];
const whyIcons: IconName[] = ["security", "cloud", "ai", "location"];
const stack = ["Google Cloud", "Google Workspace", "Gemini", "n8n", "OpenClaw", "WhatsApp"];

export function HomePage({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const h = t.home;
  const p = (path: string) => localePath(lang, path);
  const lux = t.products.luxhotel;
  const others = productSlugs.filter((s) => s !== "luxhotel");

  return (
    <>
      <JsonLd data={graph(webPageSchema({ lang, path: "/", name: t.meta.homeTitle, description: t.meta.homeDescription }))} />

      <section className="hero lines-bg">
        <div className="container hero__grid">
          <div>
            <h1>{h.title}</h1>
            <p className="lead">{h.lead}</p>
            <div className="btn-row">
              <Link href={p("/contact")} className="btn btn--light">
                {h.primary}
              </Link>
              <Link href={p("/projects")} className="btn btn--outline-light">
                {h.secondary}
              </Link>
            </div>
            <ul className="hero__trust">
              {h.trust.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <ul className="hero__tiles" aria-label={t.home.servicesEyebrow}>
            {h.heroTiles.map((label, i) => (
              <li key={label} className="hero__tile">
                <Icon3D name={heroIcons[i]} size={88} priority />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="container">
        <ul className="stats stats--overlap">
          {h.stats.map((s) => (
            <li key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <section className="section" aria-labelledby="services-title">
        <div className="container">
          <SectionHead id="services-title" title={h.servicesTitle} lead={h.servicesLead} />
          <ul className="grid grid--3">
            {serviceIds.map((id) => {
              const s = t.services[id];
              return (
                <li key={id} className="card card--link">
                  <div className="icon-tile">
                    <Icon3D name={serviceIcons[id]} size={52} />
                  </div>
                  <h3 className="card__title">
                    <Link href={`${p("/solutions")}#${id}`} className="stretched-link">
                      {s.title}
                    </Link>
                  </h3>
                  <p>{s.short}</p>
                  <span className="card__more" aria-hidden="true">
                    {t.common.learnMore} →
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="featured-title">
        <div className="container split">
          <div>
            <h2 id="featured-title">{lux.name}</h2>
            <p className="lead">{lux.tagline}</p>
            <ul className="checklist">
              {h.featuredPoints.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
            <div className="btn-row">
              <Link href={p("/projects/luxhotel")} className="btn btn--primary">
                {t.common.viewProject}
              </Link>
              <a href={products.luxhotel.url} className="btn btn--secondary" rel="noopener" target="_blank">
                luxhotelsystem.com ↗
              </a>
            </div>
          </div>
          <div className="media-icon">
            <Icon3D name={products.luxhotel.icon} size={220} />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="products-title">
        <div className="container">
          <SectionHead id="products-title" title={h.productsTitle} lead={h.productsLead} />
          <div className="grid grid--4">
            {others.map((slug) => (
              <ProductCard key={slug} lang={lang} slug={slug} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="process-title">
        <div className="container">
          <SectionHead id="process-title" title={h.processTitle} lead={h.processLead} />
          <ol className="grid grid--4 steps">
            {h.process.map((step, i) => (
              <li key={step.title} className="step">
                <span className="step__num">0{i + 1}</span>
                <Icon3D name={processIcons[i]} size={64} />
                <h3>{step.title}</h3>
                <p className="muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="why-title">
        <div className="container split">
          <div>
            <h2 id="why-title">{h.whyTitle}</h2>
            <p className="lead">{h.whyText}</p>
            <Link href={p("/about")} className="text-link">
              {h.whyLink} →
            </Link>
            <h3 className="stack-title">
              {h.stackTitle}
            </h3>
            <p className="muted">{stack.join(" · ")}</p>
          </div>
          <ul className="grid">
            {h.why.map((w, i) => (
              <li key={w.title} className="card feature">
                <Icon3D name={whyIcons[i]} size={56} />
                <div>
                  <h3>{w.title}</h3>
                  <p>{w.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand lang={lang} />
    </>
  );
}
