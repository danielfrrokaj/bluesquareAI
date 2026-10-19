import { getRates, listAccounts, listCategories, listRecurring, ruleEnded } from "@/lib/finance";
import { removeRecurring, saveRecurring } from "@/app/finance/actions";
import { isAdmin } from "@/lib/auth";
import { listUsers, type User } from "@/lib/users";
import { dayOfMonth, monthLabel, today } from "@/lib/period";
import { money } from "@/lib/format";
import { ActionForm } from "./ActionForm";
import { Modal } from "./Modal";
import { TransactionFields } from "./TransactionFields";

const ordinals = new Intl.PluralRules("en-US", { type: "ordinal" });
const suffixes: Record<string, string> = { one: "st", two: "nd", few: "rd", other: "th" };
/** 1 -> "1st", 22 -> "22nd", 31 -> "31st" */
export const nth = (n: number) => `${n}${suffixes[ordinals.select(n)]}`;

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** Monthly rules and when each books next, with Edit (for the months after) and Stop for those allowed. */
export async function RecurringRules({ user }: { user: User }) {
  const admin = isAdmin(user);
  const [rules, accounts, categories, users, rates] = await Promise.all([
    listRecurring(), listAccounts(true), listCategories(true), admin ? listUsers() : [], getRates(),
  ]);
  return (
    <section className="panel" id="recurring">
      <header className="panel__head">
        <div>
          <h2>Recurring</h2>
          <p className="muted panel__sub">
            Each is booked as a transaction when its day of the month comes. Edit a booked month in the list above; changes here apply to the months after.
          </p>
        </div>
      </header>
      {rules.length === 0 ? (
        <p className="empty">Nothing repeats yet. Tick “Repeat every month” when adding a transaction.</p>
      ) : (
        <ul className="acclist">
          {rules.map((r) => {
            const ended = ruleEnded(r);
            const next = dayOfMonth(r.next_month, r.day);
            const income = r.type === "income";
            return (
              <li key={r.id} className={ended ? "is-archived" : undefined}>
                <div className="acclist__main">
                  <strong>
                    {r.description}
                    {ended && <span className="tag tag--muted">Ended</span>}
                  </strong>
                  <small className="muted">
                    {income ? "Income" : "Expense"} on the {nth(r.day)}{r.day > 28 && " (or the month's last day)"}
                    {r.category_name && <> · {r.category_name}</>}
                    {r.account_name && <> · {r.account_name}</>}
                    {" · "}
                    {ended
                      ? `last booked ${monthLabel(r.end_month!)}`
                      : `next ${dateFmt.format(new Date(`${next}T00:00:00Z`))}${r.end_month ? `, until ${monthLabel(r.end_month)}` : ""}`}
                  </small>
                </div>
                <span className="acclist__value">
                  {income ? "+" : "−"}
                  {money(r.amount, r.currency)}
                </span>
                {(admin || r.created_by === user.id || r.user_id === user.id) && (
                  <Modal trigger="Edit" title="Edit recurring transaction" triggerClassName="btn btn--small">
                    <p className="muted note-top">
                      {ended
                        ? "It has ended. Set a later last month to start it again from this month."
                        : `Changes apply from ${monthLabel(r.next_month)}. Months already booked keep their amounts; edit those in the list.`}
                    </p>
                    <ActionForm action={saveRecurring} submit="Save changes">
                      <TransactionFields
                        accounts={accounts} categories={categories} users={users} currencies={Object.keys(rates)} today={today()}
                        currentUserId={user.id} canPickUser={admin}
                        tx={{
                          id: r.id, source: "recurring", type: r.type, amount: r.amount, original_amount: null, currency: r.currency, occurred_on: next,
                          counterparty: r.counterparty, description: r.description, account_id: r.account_id, category_id: r.category_id, user_id: r.user_id,
                        }}
                        when={
                          <>
                            <label className="field">
                              <span>Day of the month</span>
                              <input type="number" name="day" min={1} max={31} defaultValue={r.day} required />
                            </label>
                            <label className="field">
                              <span>Last month (optional)</span>
                              <input type="month" name="until" placeholder="YYYY-MM" defaultValue={r.end_month ?? ""} />
                            </label>
                          </>
                        }
                      />
                    </ActionForm>
                    <div className="danger">
                      <ActionForm action={removeRecurring} submit="Stop repeating" pending="Stopping…" danger className="form form--row">
                        <input type="hidden" name="id" value={r.id} />
                        <span className="muted">Months already booked stay.</span>
                      </ActionForm>
                    </div>
                  </Modal>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
