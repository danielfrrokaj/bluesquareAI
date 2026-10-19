import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin, requireFinanceTab } from "@/lib/auth";
import { bookRecurring, isTxKind, isTxStatus, listAccounts, listCategories, listTransactions, transactionTotals, type TxFilter } from "@/lib/finance";
import { listUsers } from "@/lib/users";
import { optionalPeriod } from "@/lib/period";
import { num } from "@/lib/format";
import { Shell } from "@/components/Shell";
import { financeNav } from "@/components/nav";
import { TransactionTable } from "@/components/TransactionTable";
import { AddTransaction } from "@/components/AddTransaction";
import { RecurringRules } from "@/components/RecurringRules";

export const dynamic = "force-dynamic";
export const metadata = { title: "Transactions" };

const PAGE = 25;
const DATES = [
  ["month", "This month"], ["last-month", "Last month"], ["3m", "Last 3 months"], ["6m", "Last 6 months"],
  ["12m", "Last 12 months"], ["ytd", "This year"],
] as const;

/** Page numbers around the current one, with the first and last: 1 … 4 5 6 … 12. */
function pageList(page: number, pages: number): (number | null)[] {
  const shown = [...new Set([1, page - 1, page, page + 1, pages])].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);
  const out: (number | null)[] = [];
  for (const p of shown) {
    const prev = out.at(-1) ?? 0;
    if (prev !== null && p - prev === 2) out.push(prev + 1); // a single gap: show the page, not "…"
    else if (prev !== null && p - prev > 2) out.push(null);
    out.push(p);
  }
  return out;
}

type SP = {
  period?: string; from?: string; to?: string; type?: string; account?: string; category?: string;
  user?: string; source?: string; status?: string; q?: string; page?: string; saved?: string; deleted?: string;
};

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireFinanceTab("transactions");
  const admin = isAdmin(user);
  const sp = await searchParams;
  // Every date unless a period is picked (or comes with a link, e.g. from an account's month).
  const period = optionalPeriod(sp);
  // Months of recurring rules whose day has come are booked before anything is read.
  await bookRecurring();
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const filter: TxFilter = {
    from: period?.from,
    to: period?.to,
    type: isTxKind(sp.type) ? sp.type : undefined,
    accountId: sp.account || undefined,
    categoryId: sp.category || undefined,
    userId: sp.user || undefined,
    source: sp.source === "bluebill" || sp.source === "manual" || sp.source === "meta_ads" || sp.source === "recurring" ? sp.source : undefined,
    status: isTxStatus(sp.status) ? sp.status : undefined,
    q: sp.q?.trim().slice(0, 100) || undefined,
  };
  const [rows, totals, accounts, categories, users] = await Promise.all([
    listTransactions(filter, PAGE, (page - 1) * PAGE), transactionTotals(filter), listAccounts(true), listCategories(true), listUsers(),
  ]);

  // Current filters, for links that change only one of them.
  const keep = {
    period: period?.key, from: period?.key === "custom" ? period.from : undefined, to: period?.key === "custom" ? period.to : undefined,
    type: filter.type, account: sp.account, category: sp.category, user: sp.user, source: filter.source, status: filter.status, q: filter.q,
  };
  const link = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...keep, ...extra })) if (v) p.set(k, v);
    return `?${p}`;
  };
  const exportQs = new URLSearchParams(Object.entries(keep).filter((e): e is [string, string] => !!e[1]));
  const pages = Math.max(1, Math.ceil(totals.count / PAGE));
  if (page > pages) redirect(`/finance/transactions${link({ page: pages > 1 ? String(pages) : undefined })}`);
  const pageLink = (p: number) => link({ page: p > 1 ? String(p) : undefined });

  return (
    <Shell department="finance" subnav={financeNav("transactions", user)}>
      <div className="pagehead">
        <div>
          <h1>Transactions</h1>
          <p className="muted">{period?.label ?? "All dates"}</p>
        </div>
      </div>

      {sp.deleted && <p className="notice" role="status">Transaction deleted.</p>}
      {sp.saved && <p className="notice" role="status">Transaction saved.</p>}

      <section className="panel">
        <form className="filters filters--tx" action="/finance/transactions">
          {keep.from && <input type="hidden" name="from" value={keep.from} />}
          {keep.to && <input type="hidden" name="to" value={keep.to} />}
          <label className="field">
            <span>Search</span>
            <input name="q" defaultValue={filter.q ?? ""} placeholder="Description or client" />
          </label>
          <label className="field">
            <span>Dates</span>
            <select name="period" defaultValue={period?.key ?? ""}>
              <option value="">All dates</option>
              {DATES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              {period?.key === "custom" && <option value="custom">{period.label}</option>}
            </select>
          </label>
          <label className="field">
            <span>Type</span>
            <select name="type" defaultValue={filter.type ?? ""}>
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="transfer">Transfer</option>
            </select>
          </label>
          <label className="field">
            <span>Account</span>
            <select name="account" defaultValue={sp.account ?? ""}>
              <option value="">All accounts</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              <option value="none">No account</option>
            </select>
          </label>
          <label className="field">
            <span>Category</span>
            <select name="category" defaultValue={sp.category ?? ""}>
              <option value="">All categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.kind})</option>)}
              <option value="none">Uncategorised</option>
            </select>
          </label>
          <label className="field">
            <span>User</span>
            <select name="user" defaultValue={sp.user ?? ""}>
              <option value="">Everyone</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Source</span>
            <select name="source" defaultValue={filter.source ?? ""}>
              <option value="">All</option>
              <option value="manual">Entered here</option>
              <option value="bluebill">Fiscal invoices</option>
              <option value="meta_ads">Meta Ads</option>
              <option value="recurring">Recurring</option>
            </select>
          </label>
          <label className="field">
            <span>Status</span>
            <select name="status" defaultValue={filter.status ?? ""}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <div className="btnrow">
            <button className="btn btn--primary btn--small">Filter</button>
            <Link href="/finance/transactions" className="btn btn--small">Reset</Link>
          </div>
        </form>
      </section>

      <section className="panel">
        <header className="panel__head">
          <h2>{num(totals.count)} transactions</h2>
          <span className="btnrow">
            <a href={`/api/finance/export?${exportQs}`} className="btn btn--small">Export CSV</a>
            <AddTransaction user={user} admin={admin} />
          </span>
        </header>
        <TransactionTable rows={rows} highlight={sp.saved} />
        {totals.count > 0 && (
          <nav className="pager pager--numbers" aria-label="Pages">
            <span className="pager__info">
              {num((page - 1) * PAGE + 1)}–{num(Math.min(page * PAGE, totals.count))} of {num(totals.count)}
            </span>
            {pages > 1 && (
              <span className="pager__pages">
                {page > 1 ? <Link href={pageLink(page - 1)} className="pager__step">‹ Newer</Link> : <span className="pager__step" aria-disabled="true">‹ Newer</span>}
                {pageList(page, pages).map((p, i) => p === null
                  ? <span key={`gap${i}`} className="pager__gap">…</span>
                  : <Link key={p} href={pageLink(p)} className="pager__num" aria-current={p === page ? "page" : undefined} aria-label={`Page ${p}`}>{p}</Link>)}
                {page < pages ? <Link href={pageLink(page + 1)} className="pager__step">Older ›</Link> : <span className="pager__step" aria-disabled="true">Older ›</span>}
              </span>
            )}
          </nav>
        )}
      </section>

      <RecurringRules user={user} />
    </Shell>
  );
}
