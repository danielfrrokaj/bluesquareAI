// Schema.org JSON-LD builders. Entities reference each other by @id so search
// engines can join the organization, website, pages and products into one graph.

import { COMPANY, SITE_URL } from "./site";
import { localePath, type Locale } from "./i18n";
import { products, type ProductSlug } from "@/content/data";
import { getDictionary } from "@/content";

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

type Thing = Record<string, unknown>;

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

export function organizationSchema(lang: Locale): Thing {
  const t = getDictionary(lang);
  const people = COMPANY.team.map((member, i) => ({
    "@type": "Person",
    "@id": `${SITE_URL}/#${member.slug}`,
    name: member.name,
    jobTitle: t.about.team[i].role,
    ...(member.image ? { image: absoluteUrl(member.image) } : {}),
    worksFor: { "@id": ORG_ID },
  }));

  return {
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORG_ID,
    name: COMPANY.name,
    alternateName: COMPANY.shortName,
    url: absoluteUrl("/"),
    logo: { "@type": "ImageObject", url: absoluteUrl("/logo-512.png"), width: 512, height: 512 },
    image: absoluteUrl("/og-image.png"),
    description: t.meta.homeDescription,
    email: COMPANY.email,
    telephone: COMPANY.phone,
    taxID: COMPANY.nuis,
    foundingDate: COMPANY.foundingYear,
    foundingLocation: { "@type": "Place", name: "Tirana, Albania" },
    founder: people.filter((_, i) => COMPANY.team[i].founder),
    employee: people,
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.address.street,
      addressLocality: COMPANY.address.locality,
      postalCode: COMPANY.address.postalCode,
      addressCountry: COMPANY.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: COMPANY.geo.lat, longitude: COMPANY.geo.lng },
    hasMap: COMPANY.mapsUrl,
    areaServed: [
      { "@type": "Country", name: "Albania" },
      { "@type": "Place", name: "Balkans" },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: COMPANY.email,
      telephone: COMPANY.phone,
      availableLanguage: ["en", "sq"],
      areaServed: "AL",
    },
    knowsAbout: [
      "Hotel management software",
      "Channel manager",
      "Mobile app development",
      "Business dashboards",
      "CRM development",
      "Artificial intelligence",
      "Workflow automation",
      "Website development",
    ],
    knowsLanguage: ["en", "sq"],
  };
}

export function websiteSchema(): Thing {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: absoluteUrl("/"),
    name: COMPANY.name,
    inLanguage: ["en", "sq"],
    publisher: { "@id": ORG_ID },
  };
}

type Crumb = { name: string; path: string };

/** A WebPage (or subtype) with its breadcrumb trail. `crumbs` excludes Home. */
export function webPageSchema(opts: {
  lang: Locale;
  path: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "ItemPage";
  name: string;
  description: string;
  crumbs?: Crumb[];
  extra?: Thing;
}): Thing[] {
  const { lang, path, type = "WebPage", name, description, crumbs = [], extra = {} } = opts;
  const t = getDictionary(lang);
  const url = absoluteUrl(localePath(lang, path));
  const trail = [{ name: t.nav.home, path: "/" }, ...crumbs];

  const page: Thing = {
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: lang,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    ...extra,
  };

  if (crumbs.length === 0) return [page];

  page.breadcrumb = { "@id": `${url}#breadcrumb` };
  return [
    page,
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: trail.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: absoluteUrl(localePath(lang, c.path)),
      })),
    },
  ];
}

export function productSchema(lang: Locale, slug: ProductSlug): Thing {
  const facts = products[slug];
  const copy = getDictionary(lang).products[slug];
  const url = absoluteUrl(localePath(lang, `/projects/${slug}`));
  return {
    "@type": facts.schemaType,
    "@id": `${absoluteUrl(`/projects/${slug}`)}#software`,
    name: copy.name,
    description: copy.summary,
    url,
    applicationCategory: facts.applicationCategory,
    operatingSystem: facts.operatingSystem,
    inLanguage: ["sq", "en"],
    image: absoluteUrl(`/icons/${facts.icon}.png`),
    ...(facts.url ? { sameAs: facts.url } : {}),
    creator: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    ...(facts.offer
      ? {
          offers: {
            "@type": "Offer",
            price: facts.offer.price,
            priceCurrency: facts.offer.currency,
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: facts.offer.price,
              priceCurrency: facts.offer.currency,
              unitText: facts.offer.unitText,
            },
            seller: { "@id": ORG_ID },
          },
        }
      : {}),
  };
}

export function graph(...nodes: (Thing | Thing[])[]): Thing {
  return { "@context": "https://schema.org", "@graph": nodes.flat() };
}
