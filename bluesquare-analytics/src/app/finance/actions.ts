"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdmin, requireAuth, requireRole } from "@/lib/auth";
import {
  BASE_CURRENCY, categoryNameTaken, createAccount, currencyCode, getRates, removeRate as deleteRate, setRate, toBase, createCategory, createTransaction, deleteOrArchiveAccount, deleteOrArchiveCategory, setAccountLogo,
  deleteTransaction, getTransaction, isTxType, listAccounts, listCategories, updateAccount, updateCategory,
  updateTransaction, updateTransactionBooking, type Transaction, type TxInput,
} from "@/lib/finance";
import { listUsers } from "@/lib/users";
import { BlueBillError, connect, deactivate, disconnect, reactivate, setBlueBillAccount, syncInvoices } from "@/lib/bluebill";
import { isDate } from "@/lib/period";
import { readLogo } from "@/lib/logo";
import type { FormState } from "@/components/ActionForm";

const str = (form: FormData, key: string, max = 200) => String(form.get(key) ?? "").trim().slice(0, max);

/** "12,000.50" or "12000,5" -> 12000.5; null when not a number. */
function amount(raw: string): number | null {
  const s = raw.replace(/\s/g, "");
  const normalized = /,\d{1,2}$/.test(s) && !s.includes(".") ? s.replace(",", ".") : s.replace(/,/g, "");
  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const n = Number(normalized);
  return Number.isFinite(n) && Math.abs(n) < 1e12 ? n : null;
}

const refresh = () => revalidatePath("/finance", "layout");

// ---------- Transactions (any signed-in user; members edit only their own) ----------

/** `existing` keeps its exchange rate while its currency and amount are unchanged. */
async function readTransaction(form: FormData, existing?: Transaction): Promise<TxInput | string> {
  const type = str(form, "type");
  const value = amount(str(form, "amount", 30));
  const currency = currencyCode(str(form, "currency", 3) || BASE_CURRENCY);
  const occurredOn = str(form, "occurred_on", 10);
  const description = str(form, "description", 300);
  const accountId = str(form, "account_id") || null;
  const categoryId = str(form, "category_id") || null;
  const userId = str(form, "user_id") || null;
  if (!isTxType(type)) return "Choose income or expense.";
  if (value === null || value <= 0) return "Enter an amount greater than 0, e.g. 12000 or 12000.50.";
  if (!currency) return "Choose a currency.";
  const unchanged = existing && existing.currency === currency && (existing.original_amount ?? existing.amount) === value;
  const converted = unchanged && existing.fx_rate
    ? { amount: existing.amount, rate: existing.fx_rate }
    : toBase(value, currency, await getRates());
  if (!converted) return `There's no ${currency} rate yet. An admin can add it in Finance → Settings → Currency rates.`;
  if (!isDate(occurredOn)) return "Enter a valid date.";
  if (!description) return "Add a short description.";
  const [accounts, categories, users] = await Promise.all([listAccounts(true), listCategories(true), listUsers()]);
  if (accountId && !accounts.some((a) => a.id === accountId)) return "That account no longer exists.";
  const category = categoryId ? categories.find((c) => c.id === categoryId) : null;
  if (categoryId && !category) return "That category no longer exists.";
  if (category && category.kind !== type) return `“${category.name}” is an ${category.kind} category; pick one for ${type}.`;
  if (userId && !users.some((u) => u.id === userId)) return "That user no longer exists.";
  const foreign = currency !== BASE_CURRENCY;
  return {
    type, amount: converted.amount, currency, originalAmount: foreign ? value : null, fxRate: foreign ? converted.rate : null,
    occurredOn, description, counterparty: str(form, "counterparty", 120), accountId, categoryId, userId,
  };
}

export async function addTransaction(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireAuth();
  const input = await readTransaction(form);
  if (typeof input === "string") return { error: input };
  // Members record their own transactions; admins may record them for anyone.
  if (!isAdmin(user)) input.userId = user.id;
  await createTransaction(input, user.id);
  refresh();
  return { ok: `Saved: ${input.description}.` };
}

