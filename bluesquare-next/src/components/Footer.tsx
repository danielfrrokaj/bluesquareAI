import Link from "next/link";
import { getDictionary } from "@/content";
import { productSlugs, serviceIds } from "@/content/data";
import { localePath, type Locale } from "@/lib/i18n";
import { COMPANY } from "@/lib/site";
import { Logo } from "./Logo";

export function Footer({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const p = (path: string) => localePath(lang, path);
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <Logo lang={lang} inverted />
            <p>{t.footer.tagline}</p>
            <address>
              {COMPANY.address.street}, {COMPANY.address.locality}, {COMPANY.address.countryName[lang]}
              <br />
              <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
              <br />
              <a href={COMPANY.phoneHref}>{COMPANY.phone}</a>
            </address>
          </div>

          <nav aria-label={t.footer.solutions}>
            <h2 className="site-footer__title">{t.footer.solutions}</h2>
            <ul>
              {serviceIds.map((id) => (
                <li key={id}>
                  <Link href={`${p("/solutions")}#${id}`}>{t.services[id].title}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t.footer.products}>
            <h2 className="site-footer__title">{t.footer.products}</h2>
            <ul>
              {productSlugs.map((slug) => (
                <li key={slug}>
                  <Link href={p(`/projects/${slug}`)}>{t.products[slug].name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t.footer.company}>
            <h2 className="site-footer__title">{t.footer.company}</h2>
            <ul>
              <li><Link href={p("/about")}>{t.nav.about}</Link></li>
              <li><Link href={p("/careers")}>{t.nav.careers}</Link></li>
              <li><Link href={p("/contact")}>{t.nav.contact}</Link></li>
              <li><Link href={p("/privacy")}>{t.footer.privacy}</Link></li>
            </ul>
          </nav>
        </div>

        <div className="site-footer__bottom">
          <p>
            © {year} {COMPANY.name}. {t.footer.rights}
          </p>
          <p>
            {t.footer.registered} · NUIS {COMPANY.nuis}
          </p>
        </div>
      </div>
    </footer>
  );
}
