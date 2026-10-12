import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { RouteModal } from "@/components/RouteModal";
import { TransactionDetail } from "@/components/TransactionDetail";

/** A transaction opened from a list: shown as a modal; a direct visit gets the full page instead. */
export default async function TransactionModal({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const detail = await TransactionDetail({ id: (await params).id, user });
  if (!detail) notFound();
  return <RouteModal label="Transaction">{detail}</RouteModal>;
}
