import type { Site } from "@/lib/sites";
import { ARCHIVE_TABS, canOpenArchiveTab, canOpenFinanceTab, FINANCE_TABS, type ArchiveTab, type FinanceTab } from "@/lib/departments";
import type { SubLink } from "./Shell";
import type { NavIconName } from "./NavIcon";

export const analyticsNav = (sites: Site[], currentId?: string): SubLink[] => [
  { href: "/analytics", label: "All websites", current: !currentId },
  ...sites.map((s) => ({ href: `/sites/${s.id}`, label: s.name, current: s.id === currentId })),
  // ShqipFol has its own analytics app.
  { href: "https://wandering-wolf-play.vercel.app/", label: "ShqipFol", external: true },
];

export type { FinanceTab };

// Suppliers show their own logo instead of a line icon.
const financeLogos: Partial<Record<FinanceTab, string>> = { gcloud: "/icons/google.png", channex: "/icons/channex.webp" };

/** Finance's tab bar, with only the tabs this user may open. */
export const financeNav = (current: FinanceTab, user: Parameters<typeof canOpenFinanceTab>[0]): SubLink[] =>
  FINANCE_TABS.filter((t) => canOpenFinanceTab(user, t.key)).map(({ key, href, label }): SubLink =>
    financeLogos[key]
      ? { href, label, image: financeLogos[key], current: key === current }
      : { href, label, icon: (key === "accounts" ? "wallet" : key) as NavIconName, current: key === current },
  );

export type LuxHotelTab = "properties" | "ai-chats" | "web-requests" | "technical-issues";

/** LuxHotel's tabs; `unread` adds each feed's count of records this person hasn't read. */
export const luxhotelNav = (current: LuxHotelTab, unread?: Partial<Record<LuxHotelTab, number>>): SubLink[] =>
  (
    [
      ["properties", "/luxhotel", "Properties", "hotel"],
      ["ai-chats", "/luxhotel/ai-chats", "AI chats", "chat"],
      ["web-requests", "/luxhotel/web-requests", "Website requests", "inbox"],
      ["technical-issues", "/luxhotel/technical-issues", "Technical issues", "issue"],
    ] as [LuxHotelTab, string, string, NavIconName][]
  ).map(([key, href, label, icon]) => ({ href, label, icon, current: key === current, badge: unread?.[key] }));

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

export type { ArchiveTab };

/** Archive's tab bar, with only the tabs this user may open. */
export const archiveNav = (current: ArchiveTab, user: Parameters<typeof canOpenArchiveTab>[0]): SubLink[] =>
  ARCHIVE_TABS.filter((t) => canOpenArchiveTab(user, t.key)).map(({ key, href, label }) => ({ href, label, icon: key, current: key === current }));
