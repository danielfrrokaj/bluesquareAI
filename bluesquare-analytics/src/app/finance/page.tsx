import Link from "next/link";
import { after } from "next/server";
import { isAdmin, requireAuth } from "@/lib/auth";
import { listTransactions } from "@/lib/finance";
import { accountReport, categoryReport, monthlyTotals, projection } from "@/lib/finance-reports";
import { getBlueBill, syncIfStale } from "@/lib/bluebill";
import { addMonths, monthLabel, parsePeriod } from "@/lib/period";
import { money } from "@/lib/format";
import { Shell } from "@/components/Shell";
import { financeNav } from "@/components/nav";
import { MoneyChart } from "@/components/MoneyChart";
import { Breakdown } from "@/components/Breakdown";
import { TransactionTable } from "@/components/TransactionTable";
import { AddTransaction } from "@/components/AddTransaction";
import { AccountMark } from "@/components/AccountMark";

export const dynamic = "force-dynamic";
export const metadata = { title: "Finance" };

export default async function FinanceOverview() {
  const user = await requireAuth();
  const admin = isAdmin(user);
  const month = parsePeriod({ period: "month" });
  const [proj, accounts, expenses, recent, bluebill] = await Promise.all([
    projection(), accountReport(month), categoryReport("expense", month), listTransactions({}, 8), getBlueBill(),
  ]);
  // Pull new fiscalized invoices after the response is sent, at most every 15 minutes.
  after(syncIfStale);

  const chart = [
    ...(await monthlyTotals(addMonths(proj.month, -11), proj.month)),
    ...proj.next.map((n) => ({ ...n, forecast: true })),
  ];
  const net = proj.actual.income - proj.actual.expense;
  const pIncome = proj.projected.income, pExpense = proj.projected.expense;
  const pNet = pIncome !== null && pExpense !== null ? pIncome - pExpense : null;
  const balance = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <Shell department="finance" subnav={financeNav("overview", admin)}>
      <div className="pagehead">
        <div>
          <h1>Finance</h1>
          <p className="muted">
            {monthLabel(proj.month)} · day {proj.day} of {proj.days}
            {bluebill.active && bluebill.lastSyncAt && <> · BlueBill synced {new Date(bluebill.lastSyncAt).toLocaleString("en-GB", { timeZone: process.env.REPORT_TIMEZONE || "Europe/Tirane", dateStyle: "short", timeStyle: "short" })}</>}
          </p>
        </div>
        <AddTransaction user={user} admin={admin} />
      </div>

      <ul className="kpis kpis--4">
        <li className="kpi--income">
          <span>Income this month</span>
          <strong>{money(proj.actual.income)}</strong>
          {pIncome !== null && <small>Expected {money(pIncome)}</small>}
        </li>
        <li className="kpi--expense">
          <span>Expenses this month</span>
          <strong>{money(proj.actual.expense)}</strong>
          {pExpense !== null && <small>Expected {money(pExpense)}</small>}
        </li>
        <li className={net < 0 ? "kpi--loss" : "kpi--profit"}>
          <span>Net this month</span>
          <strong className={net < 0 ? "neg" : undefined}>{money(net)}</strong>
          {pNet !== null && <small className={pNet < 0 ? "neg" : "pos"}>Heading for {money(pNet)}</small>}
        </li>
        <li className="kpi--neutral">
          <span>Balance, all accounts</span>
          <strong className={balance < 0 ? "neg" : undefined}>{money(balance)}</strong>
          <small>{accounts.filter((a) => !a.archived).length} virtual accounts</small>
        </li>
      </ul>

      <section className="panel">
        <header className="panel__head">
          <h2>Last 12 months and forecast</h2>
          <span className="legend">
            <i className="legend__income" /> Income <i className="legend__expense" /> Expenses <i className="legend__forecast" /> Forecast
          </span>
        </header>
        <MoneyChart rows={chart} />
        {!proj.enoughHistory && <p className="muted note">The forecast starts once there are two complete months of transactions.</p>}
      </section>

      <div className="cols">
        <section className="panel">
          <header className="panel__head">
            <h2>Virtual accounts</h2>
            <span>Balance</span>
          </header>
          {accounts.length === 0 ? (
            <p className="empty">
              No virtual accounts yet.{admin && <> Create them in <Link href="/finance/settings">Settings</Link>.</>}
            </p>
          ) : (
            <ul className="breakdown">
              {accounts.filter((a) => !a.archived).map((a) => (
                <li key={a.id}>
                  <AccountMark id={a.id} name={a.name} logo={a.logo} size={34} />
                  <span className="breakdown__label">
                    <Link href={`/finance/transactions?account=${a.id}&period=month`}>{a.name}</Link>
                    <small>
                      +{money(a.income)} / −{money(a.expense)} this month
                    </small>
                  </span>
                  <span className={`breakdown__value${a.balance < 0 ? " neg" : ""}`}>{money(a.balance)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <Breakdown
          title="Top expenses this month"
          valueLabel={money(proj.actual.expense)}
          empty="No expenses recorded this month."
          format={money}
          rows={expenses.slice(0, 8).map((c) => ({ key: c.id ?? "none", label: c.name, value: c.total }))}
        />
      </div>

      <section className="panel">
        <header className="panel__head">
          <h2>Latest transactions</h2>
          <Link href="/finance/transactions" className="btn btn--small">
            All transactions
          </Link>
        </header>
        <TransactionTable rows={recent} />
      </section>
    </Shell>
  );
}