async function editableTransaction(id: string) {
  const user = await requireAuth();
  const tx = await getTransaction(id);
  if (!tx) redirect("/finance/transactions");
  if (!isAdmin(user) && tx.created_by !== user.id && tx.user_id !== user.id) redirect("/forbidden");
  return { user, tx };
}

export async function saveTransaction(_: FormState, form: FormData): Promise<FormState> {
  const { user, tx } = await editableTransaction(str(form, "id"));
  if (tx.source !== "manual") {
    // Synced transactions mirror the fiscal invoice; only where it's booked can change.
    const accountId = str(form, "account_id") || null;
    const categoryId = str(form, "category_id") || null;
    const categories = await listCategories(true);
    const category = categoryId ? categories.find((c) => c.id === categoryId) : null;
    if (category && category.kind !== tx.type) return { error: `Pick a ${tx.type} category.` };
    await updateTransactionBooking(tx.id, { accountId, categoryId, userId: isAdmin(user) ? str(form, "user_id") || null : tx.user_id });
  } else {
    const input = await readTransaction(form, tx);
    if (typeof input === "string") return { error: input };
    if (!isAdmin(user)) input.userId = tx.user_id;
    await updateTransaction(tx.id, input);
  }
  refresh();
  return { ok: "Changes saved." };
}

export async function removeTransaction(_: FormState, form: FormData): Promise<FormState> {
  const { tx } = await editableTransaction(str(form, "id"));
  if (tx.source === "meta_ads") return { error: "This expense comes from Marketing & Ads → Meta Ads; change or delete the results there." };
  if (tx.source !== "manual") return { error: "Synced transactions can't be deleted here; they mirror a fiscalized invoice." };
  await deleteTransaction(tx.id);
  refresh();
  redirect("/finance/transactions?deleted=1");
}

// ---------- Settings: virtual accounts & categories (admin) ----------

export async function addAccount(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  const name = str(form, "name", 80);
  const opening = amount(str(form, "opening_balance", 30) || "0");
  if (!name) return { error: "Enter a name for the account." };
  if (opening === null) return { error: "Enter a valid opening balance, e.g. 0 or 150000." };
  const logo = await readLogo(form);
  if (typeof logo === "string") return { error: logo };
  const id = await createAccount({ name, description: str(form, "description", 200), openingBalance: opening });
  if (logo) await setAccountLogo(id, logo);
  refresh();
  return { ok: `Account “${name}” created.` };
}

export async function saveAccount(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  const name = str(form, "name", 80);
  const opening = amount(str(form, "opening_balance", 30) || "0");
  if (!name) return { error: "The name can't be empty." };
  if (opening === null) return { error: "Enter a valid opening balance." };
  const logo = await readLogo(form);
  if (typeof logo === "string") return { error: logo };
  if (logo) await setAccountLogo(str(form, "id"), logo);
  else if (form.get("remove_logo") === "on") await setAccountLogo(str(form, "id"), null);
  await updateAccount(str(form, "id"), { name, description: str(form, "description", 200), openingBalance: opening, archived: form.get("archived") === "on" });
  refresh();
  return { ok: "Saved." };
}

export async function removeAccount(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  const result = await deleteOrArchiveAccount(str(form, "id"));
  refresh();
  return { ok: result === "archived" ? "It has transactions, so it was archived instead." : "Deleted." };
}

function budget(form: FormData): number | null | undefined {
  const raw = str(form, "monthly_budget", 30);
  if (!raw) return null;
  const n = amount(raw);
  return n !== null && n >= 0 ? n : undefined;
}

export async function addCategory(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  const name = str(form, "name", 80);
  const kind = str(form, "kind");
  const monthlyBudget = budget(form);
  if (!name) return { error: "Enter a name for the category." };
  if (!isTxType(kind)) return { error: "Choose income or expense." };
  if (monthlyBudget === undefined) return { error: "Enter a valid monthly budget or leave it empty." };
  if (await categoryNameTaken(kind, name)) return { error: `There is already an ${kind} category called “${name}”.` };
  await createCategory({ name, kind, monthlyBudget: kind === "expense" ? monthlyBudget : null });
  refresh();
  return { ok: `Category “${name}” created.` };
}

