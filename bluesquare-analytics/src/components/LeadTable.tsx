import Link from "next/link";
import { LEAD_SORTS, leadTitle, stage, type Lead, type LeadSort, type SortDir } from "@/lib/sales";
import { STEPS, type Step } from "@/lib/sales-fields";
import { money } from "@/lib/format";

const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const fmtDay = (d: string) => dayFmt.format(new Date(`${d}T00:00:00Z`));
const short = (s: string, n = 90) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

type Sorting = { key: LeadSort; dir?: SortDir };

/** A column header that sorts by its column: the first click in the column's natural direction, the next reverses it. */
function SortHeader({ col, sort, href, className, children }: {
  col: LeadSort; sort: Sorting; href: (sort: LeadSort, dir: SortDir) => string; className?: string; children: React.ReactNode;
}) {
  const active = sort.key === col;
  const dir = sort.dir ?? LEAD_SORTS[sort.key].dir;
  const next = active ? (dir === "asc" ? "desc" : "asc") : LEAD_SORTS[col].dir;
  return (
    <th className={className} aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : undefined}>
      <Link href={href(col, next)} scroll={false} className={`sorter${active ? ` is-active${dir === "asc" ? " is-asc" : ""}` : ""}`}
        title={`Sort by ${String(children).toLowerCase()}`}>
        {children}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {active ? <path d="M12 5v14M6 13l6 6 6-6" /> : <path d="m7 9 5-5 5 5M7 15l5 5 5-5" />}
        </svg>
      </Link>
    </th>
  );
}

/** Leads, customers or archive rows, sorted by clicking a header; every row opens the lead (as a modal from Sales pages). */
export function LeadTable({ rows, view, today, sort, sortHref }: {
  rows: Lead[]; view: "leads" | "customers" | "archive"; today: string; sort: Sorting; sortHref: (sort: LeadSort, dir: SortDir) => string;
}) {
  if (!rows.length) return <p className="empty">{view === "leads" ? "No leads match." : view === "customers" ? "No customers yet." : "Nothing archived."}</p>;
  const th = (col: LeadSort, label: string, className?: string) => <SortHeader col={col} sort={sort} href={sortHref} className={className}>{label}</SortHeader>;
  return (
    <div className="tablewrap">
      <table className="table leadtable">
        <thead>
          <tr>
            {th("property", "Property")}
            {th("city", "Location")}
            {th("rooms", "Rooms", "leadtable__num")}
            {view === "leads" && <>{th("progress", "Progress")}{th("followup", "Follow-up")}{th("source", "Source")}{th("added", "Added")}</>}
            {view === "customers" && <><th>Products</th>{th("value", "Monthly")}{th("closed", "Won")}</>}
            {view === "archive" && <>{th("reason", "Reason")}{th("closed", "Lost")}{th("progress", "Progress")}</>}
            {th("owner", "Owner")}
          </tr>
        </thead>
        <tbody>
          {rows.map((l) => {
            const st = stage(l);
            const overdue = l.due_date && l.due_date < today;
            return (
              <tr key={l.id}>
                <td className="leadtable__main">
                  <Link href={`/sales/leads/${l.id}`} className="stretched" scroll={false}>{leadTitle(l)}</Link>
                  <small>
                    {[l.hotel && l.contact, leadTitle(l) !== l.phone && l.phone].filter(Boolean).join(" · ") || (leadTitle(l) === l.phone ? "No name yet" : "No contact details")}
                    {l.last_note && <span className="leadtable__note"> — {short(l.last_note)}</span>}
                  </small>
                </td>
                <td>
                  {l.city ?? <span className="muted">–</span>}
                  {l.property_type && <small>{l.property_type}</small>}
                </td>
                <td className="leadtable__num">{l.rooms ?? <span className="muted">–</span>}</td>
                {view === "leads" && (
                  <>
                    <td><Progress lead={l} label={st.label} /></td>
                    <td className={overdue ? "neg" : l.due_date === today ? "due-today" : undefined}>
                      {l.due_date ? (overdue ? `Overdue · ${fmtDay(l.due_date)}` : l.due_date === today ? "Today" : fmtDay(l.due_date)) : <span className="muted">–</span>}
                    </td>
                    <td>{l.source ?? <span className="muted">–</span>}</td>
                    <td>{fmtDay(l.created_at.slice(0, 10))}</td>
                  </>
                )}
                {view === "customers" && (
                  <>
                    <td>{l.products.length ? l.products.map((p) => <span key={p} className="chip chip--small">{p}</span>) : <span className="muted">–</span>}</td>
                    <td>{l.monthly_value !== null ? `${money(l.monthly_value)}` : <span className="muted">–</span>}</td>
                    <td>{l.closed_at ? fmtDay(l.closed_at.slice(0, 10)) : "–"}</td>
                  </>
                )}
                {view === "archive" && (
                  <>
                    <td>{l.lost_reason ?? "–"}</td>
                    <td>{l.closed_at ? fmtDay(l.closed_at.slice(0, 10)) : "–"}</td>
                    <td><Progress lead={l} label={st.label} /></td>
                  </>
                )}
                <td>{l.owner_name ?? <span className="muted">–</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Four dots for the checklist, with the furthest step named. */
function Progress({ lead }: { lead: Lead; label?: string }) {
  const label = stage({ ...lead, status: "open" }).label;
  return (
    <span className="progress" title={(Object.keys(STEPS) as Step[]).map((s) => `${STEPS[s]}: ${lead[s] ? "yes" : "no"}`).join("\n")}>
      <span className="progress__dots" aria-hidden="true">
        {(Object.keys(STEPS) as Step[]).map((s) => <i key={s} className={lead[s] ? "on" : undefined} />)}
      </span>
      {label}
    </span>
  );
}
