import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { leadTitle, listLeads, whatsappNumber, type Lead } from "@/lib/sales";
import { STEPS, type Step } from "@/lib/sales-fields";
import { today as todayFn } from "@/lib/period";
import { Shell } from "@/components/Shell";
import { salesNav } from "@/components/nav";
import { snoozeFollowUp } from "../actions";
import s from "./followups.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Follow-ups" };

// Generated from open leads with a due date: nothing to enter here. Logging a call on the lead
// (or changing its due date) moves the card; won or lost leads drop off.

type Urgency = "overdue" | "today" | "soon" | "later";

const daysBetween = (from: string, to: string) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
const urgency = (days: number): Urgency => (days < 0 ? "overdue" : days === 0 ? "today" : days <= 3 ? "soon" : "later");
const when = (days: number) =>
  days < -1 ? `${-days} days overdue` : days === -1 ? "1 day overdue" : days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`;
const longDate = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

const GROUPS: { key: Urgency; title: string }[] = [
  { key: "overdue", title: "Overdue" },
  { key: "today", title: "Today" },
  { key: "soon", title: "Next 3 days" },
  { key: "later", title: "Later" },
];

export default async function FollowupsPage({ searchParams }: { searchParams: Promise<{ who?: string }> }) {
  const user = await requireAuth();
  const mine = (await searchParams).who === "me";
  const today = todayFn();
  const leads = (await listLeads({ status: "open", sort: "followup", owner: mine ? user.id : undefined }, today, 1000)).filter((l) => l.due_date);
  const items = leads.map((l) => ({ lead: l, days: daysBetween(today, l.due_date!) }));
  const overdue = items.filter((i) => i.days < 0).length;
  const dueToday = items.filter((i) => i.days === 0).length;

  return (
    <Shell department="sales" subnav={salesNav("followups")}>
      <div className={s.page}>
        <div className="pagehead">
          <div>
            <h1>Follow-ups</h1>
            <p className="muted">
              {items.length} open leads with a follow-up date
              {overdue > 0 && <> · <span className={s.late}>{overdue} overdue</span></>}
              {dueToday > 0 && <> · {dueToday} today</>}
            </p>
          </div>
          <Link href={mine ? "/sales/follow-ups" : "/sales/follow-ups?who=me"} className={`${s.filterchip}${mine ? ` ${s.on}` : ""}`}>
            My follow-ups
          </Link>
        </div>

        <ul className={s.legend} aria-label="Colour key">
          <li className={s.fu_overdue}>Overdue</li>
          <li className={s.fu_today}>Today</li>
          <li className={s.fu_soon}>Within 3 days</li>
          <li className={s.fu_later}>Later</li>
        </ul>

        {items.length === 0 && (
          <p className="empty empty--big">
            Nothing to follow up. Leads appear here when they have a due date: set one on a lead, or when you log a call.
          </p>
        )}

        {items.length > 0 && (
          <div className={s.columns}>
            {GROUPS.map((g) => {
              const list = items.filter((i) => urgency(i.days) === g.key);
              return (
                <section key={g.key} className={`${s.fugroup} ${s[`fu_${g.key}`]}`}>
                  <h2>{g.title} <span>{list.length}</span></h2>
                  {list.length === 0 ? (
                    <p className={s.none}>None</p>
                  ) : (
                    <ul className={s.fucards}>
                      {list.map(({ lead, days }) => <Card key={lead.id} lead={lead} days={days} />)}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}

function Card({ lead: l, days }: { lead: Lead; days: number }) {
  const wa = whatsappNumber(l.phone);
  const tel = l.phone?.replace(/[^\d+]/g, "");
  return (
    <li className={`${s.fucard} ${s[`fu_${urgency(days)}`]}`}>
      <div className={s.futop}>
        <span className={s.fuwhen}>{when(days)}</span>
        <span className={s.fudate}>{longDate(l.due_date!)}</span>
      </div>
      <strong className={s.funame}>
        <Link href={`/sales/leads/${l.id}`} scroll={false}>{leadTitle(l)}</Link>
      </strong>
      {l.contact && l.hotel && <span className={s.fucontact}>{l.contact}</span>}
      {tel ? <a href={`tel:${tel}`} className={s.fuphone}>{l.phone}</a> : <span className={s.fuphone}>No phone</span>}
      <span className={s.steps}>
        {(Object.keys(STEPS) as Step[]).map((k) => <span key={k} className={`${s.step}${l[k] ? ` ${s["step--on"]}` : ""}`}>{STEPS[k]}</span>)}
      </span>
      {l.last_note && <p className={s.funote}>“{l.last_note.length > 140 ? `${l.last_note.slice(0, 140)}…` : l.last_note}”</p>}
      <div className={s.fumeta}>
        {l.city && <span>{l.city}</span>}
        {l.rooms !== null && <span>{l.rooms} rooms</span>}
        {l.owner_name && <span className={s.cardproject}>{l.owner_name}</span>}
      </div>
      <div className={s.fuactions}>
        {tel && <a href={`tel:${tel}`} className="btn btn--small btn--primary">Call</a>}
        {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="btn btn--small">WhatsApp</a>}
        <Link href={`/sales/leads/${l.id}`} scroll={false} className="btn btn--small">Log call</Link>
      </div>
      <div className={s.snooze}>
        Snooze
        {[[1, "+1 day"], [3, "+3 days"], [7, "+1 week"]].map(([d, label]) => (
          <form key={d} action={snoozeFollowUp}>
            <input type="hidden" name="id" value={l.id} />
            <input type="hidden" name="days" value={d} />
            <button title={`Follow up ${label} from today`}>{label}</button>
          </form>
        ))}
      </div>
    </li>
  );
}
