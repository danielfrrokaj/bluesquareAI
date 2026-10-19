import "server-only";
import { randomUUID } from "node:crypto";
import { query } from "./db";
import { addMonths, dayOfMonth, monthOf, today } from "./period";

export type TxType = "income" | "expense";
export const TX_TYPES: Record<TxType, string> = { income: "Income", expense: "Expense" };
export const isTxType = (v: unknown): v is TxType => v === "income" || v === "expense";
/** What a transaction can be: income, expense, or a transfer between two virtual accounts (neither). */
export type TxKind = TxType | "transfer";
export const isTxKind = (v: unknown): v is TxKind => isTxType(v) || v === "transfer";
/**
 * Pending: the money is still with the person the transaction belongs to; it counts in income and expense, not in the balance.
 * Confirmed: an admin confirmed it in the Register (or it never needed it), and it counts everywhere. Cancelled: counts nowhere.
 */
export type TxStatus = "pending" | "confirmed" | "cancelled";
export const TX_STATUSES: Record<TxStatus, string> = { pending: "Pending", confirmed: "Confirmed", cancelled: "Cancelled" };
export const isTxStatus = (v: unknown): v is TxStatus => typeof v === "string" && v in TX_STATUSES;

/** Currency for all amounts and reports. Other currencies are converted with the rates in settings. */
export const BASE_CURRENCY = "EUR";

// ---------- Currency rates ----------

/** Units of each currency per 1 EUR, e.g. { ALL: 91.77 }. */
export type Rates = Record<string, number>;

export const getRates = async (): Promise<Rates> => (await getSetting<Rates>("fx_rates")) ?? {};

/** "eur" -> "EUR"; null unless it's a 3-letter ISO 4217 code. */
export function currencyCode(raw: string): string | null {
  const code = raw.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) return null;
  try {
    new Intl.NumberFormat("en", { style: "currency", currency: code });
    return code;
  } catch {
    return null;
  }
}

/** EUR value of an amount; null when there's no rate for the currency. */
export function toBase(amount: number, currency: string, rates: Rates): { amount: number; rate: number | null } | null {
  if (currency === BASE_CURRENCY) return { amount, rate: null };
  const rate = rates[currency];
  if (!rate || rate <= 0) return null;
  return { amount: Math.max(Math.round((amount / rate) * 100) / 100, 0.01), rate };
}

export async function setRate(currency: string, rate: number, recalculate: boolean) {
  await setSetting("fx_rates", { ...(await getRates()), [currency]: rate });
  if (recalculate)
    await query(
      `update fin_transactions set amount = greatest(round(original_amount / $2, 2), 0.01), fx_rate = $2, updated_at = now()
       where currency = $1 and original_amount is not null`,
      [currency, rate],
    );
}

/** Removes a rate unless transactions still use the currency. */
export async function removeRate(currency: string): Promise<boolean> {
  const used = await query("select 1 from fin_transactions where currency = $1 limit 1", [currency]);
  if (used.length) return false;
  const { [currency]: _, ...rest } = await getRates();
  await setSetting("fx_rates", rest);
  return true;
}

/** Transactions per currency, for the settings page. */
export const currencyUsage = () =>
  query<{ currency: string; count: number }>("select currency, count(*)::int as count from fin_transactions group by currency");

// ---------- Virtual accounts ----------

/** How virtual accounts are grouped in the portfolio. */
export const ACCOUNT_GROUPS = {
  own: { label: "Virtual Accounts", hint: "Operating and bank accounts of the business" },
  partner: { label: "Partners", hint: "OTAs, agencies and financial partners holding your money" },
  other: { label: "Other", hint: "Savings, loans and anything else" },
} as const;
export type AccountGroup = keyof typeof ACCOUNT_GROUPS;
export const isAccountGroup = (v: unknown): v is AccountGroup => typeof v === "string" && v in ACCOUNT_GROUPS;

