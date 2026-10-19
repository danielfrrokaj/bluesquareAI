import Link from "next/link";
import { requireFinanceTab } from "@/lib/auth";
import {
  accountReport, categoryReport, expenseOutlook, monthlyTotals, periodTotals, projection, unassignedAccountTotals, userReport,
} from "@/lib/finance-reports";
import { bookRecurring } from "@/lib/finance";
import { addMonths, monthLabel, monthOf, parsePeriod } from "@/lib/period";
import { change, money, num, pct } from "@/lib/format";
import { FinanceSummary, SectionTitle, StatCard } from "@/components/FinanceCards";
import { InfoTip } from "@/components/FinIcon";
import { Shell } from "@/components/Shell";
import { financeNav } from "@/components/nav";
import { PeriodTabs } from "@/components/PeriodTabs";
import { MoneyChart } from "@/components/MoneyChart";

export const dynamic = "force-dynamic";
export const metadata = { title: "Finance reports" };

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ period?: string; from?: string; to?: string; month?: string }> }) {
  const user = await requireFinanceTab("reports");
  const period = parsePeriod(await searchParams);
  // Months of recurring rules whose day has come are booked before anything is read.
  await bookRecurring();
  const [proj, outlook, accounts, unassigned, expenses, income, people, totals] = await Promise.all([
    projection(), expenseOutlook(), accountReport(period), unassignedAccountTotals(period), categoryReport("expense", period),
    categoryReport("income", period), userReport(period), periodTotals(period),
  ]);
  // "All" starts long before the books do: chart from the first booked month.
  const firstMonth = period.key === "all" ? addMonths(monthOf(period.to), -(totals.months - 1)) : monthOf(period.from);
  const months = await monthlyTotals(firstMonth, monthOf(period.to));
  const { income: totalIncome, expense: totalExpense, prevIncome, prevExpense } = totals;
  const balance = accounts.reduce((s, a) => s + a.balance, 0);
  const qs = period.key === "custom" ? `period=custom&from=${period.from}&to=${period.to}` : `period=${period.key}`;
  const margin = totalIncome ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : null;
  const pNet = proj.projected.income !== null && proj.projected.expense !== null ? proj.projected.income - proj.projected.expense : null;

  return (
    <Shell department="finance" subnav={financeNav("reports", user)}>
      <div className="pagehead">
        <div>
          <h1>Reports &amp; forecast</h1>
          <p className="muted">Results by account and category, and where the coming months are heading</p>
        </div>
      </div>

      <PeriodTabs base="/finance/reports" current={period} />

      <SectionTitle icon="trend" art="transactions" title="Results" sub={period.label}>
        <InfoTip text="Compared with the period of the same length just before it." />
      </SectionTitle>

      <ul className="fstats">
        <StatCard tone="green" label="Income" value={money(totalIncome)} caption={<Delta now={totalIncome} before={prevIncome} all={period.key === "all"} />} info="Income booked in the period." />
        <StatCard tone="red" label="Expenses" value={money(totalExpense)} caption={<Delta now={totalExpense} before={prevExpense} upIsBad all={period.key === "all"} />} info="Expenses booked in the period." />
        <StatCard
          tone={totalIncome - totalExpense < 0 ? "red" : "blue"} label="Net result" value={money(totalIncome - totalExpense)}
          caption={<Delta now={totalIncome - totalExpense} before={prevIncome - prevExpense} all={period.key === "all"} />} info="Income minus expenses in the period."
        />
        <StatCard tone="violet" label="Margin" value={margin === null ? "–" : `${margin}%`} caption={`${num(totals.count)} transactions`} info="Share of income left after expenses." />
      </ul>

      <FinanceSummary
        periodLabel={period.label}
        income={totalIncome}
        expense={totalExpense}
        balance={balance}
        extra={period.key !== "all" ? { label: "Net in the previous period", value: prevIncome - prevExpense } : null}
        accounts={accounts}
        unassigned={unassigned}
        incomeCats={income}
        expenseCats={expenses}
        qs={qs}
      />

      {/* ---------- Forecast ---------- */}
      <SectionTitle icon="trend" art="forecast" title="Forecast" sub="Based on the last 12 complete months" id="forecast" />
      <section className="panel">
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

function Delta({ now, before, upIsBad, all }: { now: number; before: number; upIsBad?: boolean; all?: boolean }) {
  if (all) return <>All booked transactions</>;
  const c = change(now, before);
  if (!c) return <>No earlier data to compare</>;
  const up = now > before;
  return <span className={up === !upIsBad ? "pos" : "neg"}>{c} vs previous period</span>;
}
