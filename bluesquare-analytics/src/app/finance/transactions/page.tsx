import Link from "next/link";
import { isAdmin, requireAuth } from "@/lib/auth";
import { isTxKind, listAccounts, listCategories, listTransactions, transactionTotals, type TxFilter } from "@/lib/finance";
import { listUsers } from "@/lib/users";
import { parsePeriod } from "@/lib/period";
import { num } from "@/lib/format";
import { Shell } from "@/components/Shell";
import { financeNav } from "@/components/nav";
import { TransactionTable } from "@/components/TransactionTable";
import { AddTransaction } from "@/components/AddTransaction";

export const dynamic = "force-dynamic";
export const metadata = { title: "Transactions" };

const PAGE = 100;

type SP = {
  period?: string; from?: string; to?: string; type?: string; account?: string; category?: string;
  user?: string; source?: string; q?: string; page?: string; saved?: string; deleted?: string;
};

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireAuth();
  const admin = isAdmin(user);
  const sp = await searchParams;
  const period = parsePeriod(sp);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const filter: TxFilter = {
    from: period.from,
    to: period.to,
    type: isTxKind(sp.type) ? sp.type : undefined,
    accountId: sp.account || undefined,
    categoryId: sp.category || undefined,
    userId: sp.user || undefined,
    source: sp.source === "bluebill" || sp.source === "manual" || sp.source === "meta_ads" ? sp.source : undefined,
    q: sp.q?.trim().slice(0, 100) || undefined,
  };
  const [rows, totals, accounts, categories, users] = await Promise.all([
    listTransactions(filter, PAGE, (page - 1) * PAGE), transactionTotals(filter), listAccounts(true), listCategories(true), listUsers(),
  ]);

  // Current filters, for links that change only one of them.
  const keep = {
    period: period.key, from: period.key === "custom" ? period.from : undefined, to: period.key === "custom" ? period.to : undefined,
    type: filter.type, account: sp.account, category: sp.category, user: sp.user, source: filter.source, q: filter.q,
  };
  const link = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...keep, ...extra })) if (v) p.set(k, v);
    return `?${p}`;
  };
  const exportQs = new URLSearchParams(Object.entries(keep).filter((e): e is [string, string] => !!e[1]));
  const pages = Math.max(1, Math.ceil(totals.count / PAGE));

  return (
    <Shell department="finance" subnav={financeNav("transactions", admin)}>
      <div className="pagehead">
        <div>
          <h1>Transactions</h1>
          <p className="muted">{period.label}</p>
        </div>
      </div>

      {sp.deleted && <p className="notice" role="status">Transaction deleted.</p>}
      {sp.saved && <p className="notice" role="status">Transaction saved.</p>}

      <section className="panel">
        <form className="filters" action="/finance/transactions">
          {keep.period && <input type="hidden" name="period" value={keep.period} />}
          {keep.from && <input type="hidden" name="from" value={keep.from} />}
          {keep.to && <input type="hidden" name="to" value={keep.to} />}
          <label className="field">
            <span>Search</span>
            <input name="q" defaultValue={filter.q ?? ""} placeholder="Description or client" />
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
            </select>
          </label>
          <div className="btnrow">
            <button className="btn btn--primary btn--small">Filter</button>
            <Link href={`/finance/transactions?period=${period.key === "custom" ? "month" : period.key}`} className="btn btn--small">Reset</Link>
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
        {pages > 1 && (
          <nav className="pager" aria-label="Pages">
            {page > 1 && <Link href={link({ page: String(page - 1) })} className="btn btn--small">Newer</Link>}
            <span className="muted">Page {page} of {pages}</span>
            {page < pages && <Link href={link({ page: String(page + 1) })} className="btn btn--small">Older</Link>}
          </nav>
        )}
      </section>

    </Shell>
  );
}
