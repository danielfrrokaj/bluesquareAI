import Link from "next/link";
import type { Transaction } from "@/lib/finance";
import { money } from "@/lib/format";
import { today } from "@/lib/period";
import { AccountMark } from "./AccountMark";

const dayFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function dayLabel(date: string, now: string): string {
  if (date === now) return "Today";
  const y = new Date(`${now}T00:00:00Z`);
  y.setUTCDate(y.getUTCDate() - 1);
  if (date === y.toISOString().slice(0, 10)) return "Yesterday";
  return dayFmt.format(new Date(`${date}T00:00:00Z`));
}

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");

/** Transactions grouped by day, each row opening the transaction (as a modal from Finance pages). */
export function TransactionTable({ rows, highlight }: { rows: Transaction[]; highlight?: string }) {
  if (rows.length === 0) return <p className="empty">No transactions match.</p>;
  const now = today();
  const days: { date: string; rows: Transaction[]; net: number }[] = [];
  for (const t of rows) {
    let day = days.at(-1);
    if (day?.date !== t.occurred_on) days.push((day = { date: t.occurred_on, rows: [], net: 0 }));
    day.rows.push(t);
    // A transfer only moves money between accounts, so it leaves the day's net unchanged.
    if (t.status !== "cancelled") day.net += t.type === "income" ? t.amount : t.type === "expense" ? -t.amount : 0;
  }

  return (
    <div className="txlist">
      <div className="txlist__head" aria-hidden="true">
        <span>Transaction</span>
        <span>Category</span>
        <span>Account</span>
        <span>User</span>
        <span>Amount</span>
      </div>
      {days.map((d) => (
        <section key={d.date} className="txday">
          <h3 className="txday__head">
            <span>{dayLabel(d.date, now)}</span>
            <span className={d.net < 0 ? "neg" : "pos"}>
              {d.net < 0 ? "−" : "+"}
              {money(Math.abs(d.net))}
            </span>
          </h3>
          <ul>
            {d.rows.map((t) => {
              const income = t.type === "income";
              const transfer = t.type === "transfer";
              const who = t.user_name ?? (t.source === "bluebill" ? "BlueBill" : t.source === "meta_ads" ? "Meta Ads" : null);
              return (
                <li key={t.id} className={`txrow${t.id === highlight ? " is-new" : ""}`}>
                  <span className={`txrow__icon ${transfer ? "txrow__icon--move" : income ? "txrow__icon--in" : "txrow__icon--out"}`} aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      {transfer ? <path d="M4 8h15l-4-4M20 16H5l4 4" /> : income ? <path d="M17 7 7 17M7 8v9h9" /> : <path d="M7 17 17 7M8 7h9v9" />}
                    </svg>
                  </span>
                  <div className="txrow__main">
                    <Link href={`/finance/transactions/${t.id}`} className="txrow__title stretched" scroll={false}>
                      {t.description || "(no description)"}
                    </Link>
                    <small>
                      {t.status === "pending" && (
                        <span className="txrow__pending" title={`Still with ${t.user_name ?? "the person who recorded it"}; not in the balance until confirmed in the Register`}>
                          Pending
                        </span>
                      )}
                      {t.status === "cancelled" && <span className="txrow__cancelled" title="Cancelled: counts nowhere">Cancelled</span>}
                      {t.source === "bluebill" && <span className="txrow__fiscal">Fiscal</span>}
                      {t.source === "meta_ads" && <span className="txrow__fiscal">Meta Ads</span>}
                      {t.source === "recurring" && <span className="txrow__fiscal txrow__fiscal--repeat">Monthly</span>}
                      {transfer ? <span className="muted">Between virtual accounts</span> : t.counterparty ?? (t.source === "bluebill" ? null : <span className="muted">No client / supplier</span>)}
                    </small>
                  </div>
                  {transfer ? <span className="chip chip--move">Transfer</span> : <span className={`chip${t.category_name ? "" : " chip--empty"}`}>{t.category_name ?? "Uncategorised"}</span>}
                  <span className="txrow__account">
                    {transfer ? (
                      <>
                        {t.account_id && t.account_name && <AccountMark id={t.account_id} name={t.account_name} logo={t.account_logo} />}
                        <span>{t.account_name ?? "—"} → {t.to_account_name ?? "—"}</span>
                      </>
                    ) : t.account_id && t.account_name ? (
                      <>
                        <AccountMark id={t.account_id} name={t.account_name} logo={t.account_logo} />
                        <span>{t.account_name}</span>
                      </>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </span>
                  <span className="txrow__user">
                    {who ? (
                      <>
                        <i className={t.user_name ? undefined : "is-system"} aria-hidden="true">{t.user_name ? initials(t.user_name) : "B"}</i>
                        {who}
                      </>
                    ) : (
                      <span className="muted">–</span>
                    )}
                  </span>
                  <span className={`txrow__amount ${t.status === "cancelled" ? "txrow__amount--void" : transfer ? "txrow__amount--move" : income ? "pos" : "neg"}`}>
                    {transfer ? "" : income ? "+" : "−"}
                    {money(t.amount)}
                    {t.original_amount !== null && <small>{money(t.original_amount, t.currency)}</small>}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
