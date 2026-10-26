import Link from "next/link";
import { notFound } from "next/navigation";
import { isAdmin, requireAuth } from "@/lib/auth";
import { BillingError, billingMessage, getInvoice } from "@/lib/lux-billing";
import {
  fiscalLabel, invoiceStatusLabel, invoiceTone, methodLabel, money, paymentStatusLabel, paymentTone, periodLabel,
} from "@/lib/luxhotel-data";
import { Shell } from "@/components/Shell";
import { luxhotelNav } from "@/components/nav";
import { propertyNames, when } from "../../../feeds";
import { PaymentLinkButton } from "../../BillingForms";
import { Status } from "../../billing";
import s from "../../payments.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Invoice · LuxHotel" };

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const admin = isAdmin(user);
  const { id } = await params;

  let invoice;
  try {
    invoice = await getInvoice(id);
  } catch (err) {
    if (err instanceof BillingError && err.reason === "not_found") notFound();
    if (!(err instanceof BillingError)) throw err;
    return (
      <Shell department="luxhotel" subnav={luxhotelNav("payments")}>
        <p className={s.back}><Link href="/luxhotel/payments">← All payments</Link></p>
        <section className="panel"><p className="empty">{billingMessage(err)}</p></section>
      </Shell>
    );
  }

  const names = await propertyNames();
  const hotelName = names.byHotel.get(invoice.hotel_id) ?? invoice.hotel_id;
  const payments = invoice.payments ?? [];

  return (
    <Shell department="luxhotel" subnav={luxhotelNav("payments")}>
      <p className={s.back}><Link href="/luxhotel/payments">← All payments</Link></p>
      <section className="panel">
        <div className={s.detail}>
          <div className={s.detailHead}>
            <div>
              <h1>Invoice {invoice.number}</h1>
              <p className="muted">{hotelName} · {periodLabel(invoice.period)}</p>
            </div>
            <div className={s.detailActions}>
              <Status label={invoice.removed ? "Removed" : invoiceStatusLabel[invoice.status]} tone={invoice.removed ? "muted" : invoiceTone(invoice.status)} />
              {invoice.pdf_url && <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer" className="btn btn--small">PDF</a>}
              {invoice.payment_url && <a href={invoice.payment_url} target="_blank" rel="noopener noreferrer" className="btn btn--small">Pay link</a>}
              {admin && invoice.status === "sent" && !invoice.removed && <PaymentLinkButton invoiceId={invoice.id} hasLink={!!invoice.payment_url} />}
            </div>
          </div>

          <dl className={s.meta}>
            <div><dt>Billed to</dt><dd>{invoice.billed_to.legal_name ?? invoice.billed_to.hotel_name ?? hotelName}</dd></div>
            {invoice.billed_to.tax_id && <div><dt>Tax ID</dt><dd>{invoice.billed_to.tax_id}</dd></div>}
            {invoice.billed_to.email && <div><dt>Email</dt><dd>{invoice.billed_to.email}</dd></div>}
            <div><dt>Plan</dt><dd>{invoice.plan === "with_channel_manager" ? "With channel manager" : "Without channel manager"}</dd></div>
            <div><dt>Rooms billed</dt><dd>{invoice.room_count ?? "—"}</dd></div>
            <div><dt>Issued</dt><dd>{when(invoice.created_at)}</dd></div>
            {invoice.paid_at && <div><dt>Paid</dt><dd>{when(invoice.paid_at)}{invoice.payment_method ? ` · ${methodLabel[invoice.payment_method]}` : ""}</dd></div>}
            <div><dt>Fiscal</dt><dd>{fiscalLabel(invoice.fiscal_status)}</dd></div>
          </dl>

          <div className="tablewrap">
            <table className={`table ${s.billing}`}>
              <thead><tr><th>Line</th><th>Amount</th></tr></thead>
              <tbody>
                {invoice.line_items.map((line, i) => (
                  <tr key={`${line.key}-${i}`}>
                    <td style={{ textAlign: "left" }}>{line.label}{line.description && <small>{line.description}</small>}</td>
                    <td>{money(line.amount, invoice.currency)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {invoice.tax > 0 && <tr className={s.totals}><td style={{ textAlign: "left" }}>Subtotal</td><td>{money(invoice.subtotal, invoice.currency)}</td></tr>}
                {invoice.tax > 0 && <tr className={s.totals}><td style={{ textAlign: "left" }}>Tax</td><td>{money(invoice.tax, invoice.currency)}</td></tr>}
                <tr className={s.totals}><td style={{ textAlign: "left" }}>Total</td><td>{money(invoice.total, invoice.currency)}</td></tr>
              </tfoot>
            </table>
          </div>

          {invoice.notes && <p className="muted">{invoice.notes}</p>}

          <div>
            <h2>Payments</h2>
            {payments.length === 0 ? (
              <p className="empty">No payments recorded yet.</p>
            ) : (
              <div className="tablewrap">
                <table className={`table ${s.billing}`}>
                  <thead><tr><th>When</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td style={{ textAlign: "left" }}>{when(payment.created_at)}</td>
                        <td>{money(payment.amount, payment.currency)}</td>
                        <td>{methodLabel[payment.method]}</td>
                        <td>
                          <Status label={paymentStatusLabel[payment.status]} tone={paymentTone(payment.status)} />
                          {payment.failure_reason && <small>{payment.failure_reason}</small>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </Shell>
  );
}