export type Account = {
  id: string; name: string; description: string | null; opening_balance: number; archived: boolean;
  logo_version: number | null; // null: no logo
  account_group: AccountGroup;
};

export const listAccounts = (includeArchived = false) =>
  query<Account>(
    `select id, name, description, opening_balance::float8 as opening_balance, archived,
            case when logo is null then null else logo_version end as logo_version, account_group
     from fin_accounts ${includeArchived ? "" : "where not archived"} order by archived, name`,
  );

export async function createAccount(a: { name: string; description: string; openingBalance: number; group: AccountGroup }) {
  const id = randomUUID();
  await query("insert into fin_accounts (id, name, description, opening_balance, account_group) values ($1, $2, $3, $4, $5)", [
    id, a.name, a.description || null, a.openingBalance, a.group,
  ]);
  return id;
}

export const updateAccount = (id: string, a: { name: string; description: string; openingBalance: number; archived: boolean; group: AccountGroup }) =>
  query("update fin_accounts set name = $2, description = $3, opening_balance = $4, archived = $5, account_group = $6 where id = $1", [
    id, a.name, a.description || null, a.openingBalance, a.archived, a.group,
  ]);

// ---------- Account logos ----------

/** Replaces the logo (null removes it). The version bump gives the image a new URL, so caches don't show the old one. */
export const setAccountLogo = (id: string, logo: { data: Buffer; type: string } | null) =>
  query("update fin_accounts set logo = $2, logo_type = $3, logo_version = logo_version + 1 where id = $1", [
    id, logo?.data ?? null, logo?.type ?? null,
  ]);

export async function getAccountLogo(id: string): Promise<{ data: Uint8Array; type: string } | null> {
  const [row] = await query<{ logo: Uint8Array | null; logo_type: string | null }>("select logo, logo_type from fin_accounts where id = $1", [id]);
  return row?.logo && row.logo_type ? { data: row.logo, type: row.logo_type } : null;
}

/** Deletes an unused account; one with transactions is archived instead, so history stays intact. */
export async function deleteOrArchiveAccount(id: string): Promise<"deleted" | "archived"> {
  const used = await query("select 1 from fin_transactions where account_id = $1 or to_account_id = $1 limit 1", [id]);
  if (used.length) {
    await query("update fin_accounts set archived = true where id = $1", [id]);
    return "archived";
  }
  await query("delete from fin_accounts where id = $1", [id]);
  return "deleted";
}

// ---------- Categories ----------

export type Category = { id: string; name: string; kind: TxType; monthly_budget: number | null; archived: boolean };

export const listCategories = (includeArchived = false) =>
  query<Category>(
    `select id, name, kind, monthly_budget::float8 as monthly_budget, archived
     from fin_categories ${includeArchived ? "" : "where not archived"} order by archived, kind, name`,
  );

export async function categoryNameTaken(kind: TxType, name: string, exceptId = ""): Promise<boolean> {
  const rows = await query("select 1 from fin_categories where kind = $1 and lower(name) = lower($2) and id <> $3", [kind, name, exceptId]);
  return rows.length > 0;
}

export async function createCategory(c: { name: string; kind: TxType; monthlyBudget: number | null }) {
  const id = randomUUID();
  await query("insert into fin_categories (id, name, kind, monthly_budget) values ($1, $2, $3, $4)", [id, c.name, c.kind, c.monthlyBudget]);
  return id;
}

export const updateCategory = (id: string, c: { name: string; monthlyBudget: number | null; archived: boolean }) =>
  query("update fin_categories set name = $2, monthly_budget = $3, archived = $4 where id = $1", [id, c.name, c.monthlyBudget, c.archived]);

export async function deleteOrArchiveCategory(id: string): Promise<"deleted" | "archived"> {
  const used = await query("select 1 from fin_transactions where category_id = $1 limit 1", [id]);
  if (used.length) {
    await query("update fin_categories set archived = true where id = $1", [id]);
    return "archived";
  }
  await query("delete from fin_categories where id = $1", [id]);
  return "deleted";
}

