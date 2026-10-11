import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { listSites } from "@/lib/sites";
import { parseRange, siteTotals } from "@/lib/stats";
import { num } from "@/lib/format";
import { Shell } from "@/components/Shell";
import { RangeTabs } from "@/components/RangeTabs";
import { AddSiteForm } from "@/components/AddSiteForm";

export const dynamic = "force-dynamic";

export default async function SitesPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  await requireAuth();
  const range = parseRange((await searchParams).range);
  const [sites, totals] = await Promise.all([listSites(), siteTotals(range)]);

  return (
    <Shell sites={sites}>
      <div className="pagehead">
        <h1>Websites</h1>
        <RangeTabs base="/" current={range} />
      </div>

      {sites.length === 0 ? (
        <p className="empty empty--big">No websites yet. Add your first one below to get its tracking code.</p>
      ) : (
        <ul className="sitegrid">
          {sites.map((s) => (
            <li key={s.id} className="panel sitecard">
              <h2>
                <Link href={`/sites/${s.id}?range=${range}`} className="stretched">
                  {s.name}
                </Link>
              </h2>
              <p className="muted">{s.domain}</p>
              <dl className="sitecard__stats">
                <div>
                  <dt>Visitors</dt>
                  <dd>{num(totals[s.id]?.visitors ?? 0)}</dd>
                </div>
                <div>
                  <dt>Page views</dt>
                  <dd>{num(totals[s.id]?.views ?? 0)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}

      <section className="panel">
        <header className="panel__head">
          <h2>Add a website</h2>
        </header>
        <AddSiteForm />
      </section>
    </Shell>
  );
}
