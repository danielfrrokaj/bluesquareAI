import Link from "next/link";
import { getDictionary } from "@/content";
import { localePath, type Locale } from "@/lib/i18n";
import { COMPANY } from "@/lib/site";

export function CtaBand({
  lang,
  title,
  text,
  button,
  showPhone = true,
}: {
  lang: Locale;
  title?: string;
  text?: string;
  button?: string;
  showPhone?: boolean;
}) {
  const t = getDictionary(lang);
  return (
    <section className="section section--tight">
      <div className="container">
        <div className="cta-band">
          <div>
            <h2>{title ?? t.cta.title}</h2>
            <p>{text ?? t.cta.text}</p>
          </div>
          <div className="cta-band__actions">
            <Link href={localePath(lang, "/contact")} className="btn btn--light">
              {button ?? t.cta.primary}
            </Link>
            {showPhone && (
              <a href={COMPANY.phoneHref} className="btn btn--outline-light">
                {COMPANY.phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
