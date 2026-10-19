import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { countLeads, leadSources, listLeads, salesStats, type LeadFilter, type LeadStatus } from "@/lib/sales";
import { STEPS } from "@/lib/sales-fields";
import { listUsers } from "@/lib/users";
import { today as todayFn } from "@/lib/period";
import { money, num } from "@/lib/format";
import { addLead } from "@/app/sales/actions";
import { Shell } from "./Shell";
import { salesNav } from "./nav";
import { ActionForm } from "./ActionForm";
import { Modal } from "./Modal";
import { LeadFields } from "./LeadFields";
import { AiLeadImport, Sparkles } from "./AiLeadImport";
import ai from "./AiLeadImport.module.css";
import { LeadTable } from "./LeadTable";

const PAGE = 100;
export type SalesSearch = { q?: string; stage?: string; source?: string; owner?: string; due?: string; sort?: string; page?: string };
const VIEWS = {
  leads: { status: "open", title: "Leads", base: "/sales" },
  customers: { status: "won", title: "Customers", base: "/sales/customers" },
  archive: { status: "lost", title: "Archive", base: "/sales/archive" },
} as const;

/** Leads, Customers and Archive: the same list over a different status. */
export async function SalesList({ view, sp }: { view: keyof typeof VIEWS; sp: SalesSearch }) {
  const me = await requireAuth();
  const v = VIEWS[view];
  const today = todayFn();
  const filter: LeadFilter = {
    status: v.status as LeadStatus,
    q: sp.q?.trim().slice(0, 100) || undefined,
    stage: sp.stage || undefined,
    source: sp.source || undefined,
    owner: sp.owner || undefined,
    due: (["overdue", "today", "week", "none"] as const).find((d) => d === sp.due),
    sort: (["followup", "newest", "rooms", "closed"] as const).find((s) => s === sp.sort) ?? (view === "leads" ? "followup" : "closed"),
  };
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const [rows, total, stats, users, sources] = await Promise.all([
    listLeads(filter, today, PAGE, (page - 1) * PAGE), countLeads(filter, today), salesStats(today), listUsers(), leadSources(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const link = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, val] of Object.entries({ ...sp, page: undefined, ...extra })) if (val) p.set(k, val);
    return `${v.base}?${p}`;
  };
  const filtered = !!(filter.q || filter.stage || filter.source || filter.owner || filter.due);
  // Only what the owner pickers need goes to the browser (the AI import form is client-side).
  const people = users.map((u) => ({ id: u.id, name: u.name, active: u.active }));

  return (
    <Shell department="sales" subnav={salesNav(view)}>
      <div className="pagehead">
        <div>
          <h1>{v.title}</h1>
          <p className="muted">
            {view === "leads" ? "Hotels and properties you're talking to." : view === "customers" ? "Won leads: properties using our software." : "Lost leads. Reopen one to try again."}
          </p>
        </div>
        {view === "leads" && (
          <div className="btnrow">
            <Link href="/sales/import" className="btn">Import</Link>
            <Modal trigger={<><Sparkles size={16} /> AI import</>} title="New lead with AI" triggerClassName={`btn ${ai.trigger}`}>
              <AiLeadImport users={people} meId={me.id} />
            </Modal>
            <Modal trigger="Add lead" title="New lead">
              <ActionForm action={addLead} submit="Add lead">
                <LeadFields users={people} meId={me.id} note />
              </ActionForm>
            </Modal>
          </div>
        )}
      </div>

      {view === "leads" && (
        <ul className="kpis kpis--4">
          <li className="kpi--neutral"><span>Open leads</span><strong>{num(stats.open)}</strong><small>{num(stats.interested)} interested</small></li>
          <li className={stats.overdue ? "kpi--loss" : "kpi--income"}>
            <span>Follow-ups due</span><strong>{num(stats.due)}</strong>
            <small>{stats.overdue ? `${num(stats.overdue)} overdue` : "Nothing overdue"}</small>
          </li>
          <li className="kpi--profit"><span>Won this month</span><strong>{num(stats.wonMonth)}</strong><small>{stats.mrrMonth ? `+${money(stats.mrrMonth)} / month` : "No new revenue yet"}</small></li>
          <li className="kpi--expense"><span>Win rate</span><strong>{stats.winRate === null ? "–" : `${stats.winRate}%`}</strong><small>Last 90 days, won ÷ closed</small></li>
        </ul>
      )}
      {view === "customers" && (
        <ul className="kpis kpis--4">
          <li className="kpi--profit"><span>Customers</span><strong>{num(stats.customers)}</strong><small>{num(stats.wonMonth)} this month</small></li>
          <li className="kpi--income"><span>Monthly revenue</span><strong>{money(stats.mrr)}</strong><small>From won deals with a value</small></li>
          <li className="kpi--neutral"><span>Rooms</span><strong>{num(stats.rooms)}</strong><small>Across customers</small></li>
          <li className="kpi--expense"><span>Win rate</span><strong>{stats.winRate === null ? "–" : `${stats.winRate}%`}</strong><small>Last 90 days</small></li>
        </ul>
      )}

      <section className="panel">
        <form className="filters filters--sales" action={v.base}>
          <label className="field">
            <span>Search</span>
            <input name="q" defaultValue={filter.q ?? ""} placeholder="Property, contact, phone, city" />
          </label>
          {view !== "customers" && (
            <label className="field">
              <span>Progress</span>
              <select name="stage" defaultValue={filter.stage ?? ""}>
                <option value="">Any</option>
                <option value="new">New (nothing yet)</option>
                {Object.entries(STEPS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </label>
          )}
          {view === "leads" && (
            <label className="field">
              <span>Follow-up</span>
              <select name="due" defaultValue={filter.due ?? ""}>
                <option value="">Any</option>
                <option value="overdue">Overdue</option>
                <option value="today">Today</option>
                <option value="week">Next 7 days</option>
                <option value="none">Not set</option>
              </select>
            </label>
          )}
          <label className="field">
            <span>Source</span>
            <select name="source" defaultValue={filter.source ?? ""}>
              <option value="">Any</option>
              {sources.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Owner</span>
            <select name="owner" defaultValue={filter.owner ?? ""}>
              <option value="">Anyone</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              <option value="none">Nobody</option>
            </select>
          </label>
          <label className="field">
            <span>Sort</span>
            <select name="sort" defaultValue={filter.sort}>
              {view === "leads" && <option value="followup">Follow-up date</option>}
              {view !== "leads" && <option value="closed">Most recent</option>}
              <option value="newest">Newest first</option>
              <option value="rooms">Most rooms</option>
            </select>
          </label>
          <div className="btnrow">
            <button className="btn btn--primary btn--small">Filter</button>
            {filtered && <Link href={v.base} className="btn btn--small">Reset</Link>}
          </div>
        </form>
      </section>

      <section className="panel">
        <header className="panel__head">
          <h2>{num(total)} {view === "leads" ? `lead${total === 1 ? "" : "s"}` : view === "customers" ? `customer${total === 1 ? "" : "s"}` : "archived"}</h2>
          {view === "leads" && stats.overdue > 0 && filter.due !== "overdue" && <Link href={link({ due: "overdue" })} className="btn btn--small">Show {stats.overdue} overdue</Link>}
        </header>
        <LeadTable rows={rows} view={view} today={today} />
        {pages > 1 && (
          <nav className="pager" aria-label="Pages">
            {page > 1 && <Link href={link({ page: String(page - 1) })} className="btn btn--small">Previous</Link>}
            <span className="muted">Page {page} of {pages}</span>
            {page < pages && <Link href={link({ page: String(page + 1) })} className="btn btn--small">Next</Link>}
          </nav>
        )}
      </section>
    </Shell>
  );
}
