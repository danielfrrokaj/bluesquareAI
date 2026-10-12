import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getLead, leadTitle } from "@/lib/sales";
import { today } from "@/lib/period";
import { Shell } from "@/components/Shell";
import { salesNav } from "@/components/nav";
import { LeadDetail } from "@/components/LeadDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const lead = await getLead((await params).id);
  return { title: lead ? leadTitle(lead) : "Lead" };
}

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireAuth();
  const id = (await params).id;
  const lead = await getLead(id);
  if (!lead) notFound();
  const tab = lead.status === "won" ? "customers" : lead.status === "lost" ? "archive" : "leads";
  return (
    <Shell department="sales" subnav={salesNav(tab)}>
      <Link href={tab === "leads" ? "/sales" : `/sales/${tab}`} className="backlink">← {tab === "leads" ? "All leads" : tab === "customers" ? "Customers" : "Archive"}</Link>
      {await LeadDetail({ id, me, today: today() })}
    </Shell>
  );
}
