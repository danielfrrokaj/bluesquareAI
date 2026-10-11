import Link from "next/link";
import { getDictionary } from "@/content";
import { localePath, type Locale } from "@/lib/i18n";
import { COMPANY } from "@/lib/site";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";
import { LangSwitch } from "./LangSwitch";
import { MenuToggle } from "./MenuToggle";
import { MailIcon, PhoneIcon, PinIcon } from "./icons";

export function Header({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const p = (path: string) => localePath(lang, path);
  const links = [
    { href: p("/solutions"), label: t.nav.solutions },
    { href: p("/projects"), label: t.nav.projects },
    { href: p("/about"), label: t.nav.about },
    { href: p("/careers"), label: t.nav.careers },
    { href: p("/contact"), label: t.nav.contact },
  ];

  return (
    <div className="site-top">
      <div className="topbar">
        <div className="container topbar__inner">
          <a href={COMPANY.mapsUrl} className="topbar__item topbar__address" target="_blank" rel="noopener">
            <PinIcon />
            {COMPANY.address.street}, {COMPANY.address.locality}
          </a>
          <div className="topbar__group">
            <a href={COMPANY.phoneHref} className="topbar__item">
              <PhoneIcon />
              {COMPANY.phone}
            </a>
            <a href={`mailto:${COMPANY.email}`} className="topbar__item topbar__email">
              <MailIcon />
              {COMPANY.email}
            </a>
            <LangSwitch lang={lang} label={t.nav.language} />
          </div>
        </div>
      </div>

      <header className="site-header" id="site-header">
        <div className="container site-header__inner">
          <Logo lang={lang} inverted />
          <nav className="nav" id="site-nav" aria-label={t.nav.primary}>
            <ul className="nav__list">
              {links.map((l) => (
                <li key={l.href}>
                  <NavLink href={l.href}>{l.label}</NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="site-header__actions">
            <Link href={p("/contact")} className="btn btn--accent btn--sm">
              {t.nav.cta}
            </Link>
            <MenuToggle openLabel={t.nav.menu} closeLabel={t.nav.close} />
          </div>
        </div>
      </header>
    </div>
  );
}
