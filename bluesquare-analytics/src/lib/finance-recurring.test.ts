import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { query } from "./db";
import { bookRecurring, createRecurring, getRecurring, ruleEnded, updateRecurring, type TxInput } from "./finance";
import { monthOf, today } from "./period";

// A throwaway embedded database. The connection opens on the first query, so this is in time.
const dir = mkdtempSync(join(tmpdir(), "bsa-recurring-"));
process.env.PGLITE_DIR = dir;
delete process.env.DATABASE_URL;
after(() => rmSync(dir, { recursive: true, force: true }));

const input = (occurredOn: string, overrides: Partial<TxInput> = {}): TxInput => ({
  type: "expense", amount: 180, currency: "EUR", originalAmount: null, fxRate: null, occurredOn, description: "Office rent",
  counterparty: "", accountId: null, toAccountId: null, categoryId: null, userId: null, ...overrides,
});
const booked = (rule: string) =>
  query<{ occurred_on: string; amount: number; original_amount: number | null; external_id: string }>(
    `select to_char(occurred_on, 'YYYY-MM-DD') as occurred_on, amount::float8 as amount, original_amount::float8 as original_amount, external_id
     from fin_transactions where external_id like $1 order by occurred_on`,
    [`recurring:${rule}:%`],
  );

test("books each month once its day has come, on the month's last day when it is shorter", async () => {
  const id = await createRecurring(input("2026-08-31"), null, null as never);
  await bookRecurring("2026-10-14");
  assert.deepEqual((await booked(id)).map((t) => t.occurred_on), ["2026-08-31", "2026-09-30"]);
  assert.equal((await getRecurring(id))!.next_month, "2026-10");
  await bookRecurring("2026-10-31");
  assert.deepEqual((await booked(id)).map((t) => t.occurred_on), ["2026-08-31", "2026-09-30", "2026-10-31"]);
});

test("never books a month twice, also when two requests book at once", async () => {
  const id = await createRecurring(input("2026-06-10"), null, null as never);
  await Promise.all([bookRecurring("2026-10-14"), bookRecurring("2026-10-14")]);
  await bookRecurring("2026-10-14");
  assert.deepEqual((await booked(id)).map((t) => t.external_id.slice(-7)), ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10"]);
});

test("a booked month can be edited or deleted on its own, and a deleted month stays deleted", async () => {
  const id = await createRecurring(input("2026-09-05"), null, null as never);
  await bookRecurring("2026-10-14");
  await query("update fin_transactions set amount = 212 where external_id = $1", [`recurring:${id}:2026-10`]);
  await query("delete from fin_transactions where external_id = $1", [`recurring:${id}:2026-09`]);
  await bookRecurring("2026-10-20");
  assert.deepEqual((await booked(id)).map((t) => [t.occurred_on, t.amount]), [["2026-10-05", 212]]);
});

test("stops after its last month; a later last month resumes it from this month, skipping the months in between", async () => {
  const id = await createRecurring(input("2026-01-03"), "2026-02", null as never);
  await bookRecurring(`${monthOf(today())}-28`);
  assert.deepEqual((await booked(id)).map((t) => t.occurred_on), ["2026-01-03", "2026-02-03"]);
  const rule = (await getRecurring(id))!;
  assert.ok(ruleEnded(rule));
  await updateRecurring(rule, input("2026-03-03"), 3, null);
  assert.equal((await getRecurring(id))!.next_month, monthOf(today()));
  assert.ok(!ruleEnded((await getRecurring(id))!));
});

test("other currencies keep the entered amount and are converted with the rate when booked", async () => {
  const id = await createRecurring(input("2026-10-01", { currency: "ALL", amount: 100, originalAmount: 9177, fxRate: 91.77 }), null, null as never);
  await query(`update app_settings set value = '{"ALL": 100}' where key = 'fx_rates'`);
  await bookRecurring("2026-10-14");
  assert.deepEqual((await booked(id)).map((t) => [t.amount, t.original_amount]), [[91.77, 9177]]);
  // With its rate removed, the month waits instead of being booked at a wrong amount.
  const later = await createRecurring(input("2026-10-02", { currency: "USD", originalAmount: 50 }), null, null as never);
  await bookRecurring("2026-10-14");
  assert.equal((await booked(later)).length, 0);
  assert.equal((await getRecurring(later))!.next_month, "2026-10");
});
