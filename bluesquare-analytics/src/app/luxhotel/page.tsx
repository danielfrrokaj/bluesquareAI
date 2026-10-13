import { Suspense } from "react";
import { requireAuth } from "@/lib/auth";
import { getLuxHotels } from "@/lib/luxhotel";
import { Shell } from "@/components/Shell";
import { LuxHotelDashboard } from "./LuxHotelDashboard";
import s from "./luxhotel.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "LuxHotel System" };

async function Monitor() {
  return <LuxHotelDashboard initial={await getLuxHotels()} />;
}

export default async function LuxHotelPage() {
  await requireAuth();
  return <Shell department="luxhotel">
    <Suspense fallback={<div className={s.loading} role="status"><img src="/icons/luxhotel.png" alt="LuxHotel System" width={120} height={83} /><h1>Loading your property network…</h1><p>Fetching properties, subscriptions and connections.</p></div>}>
      <Monitor />
    </Suspense>
  </Shell>;
}
