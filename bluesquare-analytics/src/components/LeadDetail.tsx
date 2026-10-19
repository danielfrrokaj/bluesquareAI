import { isAdmin } from "@/lib/auth";
import { getLead, leadTitle, listNotes, stage, whatsappNumber } from "@/lib/sales";
import { LOST_REASONS, NOTE_KINDS, PRODUCTS, STEPS, type Step } from "@/lib/sales-fields";
import { avatarUrl, listUsers, type User } from "@/lib/users";
import { money } from "@/lib/format";
import { addLeadNote, loseLead, reopenLead, removeLead, removeNote, saveLead, toggleStep, winLead } from "@/app/sales/actions";
import { ActionForm } from "./ActionForm";
import { Modal } from "./Modal";
import { LeadFields } from "./LeadFields";
import { LogoMark } from "./AccountMark";

const when = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: process.env.REPORT_TIMEZONE || "Europe/Tirane" });
const dayFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

const KIND_ICON: Record<string, string> = { note: "✎", call: "☎", meeting: "◷", event: "•" };

/** One lead: contact actions, Win/Lost, checklist, details and the timeline. Used as a page and as a modal. */
export async function LeadDetail({ id, me, today }: { id: string; me: User; today: string }) {
  const lead = await getLead(id);
  if (!lead) return null;
  const [notes, users] = await Promise.all([listNotes(id), listUsers()]);
  const st = stage(lead);
  const wa = whatsappNumber(lead.phone);
  const overdue = lead.status === "open" && lead.due_date && lead.due_date < today;
  const details: [string, React.ReactNode][] = [
    ["Contact", lead.contact],
    ["Phone", lead.phone],
    ["Email", lead.email],
    ["City", lead.city],
    ["Rooms", lead.rooms],
    ["Property type", lead.property_type],
    ["Current system", lead.current_system],
    ["Source", lead.source],
    ["Owner", lead.owner_name],
    ["ID in old system", lead.ref],
    // Links, such as a website found by the lead API, open in a new tab.
    ...Object.entries(lead.extra).map(([k, v]): [string, React.ReactNode] => [
      k, /^https?:\/\/\S+$/.test(v) ? <a href={v} target="_blank" rel="noopener noreferrer">{v.replace(/^https?:\/\/(www\.)?/, "")}</a> : v,
    ]),
  ];

  return (
    <div className="lead">
      <section className={`leadhero leadhero--${lead.status}`}>
        <div className="leadhero__top">
          <div>
            <div className="txhero__badges">
              <span className="txhero__badge">{st.label}</span>
              {lead.status === "open" && lead.due_date && (
                <span className={`txhero__badge${overdue ? " leadhero__overdue" : ""}`}>
                  {overdue ? "Overdue · " : "Follow up "}{lead.due_date === today ? "today" : dayFmt.format(new Date(`${lead.due_date}T00:00:00Z`))}
                </span>
              )}
            </div>
            <h1>{leadTitle(lead)}</h1>
            <p>{[lead.hotel && lead.contact, lead.city, lead.rooms !== null && `${lead.rooms} rooms`].filter(Boolean).join(" · ") || "No details yet"}</p>
          </div>
          {lead.status === "won" && (
            <div className="txhero__amount">
              <strong>{lead.monthly_value !== null ? `${money(lead.monthly_value)}` : "Customer"}</strong>
              <small>{lead.monthly_value !== null ? "per month · " : ""}{lead.products.join(", ")}</small>
            </div>
          )}
        </div>
        <div className="leadhero__actions">
          {lead.phone && <a className="btn btn--small btn--glass" href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}>☎ Call</a>}
          {wa && <a className="btn btn--small btn--glass" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
          {lead.email && <a className="btn btn--small btn--glass" href={`mailto:${lead.email}`}>Email</a>}
          <span className="leadhero__spacer" />
          {lead.status === "open" ? (
            <>
              <Modal trigger="✓ Win" title={`Won ${leadTitle(lead)}`} triggerClassName="btn btn--small btn--win">
                <ActionForm action={winLead} submit="Mark as won" className="form">
                  <input type="hidden" name="id" value={lead.id} />
                  <fieldset className="checks">
                    <legend>What did they buy?</legend>
                    {PRODUCTS.map((p) => (
                      <label key={p} className="check"><input type="checkbox" name="products" value={p} defaultChecked={p === "PMS"} /> {p}</label>
                    ))}
                  </fieldset>
                  <label className="field"><span>Monthly value (€)</span><input name="monthly_value" inputMode="decimal" placeholder="Optional, e.g. 49" /></label>
                  <label className="field"><span>Note</span><textarea name="note" rows={2} maxLength={2000} placeholder="Optional: plan, go-live date, who signed…" /></label>
                </ActionForm>
              </Modal>
              <Modal trigger="✕ Lost" title={`Lost ${leadTitle(lead)}`} triggerClassName="btn btn--small btn--lose">
                <ActionForm action={loseLead} submit="Move to archive" className="form">
                  <input type="hidden" name="id" value={lead.id} />
                  <label className="field">
                    <span>Why?</span>
                    <select name="reason" required defaultValue="">
                      <option value="" disabled>Pick a reason</option>
                      {LOST_REASONS.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </label>
                  <label className="field"><span>Note</span><textarea name="note" rows={2} maxLength={2000} placeholder="Optional: which competitor, what price…" /></label>
                </ActionForm>
              </Modal>
            </>
          ) : (
            <Modal trigger="↺ Reopen" title={`Reopen ${leadTitle(lead)}?`} triggerClassName="btn btn--small btn--glass">
              <p className="muted">It moves back to Leads{lead.status === "won" ? " and leaves Customers" : ""}. The history stays.</p>
              <ActionForm action={reopenLead} submit="Reopen lead" className="form">
                <input type="hidden" name="id" value={lead.id} />
              </ActionForm>
            </Modal>
          )}
        </div>
      </section>

      <section className="panel">
        <header className="panel__head">
          <h2>Progress</h2>
          {lead.status === "lost" && <span>Lost: {lead.lost_reason}</span>}
        </header>
        <div className="steps">
          {(Object.keys(STEPS) as Step[]).map((s, i) => (
            <form key={s} action={toggleStep}>
              <input type="hidden" name="id" value={lead.id} />
              <input type="hidden" name="step" value={s} />
              <button className={`step${lead[s] ? " is-on" : ""}`} aria-pressed={lead[s]} title={lead[s] ? "Click to undo" : "Click to mark done"}>
                <span className="step__dot">{lead[s] ? "✓" : i + 1}</span>
                {STEPS[s]}
              </button>
            </form>
          ))}
        </div>
      </section>

      <div className="lead__cols">
        <section className="panel">
          <header className="panel__head">
            <h2>Activity</h2>
            <span>{notes.length} entries</span>
          </header>
          <ActionForm action={addLeadNote} submit="Add" className="form notebox">
            <input type="hidden" name="id" value={lead.id} />
            <textarea name="body" rows={3} maxLength={5000} placeholder="Leave a note: what was said, what's next…" required />
            <div className="notebox__row">
              <select name="kind" defaultValue="note" aria-label="Kind">
                {Object.entries(NOTE_KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              {lead.status === "open" && (
                <label className="notebox__due">Next follow-up <input type="date" name="due_date" min={today} /></label>
              )}
            </div>
          </ActionForm>
          <ol className="timeline">
            {notes.map((n) => (
              <li key={n.id} className={`timeline__item timeline__item--${n.kind}`}>
                {n.user_id && n.kind !== "event" ? (
                  <LogoMark src={avatarUrl({ id: n.user_id, avatar_version: n.user_avatar })} name={n.user_name ?? "?"} size={28} round />
                ) : (
                  <span className="timeline__icon" aria-hidden="true">{KIND_ICON[n.kind] ?? "•"}</span>
                )}
                <div>
                  <p className="timeline__meta">
                    <strong>{n.kind === "event" ? n.body : (n.user_name ?? "Someone")}</strong>
                    {n.kind !== "event" && n.kind !== "note" && <span className="tag">{NOTE_KINDS[n.kind as keyof typeof NOTE_KINDS] ?? n.kind}</span>}
                    <span className="muted"> · {when.format(new Date(n.created_at))}{n.kind === "event" && n.user_name ? ` · ${n.user_name}` : ""}</span>
                  </p>
                  {n.kind !== "event" && <p className="timeline__body">{n.body}</p>}
                </div>
                {isAdmin(me) && n.kind !== "event" && (
                  <form action={removeNote} className="timeline__del">
                    <input type="hidden" name="id" value={lead.id} />
                    <input type="hidden" name="note_id" value={n.id} />
                    <button aria-label="Delete note" title="Delete note">×</button>
                  </form>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section className="panel">
          <header className="panel__head">
            <h2>Details</h2>
            <Modal trigger="Edit" title={`Edit ${leadTitle(lead)}`} triggerClassName="btn btn--small">
              <ActionForm action={saveLead} submit="Save changes">
                <LeadFields lead={lead} users={users} meId={me.id} />
              </ActionForm>
              {isAdmin(me) && (
                <div className="danger">
                  <ActionForm action={removeLead} submit="Delete lead" pending="Deleting…" danger className="form form--row">
                    <input type="hidden" name="id" value={lead.id} />
                    <span className="muted">Deletes the lead and its notes for good. To keep history, mark it Lost instead.</span>
                  </ActionForm>
                </div>
              )}
            </Modal>
          </header>
          <dl className="leadfacts">
            {details.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd className={v === null || v === "" ? "muted" : undefined}>{v === null || v === "" ? "–" : v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
