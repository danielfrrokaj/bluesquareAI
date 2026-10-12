import "server-only";
import { randomUUID } from "node:crypto";
import { query } from "./db";

export type TxType = "income" | "expense";
export const TX_TYPES: Record<TxType, string> = { income: "Income", expense: "Expense" };
export const isTxType = (v: unknown): v is TxType => v === "income" || v === "expense";

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

export type Account = {
  id: string; name: string; description: string | null; opening_balance: number; archived: boolean;
  logo_version: number | null; // null: no logo
};

export const listAccounts = (includeArchived = false) =>
  query<Account>(
    `select id, name, description, opening_balance::float8 as opening_balance, archived,
            case when logo is null then null else logo_version end as logo_version
     from fin_accounts ${includeArchived ? "" : "where not archived"} order by archived, name`,
  );

export async function createAccount(a: { name: string; description: string; openingBalance: number }) {
  const id = randomUUID();
  await query("insert into fin_accounts (id, name, description, opening_balance) values ($1, $2, $3, $4)", [
    id, a.name, a.description || null, a.openingBalance,
  ]);
  return id;
}

export const updateAccount = (id: string, a: { name: string; description: string; openingBalance: number; archived: boolean }) =>
  query("update fin_accounts set name = $2, description = $3, opening_balance = $4, archived = $5 where id = $1", [
    id, a.name, a.description || null, a.openingBalance, a.archived,
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
  const used = await query("select 1 from fin_transactions where account_id = $1 limit 1", [id]);
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
  type: TxType;
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
  category_id: string | null;
  category_name: string | null;
  user_id: string | null;
  user_name: string | null;
  source: string;
  external_id: string | null;
  created_by: string | null;
};

export type TxFilter = {
  from?: string;
  to?: string;
  type?: TxType;
  accountId?: string;
  categoryId?: string;
  userId?: string;
  source?: string;
  q?: string;
};

const TX_SELECT = `
  select t.id, t.type, t.amount::float8 as amount, t.currency, t.original_amount::float8 as original_amount, t.fx_rate::float8 as fx_rate,
         to_char(t.occurred_on, 'YYYY-MM-DD') as occurred_on, t.description, t.counterparty,
         t.account_id, a.name as account_name, case when a.logo is null then null else a.logo_version end as account_logo, t.category_id, c.name as category_name, t.user_id, u.name as user_name,
         t.source, t.external_id, t.created_by
  from fin_transactions t
  left join fin_accounts a on a.id = t.account_id
  left join fin_categories c on c.id = t.category_id
  left join users u on u.id = t.user_id`;

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
  else if (f.accountId) add("t.account_id = ?", f.accountId);
  if (f.categoryId === "none") parts.push("t.category_id is null");
  else if (f.categoryId) add("t.category_id = ?", f.categoryId);
  if (f.userId) add("t.user_id = ?", f.userId);
  if (f.source) add("t.source = ?", f.source);
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
            coalesce(sum(amount) filter (where type = 'income'), 0)::float8 as income,
            coalesce(sum(amount) filter (where type = 'expense'), 0)::float8 as expense
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
  type: TxType;
  amount: number; // EUR
  currency: string;
  originalAmount: number | null;
  fxRate: number | null;
  occurredOn: string;
  description: string;
  counterparty: string;
  accountId: string | null;
  categoryId: string | null;
  userId: string | null;
};

export async function createTransaction(t: TxInput, createdBy: string): Promise<string> {
  const id = randomUUID();
  await query(
    `insert into fin_transactions (id, type, amount, occurred_on, description, counterparty, account_id, category_id, user_id, created_by,
                                   currency, original_amount, fx_rate)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [id, t.type, t.amount, t.occurredOn, t.description, t.counterparty || null, t.accountId, t.categoryId, t.userId, createdBy,
      t.currency, t.originalAmount, t.fxRate],
  );
  return id;
}

export const updateTransaction = (id: string, t: TxInput) =>
  query(
    `update fin_transactions set type = $2, amount = $3, occurred_on = $4, description = $5, counterparty = $6,
            account_id = $7, category_id = $8, user_id = $9, currency = $10, original_amount = $11, fx_rate = $12, updated_at = now()
     where id = $1`,
    [id, t.type, t.amount, t.occurredOn, t.description, t.counterparty || null, t.accountId, t.categoryId, t.userId,
      t.currency, t.originalAmount, t.fxRate],
  );

/** Synced transactions keep amount, date and type from the source; only the booking can change. */
export const updateTransactionBooking = (id: string, b: { accountId: string | null; categoryId: string | null; userId: string | null }) =>
  query("update fin_transactions set account_id = $2, category_id = $3, user_id = $4, updated_at = now() where id = $1", [
    id, b.accountId, b.categoryId, b.userId,
  ]);

export const deleteTransaction = (id: string) => query("delete from fin_transactions where id = $1", [id]);

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
