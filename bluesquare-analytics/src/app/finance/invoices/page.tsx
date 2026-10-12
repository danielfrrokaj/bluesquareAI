import Link from "next/link";
import { isAdmin, requireAuth } from "@/lib/auth";
import { getBlueBill, invoiceDocumentUrl, invoiceTotals, listInvoices } from "@/lib/bluebill";
import { parsePeriod } from "@/lib/period";
import { money, num } from "@/lib/format";
import { Shell } from "@/components/Shell";
import { financeNav } from "@/components/nav";
import { PeriodTabs } from "@/components/PeriodTabs";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fiscal invoices" };

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ period?: string; from?: string; to?: string; q?: string }> }) {
  const user = await requireAuth();
  const admin = isAdmin(user);
  const sp = await searchParams;
  const period = parsePeriod(sp);
  const q = sp.q?.trim().slice(0, 100) ?? "";
  const [settings, invoices, totals] = await Promise.all([getBlueBill(), listInvoices(period.from, period.to, q), invoiceTotals(period.from, period.to)]);

  return (
    <Shell department="finance" subnav={financeNav("invoices", admin)}>
      <div className="pagehead">
        <div>
          <h1>Fiscal invoices</h1>
          <p className="muted">
            Fiscalized invoices from BlueBill · {period.label} · {num(totals.count)} invoices · {money(totals.total)}
          </p>
        </div>
        <PeriodTabs base="/finance/invoices" current={period} keep={{ q: q || undefined }} />
      </div>

      {!settings.active && (
        <p className="notice">
          BlueBill sync is {settings.token ? "paused" : "not connected"}.{" "}
          {admin ? <Link href="/finance/settings#fiscalization">Set it up in Finance settings</Link> : "Ask an admin to connect it in Finance settings."}
        </p>
      )}

      <section className="panel">
        <header className="panel__head">
          <form action="/finance/invoices" className="searchrow">
            <input type="hidden" name="period" value={period.key} />
            {period.key === "custom" && <><input type="hidden" name="from" value={period.from} /><input type="hidden" name="to" value={period.to} /></>}
            <label className="field">
              <span className="sr-only">Search</span>
              <input name="q" defaultValue={q} placeholder="Number, buyer or NUIS" />
            </label>
            <button className="btn btn--small">Search</button>
          </form>
        </header>
        {invoices.length === 0 ? (
          <p className="empty">No fiscalized invoices in this period.</p>
        ) : (
          <div className="tablewrap">
            <table className="table">
              <thead>
                <tr><th>Number</th><th>Issued</th><th>Buyer</th><th>Type</th><th>NIVF / IIC</th><th>NSLF / FIC</th><th>Total</th><th></th></tr>
              </thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.id}>
                    <td className="table__path">
                      {i.transaction_id ? <Link href={`/finance/transactions/${i.transaction_id}`}>{i.number ?? i.id}</Link> : (i.number ?? i.id)}
                    </td>
                    <td>{i.issued_at}</td>
                    <td>{i.guest_name ?? "–"}{i.buyer_nuis && <small className="muted"> {i.buyer_nuis}</small>}</td>
                    <td>{i.type ?? "–"}</td>
                    <td><code className="hash" title={i.iic ?? ""}>{i.iic ?? "–"}</code></td>
                    <td><code className="hash" title={i.fic ?? ""}>{i.fic ?? "–"}</code></td>
                    <td>{money(i.total, i.currency || "ALL")}</td>
                    <td>
                      <a href={invoiceDocumentUrl(i.id)} target="_blank" rel="noopener noreferrer">Document ↗</a>
                      {i.verification_url && <> · <a href={i.verification_url} target="_blank" rel="noopener noreferrer">Verify</a></>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Shell>
  );
}
