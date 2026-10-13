import Link from "next/link";
import { Suspense } from "react";
import { after } from "next/server";
import { isAdmin, requireAuth } from "@/lib/auth";
import { accountReport, categoryReport, monthlyTotals, periodTotals, projection, unassignedAccountTotals } from "@/lib/finance-reports";
import { getBlueBill, syncIfStale } from "@/lib/bluebill";
import { addMonths, parsePeriod } from "@/lib/period";
import { money } from "@/lib/format";
import { Shell } from "@/components/Shell";
import { financeNav } from "@/components/nav";
import { MoneyChart } from "@/components/MoneyChart";
import { AddTransaction } from "@/components/AddTransaction";
import { PeriodTabs } from "@/components/PeriodTabs";
import { FinanceSummary, SectionTitle, StatCard } from "@/components/FinanceCards";
import { InfoTip } from "@/components/FinIcon";
import { ChannexCard, ChannexCardLoading, GoogleCloudCard, GoogleCloudCardLoading } from "@/components/SupplierCards";

export const dynamic = "force-dynamic";
export const metadata = { title: "Finance" };

type SP = { period?: string; from?: string; to?: string; month?: string };

export default async function FinanceOverview({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireAuth();
  const admin = isAdmin(user);
  const period = parsePeriod(await searchParams);
  const [proj, totals, accounts, unassigned, incomeCats, expenseCats, bluebill] = await Promise.all([
    projection(), periodTotals(period), accountReport(period), unassignedAccountTotals(period),
    categoryReport("income", period), categoryReport("expense", period), getBlueBill(),
  ]);
  // Pull new fiscalized invoices after the response is sent, at most every 15 minutes.
  after(syncIfStale);

  const chart = [
    ...(await monthlyTotals(addMonths(proj.month, -11), proj.month)),
    ...proj.next.map((n) => ({ ...n, forecast: true })),
  ];
  const balance = accounts.reduce((s, a) => s + a.balance, 0);
  const qs = period.key === "custom" ? `period=custom&from=${period.from}&to=${period.to}` : `period=${period.key}`;

  const thisMonth = period.key === "month";
  const expected = (projected: number | null) => (thisMonth && projected !== null ? `Expected ${money(projected)} by month end` : period.label);
  const expectedNet = thisMonth && proj.projected.income !== null && proj.projected.expense !== null ? proj.projected.income - proj.projected.expense : null;

  return (
    <Shell department="finance" subnav={financeNav("overview", admin)}>
      <div className="pagehead">
        <div>
          <h1>Finance</h1>
          <p className="muted">
            Income, expenses and cash flow
            {bluebill.active && bluebill.lastSyncAt && <> · BlueBill synced {new Date(bluebill.lastSyncAt).toLocaleString("en-GB", { timeZone: process.env.REPORT_TIMEZONE || "Europe/Tirane", dateStyle: "short", timeStyle: "short" })}</>}
          </p>
        </div>
        <AddTransaction user={user} admin={admin} />
      </div>

      <PeriodTabs base="/finance" current={period} />

      <SectionTitle icon="money" art="transactions" title="Transactions" sub={period.label}>
        <InfoTip text="Amounts already recorded in the period, including fiscalized invoices from BlueBill." />
      </SectionTitle>

      <ul className={`fstats${thisMonth ? "" : " fstats--2"}`}>
        <StatCard tone="green" label="Income" value={money(totals.income)} caption={expected(proj.projected.income)} info="Income recorded in this period, including fiscalized invoices from BlueBill." />
        <StatCard tone="red" label="Expenses" value={money(totals.expense)} caption={expected(proj.projected.expense)} info="Expenses recorded in this period. Channex and Google Cloud are billed in USD and shown separately." />
        {/* Expected supplier costs, streamed in: Google Cloud and the daily LuxHotel read can take a few seconds. */}
        {thisMonth && (
          <>
            <Suspense fallback={<ChannexCardLoading />}><ChannexCard /></Suspense>
            <Suspense fallback={<GoogleCloudCardLoading />}><GoogleCloudCard period={period} /></Suspense>
          </>
        )}
      </ul>

      <FinanceSummary
        periodLabel={period.label}
        income={totals.income}
        expense={totals.expense}
        balance={balance}
        extra={expectedNet !== null ? { label: "Expected net at month end", value: expectedNet } : period.key !== "all" ? { label: "Net in the previous period", value: totals.prevIncome - totals.prevExpense } : null}
        accounts={accounts}
        unassigned={unassigned}
        incomeCats={incomeCats}
        expenseCats={expenseCats}
        qs={qs}
      />

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

    </Shell>
  );
}