/** Category of a type by name, created when missing (BlueBill invoice categories, "Advertising" for ad spend). */
export async function ensureCategory(kind: TxType, name: string): Promise<string> {
  const find = () => query<{ id: string }>("select id from fin_categories where kind = $1 and lower(name) = lower($2)", [kind, name]);
  const [found] = await find();
  if (found) return found.id;
  await query("insert into fin_categories (id, name, kind) values ($1, $2, $3) on conflict do nothing", [randomUUID(), name, kind]);
  return (await find())[0].id;
}

export const ensureIncomeCategory = (name: string) => ensureCategory("income", name);

// ---------- Transactions ----------

export type Transaction = {
  id: string;
  type: TxKind;
  amount: number; // EUR
  currency: string; // what was entered or invoiced
  original_amount: number | null; // in that currency, when it isn't EUR
  fx_rate: number | null;
  occurred_on: string;
  description: string;
  counterparty: string | null;
  account_id: string | null;
  account_name: string | null;
  account_logo: number | null; // logo version, null without a logo
  // Transfers only: the account the money went into (account_* is where it came from).
  to_account_id: string | null;
  to_account_name: string | null;
  to_account_logo: number | null;
  category_id: string | null;
  category_name: string | null;
  user_id: string | null;
  user_name: string | null;
  source: string;
  external_id: string | null;
  created_by: string | null;
  status: TxStatus;
  reviewed_at: string | null; // when an admin confirmed or cancelled it in the Register; null if it never waited
  reviewed_by_name: string | null;
};

/** Mirrors another system (BlueBill, Meta Ads), which owns its amount, date and type. Months of a recurring rule are not synced. */
export const isSynced = (source: string) => source !== "manual" && source !== "recurring";

export type TxFilter = {
  from?: string;
  to?: string;
  type?: TxKind;
  accountId?: string; // also matches transfers into the account
  categoryId?: string;
  userId?: string;
  source?: string;
  status?: TxStatus;
  q?: string;
};

const TX_SELECT = `
  select t.id, t.type, t.amount::float8 as amount, t.currency, t.original_amount::float8 as original_amount, t.fx_rate::float8 as fx_rate,
         to_char(t.occurred_on, 'YYYY-MM-DD') as occurred_on, t.description, t.counterparty,
         t.account_id, a.name as account_name, case when a.logo is null then null else a.logo_version end as account_logo,
         t.to_account_id, ta.name as to_account_name, case when ta.logo is null then null else ta.logo_version end as to_account_logo,
         t.category_id, c.name as category_name, t.user_id, u.name as user_name,
         t.source, t.external_id, t.created_by, t.status, t.reviewed_at::text as reviewed_at, ru.name as reviewed_by_name
  from fin_transactions t
  left join fin_accounts a on a.id = t.account_id
  left join fin_accounts ta on ta.id = t.to_account_id
  left join fin_categories c on c.id = t.category_id
  left join users u on u.id = t.user_id
  left join users ru on ru.id = t.reviewed_by`;

function where(f: TxFilter): { sql: string; params: unknown[] } {
  const parts: string[] = [];
  const params: unknown[] = [];
  const add = (cond: string, value: unknown) => {
    params.push(value);
    parts.push(cond.replace("?", `$${params.length}`));
  };
  if (f.from) add("t.occurred_on >= ?::date", f.from);
  if (f.to) add("t.occurred_on <= ?::date", f.to);
  if (f.type) add("t.type = ?", f.type);
  if (f.accountId === "none") parts.push("t.account_id is null");
  else if (f.accountId) {
    params.push(f.accountId);
    parts.push(`(t.account_id = $${params.length} or t.to_account_id = $${params.length})`);
  }
  if (f.categoryId === "none") parts.push("t.category_id is null");
  else if (f.categoryId) add("t.category_id = ?", f.categoryId);
  if (f.userId) add("t.user_id = ?", f.userId);
  if (f.source) add("t.source = ?", f.source);
  if (f.status) add("t.status = ?", f.status);
  if (f.q) add("(t.description || ' ' || coalesce(t.counterparty, '')) ilike ?", `%${f.q.replace(/[\\%_]/g, "\\$&")}%`);
  return { sql: parts.length ? `where ${parts.join(" and ")}` : "", params };
}

