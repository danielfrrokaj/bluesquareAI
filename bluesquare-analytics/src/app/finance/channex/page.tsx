import { Suspense } from "react";
import { isAdmin, requireAuth } from "@/lib/auth";
import { getChannexReport } from "@/lib/channex";
import { channelLabel } from "@/lib/luxhotel-data";
import { money } from "@/lib/format";
import { monthLabel, TZ } from "@/lib/period";
import { Shell } from "@/components/Shell";
import { financeNav } from "@/components/nav";
import { CategorySelect } from "./CategorySelect";
import s from "./channex.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Channex" };

const usd = (value: number) => money(value, "USD");
const when = (iso: string) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: TZ() }).format(new Date(iso));
const day = (iso: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(iso));
const firstOf = (month: string) => day(`${month}-01T00:00:00Z`);
const plural = (n: number, unit: string) => n === 1 ? unit : unit === "property" ? "properties" : `${unit}s`;

/** "Booking.com ×2, Airbnb" */
function channelList(channels: string[]) {
  const counts = new Map<string, number>();
  for (const ota of channels) counts.set(ota, (counts.get(ota) ?? 0) + 1);
  return [...counts].map(([ota, n]) => channelLabel(ota) + (n > 1 ? ` ×${n}` : "")).join(", ");
}

/** What Channex charges us, estimated from the LuxHotel properties (USD, excluding VAT). */
export default async function ChannexPage() {
  const user = await requireAuth();
  return (
    <Shell department="finance" subnav={financeNav("channex", isAdmin(user))}>
      <div className="pagehead">
        <div>
          <h1>Channex</h1>
          <p className="muted">WhiteLabel plan · estimated from the properties on LuxHotel System</p>
        </div>
      </div>
      {/* Once a day this also reads LuxHotel, which can take a few seconds. */}
      <Suspense fallback={<section className="panel"><p className="empty">Loading Channex costs…</p></section>}>
        <ChannexCosts admin={isAdmin(user)} />
      </Suspense>
    </Shell>
  );
}

