import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getSite, listSites } from "@/lib/sites";
import { publicUrl, snippetFor } from "@/lib/public-url";
import {
  activity, browsers, countries, devices, FILTERS, hosts, parseFilters, parseRange, RANGES, referrers, summary, systems, topClicks,
  topPages, type FilterKey, type Filters,
} from "@/lib/stats";
import { countryName, duration, flag, num } from "@/lib/format";
import { removeSite, saveSite } from "@/app/actions";
import { Shell } from "@/components/Shell";
import { RangeTabs } from "@/components/RangeTabs";
import { BarChart } from "@/components/BarChart";
import { Breakdown } from "@/components/Breakdown";
import { CopyButton } from "@/components/CopyButton";
import { ActionForm } from "@/components/ActionForm";
import { Modal } from "@/components/Modal";
import { LogoField } from "@/components/LogoField";
import { siteLogoUrl } from "@/components/AccountMark";
import { analyticsNav } from "@/components/nav";
import s from "./report.module.css";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const site = await getSite((await params).id);
  return { title: site?.name ?? "Website" };
}

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  Desktop: <path d="M3 5h18v11H3zM8 20h8M12 16v4" />,
  Mobile: <path d="M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2" />,
  Tablet: <path d="M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2" />,
};

function Device({ name }: { name: string }) {
  const icon = DEVICE_ICONS[name];
  return (
    <span className={s.device}>
      {icon && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {icon}
        </svg>
      )}
      {name}
    </span>
  );
}

