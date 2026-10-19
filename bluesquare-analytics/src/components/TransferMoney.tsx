import { addTransfer } from "@/app/finance/actions";
import { getRates, listAccounts } from "@/lib/finance";
import { accountReport } from "@/lib/finance-reports";
import { parsePeriod, today } from "@/lib/period";
import { ActionForm } from "./ActionForm";
import { Modal } from "./Modal";
import { TransferFields } from "./TransferFields";

/** "Transfer" button: moves money between two virtual accounts. Hidden until there are two accounts. */
export async function TransferMoney() {
  const [accounts, rates, report] = await Promise.all([listAccounts(), getRates(), accountReport(parsePeriod({ period: "month" }))]);
  if (accounts.length < 2) return null;
  // All-time balances (the period only affects the report's income and expense columns).
  const balances = Object.fromEntries(report.map((a) => [a.id, a.balance]));
  return (
    <Modal trigger="Transfer" title="Transfer between accounts" triggerClassName="btn">
      <p className="muted">Moves money from one virtual account to another. It isn&apos;t counted as income or expense.</p>
      <ActionForm action={addTransfer} submit="Transfer">
        <TransferFields accounts={accounts} currencies={Object.keys(rates)} today={today()} balances={balances} rates={rates} />
      </ActionForm>
    </Modal>
  );
}
