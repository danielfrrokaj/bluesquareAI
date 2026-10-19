import { getRates, getRecurring, getTransaction, isSynced, listAccounts, listCategories, ruleOf } from "@/lib/finance";
import { query } from "@/lib/db";
import { invoiceDocumentUrl } from "@/lib/bluebill";
import { adForTransaction } from "@/lib/ads";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { listUsers, type User } from "@/lib/users";
import { monthLabel, today, TZ } from "@/lib/period";
import { money } from "@/lib/format";
import { cancel, confirm, removeTransaction, reopen, saveTransaction } from "@/app/finance/actions";
import { ActionForm } from "./ActionForm";
import { Modal } from "./Modal";
import { CopyButton } from "./CopyButton";
import { TransactionFields } from "./TransactionFields";
import { TransferFields } from "./TransferFields";
import { AccountMark } from "./AccountMark";
import { nth } from "./RecurringRules";

const longDate = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const reviewedOn = (iso: string) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: TZ() }).format(new Date(iso));

/** One transaction: summary card, details and fiscal data, with Edit/Delete for those allowed. Used as a page and as a modal. */
export async function TransactionDetail({ id, user }: { id: string; user: User }) {
  const tx = await getTransaction(id);
  if (!tx) return null;
  const admin = isAdmin(user);
  // Members can't change a transaction once an admin confirmed or cancelled it in the Register.
  const canEdit = admin || ((tx.created_by === user.id || tx.user_id === user.id) && tx.reviewed_at === null);
  // Only incomes and expenses entered here (or booked by a monthly rule) wait in the Register.
  const reviewable = tx.type !== "transfer" && (tx.source === "manual" || tx.source === "recurring");
  const synced = isSynced(tx.source);
  const fromAds = tx.source === "meta_ads";
  const booked = ruleOf(tx.external_id); // a month of a recurring rule
  const [accounts, categories, users, rates, invoice, ad, rule] = await Promise.all([
    listAccounts(true),
    listCategories(true),
    listUsers(),
    getRates(),
    synced && tx.external_id?.startsWith("bluebill:")
      ? query<{ number: string | null; iic: string | null; fic: string | null; verification_url: string | null }>(
          "select number, iic, fic, verification_url from bluebill_invoices where id = $1",
          [tx.external_id.slice("bluebill:".length)],
        ).then((r) => r[0] ?? null)
      : null,
    fromAds && tx.external_id ? adForTransaction(tx.external_id) : null,
    booked ? getRecurring(booked.id) : null,
  ]);
  const income = tx.type === "income";
  const transfer = tx.type === "transfer";
  const sign = transfer ? "" : income ? "+" : "−";

  return (
    <>
      <section className={`txhero ${transfer ? "txhero--transfer" : income ? "txhero--income" : "txhero--expense"}`}>
        <div className="txhero__main">
          <div className="txhero__badges">
            <span className="txhero__badge">{transfer ? "⇄ Transfer" : income ? "↓ Income" : "↑ Expense"}</span>
            {synced && <span className="txhero__badge">{fromAds ? "Meta Ads" : "✓ Fiscalized"}</span>}
            {booked && <span className="txhero__badge">↻ Monthly</span>}
            {tx.status === "pending" && <span className="txhero__badge">◷ Pending · with {tx.user_name ?? "nobody"}</span>}
            {tx.status === "cancelled" && <span className="txhero__badge">✕ Cancelled</span>}
            {tx.status === "confirmed" && tx.reviewed_at && <span className="txhero__badge">✓ Confirmed</span>}
          </div>
          <h1>{tx.description || "Transaction"}</h1>
          <p>
            {longDate.format(new Date(`${tx.occurred_on}T00:00:00Z`))}
            {tx.counterparty && <> · {tx.counterparty}</>}
          </p>
        </div>
        <div className="txhero__amount">
          <strong>
            {sign}
            {money(tx.amount)}
          </strong>
          {tx.original_amount !== null && (
            <small>
              {money(tx.original_amount, tx.currency)} · 1 EUR = {tx.fx_rate} {tx.currency}
            </small>
          )}
        </div>
        {canEdit && (
          <div className="txhero__actions">
            {admin && reviewable && tx.status === "pending" && (
              <form action={confirm}>
                <input type="hidden" name="id" value={tx.id} />
                <button className="btn btn--small btn--glass" title="The money was handed over: count it in the account's balance">Confirm</button>
              </form>
            )}
            {admin && reviewable && tx.status !== "cancelled" && (
              <form action={cancel}>
                <input type="hidden" name="id" value={tx.id} />
                <button className="btn btn--small btn--glass" title="It stays listed as cancelled but counts nowhere">Cancel transaction</button>
              </form>
            )}
            {admin && reviewable && tx.reviewed_at && (
              <form action={reopen}>
                <input type="hidden" name="id" value={tx.id} />
                <button className="btn btn--small btn--glass" title="Pending again, waiting in the Register">Back to pending</button>
              </form>
            )}
            <Modal trigger="Edit" title={transfer ? "Edit transfer" : "Edit transaction"} triggerClassName="btn btn--small btn--glass">
              {synced && (
                <p className="muted note-top">
                  {fromAds ? (
                    <>Amount and date come from the ad&apos;s results{ad && <> in <Link href={`/marketing/ads#ad-${ad.id}`}>{ad.name}</Link></>}; change them in Marketing &amp; Ads. You can change where it&apos;s booked.</>
                  ) : (
                    <>Amount, date and type come from the fiscalized invoice. You can change where it&apos;s booked.</>
                  )}
                </p>
              )}
              <ActionForm action={saveTransaction} submit="Save changes">
                {transfer ? (
                  <TransferFields accounts={accounts} currencies={Object.keys(rates)} tx={tx} today={today()} />
                ) : (
                  <TransactionFields
                    accounts={accounts} categories={categories} users={users} currencies={Object.keys(rates)} tx={tx} today={today()}
                    currentUserId={user.id} canPickUser={admin}
                  />
                )}
              </ActionForm>
            </Modal>
            {!synced && (
              <Modal trigger="Delete" title="Delete this transaction?" triggerClassName="btn btn--small btn--glass">
                <p className="muted">
                  “{tx.description}” ({sign}{money(tx.amount)}) will be removed{transfer ? ", and both account balances restored" : " from all reports"}. This can&apos;t be undone.
                </p>
                <ActionForm action={removeTransaction} submit="Delete transaction" pending="Deleting…" danger className="form form--row">
                  <input type="hidden" name="id" value={tx.id} />
                </ActionForm>
              </Modal>
            )}
          </div>
        )}
      </section>

      <ul className="tiles">
        {!transfer && <Tile label="Category" value={tx.category_name} empty="Uncategorised" />}
        <Tile
          label={transfer ? "From account" : "Virtual account"} value={tx.account_name} empty="No account"
          mark={tx.account_id && tx.account_name ? <AccountMark id={tx.account_id} name={tx.account_name} logo={tx.account_logo} size={24} /> : null}
        />
        {transfer && (
          <Tile
            label="To account" value={tx.to_account_name} empty="No account"
            mark={tx.to_account_id && tx.to_account_name ? <AccountMark id={tx.to_account_id} name={tx.to_account_name} logo={tx.to_account_logo} size={24} /> : null}
          />
        )}
        <Tile label="User" value={tx.user_name} empty={fromAds ? "Meta Ads" : synced ? "BlueBill" : "Nobody"} />
        {!transfer && <Tile label="Client / supplier" value={tx.counterparty} empty="–" />}
        <Tile label="Currency" value={tx.currency} empty="EUR" />
        <Tile label="Source" value={fromAds ? "Meta Ads (Marketing & Ads)" : synced ? "BlueBill sync" : booked ? "Recurring" : "Entered here"} empty="" />
        {!transfer && (
          <Tile
            label="Status" empty=""
            value={tx.status === "pending"
              ? `Pending: with ${tx.user_name ?? "nobody"}, not in the balance yet`
              : tx.reviewed_at
                ? `${tx.status === "cancelled" ? "Cancelled, counts nowhere" : "Confirmed"} · ${reviewedOn(tx.reviewed_at)}${tx.reviewed_by_name ? ` by ${tx.reviewed_by_name}` : ""}`
                : "Confirmed"}
          />
        )}
      </ul>

      {fromAds && (
        <section className="panel">
          <header className="panel__head">
            <div>
              <h2>Meta Ads</h2>
              <p className="muted panel__sub">
                {ad ? <>Spend of the ad “{ad.name}”.</> : <>Spend booked from Marketing &amp; Ads.</>} The amount and date follow its
                results; change or delete them there.
              </p>
            </div>
            {ad && <Link href={`/marketing/ads#ad-${ad.id}`} className="btn btn--small">Open the ad</Link>}
          </header>
        </section>
      )}

      {booked && (
        <section className="panel">
          <header className="panel__head">
            <div>
              <h2>Repeats every month</h2>
              <p className="muted panel__sub">
                {rule ? (
                  <>
                    {monthLabel(booked.month)}&apos;s booking of “{rule.description}”, on the {nth(rule.day)} of each month. Editing it here changes only this
                    month; edit the rule for the months after.
                  </>
                ) : (
                  <>{monthLabel(booked.month)}&apos;s booking of a monthly rule that has since been stopped.</>
                )}
              </p>
            </div>
            {rule && <Link href="/finance/transactions#recurring" className="btn btn--small">Edit the rule</Link>}
          </header>
        </section>
      )}

      {invoice && (
        <section className="panel fiscal">
          <header className="panel__head">
            <div className="fiscal__title">
              <span className="fiscal__icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </span>
              <div>
                <h2>Fiscalized invoice</h2>
                <p className="muted panel__sub">{invoice.number}</p>
              </div>
            </div>
            <span className="btnrow">
              <a href={invoiceDocumentUrl(tx.external_id!.slice("bluebill:".length))} target="_blank" rel="noopener noreferrer" className="btn btn--small">
                Open in BlueBill ↗
              </a>
              {invoice.verification_url && (
                <a href={invoice.verification_url} target="_blank" rel="noopener noreferrer" className="btn btn--small btn--primary">
                  Verify with the tax authority ↗
                </a>
              )}
            </span>
          </header>
          <dl className="codes">
            {([["IIC · NIVF", invoice.iic], ["FIC · NSLF", invoice.fic]] as const).map(([label, code]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>
                  <code>{code ?? "–"}</code>
                  {code && <CopyButton text={code} />}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </>
  );
}

function Tile({ label, value, empty, mark }: { label: string; value: string | null; empty: string; mark?: React.ReactNode }) {
  return (
    <li className="tile">
      <span>{label}</span>
      <strong className={value ? (mark ? "tile__withmark" : undefined) : "muted"}>{mark}{value ?? empty}</strong>
    </li>
  );
}
