import Link from "next/link";
import { isAdmin, requireFinanceTab } from "@/lib/auth";
import { bookRecurring, listRecentlyReviewed, listTransactions, type Transaction } from "@/lib/finance";
import { money, num } from "@/lib/format";
import { TZ } from "@/lib/period";
import { Shell } from "@/components/Shell";
import { financeNav } from "@/components/nav";
import { StatCard } from "@/components/FinanceCards";
import { cancel, confirm, reopen } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Register" };

const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const when = (iso: string) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: TZ() }).format(new Date(iso));
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";

type Holder = { id: string; name: string; rows: Transaction[]; held: number; paid: number; net: number };

/**
 * Finance → Register (Arka): transactions still pending, with the money still with the person they belong to. Pending
 * income is money they hold for the company; a pending expense is money they paid themselves. Admins confirm a transaction
 * once the money is handed over (or paid back), and it then counts in its account's balance, or cancel it, and it counts
 * nowhere. Members see only their own.
 */
export default async function RegisterPage() {
  const user = await requireFinanceTab("register");
  const admin = isAdmin(user);
  await bookRecurring();
  const [pending, recent] = await Promise.all([
    listTransactions({ status: "pending", ...(admin ? {} : { userId: user.id }) }, 5000),
    listRecentlyReviewed(15, admin ? undefined : user.id),
  ]);

  const byPerson = new Map<string, Holder>();
  for (const t of pending) {
    if (t.type === "transfer") continue;
    const id = t.user_id ?? "";
    const h = byPerson.get(id) ?? { id, name: t.user_name ?? "No person", rows: [], held: 0, paid: 0, net: 0 };
    h.rows.push(t);
    if (t.type === "income") h.held += t.amount;
    else h.paid += t.amount;
    h.net = h.held - h.paid;
    byPerson.set(id, h);
  }
  const holders = [...byPerson.values()].sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  const held = holders.reduce((s, h) => s + h.held, 0);
  const paid = holders.reduce((s, h) => s + h.paid, 0);
  const count = holders.reduce((s, h) => s + h.rows.length, 0);
  const countOf = (type: Transaction["type"]) => holders.reduce((s, h) => s + h.rows.filter((t) => t.type === type).length, 0);

  return (
    <Shell department="finance" subnav={financeNav("register", user)}>
      <div className="pagehead">
        <div>
          <h1>Register</h1>
          <p className="muted">
            {admin
              ? "Pending transactions, with the money still with the person who recorded them. Confirm one once the money is handed over and it counts in the account's balance; cancel it and it counts nowhere."
              : "Your pending transactions: money that is still with you. An admin confirms them once you hand it over."}
          </p>
        </div>
      </div>

      <ul className="fstats">
        <StatCard
          tone="green" label={admin ? "Pending income" : "You hold"} value={money(held)}
          caption={`${num(countOf("income"))} pending income`}
          info="Income taken from clients that hasn't been handed over and confirmed yet."
        />
        <StatCard
          tone="red" label={admin ? "Pending expenses" : "You paid"} value={money(paid)}
          caption={`${num(countOf("expense"))} pending expenses`}
          info="Costs people paid with their own money, to be paid back and confirmed."
        />
        <StatCard
          tone={held - paid < 0 ? "red" : "navy"} label={admin ? "Net pending" : "Net to hand over"} value={money(held - paid)}
          caption={count ? `${num(count)} pending · ${num(holders.length)} ${holders.length === 1 ? "person" : "people"}` : "Nothing pending"}
          info="Pending income minus pending expenses. Not in any account's balance until confirmed."
        />
      </ul>

      {holders.length === 0 && (
        <section className="panel">
          <p className="empty">{admin ? "Nothing pending: every transaction has been confirmed or cancelled." : "You have no pending transactions."}</p>
        </section>
      )}

      {holders.map((h) => (
        <section key={h.id} className="panel register">
          <header className="register__head">
            <span className="register__avatar" aria-hidden="true">{initials(h.name)}</span>
            <div className="register__who">
              <h2>{h.name}</h2>
              <p className="muted">
                {num(h.rows.length)} pending{h.held ? ` · holds ${money(h.held)}` : ""}{h.paid ? ` · paid ${money(h.paid)}` : ""}
              </p>
            </div>
            <strong className={`register__net ${h.net < 0 ? "neg" : "pos"}`}>
              {h.net >= 0 ? `Hands over ${money(h.net)}` : `Gets back ${money(-h.net)}`}
            </strong>
            {admin && (
              <form action={confirm}>
                {h.rows.map((t) => <input key={t.id} type="hidden" name="id" value={t.id} />)}
                <button className="btn btn--small btn--primary">Confirm all{h.rows.length > 1 ? ` (${h.rows.length})` : ""}</button>
              </form>
            )}
          </header>
          <div className="tablewrap">
            <table className="table table--register">
              <thead>
                <tr><th>Date</th><th>Transaction</th><th>Account</th><th>Amount</th>{admin && <th><span className="sr-only">Confirm or cancel</span></th>}</tr>
              </thead>
              <tbody>
                {h.rows.map((t) => (
                  <tr key={t.id}>
                    <td>{day.format(new Date(`${t.occurred_on}T00:00:00Z`))}</td>
                    <td>
                      <Link href={`/finance/transactions/${t.id}`} scroll={false}>{t.description || "(no description)"}</Link>
                      <small>{t.category_name ?? "Uncategorised"}{t.counterparty ? ` · ${t.counterparty}` : ""}</small>
                    </td>
                    <td>{t.account_name ?? <span className="muted">No account</span>}</td>
                    <td className={t.type === "income" ? "pos" : "neg"}>
                      {t.type === "income" ? "+" : "−"}{money(t.amount)}
                    </td>
                    {admin && (
                      <td>
                        <span className="register__actions">
                          <form action={confirm}>
                            <input type="hidden" name="id" value={t.id} />
                            <button className="btn btn--small">Confirm</button>
                          </form>
                          <form action={cancel}>
                            <input type="hidden" name="id" value={t.id} />
                            <button className="btn btn--small btn--danger" title="It counts nowhere, but stays listed as cancelled">Cancel</button>
                          </form>
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {recent.length > 0 && (
        <section className="panel">
          <header className="panel__head">
            <h2>Recently reviewed</h2>
            <span className="muted">Confirmed ones are in the account balances; cancelled ones count nowhere</span>
          </header>
          <div className="tablewrap">
            <table className="table table--register">
              <thead>
                <tr><th>Reviewed</th><th>Transaction</th><th>Person</th><th>Amount</th><th>Status</th>{admin && <th><span className="sr-only">Undo</span></th>}</tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id}>
                    <td>{when(t.reviewed_at!)}</td>
                    <td>
                      <Link href={`/finance/transactions/${t.id}`} scroll={false}>{t.description || "(no description)"}</Link>
                      <small>{t.account_name ?? "No account"}</small>
                    </td>
                    <td>{t.user_name ?? <span className="muted">No person</span>}</td>
                    <td className={t.status === "cancelled" ? "muted register__void" : t.type === "income" ? "pos" : "neg"}>
                      {t.type === "income" ? "+" : "−"}{money(t.amount)}
                    </td>
                    <td>
                      <span className={`status status--${t.status}`}>{t.status === "cancelled" ? "Cancelled" : "Confirmed"}</span>
                      {t.reviewed_by_name && <small>by {t.reviewed_by_name}</small>}
                    </td>
                    {admin && (
                      <td>
                        <form action={reopen}>
                          <input type="hidden" name="id" value={t.id} />
                          <button className="btn btn--small" title="Back to pending, waiting in the Register again">Undo</button>
                        </form>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </Shell>
  );
}
