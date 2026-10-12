import Link from "next/link";
import { isAdmin, requireAuth } from "@/lib/auth";
import {
  accountReport, categoryReport, expenseOutlook, monthlyTotals, projection, unassignedAccountTotals, userReport, type CategoryReport,
} from "@/lib/finance-reports";
import { monthLabel, monthOf, parsePeriod } from "@/lib/period";
import { change, money, num, pct } from "@/lib/format";
import { Shell } from "@/components/Shell";
import { financeNav } from "@/components/nav";
import { PeriodTabs } from "@/components/PeriodTabs";
import { MoneyChart } from "@/components/MoneyChart";
import { AccountMark } from "@/components/AccountMark";
import { GoogleCloudForecast } from "@/components/GoogleCloudForecast";
import { getGoogleCloudReport } from "@/lib/google-cloud-billing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Finance reports" };

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ period?: string; from?: string; to?: string }> }) {
  const user = await requireAuth();
  const period = parsePeriod(await searchParams);
  const [proj, outlook, accounts, unassigned, expenses, income, people, months, cloud] = await Promise.all([
    projection(), expenseOutlook(), accountReport(period), unassignedAccountTotals(period), categoryReport("expense", period),
    categoryReport("income", period), userReport(period), monthlyTotals(monthOf(period.from), monthOf(period.to)),
    getGoogleCloudReport(period),
  ]);
  const totalIncome = income.reduce((s, c) => s + c.total, 0);
  const totalExpense = expenses.reduce((s, c) => s + c.total, 0);
  const prevIncome = income.reduce((s, c) => s + c.previous, 0);
  const prevExpense = expenses.reduce((s, c) => s + c.previous, 0);
  const pNet = proj.projected.income !== null && proj.projected.expense !== null ? proj.projected.income - proj.projected.expense : null;

  return (
    <Shell department="finance" subnav={financeNav("reports", isAdmin(user))}>
      <div className="pagehead">
        <div>
          <h1>Reports &amp; forecast</h1>
          <p className="muted">{period.label}</p>
        </div>
        <PeriodTabs base="/finance/reports" current={period} />
      </div>

      <ul className="kpis kpis--4">
        <li className="kpi--income">
          <span>Income</span>
          <strong>{money(totalIncome)}</strong>
          <Delta now={totalIncome} before={prevIncome} />
        </li>
        <li className="kpi--expense">
          <span>Expenses</span>
          <strong>{money(totalExpense)}</strong>
          <Delta now={totalExpense} before={prevExpense} upIsBad />
        </li>
        <li className={totalIncome - totalExpense < 0 ? "kpi--loss" : "kpi--profit"}>
          <span>Net result</span>
          <strong className={totalIncome - totalExpense < 0 ? "neg" : undefined}>{money(totalIncome - totalExpense)}</strong>
          <Delta now={totalIncome - totalExpense} before={prevIncome - prevExpense} />
        </li>
        <li className="kpi--neutral">
          <span>Margin</span>
          <strong>{totalIncome ? `${Math.round(((totalIncome - totalExpense) / totalIncome) * 100)}%` : "–"}</strong>
          <small>of income kept</small>
        </li>
      </ul>

      {/* ---------- Forecast ---------- */}
      <section className="panel" id="forecast">
        <header className="panel__head">
          <h2>Forecast</h2>
          <span>Based on the last 12 complete months</span>
        </header>
        {!proj.enoughHistory && proj.projected.expense === null ? (
          <p className="empty">Forecasts start once there are two complete months of transactions (or from day 7 of the first month).</p>
        ) : (
          <div className="tablewrap">
            <table className="table">
              <thead>
                <tr><th>Month</th><th>Income</th><th>Expenses</th><th>Net (surplus)</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {monthLabel(proj.month)} <span className="tag">Expected</span>
                    <small className="muted"> so far {money(proj.actual.income)} / {money(proj.actual.expense)}</small>
                  </td>
                  <td>{proj.projected.income === null ? "–" : money(proj.projected.income)}</td>
                  <td>{proj.projected.expense === null ? "–" : money(proj.projected.expense)}</td>
                  <td className={pNet !== null && pNet < 0 ? "neg" : "pos"}>{pNet === null ? "–" : money(pNet)}</td>
                </tr>
                {proj.next.map((n) => (
                  <tr key={n.month}>
                    <td>{monthLabel(n.month)} <span className="tag tag--muted">Forecast</span></td>
                    <td>{money(n.income)}</td>
                    <td>{money(n.expense)}</td>
                    <td className={n.income - n.expense < 0 ? "neg" : "pos"}>{money(n.income - n.expense)}</td>
                  </tr>
                ))}
              </tbody>
              {proj.next.length > 0 && (
                <tfoot>
                  <tr>
                    <td>Next 3 months</td>
                    <td>{money(proj.next.reduce((s, n) => s + n.income, 0))}</td>
                    <td>{money(proj.next.reduce((s, n) => s + n.expense, 0))}</td>
                    <td>{money(proj.next.reduce((s, n) => s + n.income - n.expense, 0))}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
        <p className="muted note">
          Recent months count more than older ones, and trends are followed but flattened further out, so a single unusual month doesn&apos;t
          swing the forecast. &ldquo;Expected&rdquo; for this month adds what usually still comes in or goes out after day {proj.day} (judged by past
          months, so rent paid on the 1st isn&apos;t counted twice) to what&apos;s already booked.
        </p>
      </section>

      <GoogleCloudForecast report={cloud} period={period} />

      <section className="panel">
        <header className="panel__head">
          <h2>Expense outlook by category</h2>
          <span>{monthLabel(proj.month)}</span>
        </header>
        {outlook.length === 0 ? (
          <p className="empty">No expenses in the last 12 months.</p>
        ) : (
          <div className="tablewrap">
            <table className="table">
              <thead>
                <tr><th>Category</th><th>So far</th><th>Avg. last 3 months</th><th>Expected this month</th><th>Budget</th><th>Next month</th><th>Signal</th></tr>
              </thead>
              <tbody>
                {outlook.map((c) => {
                  const expected = c.projected ?? c.soFar;
                  const over = c.budget !== null && expected > c.budget;
                  const rising = !over && c.average > 0 && expected > c.average * 1.15;
                  return (
                    <tr key={c.id ?? "none"}>
                      <td className="table__path">{c.id ? <Link href={`/finance/transactions?category=${c.id}&period=month`}>{c.name}</Link> : c.name}</td>
                      <td>{money(c.soFar)}</td>
                      <td>{money(c.average)}</td>
                      <td>{c.projected === null ? "–" : money(c.projected)}</td>
                      <td>{c.budget === null ? <span className="muted">–</span> : `${money(c.budget)} (${pct(expected, c.budget)}%)`}</td>
                      <td>{c.nextMonth === null ? "–" : money(c.nextMonth)}</td>
                      <td>
                        {over ? <span className="status status--bad">▲ Over budget</span>
                          : rising ? <span className="status status--warn">▲ Above average</span>
                          : <span className="status status--ok">● On track</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ---------- Virtual accounts ---------- */}
      <section className="panel">
        <header className="panel__head">
          <h2>Virtual accounts</h2>
          <span>Income and expenses in the period · balance today</span>
        </header>
        {accounts.length === 0 && unassigned.count === 0 ? (
          <p className="empty">No virtual accounts yet.</p>
        ) : (
          <div className="tablewrap">
            <table className="table">
              <thead>
                <tr><th>Account</th><th>Transactions</th><th>Income</th><th>Expenses</th><th>Net</th><th>Balance</th></tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id}>
                    <td className="table__path table__acc">
                      <AccountMark id={a.id} name={a.name} logo={a.logo} size={28} />
                      <Link href={`/finance/transactions?account=${a.id}&period=${period.key}${period.key === "custom" ? `&from=${period.from}&to=${period.to}` : ""}`}>{a.name}</Link>
                      {a.archived && <span className="tag tag--muted">Archived</span>}
                    </td>
                    <td>{num(a.count)}</td>
                    <td>{money(a.income)}</td>
                    <td>{money(a.expense)}</td>
                    <td className={a.income - a.expense < 0 ? "neg" : undefined}>{money(a.income - a.expense)}</td>
                    <td className={a.balance < 0 ? "neg" : undefined}><strong>{money(a.balance)}</strong></td>
                  </tr>
                ))}
                {unassigned.count > 0 && (
                  <tr>
                    <td className="muted">No account</td>
                    <td>{num(unassigned.count)}</td>
                    <td>{money(unassigned.income)}</td>
                    <td>{money(unassigned.expense)}</td>
                    <td>{money(unassigned.income - unassigned.expense)}</td>
                    <td className="muted">–</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ---------- Categories ---------- */}
      <div className="cols">
        <CategoryTable title="Expenses by category" rows={expenses} total={totalExpense} period={period.key} upIsBad />
        <CategoryTable title="Income by category" rows={income} total={totalIncome} period={period.key} />
      </div>

      {months.length > 1 && (
        <section className="panel">
          <header className="panel__head">
            <h2>Month by month</h2>
            <span className="legend">
              <i className="legend__income" /> Income <i className="legend__expense" /> Expenses
            </span>
          </header>
          <MoneyChart rows={months} />
        </section>
      )}

      <section className="panel">
        <header className="panel__head">
          <h2>By user</h2>
        </header>
        {people.length === 0 ? (
          <p className="empty">No transactions in this period.</p>
        ) : (
          <div className="tablewrap">
            <table className="table">
              <thead>
                <tr><th>User</th><th>Transactions</th><th>Income</th><th>Expenses</th></tr>
              </thead>
              <tbody>
                {people.map((u) => (
                  <tr key={u.id ?? u.name}>
                    <td className="table__path">{u.id ? <Link href={`/finance/transactions?user=${u.id}&period=${period.key}`}>{u.name}</Link> : u.name}</td>
                    <td>{num(u.count)}</td>
                    <td>{money(u.income)}</td>
                    <td>{money(u.expense)}</td>
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

function Delta({ now, before, upIsBad }: { now: number; before: number; upIsBad?: boolean }) {
  const c = change(now, before);
  if (!c) return <small>No earlier data</small>;
  const up = now > before;
  return <small className={up === !upIsBad ? "pos" : "neg"}>{c} vs previous period</small>;
}

function CategoryTable({ title, rows, total, period, upIsBad }: { title: string; rows: CategoryReport[]; total: number; period: string; upIsBad?: boolean }) {
  return (
    <section className="panel">
      <header className="panel__head">
        <h2>{title}</h2>
        <span>{money(total)}</span>
      </header>
      {rows.length === 0 ? (
        <p className="empty">Nothing in this period.</p>
      ) : (
        <ul className="breakdown">
          {rows.map((c) => {
            const d = change(c.total, c.previous);
            return (
              <li key={c.id ?? "none"}>
                <span className="breakdown__bar" style={{ width: `${pct(c.total, total)}%` }} aria-hidden="true" />
                <span className="breakdown__label">
                  {c.id ? <Link href={`/finance/transactions?category=${c.id}&period=${period}`}>{c.name}</Link> : c.name}
                  <small>{num(c.count)} transactions · {pct(c.total, total)}%</small>
                </span>
                {d && <span className={`breakdown__extra ${(c.total > c.previous) === !upIsBad ? "pos" : "neg"}`}>{d}</span>}
                <span className="breakdown__value">{money(c.total)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
