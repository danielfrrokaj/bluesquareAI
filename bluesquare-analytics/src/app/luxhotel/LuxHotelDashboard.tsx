"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  dateLabel, hotelLocation, number, percentage, planLabel,
  registrationMonths, selectHotels, summarizeHotels, timeLabel,
  type ConnectionFilter, type HotelFilter, type HotelList, type HotelSort, type LuxRead,
} from "@/lib/luxhotel-data";
import { Icon, Status } from "./parts";
import s from "./luxhotel.module.css";

function Meter({ label, value, total }: { label: string; value: number; total: number }) {
  return <div className={s.meter}><div><span>{label}</span><strong>{number(value)} <small>/ {number(total)}</small></strong></div><div className={s.track}><span style={{ width: `${percentage(value, total)}%` }} /></div></div>;
}

export function LuxHotelDashboard({ initial }: { initial: LuxRead<HotelList> }) {
  const [report, setReport] = useState(initial);
  const [clock, setClock] = useState(() => Date.parse(initial.checkedAt));
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<HotelFilter>("all");
  const [connection, setConnection] = useState<ConnectionFilter>("all");
  const [sort, setSort] = useState<HotelSort>("newest");
  const pending = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const directory = useRef<HTMLElement>(null);

  const refresh = useCallback(async () => {
    if (pending.current) return;
    pending.current = true;
    setRefreshing(true);
    const request = new AbortController();
    controller.current = request;
    try {
      const response = await fetch("/api/luxhotel/hotels", { cache: "no-store", signal: AbortSignal.any([request.signal, AbortSignal.timeout(35_000)]) });
      if (response.status === 401) {
        setSessionExpired(true);
        setReport(previous => ({ ...previous, data: null, status: "error", message: "Your session has expired. Sign in again to continue monitoring.", retryAt: new Date(Date.now() + 60_000).toISOString() }));
        setAutoRefresh(false);
        return;
      }
      if (!response.ok) throw new Error("request_failed");
      setReport(await response.json());
      setSessionExpired(false);
    } catch {
      if (!request.signal.aborted) setReport(previous => ({ ...previous, status: previous.data ? "stale" : "error", message: "The dashboard could not refresh. Check your connection and try again.", retryAt: new Date(Date.now() + 60_000).toISOString() }));
    } finally {
      pending.current = false;
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setClock(Date.now());
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => { window.clearInterval(timer); controller.current?.abort(); };
  }, []);
  useEffect(() => {
    if (autoRefresh && !document.hidden && clock >= Date.parse(report.retryAt)) void refresh();
  }, [autoRefresh, clock, refresh, report.retryAt]);

  // Snapshot time keeps subscription warnings and chart periods consistent with the displayed data.
  const snapshot = report.data;
  const now = Date.parse(snapshot?.generated_at ?? report.checkedAt);
  const hotels = useMemo(() => snapshot?.hotels ?? [], [snapshot]);
  const totals = useMemo(() => summarizeHotels(hotels, now), [hotels, now]);
  const months = useMemo(() => registrationMonths(hotels, now), [hotels, now]);
  const visible = useMemo(() => selectHotels(hotels, { query, filter, connection, sort, now }), [hotels, query, filter, connection, sort, now]);
  const cooldown = Math.max(0, Math.ceil((Date.parse(report.retryAt) - clock) / 1000));
  const chartMax = Math.max(1, ...months.map(m => m.count));
  const filterTo = (value: HotelFilter) => { setFilter(value); setConnection("all"); setQuery(""); directory.current?.scrollIntoView({ behavior: "instant", block: "start" }); };
  const reset = () => { setQuery(""); setFilter("all"); setConnection("all"); setSort("newest"); };

  return <div className={s.dashboard}>
    <header className={s.header}>
      <div className={s.identity}>
        <div className={s.logo}><img src="/icons/luxhotel.png" width={96} height={67} alt="LuxHotel System logo" /></div>
        <div><h1>LuxHotel System</h1><p>Your property network, at a glance.</p></div>
      </div>
      <a className={s.external} href="https://luxhotelsystem.com" target="_blank" rel="noopener noreferrer">Open LuxHotel <Icon name="arrow" /></a>
    </header>

    <div className={s.syncbar}>
      <div className={s.syncInfo}><span className={`${s.connectionState} ${report.status !== "ready" ? s.connectionWarning : ""}`}><i />{refreshing ? "Refreshing" : report.status === "ready" ? "Connected" : report.status === "stale" ? "Saved snapshot" : "Connection unavailable"}</span><span>{snapshot ? `Updated ${timeLabel(snapshot.generated_at)}` : "Waiting for property data"}</span></div>
      <div className={s.syncActions}><label className={s.auto}><input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />Auto-refresh · 1 min</label><button type="button" className={s.refresh} onClick={() => void refresh()} disabled={refreshing || cooldown > 0} title={cooldown ? `Next refresh available in ${cooldown} seconds` : "Refresh properties"}><Icon name="refresh" />{refreshing ? "Refreshing…" : cooldown ? `Refresh in ${cooldown}s` : "Refresh"}</button></div>
    </div>

    {report.message && <div className={s.notice} role="alert"><Icon name="warning" /><div><strong>{report.status === "stale" ? "Showing the last successful snapshot" : "Property data is unavailable"}</strong><p>{report.message}</p>{sessionExpired && <a href="/login">Sign in</a>}</div></div>}

    {!snapshot ? <section className={s.empty}><Icon name="hotel" /><h2>Connect to your property network</h2><p>Properties and monitoring data will appear here when the LuxHotel connection is available.</p><button className={s.secondary} disabled={refreshing || cooldown > 0} onClick={() => void refresh()}>{cooldown ? `Try again in ${cooldown}s` : "Try again"}</button></section> : <>
      <section className={s.metrics} aria-label="Portfolio totals">
        <div><span><Icon name="hotel" />Properties</span><strong>{number(totals.total)}</strong><small>Across {number(totals.accounts)} business accounts</small></div>
        <div><span><Icon name="rooms" />Physical rooms</span><strong>{number(totals.rooms)}</strong><small>Configured across your portfolio</small></div>
        <div><span><Icon name="check" />Active subscriptions</span><strong>{number(totals.active)}<em>/ {number(totals.total)}</em></strong><small>{percentage(totals.active, totals.total)}% of properties · Excludes suspended</small></div>
      </section>

      <div className={s.insights}>
        <section className={s.growth} aria-labelledby="registration-title">
          <div className={s.sectionHead}><div><h2 id="registration-title">Growing your network</h2><p>Property registrations · Last 6 months</p></div><span className={s.period}>{months[0].label}–{months[5].label} {new Date(now).getUTCFullYear()}</span></div>
          <div className={s.growthBody}><div className={s.growthSummary}><strong>{number(months[5].count)}</strong><span>registered this month</span><p>{number(months.reduce((n, month) => n + month.count, 0))} registrations in the displayed period.</p></div>
            <div className={s.chart} role="img" aria-label={`Registrations by month: ${months.map(m => `${m.label} ${m.count}`).join(", ")}. Current month is incomplete.`}>
              {months.map((month, index) => <div key={month.key} className={s.chartColumn}><span>{month.count}</span><div className={s.barSpace}><div className={`${s.bar} ${index === 5 ? s.currentBar : ""}`} style={{ height: `${month.count / chartMax * 100}%`, minHeight: month.count ? 4 : 0 }} /></div><small>{month.label}</small></div>)}
            </div>
          </div>
          <div className={s.growthFoot}><span>Current month to date · UTC</span><button type="button" onClick={() => { reset(); directory.current?.scrollIntoView({ behavior: "instant" }); }}>View properties <Icon name="arrow" /></button></div>
        </section>

        <section className={s.connectivity} aria-label="Channel connections">
          <div className={s.connectionTotal}><strong>{number(totals.channels)}</strong><span>reported active<br />channel connections</span></div>
          <div className={s.connectionFoot}><button onClick={() => { setConnection("disconnected"); setFilter("all"); setQuery(""); directory.current?.scrollIntoView({ behavior: "instant" }); }}>{totals.total - totals.connected} disconnected <Icon name="arrow" /></button></div>
        </section>
      </div>

      <div className={s.workspace}>
        <section ref={directory} className={s.directory} aria-labelledby="properties-title">
          <div className={s.directoryHeading}><div><h2 id="properties-title">Properties <span>{number(totals.total)}</span></h2><p>Monitor subscriptions, inventory and connections.</p></div></div>
          <div className={s.filterTabs} aria-label="Filter properties by status">{([ ["all", "All properties"], ["attention", "Needs attention"], ["active", "Active"], ["trial", "Trial"], ["expired", "Expired"], ["none", "No subscription"] ] as [HotelFilter, string][]).map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}{value === "attention" && totals.attention > 0 && <span>{totals.attention}</span>}</button>)}</div>
          <div className={s.filters}><label className={s.search}><Icon name="search" /><input aria-label="Search properties" placeholder="Search properties, locations or owners…" value={query} onChange={e => setQuery(e.target.value)} /></label><select aria-label="Channel manager connection" value={connection} onChange={e => setConnection(e.target.value as ConnectionFilter)}><option value="all">All connections</option><option value="connected">Connected</option><option value="disconnected">Disconnected</option></select><select aria-label="Sort properties" value={sort} onChange={e => setSort(e.target.value as HotelSort)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name">Name A–Z</option><option value="rooms">Most rooms</option><option value="bookings">Most reservations</option></select></div>
          <div className={s.tableScroll}><table className={s.table}><thead><tr><th scope="col">Property</th><th scope="col">Rooms</th><th scope="col">Reservations</th><th scope="col">Channel manager</th><th scope="col">Subscription</th></tr></thead><tbody>
            {visible.map(hotel => <tr key={hotel.id}><td><Link href={`/luxhotel/${encodeURIComponent(hotel.id)}`} prefetch={false} className={s.property} aria-label={`View ${hotel.name}`}><span className={s.propertyMark}><Icon name="hotel" /></span><span><strong>{hotel.name}</strong><small>{hotelLocation(hotel)}</small></span><Icon name="arrow" /></Link><span className={s.registered}>Joined {dateLabel(hotel.registered_at)}</span></td><td className={s.numeric}><strong>{number(hotel.rooms.physical)}</strong><small>{number(hotel.rooms.room_types)} types</small></td><td className={s.numeric}><strong>{number(hotel.bookings_count)}</strong></td><td><span className={`${s.connectionPill} ${hotel.channel_manager_connected ? s.isConnected : ""}`}><i />{hotel.channel_manager_connected ? "Connected" : "Disconnected"}</span><small>{hotel.channels.length ? `${hotel.channels.filter(c => c.active).length} active channel${hotel.channels.filter(c => c.active).length === 1 ? "" : "s"}` : "No channels returned"}</small></td><td><Status hotel={hotel} /><small>{hotel.subscription.expires_at ? `Ends ${dateLabel(hotel.subscription.expires_at)}` : planLabel(hotel.subscription.plan)}</small></td></tr>)}
          </tbody></table></div>
          {visible.length === 0 && <div className={s.empty}><Icon name={hotels.length ? "search" : "hotel"} /><h3>{hotels.length ? "No matching properties" : "Your first property starts here"}</h3><p>{hotels.length ? "Try another search or clear the filters to see your full network." : "Registered LuxHotel properties will appear here automatically."}</p>{hotels.length > 0 && <button className={s.secondary} onClick={reset}>Clear filters</button>}</div>}
          <footer className={s.tableFoot}><span aria-live="polite">Showing {number(visible.length)} of {number(totals.total)} properties</span><span>Reservations include all statuses</span></footer>
        </section>

        <aside className={s.aside}>
          <section className={s.attention}><div className={s.sectionHead}><h2>Needs attention</h2><span className={s.attentionIcon}><Icon name="warning" /></span></div><strong className={s.attentionNumber}>{totals.attention}</strong><p>{totals.attention ? "Properties with subscription or setup items to review." : "No subscription or setup issues found in this snapshot."}</p><button type="button" className={s.attentionButton} onClick={() => filterTo("attention")}>Review properties <Icon name="arrow" /></button><small>Includes missing subscriptions, suspensions, upcoming renewals and incomplete setup.</small></section>
          <section className={s.adoption}><h2>Module adoption</h2><p>Enabled across {totals.total} properties</p><Meter label="Messages" value={totals.messages} total={totals.total} /><Meter label="Housekeeping" value={totals.housekeeping} total={totals.total} /><Meter label="Online check-in" value={totals.online_checkin} total={totals.total} /></section>
          <p className={s.dataNote}><Icon name="link" /><span>Channel lists can be temporarily unavailable even when the channel manager is connected.</span></p>
        </aside>
      </div>
      <footer className={s.pageFoot}><span>LuxHotel System · Property monitoring</span><span>Read-only data · Refreshes every minute while this tab is visible{!autoRefresh ? " (paused)" : ""}</span></footer>
    </>}
  </div>;
}
