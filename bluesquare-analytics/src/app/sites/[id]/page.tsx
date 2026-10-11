import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getSite, listSites } from "@/lib/sites";
import { publicUrl, snippetFor } from "@/lib/public-url";
import {
  activity, browsers, countries, devices, parseRange, RANGES, referrers, summary, systems, topClicks, topPages,
} from "@/lib/stats";
import { countryName, duration, flag, num } from "@/lib/format";
import { removeSite } from "@/app/actions";
import { Shell } from "@/components/Shell";
import { RangeTabs } from "@/components/RangeTabs";
import { BarChart } from "@/components/BarChart";
import { Breakdown } from "@/components/Breakdown";
import { CopyButton } from "@/components/CopyButton";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ range?: string; setup?: string; error?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const site = await getSite((await params).id);
  return { title: site?.name ?? "Website" };
}

export default async function SitePage({ params, searchParams }: Props) {
  await requireAuth();
  const { id } = await params;
  const sp = await searchParams;
  const site = await getSite(id);
  if (!site) notFound();
  const range = parseRange(sp.range);

  const [sites, sum, act, pages, ctry, clicks, refs, dev, brw, os, base] = await Promise.all([
    listSites(), summary(id, range), activity(id, range), topPages(id, range), countries(id, range),
    topClicks(id, range), referrers(id, range), devices(id, range), browsers(id, range), systems(id, range), publicUrl(),
  ]);
  const snippet = snippetFor(base, id);
  const exportUrl = (type: string) => `/api/sites/${id}/export?range=${range}&type=${type}`;
  const hasData = sum.views > 0;

  return (
    <Shell sites={sites} currentId={id}>
      <div className="pagehead">
        <div>
          <h1>{site.name}</h1>
          <p className="muted">
            {site.domain} · <span className="live">{num(sum.live)} online now</span>
          </p>
        </div>
        <RangeTabs base={`/sites/${id}`} current={range} />
      </div>

      {(sp.setup || !hasData) && (
        <section className="panel panel--note" id="snippet">
          <header className="panel__head">
            <h2>{hasData ? "Tracking code" : "Install the tracking code"}</h2>
          </header>
          <p>
            Paste this in the <code>&lt;head&gt;</code> of every page on <strong>{site.domain}</strong>. Data appears here within seconds of
            the first visit.
          </p>
          <div className="snippet">
            <code>{snippet}</code>
            <CopyButton text={snippet} />
          </div>
        </section>
      )}

      <ul className="kpis">
        <li><span>Visitors</span><strong>{num(sum.visitors)}</strong></li>
        <li><span>Page views</span><strong>{num(sum.views)}</strong></li>
        <li><span>Avg. time on page</span><strong>{duration(sum.avgSeconds)}</strong></li>
        <li><span>Total time on site</span><strong>{duration(sum.totalSeconds)}</strong></li>
        <li><span>Clicks</span><strong>{num(sum.clicks)}</strong></li>
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
                  <tr key={p.path}>
                    <td className="table__path">{p.path}</td>
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

      <div className="cols">
        <Breakdown
          title="Countries"
          valueLabel="Visitors"
          rows={ctry.map((c) => ({ key: c.key, label: <>{flag(c.key)} {countryName(c.key)}</>, value: c.visitors }))}
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

      <div className="cols cols--3">
        <Breakdown title="Referrers" valueLabel="Visitors" rows={refs.map((r) => ({ key: r.key, label: r.key, value: r.visitors }))} />
        <Breakdown title="Devices" valueLabel="Visitors" rows={dev.map((r) => ({ key: r.key, label: r.key, value: r.visitors }))} />
        <Breakdown title="Browsers" valueLabel="Visitors" rows={brw.map((r) => ({ key: r.key, label: r.key, value: r.visitors }))} />
      </div>

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
              {[...act].reverse().filter((r) => range !== "today" || r.views > 0 || r.clicks > 0).map((r) => (
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

      <div className="cols">
        <Breakdown title="Operating systems" valueLabel="Visitors" rows={os.map((r) => ({ key: r.key, label: r.key, value: r.visitors }))} />
        <section className="panel" id="setup">
          <header className="panel__head">
            <h2>Settings</h2>
          </header>
          <p className="muted">Tracking code for {site.domain}:</p>
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
