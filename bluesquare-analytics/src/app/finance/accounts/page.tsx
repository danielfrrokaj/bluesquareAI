import Link from "next/link";
import { isAdmin, requireAuth } from "@/lib/auth";
import { accountReport } from "@/lib/finance-reports";
import { parsePeriod } from "@/lib/period";
import { Shell } from "@/components/Shell";
import { financeNav } from "@/components/nav";
import { AccountPortfolio } from "@/components/FinanceCards";
import { AddTransaction } from "@/components/AddTransaction";
import { TransferMoney } from "@/components/TransferMoney";

export const dynamic = "force-dynamic";
export const metadata = { title: "Accounts" };

export default async function AccountsPage() {
  const user = await requireAuth();
  const admin = isAdmin(user);
  const accounts = await accountReport(parsePeriod({ period: "month" }));
  return (
    <Shell department="finance" subnav={financeNav("accounts", admin)}>
      <div className="pagehead">
        <div>
          <h1>Accounts</h1>
          <p className="muted">Where the money is: every virtual account&apos;s balance today.</p>
        </div>
        <div className="btnrow">
          {admin && <Link href="/finance/settings#accounts" className="btn">Manage accounts</Link>}
          <TransferMoney />
          <AddTransaction user={user} admin={admin} />
        </div>
      </div>
      <AccountPortfolio accounts={accounts} />
    </Shell>
  );
}
