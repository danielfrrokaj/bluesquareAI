import Link from "next/link";
import { isAdmin, requireAuth } from "@/lib/auth";
import { getRates } from "@/lib/finance";
import { BillingError, billingMessage, listAllInvoices } from "@/lib/lux-billing";
import { savedHotels } from "@/lib/lux-properties";
import {
  eur, fiscalLabel, invoiceStatusLabel, invoiceTone, methodLabel, money, periodLabel, summarizeBilling,
  type Invoice,
} from "@/lib/luxhotel-data";
import { Shell } from "@/components/Shell";
import { Modal } from "@/components/Modal";
import { luxhotelNav } from "@/components/nav";
import { propertyNames, when } from "../feeds";
import { BillingBoard } from "./Board";
import { IssueInvoiceForm, PaymentLinkButton } from "./BillingForms";
import { Status } from "./billing";
import s from "./payments.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payments · LuxHotel" };

type SP = { view?: string };

/** First and last day of the current month, as YYYY-MM-DD, for the issue form's defaults. */
function thisMonth(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireAuth();
  const admin = isAdmin(user);
  const view = (await searchParams).view === "invoices" ? "invoices" : "hotels";

  const [hotelsRead, names, rates] = await Promise.all([savedHotels(), propertyNames(), getRates()]);
  const hotels = hotelsRead.data?.hotels ?? [];
  const hotelName = (id: string) => names.byHotel.get(id) ?? id;
  const hotelOptions = [...names.byHotel].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  const allPerEur = typeof rates.ALL === "number" && rates.ALL > 0 ? rates.ALL : null;

  let invoices: Invoice[] = [];
  let error: string | null = null;
  try {
    invoices = await listAllInvoices();
  } catch (err) {
    if (!(err instanceof BillingError)) throw err;
    error = billingMessage(err);
  }

  const summary = summarizeBilling(hotels, invoices, Date.now(), allPerEur);
  const sortedInvoices = [...invoices].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));

  const tab = (key: "hotels" | "invoices", label: string, badge?: number) => (
    <Link href={`/luxhotel/payments?view=${key}`} className={`${s.segment}${view === key ? ` ${s.segmentOn}` : ""}`} aria-current={view === key ? "page" : undefined}>
      {label}{badge ? <b className={s.segBadge}>{badge}</b> : null}
    </Link>
  );

  return (
    <Shell department="luxhotel" subnav={luxhotelNav("payments")}>
      <div className="pagehead">
        <div>
          <h1>Payments</h1>
          <p className="muted">Subscriptions, invoices and payments across every LuxHotel property. {admin ? "Issue invoices and create POK payment links here." : "Issuing invoices is limited to administrators."}</p>
        </div>
        {admin && (
          <Modal trigger="+ Issue invoice" title="Issue a subscription invoice">
            <IssueInvoiceForm hotels={hotelOptions} defaultPeriod={thisMonth()} />
          </Modal>
        )}
      </div>

      <div className={s.kpis}>
        <div className={s.kpi}><span>Invoices</span><strong>{summary.kpis.invoices}</strong></div>
        <div className={`${s.kpi} ${s.kpiWarn}`}><span>Unpaid</span><strong>{summary.kpis.unpaid}</strong></div>
        <div className={s.kpi}><span>Paid</span><strong>{summary.kpis.paid}</strong></div>
        <div className={s.kpi}><span>Revenue (paid)</span><strong>{eur(summary.kpis.revenueEur)}</strong></div>
      </div>

      <div className={s.toolbar}>
        <div className={s.segments} role="tablist" aria-label="Billing view">
          {tab("hotels", "Hotels")}
          {tab("invoices", "Invoices", summary.kpis.invoices)}
        </div>
        {allPerEur && <span className={s.fx}>Rate: 1 EUR = {Math.round(allPerEur)} ALL</span>}
      </div>

      {error && <div className={s.notice} role="status"><p>{error}</p></div>}

      {view === "hotels" ? (
        <BillingBoard hotels={summary.hotels} admin={admin} />
      ) : (
        <section className="panel">
          {sortedInvoices.length === 0 && !error ? (
            <p className="empty">No invoices yet.</p>
          ) : (
            <div className="tablewrap">
              <table className={`table ${s.billing}`}>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Hotel</th>
                    <th>Period</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Fiscal</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {sortedInvoices.map((invoice) => (
                    <tr key={invoice.id} className={invoice.removed ? s.removed : undefined}>
                      <td className="table__path">
                        <Link href={`/luxhotel/payments/invoices/${encodeURIComponent(invoice.id)}`}>{invoice.number}</Link>
                        <small>{when(invoice.created_at)}</small>
                      </td>
                      <td>
                        {hotelName(invoice.hotel_id)}
                        {!invoice.includes_base_plan && <small>Add-ons only</small>}
                      </td>
                      <td>{periodLabel(invoice.period)}</td>
                      <td>{money(invoice.total, invoice.currency)}</td>
                      <td>
                        <Status label={invoice.removed ? "Removed" : invoiceStatusLabel[invoice.status]} tone={invoice.removed ? "muted" : invoiceTone(invoice.status)} />
                        {invoice.paid_at && <small>{invoice.payment_method ? methodLabel[invoice.payment_method] : "Paid"}</small>}
                      </td>
                      <td>{fiscalLabel(invoice.fiscal_status)}</td>
                      <td className={s.rowActions}>
                        {invoice.payment_url && (
                          <a href={invoice.payment_url} target="_blank" rel="noopener noreferrer" className="btn btn--small">Pay link</a>
                        )}
                        {admin && invoice.status === "sent" && !invoice.removed && (
                          <PaymentLinkButton invoiceId={invoice.id} hasLink={!!invoice.payment_url} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </Shell>
  );
}
