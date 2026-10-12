import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { today } from "@/lib/period";
import { RouteModal } from "@/components/RouteModal";
import { LeadDetail } from "@/components/LeadDetail";

/** A lead opened from a list: shown as a modal; a direct visit gets the full page instead. */
export default async function LeadModal({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireAuth();
  const detail = await LeadDetail({ id: (await params).id, me, today: today() });
  if (!detail) notFound();
  return <RouteModal label="Lead">{detail}</RouteModal>;
}
