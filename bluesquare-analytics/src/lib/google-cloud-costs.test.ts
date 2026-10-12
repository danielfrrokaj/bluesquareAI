import assert from "node:assert/strict";
import { test } from "node:test";
import { cloudCostSummary, parseBillingSources, type BillingRead, type CloudCostDay } from "./google-cloud-costs";

const source = { name: "Test account", projectId: "test-project", datasetId: "all_billing_data", billingAccountId: "AAAAAA-BBBBBB-CCCCCC" };
const period = { from: "2026-10-01", to: "2026-10-12" };
const row = (date: string, cost = 10, credits = -2): CloudCostDay => ({
  date, cost, credits, projectId: "workload", projectName: "Workload", currency: "USD", exportedAt: "2026-10-12T10:00:00Z",
});
const read = (rows: CloudCostDay[], status: BillingRead["status"] = "ready"): BillingRead => ({ source, rows, status, message: "", checkedAt: "2026-10-12T12:00:00Z" });
const monthRows = () => Array.from({ length: 12 }, (_, i) => row(`2026-10-${String(i + 1).padStart(2, "0")}`));

test("credits reduce expenses, including negative net refunds and unallocated charges", () => {
  const unallocated = { ...row("2026-10-03", 4, 0), projectId: "", projectName: "Unallocated account costs" };
  const report = cloudCostSummary([read([row("2026-10-01", 10, -3), row("2026-10-02", 0, -9), unallocated])], period, "2026-10-12");
  assert.equal(report.periodTotal, 2);
  assert.equal(report.projects.find(p => p.name === "Workload")?.total, -2);
  assert.equal(report.projects.reduce((sum, p) => sum + p.total, 0), report.periodTotal);
});

test("forecast excludes the partial latest day and uses each future month's length", () => {
  const rows = monthRows();
  rows[11] = row("2026-10-12", 1, 0);
  const report = cloudCostSummary([read(rows)], period, "2026-10-12");
  assert.equal(report.monthTotal, 89);
  assert.equal(report.daily, 8);
  assert.equal(report.expected, 248);
  assert.deepEqual(report.next.map(n => n.expense), [240, 248, 248]);
});

test("zero net cost is valid data; missing exports are unknown", () => {
  const zero = cloudCostSummary([read(monthRows().map(r => ({ ...r, credits: -10 })))], period, "2026-10-12");
  assert.equal(zero.expected, 0);
  const waiting = cloudCostSummary([read([], "waiting")], period, "2026-10-12");
  assert.equal(waiting.periodTotal, null);
  assert.equal(waiting.expected, null);
});

test("one missing account leaves available actuals partial and withholds the combined forecast", () => {
  const waiting = { ...read([], "error"), source: { ...source, billingAccountId: "DDDDDD-EEEEEE-FFFFFF" } };
  const report = cloudCostSummary([read(monthRows()), waiting], period, "2026-10-12");
  assert.equal(report.periodTotal, 96);
  assert.equal(report.complete, false);
  assert.equal(report.expected, null);
  assert.ok(report.next.every(n => n.expense === null));
});

test("backfill gaps and stale exports cannot create a deceptively low forecast", () => {
  for (const rows of [monthRows().filter(r => r.date !== "2026-10-04"), monthRows().slice(0, 8)]) {
    assert.equal(cloudCostSummary([read(rows)], period, "2026-10-12").expected, null);
  }
});

test("date filters affect actuals but keep the current-month forecast, and accounts stay distinct", () => {
  const second = { ...read(monthRows()), source: { ...source, name: "Second account", billingAccountId: "DDDDDD-EEEEEE-FFFFFF" } };
  const report = cloudCostSummary([read(monthRows()), second], { from: "2026-10-02", to: "2026-10-03" }, "2026-10-12");
  assert.equal(report.periodTotal, 32);
  assert.equal(report.expected, 496);
  assert.equal(report.projects.length, 2);
});

test("configuration rejects duplicate accounts and SQL identifiers", () => {
  assert.deepEqual(parseBillingSources(undefined), []);
  assert.deepEqual(parseBillingSources(JSON.stringify([source])), [source]);
  assert.throws(() => parseBillingSources(JSON.stringify([source, source])));
  assert.throws(() => parseBillingSources(JSON.stringify([{ ...source, datasetId: "a`; SELECT 1" }])));
});
