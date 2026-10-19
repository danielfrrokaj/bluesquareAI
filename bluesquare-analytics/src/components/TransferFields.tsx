import { BASE_CURRENCY, type Account, type Rates, type Transaction } from "@/lib/finance";
import { accountLogoUrl } from "./AccountMark";
import { TransferInputs } from "./TransferInputs";

/**
 * Inputs for a transfer between two virtual accounts (new, or `tx` when editing one). With `balances` (EUR, by account),
 * each side shows its balance and what it becomes after the transfer.
 */
export function TransferFields({ accounts, currencies, tx, today, balances, rates }: {
  accounts: Account[];
  currencies: string[]; // those with a rate; EUR is always offered
  tx?: Transaction;
  today: string;
  balances?: Record<string, number>;
  rates?: Rates;
}) {
  // Keep an archived account selectable when the transfer already uses it.
  const options = accounts
    .filter((a) => !a.archived || a.id === tx?.account_id || a.id === tx?.to_account_id)
    .map((a) => ({ id: a.id, name: a.name, archived: a.archived, logo: accountLogoUrl(a.id, a.logo_version), balance: balances?.[a.id] ?? null }));
  return (
    <TransferInputs
      id={tx?.id}
      options={options}
      from={tx?.account_id ?? options[0]?.id ?? ""}
      to={tx?.to_account_id ?? options[1]?.id ?? ""}
      amount={tx ? String(tx.original_amount ?? tx.amount) : ""}
      currency={tx?.currency ?? BASE_CURRENCY}
      currencies={[...new Set([BASE_CURRENCY, ...currencies, ...(tx ? [tx.currency] : [])])]}
      base={BASE_CURRENCY}
      rates={rates ?? null}
      date={tx?.occurred_on ?? today}
      description={tx?.description ?? ""}
    />
  );
}
