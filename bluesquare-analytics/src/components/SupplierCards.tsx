import { getChannexReport } from "@/lib/channex";
import { getGoogleCloudReport } from "@/lib/google-cloud-billing";
import { money } from "@/lib/format";
import { monthLabel, type Period } from "@/lib/period";
import { StatCard } from "./FinanceCards";

// Supplier costs billed in USD. They never enter the EUR ledger, so these cards sit beside Expenses, not in it.
const usd = (value: number) => money(value, "USD");
const NOT_IN_TOTAL = "In USD and not included in the EUR expenses.";
const CHANNEX = { tone: "violet", logo: "/icons/channex.webp", label: "Channex", href: "/finance/channex" } as const;
const GCLOUD = { tone: "blue", logo: "/icons/google.png", label: "Google Cloud", href: "/finance/gcloud" } as const;

/** This month's Channex invoice (charged on the 1st, in advance). Hidden when LuxHotel isn't connected. */
export async function ChannexCard() {
  const r = await getChannexReport().catch(() => null);
  if (r && !r.configured) return null;
  const invoice = r?.current;
  return (
    <StatCard
      {...CHANNEX}
      value={invoice ? usd(invoice.total) : "–"}
      caption={!r ? "Unavailable right now" : invoice ? `${monthLabel(r.month)} invoice · charged on the 1st` : "Waiting for the first LuxHotel snapshot"}
      info={`Expected Channex invoice for this month, estimated from the LuxHotel properties (excluding VAT). ${NOT_IN_TOTAL}`}
    />
  );
}

/** Google Cloud's expected month-end cost across the billing accounts; month to date until a forecast is possible. */
export async function GoogleCloudCard({ period }: { period: Period }) {
  const r = await getGoogleCloudReport(period).catch(() => null);
  if (r && !r.configurationError && !r.accounts.length) return null;
  const value = r?.expected ?? r?.monthTotal ?? null;
  return (
    <StatCard
      {...GCLOUD}
      value={value === null ? "–" : usd(value)}
      caption={r?.expected != null ? `Month-end forecast${r.monthTotal !== null ? ` · ${usd(r.monthTotal)} so far` : ""}` : r?.monthTotal != null ? "So far this month · forecast pending" : "Unavailable right now"}
      info={`Expected Google Cloud cost for this month: month-to-date usage plus the seven-day pace. ${NOT_IN_TOTAL}`}
    />
  );
}

export const ChannexCardLoading = () => <StatCard {...CHANNEX} value="–" caption="Loading…" info={NOT_IN_TOTAL} />;
export const GoogleCloudCardLoading = () => <StatCard {...GCLOUD} value="–" caption="Loading…" info={NOT_IN_TOTAL} />;
