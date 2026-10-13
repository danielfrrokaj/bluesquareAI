import { addTransfer } from "@/app/finance/actions";
import { getRates, listAccounts } from "@/lib/finance";
import { today } from "@/lib/period";
import { ActionForm } from "./ActionForm";
import { Modal } from "./Modal";
import { TransferFields } from "./TransferFields";

/** "Transfer" button: moves money between two virtual accounts. Hidden until there are two accounts. */
export async function TransferMoney() {
  const [accounts, rates] = await Promise.all([listAccounts(), getRates()]);
  if (accounts.length < 2) return null;
  return (
    <Modal trigger="Transfer" title="Transfer between accounts" triggerClassName="btn">
      <p className="muted">Moves money from one virtual account to another. It isn&apos;t counted as income or expense.</p>
      <ActionForm action={addTransfer} submit="Transfer">
        <TransferFields accounts={accounts} currencies={Object.keys(rates)} today={today()} />
      </ActionForm>
    </Modal>
  );
}