async function ChannexCosts({ admin }: { admin: boolean }) {
  const r = await getChannexReport();
  const next = r.next;
  if (!next) {
    return (
      <section className="panel">
        <p className="notice">{!r.configured
          ? "LuxHotel isn't connected yet (LUXHOTEL_API_KEY), so there are no properties to price."
          : r.syncError && r.nextSyncAt ? `${r.syncError} The next attempt is after ${when(r.nextSyncAt)}.`
          : "Waiting for the first LuxHotel snapshot."}</p>
      </section>
    );
  }
  const unset = next.properties.filter(p => !p.categorySet).length;
  return (
    <>
      <section className="panel">
        <header className={s.heading}>
          <div className={s.brand}>
            {/* Channex's mark, hosted locally so the page makes no browser requests to Channex. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/channex.webp" width={36} height={36} alt="" />
            <div>
              <h2>Channex expenses</h2>
              <p>Platform fee plus every property with an active channel connection</p>
            </div>
          </div>
          <span className={s.currency}>USD excl. VAT · separate from EUR totals</span>
        </header>

        <div className={s.metrics}>
          <div>
            <span>{monthLabel(r.month)} invoice</span>
            <strong>{r.current ? usd(r.current.total) : "–"}</strong>
            <small>{r.current ? `Charged ${firstOf(r.month)} · from the ${day(r.current.takenAt)} snapshot` : "No snapshot for this month yet"}</small>
          </div>
          <div>
            <span>Next invoice</span>
            <strong>{usd(next.total)}</strong>
            <small>Charged {firstOf(next.month)} · if nothing changes before then</small>
          </div>
          <div>
            <span>Billed properties</span>
            <strong>{next.hotels + next.rentals}</strong>
            <small>{next.hotels} hotels · {next.rentals} rentals ({next.units} units) · {next.unbilled} not billed</small>
          </div>
        </div>

        <p className={s.sync}>
          LuxHotel data from {when(next.takenAt)}
          {r.nextSyncAt && <> · read once a day, next after {when(r.nextSyncAt)}</>}
        </p>
        {r.syncError && <p className={s.warning}>Last update failed: {r.syncError}</p>}
        {unset > 0 && (
          <p className="notice">
            {unset} {unset === 1 ? "property has" : "properties have"} no billing category yet and {unset === 1 ? "is" : "are"} counted as a hotel,
            Channex&apos;s default. Vacation rentals (apartments, villas, holiday homes…) are billed per unit instead,{" "}
            {admin ? "so set each one below to match its property type in Channex." : "so ask an admin to set each one to match its property type in Channex."}
          </p>
        )}
      </section>

      <div className={s.grid}>
        <section className="panel">
          <header className="panel__head">
            <h2>Next invoice · {firstOf(next.month)}</h2>
          </header>
          <div className="tablewrap">
            <table className="table">
              <thead><tr><th>Item</th><th>Quantity</th><th>Price</th><th>Amount</th></tr></thead>
              <tbody>
                {next.lines.filter(l => l.quantity > 0).map(l => (
                  <tr key={l.label}>
                    <td>{l.label}</td>
                    <td>{l.quantity} {plural(l.quantity, l.unit)}</td>
                    <td>{usd(l.rate)}</td>
                    <td>{usd(l.amount)}</td>
                  </tr>
                ))}
                <tr className={s.total}><td>Total</td><td /><td /><td>{usd(next.total)}</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <header className="panel__head">
            <h2>Invoices by month</h2>
            <span>Charged on the 1st, in advance</span>
          </header>
          <div className="tablewrap">
            <table className="table">
              <thead><tr><th>Month</th><th>Hotels</th><th>Rental units</th><th>Total · USD</th></tr></thead>
              <tbody>
                <tr>
                  <td>{monthLabel(next.month)} <span className="tag">Estimate</span></td>
                  <td>{next.hotels}</td><td>{next.units}</td><td>{usd(next.total)}</td>
                </tr>
                {r.history.map(h => (
                  <tr key={h.month}>
                    <td>{monthLabel(h.month)} <small className={s.basis}>from {day(h.takenAt)}</small></td>
                    <td>{h.hotels}</td><td>{h.units}</td><td>{usd(h.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="panel">
        <header className="panel__head">
          <h2>Properties</h2>
          <span>{next.properties.length} on LuxHotel · as of {day(next.takenAt)}</span>
        </header>
        <div className="tablewrap">
          <table className="table">
            <thead><tr><th>Property</th><th>Billed as</th><th>Rooms / units</th><th>Active connections</th><th>Chat &amp; Reviews</th><th>Monthly · USD</th></tr></thead>
            <tbody>
              {next.properties.map(p => (
                <tr key={p.id}>
                  <td className={s.name}>
                    {p.name}
                    {!p.billed && <span className="tag tag--muted" title="No active channel connection">Not billed</span>}
                  </td>
                  <td>
                    {admin
                      ? <CategorySelect key={p.categorySet ? p.category : ""} hotelId={p.id} name={p.name} value={p.categorySet ? p.category : null} />
                      : <>{p.category === "hotel" ? "Hotel" : "Vacation rental"}{!p.categorySet && <span className="tag tag--warn">Default</span>}</>}
                  </td>
                  <td>{p.units}</td>
                  <td>
                    {p.channels.length ? channelList(p.channels) : "–"}
                    {p.duplicates > 0 && <span className="tag tag--warn" title="$1 a month for each extra connection to the same OTA">{p.duplicates} duplicate</span>}
                  </td>
                  <td>{p.chat ? "Yes" : "–"}</td>
                  <td>{p.billed ? usd(p.cost) : "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted note">
          Prices from channex.io/pricing, excluding VAT. Channex charges on the 1st of each month, in advance, for properties with
          at least one active channel connection; properties added or removed during the month change the next invoice, with no
          pro rata or credit. Hotels are billed per property and vacation rentals per physical unit (rooms across all room types).
          Chat &amp; Reviews is counted for properties with LuxHotel&apos;s Messages module on. Volume discounts start at 500 hotels
          or 2,000 rental units. Not included: Stripe tokenisation ($0.02 per transaction), overage above 20 room types or 200 rate
          plans per hotel, and the first month&apos;s pro rata.
        </p>
      </section>
    </>
  );
}
