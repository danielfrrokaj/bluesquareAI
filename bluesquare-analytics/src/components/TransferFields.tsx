import { BASE_CURRENCY, type Account, type Transaction } from "@/lib/finance";

/** Inputs for a transfer between two virtual accounts (new, or `tx` when editing one). */
export function TransferFields({ accounts, currencies, tx, today }: {
  accounts: Account[];
  currencies: string[]; // those with a rate; EUR is always offered
  tx?: Transaction;
  today: string;
}) {
  // Keep an archived account selectable when the transfer already uses it.
  const options = accounts.filter((a) => !a.archived || a.id === tx?.account_id || a.id === tx?.to_account_id);
  const select = (name: string, label: string, value: string) => (
    <label className="field">
      <span>{label}</span>
      <select name={name} defaultValue={value} required>
        {options.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
            {a.archived ? " (archived)" : ""}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <div className="formgrid">
      {tx && <input type="hidden" name="id" value={tx.id} />}
      {select("account_id", "From account", tx?.account_id ?? options[0]?.id ?? "")}
      {select("to_account_id", "To account", tx?.to_account_id ?? options[1]?.id ?? "")}
      <label className="field">
        <span>Amount</span>
        <input name="amount" inputMode="decimal" placeholder="1200" defaultValue={tx ? (tx.original_amount ?? tx.amount) : ""} required />
      </label>
      <label className="field">
        <span>Currency</span>
        <select name="currency" defaultValue={tx?.currency ?? BASE_CURRENCY}>
          {[...new Set([BASE_CURRENCY, ...currencies, ...(tx ? [tx.currency] : [])])].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Date</span>
        <input type="date" name="occurred_on" defaultValue={tx?.occurred_on ?? today} required />
      </label>
      <label className="field field--wide">
        <span>Description</span>
        <input name="description" maxLength={300} placeholder="Optional, e.g. Cash deposited at the bank" defaultValue={tx?.description ?? ""} />
      </label>
    </div>
  );
}