export async function listTransactions(f: TxFilter, limit = 100, offset = 0): Promise<Transaction[]> {
  const w = where(f);
  return query<Transaction>(
    `${TX_SELECT} ${w.sql} order by t.occurred_on desc, t.created_at desc limit ${Math.floor(limit)} offset ${Math.floor(offset)}`,
    w.params,
  );
}

export async function transactionTotals(f: TxFilter): Promise<{ count: number; income: number; expense: number }> {
  const w = where(f);
  const [row] = await query<{ count: number; income: number; expense: number }>(
    `select count(*)::int as count,
            coalesce(sum(amount) filter (where type = 'income' and status <> 'cancelled'), 0)::float8 as income,
            coalesce(sum(amount) filter (where type = 'expense' and status <> 'cancelled'), 0)::float8 as expense
     from fin_transactions t ${w.sql}`,
    w.params,
  );
  return row;
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  const [row] = await query<Transaction>(`${TX_SELECT} where t.id = $1`, [id]);
  return row ?? null;
}

export type TxInput = {
  type: TxKind;
  amount: number; // EUR
  currency: string;
  originalAmount: number | null;
  fxRate: number | null;
  occurredOn: string;
  description: string;
  counterparty: string;
  accountId: string | null;
  toAccountId: string | null; // transfers only
  categoryId: string | null;
  userId: string | null;
};

