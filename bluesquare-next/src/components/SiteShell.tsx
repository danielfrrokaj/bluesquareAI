import { getDictionary } from "@/content";
import { htmlLang, localePath, type Locale } from "@/lib/i18n";
import { jakarta } from "@/lib/fonts";
import { graph, organizationSchema, websiteSchema } from "@/lib/schema";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { JsonLd } from "./JsonLd";
import { Reveal } from "./Reveal";
import { CookieBanner } from "./CookieBanner";
import { ChatWidget } from "./chat/ChatWidget";
import "@/app/globals.css";

// Blue Square Analytics (cookie-free), loaded on every page.
const ANALYTICS_URL = process.env.NEXT_PUBLIC_ANALYTICS_URL?.replace(/\/$/, "");
const ANALYTICS_SITE = process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID;

// Runs before first paint: enables the scroll-reveal styles, and turns them off
// again if the page's JavaScript has not started within 4 s (content never stays hidden).
const REVEAL_BOOT =
  "document.documentElement.classList.add('js');setTimeout(function(){if(!window.__reveal)document.documentElement.classList.remove('js')},4000)";

/** The <html> document shared by the English and Albanian root layouts. */
export function SiteShell({ lang, children }: { lang: Locale; children: React.ReactNode }) {
  const t = getDictionary(lang);
  return (
    <html lang={htmlLang[lang]} className={jakarta.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: REVEAL_BOOT }} />
        {ANALYTICS_URL && ANALYTICS_SITE && <script defer src={`${ANALYTICS_URL}/t.js`} data-site={ANALYTICS_SITE} />}
      </head>
      <body>
        <a href="#main" className="skip-link">
          {t.nav.skip}
        </a>
        <Header lang={lang} />
        <main id="main">{children}</main>
        <Footer lang={lang} />
        <Reveal />
        <CookieBanner labels={t.cookies} privacyHref={localePath(lang, "/privacy")} />
        <ChatWidget lang={lang} t={t.chat} />
        <JsonLd data={graph(organizationSchema(lang), websiteSchema())} />
      </body>
    </html>
  );
}
