import type { Site } from "@/lib/sites";
import type { SubLink } from "./Shell";

export const analyticsNav = (sites: Site[], currentId?: string): SubLink[] => [
  { href: "/analytics", label: "All websites", current: !currentId },
  ...sites.map((s) => ({ href: `/sites/${s.id}`, label: s.name, current: s.id === currentId })),
];

export type FinanceTab = "overview" | "transactions" | "reports" | "invoices" | "settings";

export const financeNav = (current: FinanceTab, admin: boolean): SubLink[] =>
  (
    [
      ["overview", "/finance", "Overview"],
      ["transactions", "/finance/transactions", "Transactions"],
      ["reports", "/finance/reports", "Reports & forecast"],
      ["invoices", "/finance/invoices", "Fiscal invoices"],
      ...(admin ? [["settings", "/finance/settings", "Settings"]] : []),
    ] as [FinanceTab, string, string][]
  ).map(([key, href, label]) => ({ href, label, icon: key, current: key === current }));
