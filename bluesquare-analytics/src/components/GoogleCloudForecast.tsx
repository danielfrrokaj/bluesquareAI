import { money } from "@/lib/format";
import { monthLabel, TZ, type Period } from "@/lib/period";
import type { CloudCostSummary } from "@/lib/google-cloud-costs";
import s from "./GoogleCloudForecast.module.css";

type Report = CloudCostSummary & { configurationError: boolean };
const usd = (value: number | null) => value === null ? "–" : money(value, "USD");
const timestamp = (value: string) => new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium", timeStyle: "short", timeZone: TZ(),
}).format(new Date(value));

export function GoogleCloudForecast({ report, period }: { report: Report; period: Period }) {
  const nextTotal = report.daily === null ? null : report.next.reduce((total, row) => total + row.expense!, 0);
  return (
    <section className={`panel ${s.panel}`} id="google-cloud-forecast" aria-labelledby="google-cloud-title">
      <header className={s.heading}>
        <div className={s.brand}>
          {/* Official Google G, hosted locally so the report makes no browser requests to Google. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/google.png" width={32} height={32} alt="" />
          <div>
            <h2 id="google-cloud-title">Google Cloud expenses &amp; forecast</h2>
            <p>Both billing accounts · Costs after credits</p>
          </div>
        </div>
        <span className={s.currency}>USD · separate from EUR totals</span>
      </header>

      {report.configurationError || report.accounts.length === 0 ? (
        <p className="notice">{report.configurationError
          ? "Google Cloud billing configuration needs attention."
          : "Connect the Google Cloud billing exports to see expenses and forecasts here."}</p>
      ) : (
        <>
          <div className={s.metrics}>
            <div><span>Exported expenses</span><strong>{usd(report.periodTotal)}</strong><small>{period.label}{report.hasData && report.periodPartial ? " · partial export" : ""}</small></div>
            <div><span>Expected this month</span><strong>{usd(report.expected)}</strong><small>{monthLabel(report.month)} · {report.monthTotal === null ? "Awaiting usage" : `${usd(report.monthTotal)} exported so far`}</small></div>
            <div><span>Next 3 months</span><strong>{usd(nextTotal)}</strong><small>{report.daily === null ? "Awaiting enough recent data" : `${usd(report.daily)} / day at the recent pace`}</small></div>
          </div>

          {!report.hasData && <p className={s.waiting}>
            {report.accounts.some(a => a.status === "error")
              ? "Google Cloud costs are unavailable. See the account status below."
              : "Waiting for the first billing export. Costs will appear automatically after Google delivers usage data."}
          </p>}
          {report.hasData && !report.complete && <p className={s.waiting}>Showing available costs. The combined forecast waits until both billing accounts have usable data.</p>}
          {report.complete && report.periodPartial && <p className={s.waiting}>The export does not yet cover the full selected period. The amount above includes only the usage received so far.</p>}
          {report.complete && report.expected === null && <p className={s.waiting}>
            {report.accounts.find(a => a.forecast.expected === null)?.forecast.reason}
          </p>}

          <ul className={s.accounts}>
            {report.accounts.map(account => (
              <li key={account.source.billingAccountId}>
                <div><strong>{account.source.name}</strong><span className={`${s.status} ${account.status === "error" ? s.error : ""}`}>{account.status === "ready" ? "Connected" : account.status === "waiting" ? "Awaiting export" : "Unavailable"}</span></div>
                <p>{account.status === "ready" ? `Usage through ${account.lastUsage}` : account.message}</p>
                <small>{account.lastExport ? `Last export ${timestamp(account.lastExport)}` : `Checked ${timestamp(account.checkedAt)}`}</small>
              </li>
            ))}
          </ul>

          {report.hasData && <div className={s.details}>
            <div>
              <h3>Cloud expense forecast</h3>
              <div className="tablewrap">
                <table className="table">
                  <thead><tr><th>Month</th><th>Expected expenses · USD</th></tr></thead>
                  <tbody>
                    <tr><td>{monthLabel(report.month)} <span className="tag">Expected</span></td><td>{usd(report.expected)}</td></tr>
                    {report.next.map(row => <tr key={row.month}><td>{monthLabel(row.month)}</td><td>{usd(row.expense)}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h3>Costs by project <small>{period.label}</small></h3>
              {report.projects.length === 0 ? <p className="empty">No exported usage in this period.</p> : <div className="tablewrap">
                <table className="table">
                  <thead><tr><th>Project</th><th>Usage cost</th><th>Credits</th><th>Net · USD</th></tr></thead>
                  <tbody>{report.projects.map(project => <tr key={project.id}>
                    <td>{project.name}<small>{project.account}</small></td>
                    <td>{usd(project.cost)}</td><td>{usd(project.credits)}</td><td><strong>{usd(project.total)}</strong></td>
                  </tr>)}</tbody>
                </table>
              </div>}
            </div>
          </div>}
          <p className="muted note">Google reports usage throughout the day; recent costs can change as credits and late usage arrive. Initial exports may take up to five days to catch up. Forecasts extend the last seven complete days&apos; net spending across the remaining days of each month. These USD estimates are separate from the EUR transaction reports above.</p>
        </>
      )}
    </section>
  );
}
