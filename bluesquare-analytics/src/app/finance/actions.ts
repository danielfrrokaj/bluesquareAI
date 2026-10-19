"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdmin, requireAuth, requireRole } from "@/lib/auth";
import {
  BASE_CURRENCY, categoryNameTaken, createAccount, currencyCode, getRates, removeRate as deleteRate, setRate, toBase, createCategory, createTransaction, deleteOrArchiveAccount, deleteOrArchiveCategory, isAccountGroup, setAccountLogo,
  deleteTransaction, getTransaction, isTxType, listAccounts, listCategories, updateAccount, updateCategory,
  updateTransaction, updateTransactionBooking, type Transaction, type TxInput,
  bookRecurring, createRecurring, deleteRecurring, getRecurring, isSynced, updateRecurring,
  cancelTransactions, confirmTransactions, reopenTransaction,
} from "@/lib/finance";
import { listUsers } from "@/lib/users";
import { BlueBillError, connect, deactivate, disconnect, reactivate, setBlueBillAccount, syncInvoices } from "@/lib/bluebill";
import { parseAmount } from "@/lib/format";
import { dayOfMonth, isDate, isMonth, monthOf, today } from "@/lib/period";
import { readLogo } from "@/lib/logo";
import { setChannexCategory } from "@/lib/channex";
import { notifyReviewed } from "@/lib/notifications";
import { isChannexCategory } from "@/lib/channex-pricing";
import type { FormState } from "@/components/ActionForm";

const str = (form: FormData, key: string, max = 200) => String(form.get(key) ?? "").trim().slice(0, max);

const refresh = () => revalidatePath("/finance", "layout");

// ---------- Transactions (any signed-in user; members edit only their own) ----------

/** The entered amount and currency, converted to EUR; `existing` keeps its exchange rate while both are unchanged. */
async function convertedAmount(form: FormData, existing?: Transaction): Promise<Pick<TxInput, "amount" | "currency" | "originalAmount" | "fxRate"> | string> {
  const value = parseAmount(str(form, "amount", 30));
  const currency = currencyCode(str(form, "currency", 3) || BASE_CURRENCY);
  if (value === null || value <= 0) return "Enter an amount greater than 0, e.g. 12000 or 12000.50.";
  if (!currency) return "Choose a currency.";
  const unchanged = existing && existing.currency === currency && (existing.original_amount ?? existing.amount) === value;
  const converted = unchanged && existing.fx_rate ? { amount: existing.amount, rate: existing.fx_rate } : toBase(value, currency, await getRates());
  if (!converted) return `There's no ${currency} rate yet. An admin can add it in Finance → Settings → Currency rates.`;
  const foreign = currency !== BASE_CURRENCY;
  return { amount: converted.amount, currency, originalAmount: foreign ? value : null, fxRate: foreign ? converted.rate : null };
}

async function readTransaction(form: FormData, existing?: Transaction, occurredOn = str(form, "occurred_on", 10)): Promise<TxInput | string> {
  const type = str(form, "type");
  const description = str(form, "description", 300);
  const accountId = str(form, "account_id") || null;
  const categoryId = str(form, "category_id") || null;
  const userId = str(form, "user_id") || null;
  if (!isTxType(type)) return "Choose income or expense.";
  const value = await convertedAmount(form, existing);
  if (typeof value === "string") return value;
  if (!isDate(occurredOn)) return "Enter a valid date.";
  if (!description) return "Add a short description.";
  const [accounts, categories, users] = await Promise.all([listAccounts(true), listCategories(true), listUsers()]);
  if (accountId && !accounts.some((a) => a.id === accountId)) return "That account no longer exists.";
  const category = categoryId ? categories.find((c) => c.id === categoryId) : null;
  if (categoryId && !category) return "That category no longer exists.";
  if (category && category.kind !== type) return `“${category.name}” is an ${category.kind} category; pick one for ${type}.`;
  if (userId && !users.some((u) => u.id === userId)) return "That user no longer exists.";
  return {
    type, ...value, occurredOn, description, counterparty: str(form, "counterparty", 120), accountId, toAccountId: null, categoryId, userId,
  };
}

