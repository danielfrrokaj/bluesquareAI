import assert from "node:assert/strict";
import { test } from "node:test";
import { allowedInboxIds, archiveHomeFor, canAccess, canOpenArchiveTab, canOpenFinanceTab, departmentHref, financeHomeFor, homeFor } from "./departments";

const member = (departments: string[] | null) => ({ role: "member", departments });

test("admins open everything, including Users", () => {
  const admin = { role: "admin", departments: [] };
  assert.ok(canAccess(admin, "users") && canAccess(admin, "finance") && canAccess(admin, "overview"));
});

test("members open only their picked sections, never Users, always Settings", () => {
  const sales = member(["sales", "projects"]);
  assert.ok(canAccess(sales, "sales") && canAccess(sales, "projects") && canAccess(sales, "settings"));
  assert.ok(!canAccess(sales, "finance") && !canAccess(sales, "overview") && !canAccess(sales, "users"));
  assert.ok(!canAccess(member(["users"]), "users"));
  assert.ok(!canAccess(null, "settings"));
});

test("accounts from before permissions keep every section except Users", () => {
  assert.ok(canAccess(member(null), "finance") && canAccess(member(null), "luxhotel"));
  assert.ok(!canAccess(member(null), "users"));
});

test("members land on their first section in sidebar order, else Settings", () => {
  assert.equal(homeFor(member(["projects", "finance"])), "/finance");
  assert.equal(homeFor(member(["overview", "sales"])), "/");
  assert.equal(homeFor(member([])), "/settings");
});

test("Finance tabs: picked tabs only, Settings never, defaults without supplier costs", () => {
  const picked = member(["finance", "finance:transactions", "finance:channex"]);
  assert.ok(canOpenFinanceTab(picked, "transactions") && canOpenFinanceTab(picked, "channex"));
  assert.ok(!canOpenFinanceTab(picked, "overview") && !canOpenFinanceTab(picked, "gcloud") && !canOpenFinanceTab(picked, "settings"));
  assert.equal(financeHomeFor(picked), "/finance/transactions");
  // Links and landing go straight to that tab, with no redirect on the way.
  assert.equal(homeFor(picked), "/finance/transactions");
  assert.equal(departmentHref(picked, { key: "finance", href: "/finance" }), "/finance/transactions");
  // Finance without a choice of tabs (and accounts from before permissions): the defaults, no Gcloud or Channex.
  for (const legacy of [member(["finance"]), member(null)]) {
    assert.ok(canOpenFinanceTab(legacy, "overview") && canOpenFinanceTab(legacy, "reports"));
    assert.ok(!canOpenFinanceTab(legacy, "gcloud") && !canOpenFinanceTab(legacy, "channex"));
  }
  // Tabs without Finance itself, or Finance with only unknown tabs, open nothing, so redirects can't loop.
  assert.ok(!canOpenFinanceTab(member(["finance:overview"]), "overview"));
  assert.ok(!canAccess(member(["finance", "finance:removed"]), "finance"));
  assert.equal(homeFor(member(["finance", "finance:removed", "sales"])), "/sales");
  assert.ok(canOpenFinanceTab({ role: "admin", departments: [] }, "settings"));
});

test("Archive tabs: Files and Vault granted on their own, both without a choice", () => {
  const vaultOnly = member(["archive", "archive:vault"]);
  assert.ok(canOpenArchiveTab(vaultOnly, "vault") && !canOpenArchiveTab(vaultOnly, "files"));
  assert.ok(canAccess(vaultOnly, "archive"));
  // The Archive link and landing go straight to the tab they have.
  assert.equal(departmentHref(vaultOnly, { key: "archive", href: "/archive" }), "/archive/vault");
  assert.equal(archiveHomeFor(vaultOnly), "/archive/vault");
  assert.equal(homeFor(vaultOnly), "/archive/vault");
  const filesOnly = member(["archive", "archive:files"]);
  assert.ok(canOpenArchiveTab(filesOnly, "files") && !canOpenArchiveTab(filesOnly, "vault"));
  assert.equal(departmentHref(filesOnly, { key: "archive", href: "/archive" }), "/archive");
  // Archive as stored before tabs existed (and accounts from before permissions) keep both.
  for (const legacy of [member(["archive"]), member(null)]) assert.ok(canOpenArchiveTab(legacy, "files") && canOpenArchiveTab(legacy, "vault"));
  // Tabs without Archive itself open nothing; Finance tabs don't open Archive's.
  assert.ok(!canOpenArchiveTab(member(["archive:vault"]), "vault"));
  assert.ok(!canAccess(member(["archive", "archive:removed"]), "archive"));
  assert.ok(!canOpenArchiveTab(member(["finance", "finance:overview"]), "files"));
  assert.ok(canOpenArchiveTab({ role: "admin", departments: [] }, "vault"));
});

test("Inbox accounts: granted whole, or only certain Chatwoot inboxes", () => {
  // Plain "inbox" (or an account from before permissions): every inbox, including ones connected later.
  assert.equal(allowedInboxIds(member(["inbox"])), null);
  assert.equal(allowedInboxIds(member(null)), null);
  assert.equal(allowedInboxIds({ role: "admin", departments: ["inbox:149189"] }), null);
  // Picked accounts: just those; the entries also open the Inbox section.
  const whatsappOnly = member(["inbox", "inbox:149189"]);
  assert.deepEqual(allowedInboxIds(whatsappOnly), [149189]);
  assert.ok(canAccess(whatsappOnly, "inbox"));
  assert.deepEqual(allowedInboxIds(member(["inbox", "inbox:149189", "inbox:149172"])), [149189, 149172]);
  // Without the Inbox section (or without any grant) nothing opens; junk entries don't count.
  assert.ok(!canAccess(member(["sales"]), "inbox"));
  assert.equal(allowedInboxIds(member(["inbox", "inbox:none", "inbox:-4"])), null);
});