/** `status`: incomes and expenses entered by hand start pending, until confirmed in the Register; transfers are confirmed. */
export async function createTransaction(t: TxInput, createdBy: string, status: TxStatus = "confirmed"): Promise<string> {
  const id = randomUUID();
  await query(
    `insert into fin_transactions (id, type, amount, occurred_on, description, counterparty, account_id, category_id, user_id, created_by,
                                   currency, original_amount, fx_rate, to_account_id, status)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
    [id, t.type, t.amount, t.occurredOn, t.description, t.counterparty || null, t.accountId, t.categoryId, t.userId, createdBy,
      t.currency, t.originalAmount, t.fxRate, t.toAccountId, t.type === "transfer" ? "confirmed" : status],
  );
  return id;
}

// ---------- Register: confirming or cancelling pending money ----------

/** Incomes and expenses of these sources wait in the Register; synced ones mirror another system and can't be cancelled. */
const REVIEWABLE = "type in ('income', 'expense') and source in ('manual', 'recurring')";

/** What a review changed, and whose money it is (the person it's booked to, else who entered it), to tell them. */
export type ReviewedTx = { id: string; type: TxType; amount: number; description: string; owner_id: string | null };
const REVIEWED = "returning id, type, amount::float8 as amount, description, coalesce(user_id, created_by) as owner_id";

/** Confirms pending incomes and expenses: the money was handed over (or paid back) and counts in the balance. */
export async function confirmTransactions(ids: string[], reviewedBy: string): Promise<ReviewedTx[]> {
  if (!ids.length) return [];
  return query<ReviewedTx>(
    `update fin_transactions set status = 'confirmed', reviewed_at = now(), reviewed_by = $2, updated_at = now()
     where id = any($1) and status = 'pending' and ${REVIEWABLE}
     ${REVIEWED}`,
    [ids, reviewedBy],
  );
}

/** Cancels incomes and expenses, pending or confirmed: they stay listed but count nowhere. */
export async function cancelTransactions(ids: string[], reviewedBy: string): Promise<ReviewedTx[]> {
  if (!ids.length) return [];
  return query<ReviewedTx>(
    `update fin_transactions set status = 'cancelled', reviewed_at = now(), reviewed_by = $2, updated_at = now()
     where id = any($1) and status <> 'cancelled' and ${REVIEWABLE}
     ${REVIEWED}`,
    [ids, reviewedBy],
  );
}

/** Undoes a confirmation or a cancellation: the transaction is pending again, waiting in the Register. */
export const reopenTransaction = (id: string) =>
  query(
    `update fin_transactions set status = 'pending', reviewed_at = null, reviewed_by = null, updated_at = now()
     where id = $1 and reviewed_at is not null and ${REVIEWABLE}`,
    [id],
  );

/** The latest confirmations and cancellations, newest first (one person's, with `userId`). */
export const listRecentlyReviewed = (limit: number, userId?: string) =>
  query<Transaction>(
    `${TX_SELECT} where t.reviewed_at is not null ${userId ? "and t.user_id = $1" : ""} order by t.reviewed_at desc limit ${Math.floor(limit)}`,
    userId ? [userId] : [],
  );

export const updateTransaction = (id: string, t: TxInput) =>
  query(
    `update fin_transactions set type = $2, amount = $3, occurred_on = $4, description = $5, counterparty = $6,
            account_id = $7, category_id = $8, user_id = $9, currency = $10, original_amount = $11, fx_rate = $12, to_account_id = $13,
            updated_at = now()
     where id = $1`,
    [id, t.type, t.amount, t.occurredOn, t.description, t.counterparty || null, t.accountId, t.categoryId, t.userId,
      t.currency, t.originalAmount, t.fxRate, t.toAccountId],
  );

/** Synced transactions keep amount, date and type from the source; only the booking can change. */
export const updateTransactionBooking = (id: string, b: { accountId: string | null; categoryId: string | null; userId: string | null }) =>
  query("update fin_transactions set account_id = $2, category_id = $3, user_id = $4, updated_at = now() where id = $1", [
    id, b.accountId, b.categoryId, b.userId,
  ]);

export const deleteTransaction = (id: string) => query("delete from fin_transactions where id = $1", [id]);

// ---------- Recurring transactions ----------

export type RecurringRule = {
  id: string;
  type: TxType;
  amount: number; // in currency
  currency: string;
  day: number;
  description: string;
  counterparty: string | null;
  account_id: string | null;
  account_name: string | null;
  category_id: string | null;
  category_name: string | null;
  user_id: string | null;
  user_name: string | null;
  next_month: string; // first month not booked yet
  end_month: string | null;
  created_by: string | null;
};

const RULE_SELECT = `
  select r.id, r.type, r.amount::float8 as amount, r.currency, r.day, r.description, r.counterparty,
         r.account_id, a.name as account_name, r.category_id, c.name as category_name, r.user_id, u.name as user_name,
         r.next_month, r.end_month, r.created_by
  from fin_recurring r
  left join fin_accounts a on a.id = r.account_id
  left join fin_categories c on c.id = r.category_id
  left join users u on u.id = r.user_id`;

/** Whether a rule has booked its last month. */
export const ruleEnded = (r: Pick<RecurringRule, "next_month" | "end_month">) => r.end_month !== null && r.next_month > r.end_month;

/** Running rules first, by the date they next book. */
export const listRecurring = () =>
  query<RecurringRule>(`${RULE_SELECT} order by (r.end_month is not null and r.next_month > r.end_month), r.next_month, r.day, r.description`);

export async function getRecurring(id: string): Promise<RecurringRule | null> {
  const [row] = await query<RecurringRule>(`${RULE_SELECT} where r.id = $1`, [id]);
  return row ?? null;
}

/** The rule a booked month came from: external_id is recurring:<rule id>:<YYYY-MM>. */
export const ruleOf = (externalId: string | null) => {
  const [kind, id, month] = externalId?.split(":") ?? [];
  return kind === "recurring" && id && month ? { id, month } : null;
};

/** A rule from a transaction's input: its date is the first month and sets the day of every later one. */
export async function createRecurring(t: TxInput, endMonth: string | null, createdBy: string): Promise<string> {
  const id = randomUUID();
  await query(
    `insert into fin_recurring (id, type, amount, currency, day, description, counterparty, account_id, category_id, user_id,
                                next_month, end_month, created_by)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [id, t.type, t.originalAmount ?? t.amount, t.currency, Number(t.occurredOn.slice(8, 10)), t.description, t.counterparty || null,
      t.accountId, t.categoryId, t.userId, monthOf(t.occurredOn), endMonth, createdBy],
  );
  return id;
}

