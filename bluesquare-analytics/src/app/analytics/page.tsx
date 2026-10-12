import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { listSites } from "@/lib/sites";
import { analyticsNav } from "@/components/nav";
import { parseRange, siteTotals } from "@/lib/stats";
import { num } from "@/lib/format";
import { Shell } from "@/components/Shell";
import { RangeTabs } from "@/components/RangeTabs";
import { ActionForm } from "@/components/ActionForm";
import { Modal } from "@/components/Modal";
import { LogoField } from "@/components/LogoField";
import { LogoMark, siteLogoUrl } from "@/components/AccountMark";
import { addSite } from "@/app/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics" };

export default async function SitesPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  await requireAuth();
  const range = parseRange((await searchParams).range);
  const [sites, totals] = await Promise.all([listSites(), siteTotals(range)]);

  return (
    <Shell department="analytics" subnav={analyticsNav(sites)}>
      <div className="pagehead">
        <h1>Websites</h1>
        <div className="btnrow">
          <RangeTabs base="/analytics" current={range} />
          <Modal trigger="Add website" title="Add a website">
            <ActionForm action={addSite} submit="Add website" pending="Adding…">
              <LogoField />
              <label className="field">
                <span>Name</span>
                <input name="name" placeholder="Blue Square AI" required maxLength={80} />
              </label>
              <label className="field">
                <span>Domains</span>
                <input name="domains" placeholder="bluesquare.ai, bluesquare.al" required />
                <small className="muted">Several? Separate them with commas. Subdomains are included.</small>
              </label>
            </ActionForm>
          </Modal>
        </div>
      </div>

      {sites.length === 0 ? (
        <p className="empty empty--big">No websites yet. Use “Add website” to get a tracking code.</p>
      ) : (
        <ul className="sitegrid">
          {sites.map((s) => (
            <li key={s.id} className="panel sitecard">
              <h2 className="sitecard__title">
                <LogoMark src={siteLogoUrl(s.id, s.logo_version)} name={s.name} size={34} />
                <Link href={`/sites/${s.id}?range=${range}`} className="stretched">
                  {s.name}
                </Link>
              </h2>
              <p className="muted">{s.domains.length ? s.domains.join(" · ") : s.domain}</p>
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
    </Shell>
  );
}
