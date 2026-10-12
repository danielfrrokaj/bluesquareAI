import { getRates, getTransaction, listAccounts, listCategories } from "@/lib/finance";
import { query } from "@/lib/db";
import { invoiceDocumentUrl } from "@/lib/bluebill";
import { isAdmin } from "@/lib/auth";
import { listUsers, type User } from "@/lib/users";
import { today } from "@/lib/period";
import { money } from "@/lib/format";
import { removeTransaction, saveTransaction } from "@/app/finance/actions";
import { ActionForm } from "./ActionForm";
import { Modal } from "./Modal";
import { CopyButton } from "./CopyButton";
import { TransactionFields } from "./TransactionFields";
import { AccountMark } from "./AccountMark";

const longDate = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** One transaction: summary card, details and fiscal data, with Edit/Delete for those allowed. Used as a page and as a modal. */
export async function TransactionDetail({ id, user }: { id: string; user: User }) {
  const tx = await getTransaction(id);
  if (!tx) return null;
  const admin = isAdmin(user);
  const canEdit = admin || tx.created_by === user.id || tx.user_id === user.id;
  const synced = tx.source !== "manual";
  const [accounts, categories, users, rates, invoice] = await Promise.all([
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
  ]);
  const income = tx.type === "income";

  return (
    <>
      <section className={`txhero ${income ? "txhero--income" : "txhero--expense"}`}>
        <div className="txhero__main">
          <div className="txhero__badges">
            <span className="txhero__badge">{income ? "↓ Income" : "↑ Expense"}</span>
            {synced && <span className="txhero__badge">✓ Fiscalized</span>}
          </div>
          <h1>{tx.description || "Transaction"}</h1>
          <p>
            {longDate.format(new Date(`${tx.occurred_on}T00:00:00Z`))}
            {tx.counterparty && <> · {tx.counterparty}</>}
          </p>
        </div>
        <div className="txhero__amount">
          <strong>
            {income ? "+" : "−"}
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
            <Modal trigger="Edit" title="Edit transaction" triggerClassName="btn btn--small btn--glass">
              {synced && <p className="muted note-top">Amount, date and type come from the fiscalized invoice. You can change where it&apos;s booked.</p>}
              <ActionForm action={saveTransaction} submit="Save changes">
                <TransactionFields
                  accounts={accounts} categories={categories} users={users} currencies={Object.keys(rates)} tx={tx} today={today()}
                  currentUserId={user.id} canPickUser={admin}
                />
              </ActionForm>
            </Modal>
            {!synced && (
              <Modal trigger="Delete" title="Delete this transaction?" triggerClassName="btn btn--small btn--glass">
                <p className="muted">
                  “{tx.description}” ({income ? "+" : "−"}{money(tx.amount)}) will be removed from all reports. This can&apos;t be undone.
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
        <Tile label="Category" value={tx.category_name} empty="Uncategorised" />
        <Tile
          label="Virtual account" value={tx.account_name} empty="No account"
          mark={tx.account_id && tx.account_name ? <AccountMark id={tx.account_id} name={tx.account_name} logo={tx.account_logo} size={24} /> : null}
        />
        <Tile label="User" value={tx.user_name} empty={synced ? "BlueBill" : "Nobody"} />
        <Tile label="Client / supplier" value={tx.counterparty} empty="–" />
        <Tile label="Currency" value={tx.currency} empty="EUR" />
        <Tile label="Source" value={synced ? "BlueBill sync" : "Entered here"} empty="" />
      </ul>

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