export async function saveCategory(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  const id = str(form, "id");
  const name = str(form, "name", 80);
  const monthlyBudget = budget(form);
  const current = (await listCategories(true)).find((c) => c.id === id);
  if (!current) return { error: "This category no longer exists." };
  if (!name) return { error: "The name can't be empty." };
  if (monthlyBudget === undefined) return { error: "Enter a valid monthly budget or leave it empty." };
  if (await categoryNameTaken(current.kind, name, id)) return { error: `There is already a category called “${name}”.` };
  await updateCategory(id, { name, monthlyBudget: current.kind === "expense" ? monthlyBudget : null, archived: form.get("archived") === "on" });
  refresh();
  return { ok: "Saved." };
}

export async function removeCategory(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  const result = await deleteOrArchiveCategory(str(form, "id"));
  refresh();
  return { ok: result === "archived" ? "It has transactions, so it was archived instead." : "Deleted." };
}

// ---------- Settings: fiscalization / BlueBill (admin) ----------

const blueBillMessage = (err: unknown) => {
  if (err instanceof BlueBillError) return err.message + (err.requestId ? ` (request ${err.requestId})` : "");
  console.error("BlueBill action failed", err);
  return "Something went wrong talking to BlueBill.";
};

export async function connectBlueBill(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  const token = str(form, "token", 500);
  const accountId = str(form, "account_id") || null;
  if (token.length < 20 || /\s/.test(token)) return { error: "Paste the full service token from BlueBill (Settings → API)." };
  try {
    await connect(token, accountId);
  } catch (err) {
    return { error: blueBillMessage(err) };
  }
  const result = await syncInvoices({ full: true });
  refresh();
  return result.ok
    ? { ok: `Connected. ${result.added} fiscalized invoice${result.added === 1 ? "" : "s"} imported.` }
    : { error: `Connected, but the first sync failed: ${result.error}` };
}

export async function syncBlueBill(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  const result = await syncInvoices({ full: form.get("full") === "1" });
  refresh();
  return result.ok
    ? { ok: result.added ? `${result.added} new invoice${result.added === 1 ? "" : "s"} imported.` : "Up to date, no new invoices." }
    : { error: result.error };
}

export async function saveBlueBillAccount(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  await setBlueBillAccount(str(form, "account_id") || null);
  refresh();
  return { ok: "Saved. New invoices will be booked to this account." };
}

export async function toggleBlueBill(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  try {
    if (form.get("active") === "1") await reactivate();
    else await deactivate();
  } catch (err) {
    return { error: blueBillMessage(err) };
  }
  refresh();
  return { ok: form.get("active") === "1" ? "Connection activated." : "Connection paused. Nothing is synced until you activate it again." };
}

export async function disconnectBlueBill(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  if (str(form, "confirm") !== "DISCONNECT") return { error: "Type DISCONNECT to confirm." };
  await disconnect();
  refresh();
  return { ok: "Token removed. Invoices already imported stay in your books." };
}

// ---------- Settings: currency rates (admin) ----------

/** "91.77" or "91,77" -> 91.77; null unless a positive number. */
function rate(raw: string): number | null {
  const n = Number(raw.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 && n < 1e7 ? Math.round(n * 1e6) / 1e6 : null;
}

export async function saveRate(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  const currency = currencyCode(str(form, "currency", 3));
  const value = rate(str(form, "rate", 30));
  if (!currency) return { error: "Enter a 3-letter currency code, e.g. ALL or USD." };
  if (currency === BASE_CURRENCY) return { error: `${BASE_CURRENCY} is the base currency; it needs no rate.` };
  if (value === null) return { error: `Enter how many ${currency} make 1 ${BASE_CURRENCY}, e.g. 91.77.` };
  const recalculate = form.get("recalculate") === "on";
  await setRate(currency, value, recalculate);
  refresh();
  revalidatePath("/");
  return { ok: `1 ${BASE_CURRENCY} = ${value} ${currency}${recalculate ? "; existing transactions recalculated" : ""}.` };
}

export async function removeRate(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  const currency = str(form, "currency", 3);
  if (!(await deleteRate(currency))) return { error: `Transactions in ${currency} use this rate, so it can't be removed. Change the rate instead.` };
  refresh();
  return { ok: `${currency} removed.` };
}
