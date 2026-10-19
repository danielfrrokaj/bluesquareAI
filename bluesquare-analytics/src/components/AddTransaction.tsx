import { addTransaction } from "@/app/finance/actions";
import { getRates, listAccounts, listCategories } from "@/lib/finance";
import { listUsers, type User } from "@/lib/users";
import { today } from "@/lib/period";
import { ActionForm } from "./ActionForm";
import { Modal } from "./Modal";
import { TransactionFields } from "./TransactionFields";

/** "Add transaction" button with its form in a modal. */
export async function AddTransaction({ user, admin }: { user: User; admin: boolean }) {
  const [accounts, categories, users, rates] = await Promise.all([listAccounts(), listCategories(), admin ? listUsers() : [], getRates()]);
  return (
    <Modal trigger="Add transaction" title="Add a transaction">
      <p className="muted">
        {admin ? "" : "Recorded under your name. "}It&apos;s saved as pending, with the money still with that person, until an admin
        confirms it in the Register.
      </p>
      <ActionForm action={addTransaction} submit="Save transaction">
        <TransactionFields
          accounts={accounts} categories={categories} users={users} currencies={Object.keys(rates)} today={today()} currentUserId={user.id} canPickUser={admin} repeat
        />
      </ActionForm>
    </Modal>
  );
}
