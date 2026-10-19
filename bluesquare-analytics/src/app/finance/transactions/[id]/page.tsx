import Link from "next/link";
import { notFound } from "next/navigation";
import { requireFinanceTab } from "@/lib/auth";
import { getTransaction } from "@/lib/finance";
import { Shell } from "@/components/Shell";
import { financeNav } from "@/components/nav";
import { TransactionDetail } from "@/components/TransactionDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const tx = await getTransaction((await params).id);
  return { title: tx?.description || "Transaction" };
}

export default async function TransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireFinanceTab("transactions");
  const detail = await TransactionDetail({ id: (await params).id, user });
  if (!detail) notFound();
  return (
    <Shell department="finance" subnav={financeNav("transactions", user)}>
      <Link href="/finance/transactions" className="backlink">← All transactions</Link>
      {detail}
    </Shell>
  );
}
