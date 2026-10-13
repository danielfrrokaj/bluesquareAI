import { isAdmin, requireAuth } from "@/lib/auth";
import { parsePeriod } from "@/lib/period";
import { getGoogleCloudReport } from "@/lib/google-cloud-billing";
import { Shell } from "@/components/Shell";
import { financeNav } from "@/components/nav";
import { PeriodTabs } from "@/components/PeriodTabs";
import { GoogleCloudForecast } from "@/components/GoogleCloudForecast";

export const dynamic = "force-dynamic";
export const metadata = { title: "Google Cloud" };

/** Google Cloud expenses & forecast (both billing accounts, in USD). */
export default async function GcloudPage({ searchParams }: { searchParams: Promise<{ period?: string; from?: string; to?: string }> }) {
  const user = await requireAuth();
  const period = parsePeriod(await searchParams);
  const report = await getGoogleCloudReport(period);
  return (
    <Shell department="finance" subnav={financeNav("gcloud", isAdmin(user))}>
      <div className="pagehead">
        <div>
          <h1>Google Cloud</h1>
          <p className="muted">{period.label}</p>
        </div>
        <PeriodTabs base="/finance/gcloud" current={period} />
      </div>
      <GoogleCloudForecast report={report} period={period} />
    </Shell>
  );
}
