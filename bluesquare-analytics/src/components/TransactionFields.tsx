import { BASE_CURRENCY, type Account, type Category, type Transaction } from "@/lib/finance";
import type { User } from "@/lib/users";

/** Inputs for a transaction form. Synced (BlueBill) transactions only show the booking: account, category, user. */
export function TransactionFields({
  accounts, categories, users, currencies, tx, today, currentUserId, canPickUser,
}: {
  accounts: Account[];
  categories: Category[];
  users: User[];
  currencies: string[]; // those with a rate; EUR is always offered
  tx?: Transaction;
  today: string;
  currentUserId: string;
  canPickUser: boolean;
}) {
  const locked = tx ? tx.source !== "manual" : false;
  // Keep an archived account/category selectable when the transaction already uses it.
  const accountOptions = accounts.filter((a) => !a.archived || a.id === tx?.account_id);
  const categoryOptions = categories.filter((c) => !c.archived || c.id === tx?.category_id);
  const group = (kind: "income" | "expense") => categoryOptions.filter((c) => c.kind === kind && (!locked || c.kind === tx?.type));
  return (
    <div className="formgrid">
      {tx && <input type="hidden" name="id" value={tx.id} />}
      {!locked && (
        <label className="field">
          <span>Type</span>
          <select name="type" defaultValue={tx?.type ?? "expense"}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
      )}
      {!locked && (
        <label className="field">
          <span>Amount</span>
          <input name="amount" inputMode="decimal" placeholder="1200" defaultValue={tx ? (tx.original_amount ?? tx.amount) : ""} required />
        </label>
      )}
      {!locked && (
        <label className="field">
          <span>Currency</span>
          <select name="currency" defaultValue={tx?.currency ?? BASE_CURRENCY}>
            {[...new Set([BASE_CURRENCY, ...currencies, ...(tx ? [tx.currency] : [])])].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      )}
      {!locked && (
        <label className="field">
          <span>Date</span>
          <input type="date" name="occurred_on" defaultValue={tx?.occurred_on ?? today} required />
        </label>
      )}
      {!locked && (
        <label className="field">
          <span>Client / supplier</span>
          <input name="counterparty" maxLength={120} placeholder="Optional" defaultValue={tx?.counterparty ?? ""} />
        </label>
      )}
      {!locked && (
        <label className="field field--wide">
          <span>Description</span>
          <input name="description" maxLength={300} placeholder="Office rent October" defaultValue={tx?.description ?? ""} required />
        </label>
      )}
      <label className="field">
        <span>Virtual account</span>
        <select name="account_id" defaultValue={tx?.account_id ?? accountOptions[0]?.id ?? ""}>
          <option value="">No account</option>
          {accountOptions.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
              {a.archived ? " (archived)" : ""}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Category</span>
        <select name="category_id" defaultValue={tx?.category_id ?? ""}>
          <option value="">Uncategorised</option>
          {(["expense", "income"] as const).map((kind) =>
            group(kind).length ? (
              <optgroup key={kind} label={kind === "expense" ? "Expense categories" : "Income categories"}>
                {group(kind).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            ) : null,
          )}
        </select>
      </label>
      {canPickUser && (
        <label className="field">
          <span>User</span>
          <select name="user_id" defaultValue={tx ? (tx.user_id ?? "") : currentUserId}>
            <option value="">Nobody</option>
            {users.filter((u) => u.active || u.id === tx?.user_id).map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
