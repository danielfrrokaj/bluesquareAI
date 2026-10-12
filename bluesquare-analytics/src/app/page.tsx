import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { projection } from "@/lib/finance-reports";
import { listSites } from "@/lib/sites";
import { siteTotals } from "@/lib/stats";
import { monthLabel, parsePeriod, today } from "@/lib/period";
import { salesStats } from "@/lib/sales";
import { listAdsWithStats, sumTotals } from "@/lib/ads";
import { money, num } from "@/lib/format";
import { Shell } from "@/components/Shell";

export const dynamic = "force-dynamic";

export default async function Overview() {
  const user = await requireAuth();
  const month = parsePeriod({ period: "month" });
  const [proj, sites, traffic, sales, ads] = await Promise.all([
    projection(), listSites(), siteTotals("7d"), salesStats(today()), listAdsWithStats(month.from, month.to),
  ]);
  const adTotals = sumTotals(ads);
  const net = proj.actual.income - proj.actual.expense;
  const visitors = Object.values(traffic).reduce((s, t) => s + t.visitors, 0);
  const views = Object.values(traffic).reduce((s, t) => s + t.views, 0);

  return (
    <Shell department="overview">
      <div className="pagehead">
        <div>
          <h1>Hello, {user.name.split(" ")[0]}</h1>
          <p className="muted">Everything at a glance.</p>
        </div>
      </div>

      <ul className="deptgrid">
        <li className="panel sitecard">
          <h2><Link href="/finance" className="stretched">Finance</Link></h2>
          <p className="muted">{monthLabel(proj.month)}</p>
          <dl className="sitecard__stats">
            <div><dt>Income</dt><dd>{money(proj.actual.income)}</dd></div>
            <div><dt>Expenses</dt><dd>{money(proj.actual.expense)}</dd></div>
            <div><dt>Net</dt><dd className={net < 0 ? "neg" : undefined}>{money(net)}</dd></div>
          </dl>
        </li>
        <li className="panel sitecard">
          <h2><Link href="/analytics" className="stretched">Analytics</Link></h2>
          <p className="muted">{sites.length} websites · last 7 days</p>
          <dl className="sitecard__stats">
            <div><dt>Visitors</dt><dd>{num(visitors)}</dd></div>
            <div><dt>Page views</dt><dd>{num(views)}</dd></div>
          </dl>
        </li>
        <li className="panel sitecard">
          <h2><Link href="/marketing/ads" className="stretched">Marketing &amp; Ads</Link></h2>
          <p className="muted">Meta Ads · {monthLabel(proj.month)}</p>
          <dl className="sitecard__stats">
            <div><dt>Ad spend</dt><dd>{money(adTotals.spend)}</dd></div>
            <div><dt>Active ads</dt><dd>{num(ads.filter((a) => a.status === "active").length)}</dd></div>
            <div><dt>Results</dt><dd>{num(adTotals.results)}</dd></div>
          </dl>
        </li>
        <li className="panel sitecard">
          <h2><Link href="/sales" className="stretched">Sales</Link></h2>
          <p className="muted">{sales.overdue ? `${num(sales.overdue)} follow-ups overdue` : "Leads and customers"}</p>
          <dl className="sitecard__stats">
            <div><dt>Open leads</dt><dd>{num(sales.open)}</dd></div>
            <div><dt>Due</dt><dd>{num(sales.due)}</dd></div>
            <div><dt>Customers</dt><dd>{num(sales.customers)}</dd></div>
          </dl>
        </li>
        <li className="panel sitecard sitecard--soon">
          <h2><Link href="/projects" className="stretched">Projects &amp; Tasks</Link></h2>
          <p className="muted">Coming soon</p>
        </li>
      </ul>
    </Shell>
  );
}
