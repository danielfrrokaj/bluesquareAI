import Link from "next/link";
import { isAdmin, requireAuth } from "@/lib/auth";
import { getRates, listAccounts } from "@/lib/finance";
import { listAdsWithStats, listResults, metrics, OBJECTIVES, AD_STATUSES, AD_CATEGORY, sumTotals } from "@/lib/ads";
import { parsePeriod, today } from "@/lib/period";
import { money, num } from "@/lib/format";
import { Shell } from "@/components/Shell";
import { PeriodTabs } from "@/components/PeriodTabs";
import { marketingNav } from "@/components/nav";
import { AddResultsButton, ManageAd, NewAdButton, PlacementBadges, STATUS_CLASS, eur, ratio } from "./parts";

export const dynamic = "force-dynamic";
export const metadata = { title: "Meta Ads · Marketing & Ads" };

type Props = { searchParams: Promise<{ period?: string; from?: string; to?: string }> };

export default async function AdsPage({ searchParams }: Props) {
  const user = await requireAuth();
  const period = parsePeriod(await searchParams);
  const [ads, accounts, rates] = await Promise.all([listAdsWithStats(period.from, period.to), listAccounts(true), getRates()]);
  const results = await Promise.all(ads.map((a) => listResults(a.id)));
  const currencies = Object.keys(rates);
  const total = sumTotals(ads);
  const m = metrics(total);
  const day = today();

  return (
    <Shell department="marketing" subnav={marketingNav("ads")}>
      <div className="pagehead">
        <div>
          <h1>Meta Ads</h1>
          <p className="muted">
            Facebook &amp; Instagram ads, entered from Ads Manager. Spend is booked in Finance as{" "}
            <Link href="/finance/reports">{AD_CATEGORY}</Link> expenses.
          </p>
        </div>
        <NewAdButton accounts={accounts} currencies={currencies} />
      </div>

      <PeriodTabs base="/marketing/ads" current={period} />

      <ul className="kpis">
        <li><span>Amount spent</span><strong>{money(total.spend)}</strong><small>{period.label}</small></li>
        <li><span>Impressions</span><strong>{num(total.impressions)}</strong><small>Reach {num(total.reach)}</small></li>
        <li><span>Clicks</span><strong>{num(total.clicks)}</strong><small>CTR {ratio(m.ctr)}%</small></li>
        <li><span>Cost per click</span><strong>{eur(m.cpc)}</strong><small>CPM {eur(m.cpm)}</small></li>
        <li><span>Results</span><strong>{num(total.results)}</strong><small>{eur(m.costPerResult)} per result</small></li>
      </ul>

      <section className="panel">
        <header className="panel__head">
          <div>
            <h2>Ads</h2>
            <p className="muted panel__sub">
              {ads.length} {ads.length === 1 ? "ad" : "ads"} · {ads.filter((a) => a.status === "active").length} active · figures for {period.label}
            </p>
          </div>
        </header>
        {ads.length === 0 ? (
          <p className="empty">No ads yet. Use “New ad” to add one, then “Add results” with the numbers from Ads Manager.</p>
        ) : (
          <div className="tablewrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Ad</th><th>Status</th><th>Objective</th><th>Budget</th><th>Spent</th><th>Impressions</th><th>Clicks</th>
                  <th>CTR</th><th>CPC</th><th>Results</th><th>Cost / result</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((a, i) => {
                  const am = metrics(a);
                  const canEdit = isAdmin(user) || a.created_by === user.id;
                  return (
                    <tr key={a.id} id={`ad-${a.id}`}>
                      <td className="table__path">
                        <span className="adcell">
                          <b>{a.name}</b>
                          <small className="muted">
                            {a.campaign && <>{a.campaign} · </>}
                            {a.start_on ?? "no start date"}{a.end_on ? ` → ${a.end_on}` : ""}
                            {a.ads_manager_url && <> · <a href={a.ads_manager_url} target="_blank" rel="noopener noreferrer">Ads Manager ↗</a></>}
                          </small>
                          <PlacementBadges value={a.placements} />
                          <span className="btnrow adcell__actions">
                            <AddResultsButton ad={a} today={day} />
                            <ManageAd ad={a} results={results[i]} accounts={accounts} currencies={currencies} canEdit={canEdit} today={day} />
                          </span>
                        </span>
                      </td>
                      <td><span className={STATUS_CLASS[a.status]}>{AD_STATUSES[a.status]}</span></td>
                      <td>{OBJECTIVES[a.objective].label}</td>
                      <td>{a.budget === null ? "–" : <>{money(a.budget, a.currency)}<small className="muted"> / {a.budget_type === "daily" ? "day" : "total"}</small></>}</td>
                      <td>{a.entries ? money(a.spend) : "–"}</td>
                      <td>{num(a.impressions)}</td>
                      <td>{num(a.clicks)}</td>
                      <td>{am.ctr === null ? "–" : `${ratio(am.ctr)}%`}</td>
                      <td>{eur(am.cpc)}</td>
                      <td>{num(a.results)}</td>
                      <td>{eur(am.costPerResult)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Shell>
  );
}
