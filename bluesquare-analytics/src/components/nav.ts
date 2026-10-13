import type { Site } from "@/lib/sites";
import type { SubLink } from "./Shell";
import type { NavIconName } from "./NavIcon";

export const analyticsNav = (sites: Site[], currentId?: string): SubLink[] => [
  { href: "/analytics", label: "All websites", current: !currentId },
  ...sites.map((s) => ({ href: `/sites/${s.id}`, label: s.name, current: s.id === currentId })),
  // ShqipFol has its own analytics app.
  { href: "https://wandering-wolf-play.vercel.app/", label: "ShqipFol", external: true },
];

export type FinanceTab = "overview" | "accounts" | "transactions" | "reports" | "gcloud" | "channex" | "settings";

// Suppliers show their own logo instead of a line icon.
const financeLogos: Partial<Record<FinanceTab, string>> = { gcloud: "/icons/google.png", channex: "/icons/channex.webp" };

export const financeNav = (current: FinanceTab, admin: boolean): SubLink[] =>
  (
    [
      ["overview", "/finance", "Overview"],
      ["accounts", "/finance/accounts", "Accounts"],
      ["transactions", "/finance/transactions", "Transactions"],
      ["reports", "/finance/reports", "Reports & forecast"],
      ["gcloud", "/finance/gcloud", "Gcloud"],
      ["channex", "/finance/channex", "Channex"],
      ...(admin ? [["settings", "/finance/settings", "Settings"]] : []),
    ] as [FinanceTab, string, string][]
  ).map(([key, href, label]): SubLink =>
    financeLogos[key]
      ? { href, label, image: financeLogos[key], current: key === current }
      : { href, label, icon: (key === "accounts" ? "wallet" : key) as NavIconName, current: key === current },
  );

export type MarketingTab = "ideas" | "plan" | "ads";

export const marketingNav = (current: MarketingTab): SubLink[] => [
  { href: "/marketing", label: "Ideas & media", icon: "ideas", current: current === "ideas" },
  { href: "/marketing/plan", label: "Publishing plan", icon: "calendar", current: current === "plan" },
  { href: "/marketing/ads", label: "Meta Ads", icon: "ads", current: current === "ads" },
];

export type SalesTab = "leads" | "followups" | "customers" | "archive" | "import";

export const salesNav = (current: SalesTab): SubLink[] =>
  (
    [
      ["leads", "/sales", "Leads"],
      ["followups", "/sales/follow-ups", "Follow-ups"],
      ["customers", "/sales/customers", "Customers"],
      ["archive", "/sales/archive", "Archive"],
      ["import", "/sales/import", "Import"],
    ] as [SalesTab, string, string][]
  ).map(([key, href, label]) => ({ href, label, icon: key === "followups" ? "phone" : key, current: key === current }));

export type ProjectsTab = "board" | "projects";

export const projectsNav = (current: ProjectsTab | null): SubLink[] => [
  { href: "/projects", label: "Tasks", icon: "board", current: current === "board" },
  { href: "/projects/list", label: "Projects", icon: "folder", current: current === "projects" },
];

export type ArchiveTab = "files" | "vault";

export const archiveNav = (current: ArchiveTab): SubLink[] => [
  { href: "/archive", label: "Files", icon: "files", current: current === "files" },
  { href: "/archive/vault", label: "Vault", icon: "vault", current: current === "vault" },
];
