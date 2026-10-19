import { requireRole } from "@/lib/auth";
import { ACCOUNT_GROUPS, BASE_CURRENCY, bookRecurring, currencyUsage, getRates, listAccounts, listCategories, type AccountGroup, type Category } from "@/lib/finance";
import { accountReport } from "@/lib/finance-reports";
import { getBlueBill } from "@/lib/bluebill";
import { parsePeriod } from "@/lib/period";
import { money } from "@/lib/format";
import {
  addAccount, addCategory, connectBlueBill, disconnectBlueBill, removeAccount, removeCategory, removeRate, saveAccount, saveBlueBillAccount,
  saveCategory, saveRate, syncBlueBill, toggleBlueBill,
} from "../actions";
import { Shell } from "@/components/Shell";
import { financeNav } from "@/components/nav";
import { ActionForm } from "@/components/ActionForm";
import { Modal } from "@/components/Modal";
import { LogoField } from "@/components/LogoField";
import { AccountMark } from "@/components/AccountMark";

export const dynamic = "force-dynamic";
export const metadata = { title: "Finance settings" };

const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-GB", { timeZone: process.env.REPORT_TIMEZONE || "Europe/Tirane", dateStyle: "medium", timeStyle: "short" }) : "never";

export default async function FinanceSettings() {
  const user = await requireRole("admin");
  // Months of recurring rules whose day has come are booked before anything is read.
  await bookRecurring();
  const [accounts, balances, categories, bb, rates, usage] = await Promise.all([
    listAccounts(true), accountReport(parsePeriod({ period: "month" })), listCategories(true), getBlueBill(), getRates(), currencyUsage(),
  ]);
  const used = new Map(usage.map((u) => [u.currency, u.count]));
  const balance = new Map(balances.map((b) => [b.id, b.balance]));
  const active = accounts.filter((a) => !a.archived);

  return (
    <Shell department="finance" subnav={financeNav("settings", user)}>
      <div className="pagehead">
        <div>
          <h1>Finance settings</h1>
          <p className="muted">Virtual accounts, categories, currency rates and fiscalization. Only admins can see this page.</p>
        </div>
      </div>

      {/* ---------- Virtual accounts ---------- */}
      <section className="panel" id="accounts">
        <header className="panel__head">
          <div>
            <h2>Virtual accounts</h2>
            <p className="muted panel__sub">Pots of money you track separately, e.g. bank, cash register, savings</p>
          </div>
          <Modal trigger="New account" title="New virtual account" triggerClassName="btn btn--primary btn--small">
            <ActionForm action={addAccount} submit="Create account" className="form">
              <LogoField />
              <label className="field"><span>Name</span><input name="name" required maxLength={80} placeholder="Raiffeisen business" /></label>
              <label className="field"><span>Description</span><input name="description" maxLength={200} placeholder="Optional" /></label>
              <label className="field"><span>Opening balance</span><input name="opening_balance" inputMode="decimal" placeholder="0" /></label>
              <GroupSelect value="own" />
            </ActionForm>
          </Modal>
        </header>
        {accounts.length > 0 && (
          <ul className="acclist">
            {accounts.map((a) => (
              <li key={a.id} className={a.archived ? "is-archived" : undefined}>
                <AccountMark id={a.id} name={a.name} logo={a.logo_version} size={40} />
                <div className="acclist__main">
                  <strong>
                    {a.name}
                    {a.archived && <span className="tag tag--muted">Archived</span>}
                  </strong>
                  <small className="muted">{a.description || "No description"}</small>
                </div>
                <span className="acclist__value">{money(balance.get(a.id) ?? a.opening_balance)}</span>
                <Modal trigger="Edit" title={`Edit ${a.name}`} triggerClassName="btn btn--small">
                  <ActionForm action={saveAccount} submit="Save changes" className="form">
                    <input type="hidden" name="id" value={a.id} />
                    <LogoField current={a.logo_version !== null ? `/api/finance/accounts/${a.id}/logo?v=${a.logo_version}` : null} name={a.name} />
                    <label className="field"><span>Name</span><input name="name" defaultValue={a.name} required maxLength={80} /></label>
                    <label className="field"><span>Description</span><input name="description" defaultValue={a.description ?? ""} maxLength={200} /></label>
                    <label className="field"><span>Opening balance</span><input name="opening_balance" inputMode="decimal" defaultValue={a.opening_balance} /></label>
                    <GroupSelect value={a.account_group} />
                    <label className="check"><input type="checkbox" name="archived" defaultChecked={a.archived} /> Archived (hidden from new transactions)</label>
                  </ActionForm>
                  <div className="danger">
                    <ActionForm action={removeAccount} submit="Delete account" pending="Deleting…" danger className="form form--row">
                      <input type="hidden" name="id" value={a.id} />
                      <span className="muted">Accounts with transactions are archived instead of deleted.</span>
                    </ActionForm>
                  </div>
                </Modal>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---------- Categories ---------- */}
      <section className="panel" id="categories">
        <header className="panel__head">
          <div>
            <h2>Categories</h2>
            <p className="muted panel__sub">Expense categories can have a monthly budget, used by the forecast</p>
          </div>
          <Modal trigger="New category" title="New category" triggerClassName="btn btn--primary btn--small">
            <ActionForm action={addCategory} submit="Create category" className="form">
              <label className="field"><span>Name</span><input name="name" required maxLength={80} placeholder="Rent" /></label>
              <label className="field">
                <span>Type</span>
                <select name="kind" defaultValue="expense">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>
              <label className="field"><span>Monthly budget (expenses)</span><input name="monthly_budget" inputMode="decimal" placeholder="Optional" /></label>
            </ActionForm>
          </Modal>
        </header>
        <div className="cols">
          <CategoryList title="Expense categories" rows={categories.filter((c) => c.kind === "expense")} />
          <CategoryList title="Income categories" rows={categories.filter((c) => c.kind === "income")} />
        </div>
      </section>

      {/* ---------- Currency rates ---------- */}
      <section className="panel" id="currencies">
        <header className="panel__head">
          <div>
            <h2>Currency rates</h2>
            <p className="muted panel__sub">
              Everything is reported in {BASE_CURRENCY}. Amounts in other currencies, such as BlueBill invoices in ALL, are converted with these rates.
            </p>
          </div>
          <Modal trigger="Add currency" title="Add a currency" triggerClassName="btn btn--primary btn--small">
            <ActionForm action={saveRate} submit="Add currency" className="form">
              <label className="field"><span>Currency code</span><input name="currency" required maxLength={3} placeholder="USD" autoComplete="off" /></label>
              <label className="field"><span>Units per 1 {BASE_CURRENCY}</span><input name="rate" inputMode="decimal" required placeholder="1.12" /></label>
            </ActionForm>
          </Modal>
        </header>
        {Object.keys(rates).length === 0 ? (
          <p className="empty">No currencies yet: everything is entered in {BASE_CURRENCY}.</p>
        ) : (
          <ul className="editlist">
            {Object.entries(rates).sort(([a], [b]) => a.localeCompare(b)).map(([code, value]) => (
              <li key={code}>
                <details>
                  <summary>
                    <strong>{code}</strong>
                    <span className="muted">{used.get(code) ? `${used.get(code)} transactions` : "Not used yet"}</span>
                    <span className="editlist__value">1 {BASE_CURRENCY} = {value} {code}</span>
                  </summary>
                  <ActionForm action={saveRate} submit="Save rate" className="form form--grid">
                    <input type="hidden" name="currency" value={code} />
                    <label className="field"><span>{code} per 1 {BASE_CURRENCY}</span><input name="rate" inputMode="decimal" defaultValue={value} required /></label>
                    <label className="check">
                      <input type="checkbox" name="recalculate" /> Also recalculate the {used.get(code) ?? 0} existing {code} transactions at this rate
                    </label>
                  </ActionForm>
                  <p className="muted note">
                    Without recalculating, the new rate applies only to transactions and invoices recorded from now on; past ones keep the rate they were booked at.
                  </p>
                  {!used.get(code) && (
                    <ActionForm action={removeRate} submit="Remove currency" pending="Removing…" danger className="form form--row">
                      <input type="hidden" name="currency" value={code} />
                    </ActionForm>
                  )}
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---------- Fiscalization ---------- */}
      <section className="panel" id="fiscalization">
        <header className="panel__head">
          <h2>Fiscalization · BlueBill</h2>
          <span className={bb.active ? "live" : "muted"}>{bb.active ? "Active" : bb.token ? "Paused" : "Not connected"}</span>
        </header>
        <p className="muted">
          Fiscalized invoices are imported from BlueBill and booked as income, converted to {BASE_CURRENCY} with the rate above. Each invoice goes to the income category matching its
          BlueBill category (created if missing). Only fiscalized invoices are imported, never drafts.
        </p>

        {!bb.token ? (
          <ActionForm action={connectBlueBill} submit="Activate connection" pending="Connecting…" className="form form--grid">
            <label className="field field--wide">
              <span>Service token</span>
              <input name="token" type="password" autoComplete="off" required placeholder="Paste the token from BlueBill → API" />
            </label>
            <AccountSelect accounts={active} value={bb.accountId ?? active[0]?.id ?? ""} />
          </ActionForm>
        ) : (
          <>
            <dl className="facts">
              <div><dt>Token</dt><dd><code>••••{bb.tokenHint}</code></dd></div>
              <div><dt>Connected</dt><dd>{when(bb.connectedAt)}</dd></div>
              <div><dt>Last sync</dt><dd>{when(bb.lastSyncAt)}{bb.lastSyncAt && !bb.lastSyncError && ` · ${bb.lastSyncNew} new`}</dd></div>
            </dl>
            {bb.lastSyncError && <p className="form__error" role="alert">Last sync failed: {bb.lastSyncError}</p>}
            <div className="btnrow">
              {bb.active && (
                <>
                  <ActionForm action={syncBlueBill} submit="Sync now" pending="Syncing…" className="form form--row" />
                  <ActionForm action={syncBlueBill} submit="Full resync" pending="Syncing…" className="form form--row form--secondary">
                    <input type="hidden" name="full" value="1" />
                  </ActionForm>
                </>
              )}
              <ActionForm action={toggleBlueBill} submit={bb.active ? "Pause connection" : "Activate connection"} pending="…" className="form form--row form--secondary">
                <input type="hidden" name="active" value={bb.active ? "0" : "1"} />
              </ActionForm>
            </div>
            <ActionForm action={saveBlueBillAccount} submit="Save" className="form form--grid">
              <AccountSelect accounts={active} value={bb.accountId ?? ""} />
            </ActionForm>
            <p className="muted note">New invoices are pulled automatically every 15 minutes while someone uses Finance, and on demand with Sync now.</p>
            <details className="danger">
              <summary>Replace or remove the token</summary>
              <ActionForm action={connectBlueBill} submit="Replace token" pending="Connecting…" className="form form--grid">
                <label className="field field--wide">
                  <span>New service token</span>
                  <input name="token" type="password" autoComplete="off" required />
                </label>
                <input type="hidden" name="account_id" value={bb.accountId ?? ""} />
              </ActionForm>
              <ActionForm action={disconnectBlueBill} submit="Disconnect" pending="…" danger className="form form--grid">
                <label className="field">
                  <span>Type DISCONNECT to remove the token</span>
                  <input name="confirm" autoComplete="off" />
                </label>
              </ActionForm>
            </details>
          </>
        )}
      </section>
    </Shell>
  );
}

function AccountSelect({ accounts, value }: { accounts: { id: string; name: string }[]; value: string }) {
  return (
    <label className="field">
      <span>Book invoices to</span>
      <select name="account_id" defaultValue={value}>
        <option value="">No account</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>
    </label>
  );
}

function CategoryList({ title, rows }: { title: string; rows: Category[] }) {
  return (
    <div>
      <h3>{title}</h3>
      {rows.length === 0 ? (
        <p className="empty">None yet.</p>
      ) : (
        <ul className="editlist">
          {rows.map((c) => (
            <li key={c.id} className={c.archived ? "is-archived" : undefined}>
              <details>
                <summary>
                  <strong>{c.name}</strong>
                  {c.archived && <span className="tag tag--muted">Archived</span>}
                  {c.monthly_budget !== null && <span className="editlist__value">{money(c.monthly_budget)}/mo</span>}
                </summary>
                <ActionForm action={saveCategory} submit="Save" className="form form--grid">
                  <input type="hidden" name="id" value={c.id} />
                  <label className="field"><span>Name</span><input name="name" defaultValue={c.name} required maxLength={80} /></label>
                  {c.kind === "expense" && (
                    <label className="field"><span>Monthly budget</span><input name="monthly_budget" inputMode="decimal" defaultValue={c.monthly_budget ?? ""} placeholder="None" /></label>
                  )}
                  <label className="check"><input type="checkbox" name="archived" defaultChecked={c.archived} /> Archived</label>
                </ActionForm>
                <ActionForm action={removeCategory} submit="Delete category" pending="Deleting…" danger className="form form--row">
                  <input type="hidden" name="id" value={c.id} />
                  <span className="muted">Categories with transactions are archived instead.</span>
                </ActionForm>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GroupSelect({ value }: { value: AccountGroup }) {
  return (
    <label className="field">
      <span>Group</span>
      <select name="group" defaultValue={value}>
        {(Object.keys(ACCOUNT_GROUPS) as AccountGroup[]).map((g) => (
          <option key={g} value={g}>{ACCOUNT_GROUPS[g].label} · {ACCOUNT_GROUPS[g].hint}</option>
        ))}
      </select>
    </label>
  );
}