export default async function SitePage({ params, searchParams }: Props) {
  await requireAuth();
  const { id } = await params;
  const sp = await searchParams;
  const site = await getSite(id);
  if (!site) notFound();
  const range = parseRange(typeof sp.range === "string" ? sp.range : undefined);
  const filters = parseFilters(sp);
  const filterKeys = Object.keys(filters) as FilterKey[];

  const [sites, sum, act, pages, ctry, clicks, refs, dev, brw, os, hst, base] = await Promise.all([
    listSites(), summary(id, range, filters), activity(id, range, filters), topPages(id, range, 50, filters), countries(id, range, filters),
    topClicks(id, range, 50, filters), referrers(id, range, filters), devices(id, range, filters), browsers(id, range, filters),
    systems(id, range, filters), hosts(id, range, filters), publicUrl(),
  ]);
  const snippet = snippetFor(base, id);

  // Links keep the range and the other filters; clicking an applied filter removes it.
  const query = (f: Filters, r = range) => {
    const p = new URLSearchParams({ range: r });
    for (const k of Object.keys(FILTERS) as FilterKey[]) if (f[k]) p.set(k, f[k]!);
    return p.toString();
  };
  const href = (f: Filters) => `/sites/${id}?${query(f)}`;
  const toggle = (key: FilterKey, value: string) => href({ ...filters, [key]: filters[key] === value ? undefined : value });
  const keep = query(filters).replace(/^range=[^&]*&?/, "");
  const exportUrl = (type: string) => `/api/sites/${id}/export?${query(filters)}&type=${type}`;
  const rows = (key: FilterKey, data: { key: string; visitors: number }[], label: (k: string) => React.ReactNode = (k) => k) =>
    data.map((r) => ({ key: r.key, label: label(r.key), value: r.visitors, href: toggle(key, r.key), active: filters[key] === r.key }));
  const filterText = (key: FilterKey, value: string) => (key === "country" ? `${flag(value)} ${countryName(value)}` : value);

  const hasData = sum.views > 0 || filterKeys.length > 0;
  const showHosts = site.domains.length > 1 || hst.length > 1;

  return (
    <Shell department="analytics" subnav={analyticsNav(sites, id)}>
      <div className={s.report}>
        <div className={s.head}>
          <div className={s.title}>
            <span className={`${s.favicon}${site.logo_version !== null ? ` ${s.faviconImg}` : ""}`} aria-hidden="true">
              {site.logo_version !== null ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={siteLogoUrl(id, site.logo_version)!} alt="" />
              ) : (
                (site.name.trim()[0]?.toUpperCase() ?? "?")
              )}
            </span>
            <div>
              <h1>{site.name}</h1>
              <div className={s.meta}>
                {site.domains.map((d) => <span key={d} className={s.domain}>{d}</span>)}
                <span className={s.livepill}>{num(sum.live)} online now</span>
              </div>
            </div>
          </div>
          <RangeTabs base={`/sites/${id}`} current={range} keep={keep} />
        </div>

        {filterKeys.length > 0 && (
          <div className={s.filters} aria-label="Active filters">
            <span>Filtered by</span>
            {filterKeys.map((k) => (
              <Link key={k} href={href({ ...filters, [k]: undefined })} className={s.chip} scroll={false} title="Remove filter">
                <small>{FILTERS[k].label}</small> {filterText(k, filters[k]!)} <i aria-hidden="true">×</i>
              </Link>
            ))}
            <Link href={href({})} className={s.clear} scroll={false}>Clear all</Link>
          </div>
        )}

        {(sp.setup || !hasData) && (
          <section className="panel panel--note" id="snippet">
            <header className="panel__head">
              <h2>{hasData ? "Tracking code" : "Install the tracking code"}</h2>
            </header>
            <p>
              Paste this in the <code>&lt;head&gt;</code> of every page on <strong>{site.domains.join(", ")}</strong>. Data appears here within
              seconds of the first visit.
            </p>
            <div className="snippet">
              <code>{snippet}</code>
              <CopyButton text={snippet} />
            </div>
          </section>
        )}

        <ul className={s.kpis}>
          <li className={s.k1}><span>Visitors</span><strong>{num(sum.visitors)}</strong></li>
          <li className={s.k2}><span>Page views</span><strong>{num(sum.views)}</strong></li>
          <li className={s.k3}><span>Avg. time on page</span><strong>{duration(sum.avgSeconds)}</strong></li>
          <li className={s.k4}><span>Total time on site</span><strong>{duration(sum.totalSeconds)}</strong></li>
          <li className={s.k5}><span>Clicks</span><strong>{num(sum.clicks)}</strong></li>
        </ul>

        <section className="panel">
          <header className="panel__head">
            <h2>Activity · {RANGES[range].label}</h2>
            <span className="legend">
              <i className="legend__bar" /> Page views <i className="legend__line" /> Visitors
            </span>
          </header>
          <BarChart rows={act} hourly={range === "today"} />
        </section>

        <div className={s.grid2}>
          <section className="panel">
            <header className="panel__head">
              <h2>Pages</h2>
              <a href={exportUrl("pages")} className="btn btn--small">Export CSV</a>
            </header>
            {pages.length === 0 ? (
              <p className="empty">No page views in this period.</p>
            ) : (
              <div className="tablewrap">
                <table className="table">
                  <thead>
                    <tr><th>Page</th><th>Views</th><th>Visitors</th><th>Avg. time</th><th>Total time</th></tr>
                  </thead>
                  <tbody>
                    {pages.map((p) => (
                      <tr key={p.path} className={filters.page === p.path ? s.rowactive : undefined}>
                        <td className="table__path">
                          <Link href={toggle("page", p.path)} className={s.pagelink} scroll={false}
                            title={filters.page === p.path ? "Remove this filter" : "Filter the report by this page"}>
                            {p.path}
                          </Link>
                        </td>
                        <td>{num(p.views)}</td>
                        <td>{num(p.visitors)}</td>
                        <td>{duration(p.avgSeconds)}</td>
                        <td>{duration(p.totalSeconds)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <Breakdown title="Referrers" valueLabel="Visitors" share rows={rows("referrer", refs)} />
        </div>

        <div className={s.half}>
          <Breakdown
            title="Countries" valueLabel="Visitors" share
            rows={rows("country", ctry, (k) => <>{flag(k)} {countryName(k)}</>)}
          />
          <section className="panel">
            <header className="panel__head">
              <h2>Clicks</h2>
              <a href={exportUrl("clicks")} className="btn btn--small">Export CSV</a>
            </header>
            {clicks.length === 0 ? (
              <p className="empty">No clicks in this period.</p>
            ) : (
              <ul className="breakdown">
                {clicks.map((c) => (
                  <li key={`${c.label}|${c.href}`}>
                    <span className="breakdown__bar" style={{ width: `${Math.round((c.clicks / clicks[0].clicks) * 100)}%` }} aria-hidden="true" />
                    <span className="breakdown__label">
                      {c.label}
                      {c.href && <small>{c.href}</small>}
                    </span>
                    <span className="breakdown__value">{num(c.clicks)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className={s.grid3}>
          <Breakdown title="Devices" valueLabel="Visitors" share rows={rows("device", dev, (k) => <Device name={k} />)} />
          <Breakdown title="Browsers" valueLabel="Visitors" share rows={rows("browser", brw)} />
          <Breakdown title="Operating systems" valueLabel="Visitors" share rows={rows("os", os)} />
        </div>

        {showHosts && <Breakdown title="Domains" valueLabel="Visitors" share rows={rows("host", hst)} />}

        <section className="panel">
          <header className="panel__head">
            <h2>Activity report</h2>
            <span className="btnrow">
              <a href={exportUrl("activity")} className="btn btn--small">Activity CSV</a>
              <a href={exportUrl("countries")} className="btn btn--small">Countries CSV</a>
            </span>
          </header>
          <div className="tablewrap">
            <table className="table">
              <thead>
                <tr><th>{range === "today" ? "Hour" : "Day"}</th><th>Visitors</th><th>Page views</th><th>Clicks</th><th>Avg. time</th></tr>
              </thead>
              <tbody>
                {[...act].reverse().filter((r) => r.views > 0 || r.clicks > 0).map((r) => (
                  <tr key={r.bucket}>
                    <td>{r.bucket}</td>
                    <td>{num(r.visitors)}</td>
                    <td>{num(r.views)}</td>
                    <td>{num(r.clicks)}</td>
                    <td>{duration(r.avgSeconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel" id="setup">
          <header className="panel__head">
            <div>
              <h2>Settings</h2>
              <p className="muted panel__sub">Events are accepted from these domains and their subdomains.</p>
            </div>
            <Modal trigger="Edit website" title="Edit website" triggerClassName="btn btn--primary btn--small">
              <ActionForm action={saveSite} submit="Save" className="form">
                <input type="hidden" name="id" value={id} />
                <LogoField current={siteLogoUrl(id, site.logo_version)} name={site.name} />
                <label className="field"><span>Name</span><input name="name" defaultValue={site.name} required maxLength={80} /></label>
                <label className="field">
                  <span>Domains (one per line or comma-separated; the first is the main one)</span>
                  <textarea name="domains" rows={4} defaultValue={site.domains.join("\n")} required />
                </label>
              </ActionForm>
            </Modal>
          </header>
          <div className={s.meta}>
            {site.domains.map((d) => <span key={d} className={s.domain}>{d}</span>)}
          </div>
          <p className="muted">Tracking code (the same for every domain):</p>
          <div className="snippet">
            <code>{snippet}</code>
            <CopyButton text={snippet} />
          </div>
          <form action={removeSite} className="danger">
            <input type="hidden" name="id" value={id} />
            <label className="field">
              <span>Type DELETE to remove this website and all its data</span>
              <input name="confirm" autoComplete="off" aria-invalid={sp.error === "confirm" || undefined} />
            </label>
            <button className="btn btn--danger btn--small">Delete website</button>
          </form>
        </section>
      </div>
    </Shell>
  );
}
