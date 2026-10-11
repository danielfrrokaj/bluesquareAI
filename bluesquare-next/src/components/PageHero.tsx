import Link from "next/link";
import { getDictionary } from "@/content";
import { localePath, type Locale } from "@/lib/i18n";

type Crumb = { name: string; path: string };

/** Navy header band for inner pages, with a visible breadcrumb trail. */
export function PageHero({
  lang,
  title,
  lead,
  crumbs,
  children,
}: {
  lang: Locale;
  title: string;
  lead?: string;
  crumbs: Crumb[];
  children?: React.ReactNode;
}) {
  const t = getDictionary(lang);
  const trail = [{ name: t.nav.home, path: "/" }, ...crumbs];
  return (
    <section className="page-hero">
      <div className="container page-hero__inner">
        <nav aria-label={t.common.breadcrumb}>
          <ol className="breadcrumbs">
            {trail.map((c, i) => (
              <li key={c.path}>
                {i < trail.length - 1 ? (
                  <Link href={localePath(lang, c.path)}>{c.name}</Link>
                ) : (
                  <span aria-current="page">{c.name}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
        {children}
      </div>
    </section>
  );
}