/** An ended rule given a later end resumes from this month, without booking the months it was stopped for. */
export async function updateRecurring(rule: RecurringRule, t: TxInput, day: number, endMonth: string | null) {
  const current = monthOf(today());
  const next = ruleEnded(rule) && rule.next_month < current ? current : rule.next_month;
  await query(
    `update fin_recurring set type = $2, amount = $3, currency = $4, day = $5, description = $6, counterparty = $7,
            account_id = $8, category_id = $9, user_id = $10, end_month = $11, next_month = $12
     where id = $1`,
    [rule.id, t.type, t.originalAmount ?? t.amount, t.currency, day, t.description, t.counterparty || null, t.accountId, t.categoryId, t.userId,
      endMonth, next],
  );
}

/** Stops a rule; the months it booked stay. */
export const deleteRecurring = (id: string) => query("delete from fin_recurring where id = $1", [id]);

/**
 * Books each rule's months whose day has come, as ordinary transactions. Pages that show transactions call it first, so no
 * scheduled job is needed and months missed while nobody looked are caught up. external_id stops a month from being booked
 * twice when two requests run this at once, and next_month moving past a month keeps it deleted if it's deleted later.
 */
export async function bookRecurring(now = today()): Promise<void> {
  const due = await query<RecurringRule>(`${RULE_SELECT} where r.next_month <= $1 and (r.end_month is null or r.next_month <= r.end_month)`, [
    monthOf(now),
  ]);
  if (!due.length) return;
  const rates = await getRates();
  for (const r of due) {
    let month = r.next_month;
    while ((r.end_month === null || month <= r.end_month) && dayOfMonth(month, r.day) <= now) {
      const value = toBase(r.amount, r.currency, rates);
      if (!value) break; // the currency's rate was removed: booked once it's back
      await query(
        `insert into fin_transactions (id, type, amount, occurred_on, description, counterparty, account_id, category_id, user_id, created_by,
                                       currency, original_amount, fx_rate, source, external_id)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'recurring', $14)
         on conflict (external_id) do nothing`,
        [randomUUID(), r.type, value.amount, dayOfMonth(month, r.day), r.description, r.counterparty, r.account_id, r.category_id, r.user_id,
          r.created_by, r.currency, r.currency === BASE_CURRENCY ? null : r.amount, value.rate, `recurring:${r.id}:${month}`],
      );
      month = addMonths(month, 1);
    }
    if (month !== r.next_month) await query("update fin_recurring set next_month = $2 where id = $1 and next_month = $3", [r.id, month, r.next_month]);
  }
}

// ---------- Settings store ----------

export async function getSetting<T>(key: string): Promise<T | null> {
  const [row] = await query<{ value: T }>("select value from app_settings where key = $1", [key]);
  return row?.value ?? null;
}

export const setSetting = (key: string, value: unknown) =>
  query(
    "insert into app_settings (key, value, updated_at) values ($1, $2::jsonb, now()) on conflict (key) do update set value = excluded.value, updated_at = now()",
    [key, JSON.stringify(value)],
  );