/** A transfer moves money from one virtual account to another: no category, not income or expense. */
async function readTransfer(form: FormData, existing?: Transaction): Promise<TxInput | string> {
  const from = str(form, "account_id");
  const to = str(form, "to_account_id");
  const occurredOn = str(form, "occurred_on", 10);
  const value = await convertedAmount(form, existing);
  if (typeof value === "string") return value;
  if (!isDate(occurredOn)) return "Enter a valid date.";
  if (!from || !to) return "Choose both accounts.";
  if (from === to) return "Choose two different accounts.";
  const accounts = await listAccounts(true);
  const source = accounts.find((a) => a.id === from);
  const target = accounts.find((a) => a.id === to);
  if (!source || !target) return "That account no longer exists.";
  // An archived account can stay on a transfer it already had, but can't be picked for a new one.
  const kept = (id: string) => existing?.account_id === id || existing?.to_account_id === id;
  if ((source.archived && !kept(from)) || (target.archived && !kept(to))) return "Archived accounts can't receive or send new transfers.";
  return {
    type: "transfer", ...value, occurredOn, description: str(form, "description", 300) || `Transfer ${source.name} → ${target.name}`,
    counterparty: "", accountId: from, toAccountId: to, categoryId: null, userId: existing ? existing.user_id : null,
  };
}

export async function addTransfer(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireAuth();
  const input = await readTransfer(form);
  if (typeof input === "string") return { error: input };
  input.userId = user.id;
  await createTransaction(input, user.id);
  refresh();
  return { ok: `Transferred: ${input.description}.` };
}

export async function addTransaction(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireAuth();
  const input = await readTransaction(form);
  if (typeof input === "string") return { error: input };
  // Members record their own transactions; admins may record them for anyone.
  if (!isAdmin(user)) input.userId = user.id;
  if (form.get("repeat")) {
    const until = readUntil(form);
    if (until === false) return { error: "Enter the last month as YYYY-MM, e.g. 2027-06." };
    if (until && until < monthOf(input.occurredOn)) return { error: "The last month can't be before the first date." };
    await createRecurring(input, until, user.id);
    await bookRecurring();
    refresh();
    return input.occurredOn <= today()
      ? { ok: `Saved: ${input.description}. It repeats every month.` }
      : { ok: `Scheduled: ${input.description}. It's booked from ${input.occurredOn}, then every month.` };
  }
  // The money stays with the person until an admin confirms it in the Register.
  await createTransaction(input, user.id, "pending");
  refresh();
  return { ok: `Saved as pending: ${input.description}.` };
}

/** The optional last month of a recurring rule: null when empty, false when it isn't a month. */
function readUntil(form: FormData): string | null | false {
  const until = str(form, "until", 7);
  return !until ? null : isMonth(until) ? until : false;
}

async function editableTransaction(id: string) {
  const user = await requireAuth();
  const tx = await getTransaction(id);
  if (!tx) redirect("/finance/transactions");
  if (!isAdmin(user) && tx.created_by !== user.id && tx.user_id !== user.id) redirect("/forbidden");
  // Once an admin confirmed or cancelled it in the Register, only an admin may change it.
  const locked = !isAdmin(user) && tx.reviewed_at !== null;
  return { user, tx, locked };
}

const LOCKED = "This transaction was already reviewed in the Register; ask an admin to change it.";

