import Link from "next/link";
import { leadTitle, stage, type Lead } from "@/lib/sales";
import { STEPS, type Step } from "@/lib/sales-fields";
import { money } from "@/lib/format";

const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const fmtDay = (d: string) => dayFmt.format(new Date(`${d}T00:00:00Z`));
const short = (s: string, n = 90) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** Leads, customers or archive rows; every row opens the lead (as a modal from Sales pages). */
export function LeadTable({ rows, view, today }: { rows: Lead[]; view: "leads" | "customers" | "archive"; today: string }) {
  if (!rows.length) return <p className="empty">{view === "leads" ? "No leads match." : view === "customers" ? "No customers yet." : "Nothing archived."}</p>;
  return (
    <div className="tablewrap">
      <table className="table leadtable">
        <thead>
          <tr>
            <th>Property</th>
            <th>Location</th>
            {view === "leads" && <><th>Progress</th><th>Follow-up</th><th>Source</th></>}
            {view === "customers" && <><th>Products</th><th>Monthly</th><th>Won</th></>}
            {view === "archive" && <><th>Reason</th><th>Lost</th><th>Progress</th></>}
            <th>Owner</th>
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
                  {l.rooms !== null && <small>{l.rooms} rooms{l.property_type ? ` · ${l.property_type}` : ""}</small>}
                </td>
                {view === "leads" && (
                  <>
                    <td><Progress lead={l} label={st.label} /></td>
                    <td className={overdue ? "neg" : l.due_date === today ? "due-today" : undefined}>
                      {l.due_date ? (overdue ? `Overdue · ${fmtDay(l.due_date)}` : l.due_date === today ? "Today" : fmtDay(l.due_date)) : <span className="muted">–</span>}
                    </td>
                    <td>{l.source ?? <span className="muted">–</span>}</td>
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
