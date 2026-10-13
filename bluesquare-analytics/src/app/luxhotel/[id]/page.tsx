import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getLuxHotel } from "@/lib/luxhotel";
import { timeLabel } from "@/lib/luxhotel-data";
import { Shell } from "@/components/Shell";
import { PropertyDetails } from "../PropertyDetails";
import { Icon } from "../parts";
import s from "../luxhotel.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Property details | LuxHotel System" };

async function Property({ id }: { id: string }) {
  const report = await getLuxHotel(id);
  return <>
    {report.message && <div className={s.notice} role="alert">
      <Icon name="warning" />
      <div><strong>{report.data ? "Showing the last successful property details" : "Property details are unavailable"}</strong><p>{report.message}</p><a href={`/luxhotel/${encodeURIComponent(id)}`}>Reload property details</a></div>
    </div>}
    {report.data ? <PropertyDetails hotel={report.data} checkedAt={report.checkedAt} /> : <section className={s.empty}>
      <Icon name="hotel" /><h1>Property unavailable</h1>
      <p>Return to your property list or try again after {timeLabel(report.retryAt)}.</p>
    </section>}
  </>;
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();
  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) notFound();
  return <Shell department="luxhotel">
    <div className={s.detailPage}>
      <Link href="/luxhotel" className={s.backLink}>← All properties</Link>
      <Suspense fallback={<section className={s.loading} role="status"><Icon name="hotel" /><h1>Loading property details…</h1><p>Fetching rooms, booking channels and subscription information.</p></section>}>
        <Property id={id} />
      </Suspense>
    </div>
  </Shell>;
}