export async function saveTransaction(_: FormState, form: FormData): Promise<FormState> {
  const { user, tx, locked } = await editableTransaction(str(form, "id"));
  if (locked) return { error: LOCKED };
  if (isSynced(tx.source)) {
    // Synced transactions mirror the fiscal invoice; only where it's booked can change.
    const accountId = str(form, "account_id") || null;
    const categoryId = str(form, "category_id") || null;
    const categories = await listCategories(true);
    const category = categoryId ? categories.find((c) => c.id === categoryId) : null;
    if (category && category.kind !== tx.type) return { error: `Pick a ${tx.type} category.` };
    await updateTransactionBooking(tx.id, { accountId, categoryId, userId: isAdmin(user) ? str(form, "user_id") || null : tx.user_id });
  } else if (tx.type === "transfer") {
    const input = await readTransfer(form, tx);
    if (typeof input === "string") return { error: input };
    await updateTransaction(tx.id, input);
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
  const { tx, locked } = await editableTransaction(str(form, "id"));
  if (locked) return { error: LOCKED };
  if (tx.source === "meta_ads") return { error: "This expense comes from Marketing & Ads → Meta Ads; change or delete the results there." };
  if (isSynced(tx.source)) return { error: "Synced transactions can't be deleted here; they mirror a fiscalized invoice." };
  await deleteTransaction(tx.id);
  refresh();
  redirect("/finance/transactions?deleted=1");
}

// ---------- Register: confirming or cancelling pending transactions (admin) ----------

const postedIds = (form: FormData) => form.getAll("id").map(String).filter((id) => /^[\w-]{1,64}$/.test(id)).slice(0, 1000);

/** Confirms the posted transactions (`id`, one or many): the money was handed over and now counts in the balance. */
export async function confirm(form: FormData) {
  const user = await requireRole("admin");
  await notifyReviewed(await confirmTransactions(postedIds(form), user.id), "confirmed", user.id);
  refresh();
}

/** Cancels the posted transactions: they stay listed, marked cancelled, but count nowhere. */
export async function cancel(form: FormData) {
  const user = await requireRole("admin");
  await notifyReviewed(await cancelTransactions(postedIds(form), user.id), "cancelled", user.id);
  refresh();
}

/** Undoes a confirmation or cancellation made by mistake: pending again, back in the Register. */
export async function reopen(form: FormData) {
  await requireRole("admin");
  await reopenTransaction(str(form, "id", 64));
  refresh();
}

// ---------- Recurring rules (same access as transactions) ----------

async function editableRule(id: string) {
  const user = await requireAuth();
  const rule = await getRecurring(id);
  if (!rule) redirect("/finance/transactions");
  if (!isAdmin(user) && rule.created_by !== user.id && rule.user_id !== user.id) redirect("/forbidden");
  return { user, rule };
}

export async function saveRecurring(_: FormState, form: FormData): Promise<FormState> {
  const { user, rule } = await editableRule(str(form, "id"));
  const day = Number(str(form, "day", 2));
  if (!Number.isInteger(day) || day < 1 || day > 31) return { error: "Enter a day of the month from 1 to 31." };
  const until = readUntil(form);
  if (until === false) return { error: "Enter the last month as YYYY-MM, e.g. 2027-06." };
  const input = await readTransaction(form, undefined, dayOfMonth(rule.next_month, day));
  if (typeof input === "string") return { error: input };
  if (!isAdmin(user)) input.userId = rule.user_id;
  await updateRecurring(rule, input, day, until);
  // The new day may already have come this month.
  await bookRecurring();
  refresh();
  return { ok: "Saved. Months already booked keep their amounts." };
}

export async function removeRecurring(_: FormState, form: FormData): Promise<FormState> {
  const { rule } = await editableRule(str(form, "id"));
  await deleteRecurring(rule.id);
  refresh();
  return { ok: `Stopped: ${rule.description}. Months already booked stay.` };
}

// ---------- Settings: virtual accounts & categories (admin) ----------

export async function addAccount(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  const name = str(form, "name", 80);
  const opening = parseAmount(str(form, "opening_balance", 30) || "0");
  if (!name) return { error: "Enter a name for the account." };
  if (opening === null) return { error: "Enter a valid opening balance, e.g. 0 or 150000." };
  const logo = await readLogo(form);
  if (typeof logo === "string") return { error: logo };
  const group = str(form, "group");
  const id = await createAccount({ name, description: str(form, "description", 200), openingBalance: opening, group: isAccountGroup(group) ? group : "own" });
  if (logo) await setAccountLogo(id, logo);
  refresh();
  return { ok: `Account “${name}” created.` };
}

export async function saveAccount(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  const name = str(form, "name", 80);
  const opening = parseAmount(str(form, "opening_balance", 30) || "0");
  if (!name) return { error: "The name can't be empty." };
  if (opening === null) return { error: "Enter a valid opening balance." };
  const logo = await readLogo(form);
  if (typeof logo === "string") return { error: logo };
  if (logo) await setAccountLogo(str(form, "id"), logo);
  else if (form.get("remove_logo") === "on") await setAccountLogo(str(form, "id"), null);
  const group = str(form, "group");
  await updateAccount(str(form, "id"), {
    name, description: str(form, "description", 200), openingBalance: opening, archived: form.get("archived") === "on", group: isAccountGroup(group) ? group : "own",
  });
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
  const n = parseAmount(raw);
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

// ---------- Channex: billing category of each property (admin) ----------

export async function saveChannexCategory(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireRole("admin");
  const hotelId = str(form, "hotel_id", 128);
  const category = str(form, "category", 20);
  if (!/^[A-Za-z0-9_-]+$/.test(hotelId)) return { error: "That property no longer exists." };
  if (!isChannexCategory(category)) return { error: "Choose hotel or vacation rental." };
  await setChannexCategory(hotelId, category, user.id);
  refresh();
  return { ok: `Billed as ${category === "hotel" ? "a hotel" : "a vacation rental"}.` };
}
