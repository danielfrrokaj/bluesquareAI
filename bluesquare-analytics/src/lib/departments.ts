// The sidebar's departments, and which of them a user may open. Pure: shared by the server and the permission picker.

export type Department = "overview" | "finance" | "analytics" | "luxhotel" | "marketing" | "archive" | "sales" | "inbox" | "projects" | "users" | "settings";

/** Sidebar order. Icons in public/icons/<key>.png, generated with Gemini in the website's 3D style (see bluesquare-next/tools). */
export const DEPARTMENTS: { key: Department; href: string; label: string }[] = [
  { key: "overview", href: "/", label: "Overview" },
  { key: "finance", href: "/finance", label: "Finance" },
  { key: "analytics", href: "/analytics", label: "Analytics" },
  { key: "luxhotel", href: "/luxhotel", label: "LuxHotel System" },
  { key: "marketing", href: "/marketing", label: "Marketing & Ads" },
  { key: "archive", href: "/archive", label: "Archive" },
  { key: "sales", href: "/sales", label: "Sales" },
  { key: "inbox", href: "/inbox", label: "Inbox" },
  { key: "projects", href: "/projects", label: "Projects & Tasks" },
  { key: "users", href: "/users", label: "Users" },
];

/** What an admin can grant a member: every department except Users (admins only). Settings (own profile) is always open. */
export const GRANTABLE = DEPARTMENTS.filter((d) => d.key !== "users");

/** Finance's tabs, in tab-bar order. Settings is admins only; the rest can be granted one by one as "finance:<tab>". */
export type FinanceTab = "overview" | "accounts" | "transactions" | "register" | "reports" | "gcloud" | "channex" | "settings";
export const FINANCE_TABS: { key: FinanceTab; href: string; label: string }[] = [
  { key: "overview", href: "/finance", label: "Overview" },
  { key: "accounts", href: "/finance/accounts", label: "Accounts" },
  { key: "transactions", href: "/finance/transactions", label: "Transactions" },
  { key: "register", href: "/finance/register", label: "Register" },
  { key: "reports", href: "/finance/reports", label: "Reports & forecast" },
  { key: "gcloud", href: "/finance/gcloud", label: "Gcloud" },
  { key: "channex", href: "/finance/channex", label: "Channex" },
  { key: "settings", href: "/finance/settings", label: "Settings" },
];
export const GRANTABLE_FINANCE_TABS = FINANCE_TABS.filter((t) => t.key !== "settings");
/** Picked when Finance is turned on, and what members get without a choice of tabs: no supplier costs. */
export const DEFAULT_FINANCE_TABS: FinanceTab[] = ["overview", "accounts", "transactions", "register", "reports"];

/** Archive's tabs, in tab-bar order; each can be granted on its own as "archive:<tab>". */
export type ArchiveTab = "files" | "vault";
export const ARCHIVE_TABS: { key: ArchiveTab; href: string; label: string }[] = [
  { key: "files", href: "/archive", label: "Files" },
  { key: "vault", href: "/archive/vault", label: "Vault" },
];
/** Archive without a choice of tabs (as stored before tabs existed) opens both. */
export const DEFAULT_ARCHIVE_TABS: ArchiveTab[] = ["files", "vault"];

/** Departments whose tabs are granted one by one, as "<department>:<tab>"; `defaults` are picked when it's turned on. */
export type TabbedDepartment = "finance" | "archive";
export const GRANTABLE_TABS: Record<TabbedDepartment, { label: string; tabs: { key: string; label: string }[]; defaults: string[] }> = {
  finance: { label: "Finance", tabs: GRANTABLE_FINANCE_TABS, defaults: DEFAULT_FINANCE_TABS },
  archive: { label: "Archive", tabs: ARCHIVE_TABS, defaults: DEFAULT_ARCHIVE_TABS },
};
export const tabKey = (department: TabbedDepartment, tab: string) => `${department}:${tab}`;
export const financeKey = (tab: FinanceTab) => tabKey("finance", tab);

/** A single Chatwoot inbox granted on its own, as "inbox:<its id>". Plain "inbox" with no picks: every inbox. */
export const inboxKey = (inboxId: number) => `inbox:${inboxId}`;

/** `departments` null: every grantable department (accounts from before permissions existed). */
type Access = { role: string; departments: string[] | null };

/** Admins open every tab; members the tabs picked for them, or the defaults when none is. Never without the department. */
function canOpenTab(user: Access | null, department: TabbedDepartment, tab: string): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.departments !== null && !user.departments.includes(department)) return false;
  const picked = user.departments?.filter((d) => d.startsWith(`${department}:`)) ?? [];
  return picked.length ? picked.includes(tabKey(department, tab)) : GRANTABLE_TABS[department].defaults.includes(tab);
}

export function canOpenFinanceTab(user: Access | null, tab: FinanceTab): boolean {
  if (tab === "settings" && user?.role !== "admin") return false;
  return canOpenTab(user, "finance", tab);
}

export const canOpenArchiveTab = (user: Access | null, tab: ArchiveTab) => canOpenTab(user, "archive", tab);

export function canAccess(user: Access | null, department: Department): boolean {
  if (!user) return false;
  if (user.role === "admin" || department === "settings") return true;
  if (department === "users") return false;
  // Finance and Archive are open while at least one of their tabs is.
  if (department === "finance") return FINANCE_TABS.some((t) => canOpenFinanceTab(user, t.key));
  if (department === "archive") return ARCHIVE_TABS.some((t) => canOpenArchiveTab(user, t.key));
  if (department === "inbox") return user.departments === null || user.departments.some((d) => d === "inbox" || d.startsWith("inbox:"));
  return user.departments === null || user.departments.includes(department);
}

/** The Chatwoot inboxes this user may see: their ids, or null for all of them (admins, or Inbox granted whole). */
export function allowedInboxIds(user: Access | null): number[] | null {
  if (!user || user.role === "admin" || user.departments === null) return null;
  const picked = user.departments.filter((d) => d.startsWith("inbox:")).map((d) => Number(d.slice(6))).filter((n) => Number.isInteger(n) && n > 0);
  return picked.length ? picked : null;
}

/**
 * Where a department's link takes this user. Finance and Archive open on the first tab they have, so following the link
 * never bounces through a redirect (which shows as a blank flash).
 */
export const departmentHref = (user: Access, department: { key: Department; href: string }) =>
  department.key === "finance" ? FINANCE_TABS.find((t) => canOpenFinanceTab(user, t.key))?.href ?? department.href
  : department.key === "archive" ? ARCHIVE_TABS.find((t) => canOpenArchiveTab(user, t.key))?.href ?? department.href
  : department.href;

/** Where a user lands: the first department they may open, else their profile settings. */
export function homeFor(user: Access): string {
  const first = DEPARTMENTS.find((d) => canAccess(user, d.key));
  return first ? departmentHref(user, first) : "/settings";
}

/** The first Finance tab a user may open, else their home. */
export const financeHomeFor = (user: Access) => FINANCE_TABS.find((t) => canOpenFinanceTab(user, t.key))?.href ?? homeFor(user);

/** The first Archive tab a user may open, else their home. */
export const archiveHomeFor = (user: Access) => ARCHIVE_TABS.find((t) => canOpenArchiveTab(user, t.key))?.href ?? homeFor(user);
