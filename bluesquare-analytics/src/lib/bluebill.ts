import "server-only";
import { query } from "./db";
import { decrypt, encrypt } from "./crypto";
import { BASE_CURRENCY, ensureIncomeCategory, getRates, getSetting, setSetting, toBase, type Rates } from "./finance";
import { TZ } from "./period";

// BlueBill fiscalization: we store a service token, then pull fiscalized invoices and book each one
// as an income transaction. Pulling is idempotent (invoice id is the key), so a sync can be re-run
// or run on two instances at once without duplicates.

const API = () => (process.env.BLUEBILL_API_URL || "https://bluebill-745501573999.europe-north1.run.app/api/v1").replace(/\/+$/, "");
const KEY = "bluebill";

/** The invoice document in the BlueBill app (the API base without /api/v1, unless BLUEBILL_APP_URL is set). */
export const invoiceDocumentUrl = (invoiceId: string) =>
  `${(process.env.BLUEBILL_APP_URL || API().replace(/\/api\/v\d+$/, "")).replace(/\/+$/, "")}/invoices/${encodeURIComponent(invoiceId)}/print`;

const STALE_MS = 15 * 60 * 1000; // auto-sync when the last sync is older than this
const MAX_PAGES = 100; // 100 × 100 invoices per sync run
const FALLBACK_CATEGORY = "Sales";

export type BlueBillSettings = {
  token: string | null; // encrypted
  tokenHint: string | null; // last 4 characters, for display
  active: boolean;
  accountId: string | null; // virtual account the invoices are booked to
  connectedAt: string | null;
  lastSyncAt: string | null;
  lastSyncError: string | null;
  lastSyncNew: number;
};

const DEFAULTS: BlueBillSettings = {
  token: null, tokenHint: null, active: false, accountId: null, connectedAt: null, lastSyncAt: null, lastSyncError: null, lastSyncNew: 0,
};

export async function getBlueBill(): Promise<BlueBillSettings> {
  return { ...DEFAULTS, ...(await getSetting<Partial<BlueBillSettings>>(KEY)) };
}

async function saveBlueBill(patch: Partial<BlueBillSettings>) {
  await setSetting(KEY, { ...(await getBlueBill()), ...patch });
}

// ---------- API client ----------

export class BlueBillError extends Error {
  constructor(message: string, readonly code: string, readonly status: number, readonly requestId?: string) {
    super(message);
  }
}

type ApiLine = { name: string; quantity: number; totalAfterVat: number; vatRate: number; category: { id: string | null; name: string } | null };
export type ApiInvoice = {
  id: string;
  number: string | null;
  status: string;
  type: string | null;
  guestName: string | null;
  buyerNuis: string | null;
  currency: string | null;
  totalAmount: number;
  issuedAt: string | null;
  createdAt: string | null;
  fiscalizedAt: string | null;
  fiscal: { iic: string | null; fic: string | null; verificationUrl: string | null } | null;
  lines: ApiLine[] | null;
};

async function call<T>(token: string, path: string): Promise<{ data: T; meta?: { nextCursor?: string | null; hasMore?: boolean } }> {
  let res: Response;
  try {
    res = await fetch(`${API()}${path}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
  } catch (err) {
    throw new BlueBillError(`BlueBill could not be reached (${(err as Error).name === "TimeoutError" ? "timeout" : "network error"}).`, "network", 0);
  }
  const body = (await res.json().catch(() => null)) as { data?: T; meta?: never; error?: { code?: string; message?: string }; requestId?: string } | null;
  if (!res.ok || !body || body.data === undefined) {
    const code = body?.error?.code ?? `http_${res.status}`;
    const message =
      res.status === 401 ? "BlueBill rejected the token. It may be wrong or revoked." : (body?.error?.message ?? `BlueBill answered ${res.status}.`);
    throw new BlueBillError(message, code, res.status, body?.requestId);
  }
  return { data: body.data, meta: body.meta };
}

/** Checks a token by asking for one invoice. Throws BlueBillError when it doesn't work. */
export async function verifyToken(token: string) {
  await call<ApiInvoice[]>(token, "/invoices?limit=1");
}

// ---------- Connection ----------

export async function connect(token: string, accountId: string | null) {
  await verifyToken(token);
  await saveBlueBill({
    token: encrypt(token), tokenHint: token.slice(-4), active: true, accountId, connectedAt: new Date().toISOString(), lastSyncError: null,
  });
}

export const setBlueBillAccount = (accountId: string | null) => saveBlueBill({ accountId });

export const deactivate = () => saveBlueBill({ active: false });

export async function reactivate() {
  const s = await getBlueBill();
  const token = s.token && decrypt(s.token);
  if (!token) throw new BlueBillError("Enter the token again.", "no_token", 0);
  await verifyToken(token);
  await saveBlueBill({ active: true, lastSyncError: null });
}

/** Removes the token. Invoices and transactions already synced stay. */
export const disconnect = () => saveBlueBill({ token: null, tokenHint: null, active: false });

// ---------- Sync ----------

const running = globalThis as typeof globalThis & { __bsaBlueBillSync?: Promise<SyncResult> | null };

export type SyncResult = { ok: boolean; fetched: number; added: number; error?: string };

/**
 * Pulls fiscalized invoices, newest first. A normal sync stops at the first page with nothing new;
 * `full` walks every page (use it after changing the account mapping or to fill gaps).
 */
export function syncInvoices(opts: { full?: boolean } = {}): Promise<SyncResult> {
  running.__bsaBlueBillSync ??= runSync(!!opts.full).finally(() => {
    running.__bsaBlueBillSync = null;
  });
  return running.__bsaBlueBillSync;
}

/** Background sync when connected and the last sync is stale. Never throws. */
export async function syncIfStale() {
  try {
    const s = await getBlueBill();
    if (!s.active || !s.token) return;
    if (s.lastSyncAt && Date.now() - Date.parse(s.lastSyncAt) < STALE_MS) return;
    await syncInvoices();
  } catch (err) {
    console.error("BlueBill background sync failed", err);
  }
}

async function runSync(full: boolean): Promise<SyncResult> {
  const s = await getBlueBill();
  const token = s.token && decrypt(s.token);
  if (!s.active || !token) return { ok: false, fetched: 0, added: 0, error: "BlueBill is not connected." };

  let fetched = 0, added = 0, cursor: string | null | undefined = null;
  try {
    const rates = await getRates();
    for (let page = 0; page < MAX_PAGES; page++) {
      const qs = new URLSearchParams({ status: "fiscalized", limit: "100" });
      if (cursor) qs.set("cursor", cursor);
      const { data, meta } = await call<ApiInvoice[]>(token, `/invoices?${qs}`);
      let pageNew = 0;
      for (const inv of data) {
        if (inv.status !== "fiscalized") continue;
        fetched++;
        if (await storeInvoice(inv, s.accountId, rates)) pageNew++;
      }
      added += pageNew;
      cursor = meta?.nextCursor;
      if (!cursor || (!full && pageNew === 0)) break;
    }
    await saveBlueBill({ lastSyncAt: new Date().toISOString(), lastSyncError: null, lastSyncNew: added });
    return { ok: true, fetched, added };
  } catch (err) {
    const message = err instanceof BlueBillError ? err.message + (err.requestId ? ` (request ${err.requestId})` : "") : "Sync failed unexpectedly.";
    if (!(err instanceof BlueBillError)) console.error("BlueBill sync failed", err);
    await saveBlueBill({ lastSyncAt: new Date().toISOString(), lastSyncError: message, lastSyncNew: added });
    return { ok: false, fetched, added, error: message };
  }
}

/** Saves the invoice and books it once. Returns true when a new transaction was created. */
async function storeInvoice(inv: ApiInvoice, accountId: string | null, rates: Rates): Promise<boolean> {
  const total = Number(inv.totalAmount) || 0;
  // BlueBill invoices are in ALL unless they say otherwise; they're booked in EUR at the current rate.
  const currency = (inv.currency || "ALL").toUpperCase();
  const converted = toBase(Math.abs(total), currency, rates);
  if (!converted && total !== 0) throw new BlueBillError(`No ${currency} rate: add it in Finance settings → Currency rates, then sync again.`, "no_rate", 0);
  const issued = inv.issuedAt ?? inv.fiscalizedAt ?? inv.createdAt ?? new Date().toISOString();
  const lines = Array.isArray(inv.lines) ? inv.lines : [];
  await query(
    `insert into bluebill_invoices (id, number, type, status, total, currency, issued_at, fiscalized_at, guest_name, buyer_nuis, iic, fic, verification_url, lines, synced_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb, now())
     on conflict (id) do update set status = excluded.status, iic = excluded.iic, fic = excluded.fic,
       verification_url = excluded.verification_url, fiscalized_at = excluded.fiscalized_at, synced_at = now()`,
    [
      inv.id, inv.number, inv.type, inv.status, total, inv.currency, issued, inv.fiscalizedAt, inv.guestName, inv.buyerNuis,
      inv.fiscal?.iic ?? null, inv.fiscal?.fic ?? null, inv.fiscal?.verificationUrl ?? null, JSON.stringify(lines),
    ],
  );
  if (total === 0 || !converted) return false;

  // The invoice is booked under the category carrying most of its value, matched by name.
  const byCategory = new Map<string, number>();
  for (const l of lines) {
    const name = l.category?.name?.trim();
    if (name) byCategory.set(name, (byCategory.get(name) ?? 0) + Math.abs(Number(l.totalAfterVat) || 0));
  }
  const top = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? FALLBACK_CATEGORY;
  const categoryId = await ensureIncomeCategory(top.slice(0, 80));

  const rows = await query(
    `insert into fin_transactions (id, type, amount, occurred_on, description, counterparty, account_id, category_id, source, external_id,
                                   currency, original_amount, fx_rate)
     values (gen_random_uuid()::text, $1, $2, ($3::timestamptz at time zone $4)::date, $5, $6, $7, $8, 'bluebill', $9, $10, $11, $12)
     on conflict (external_id) do nothing
     returning id`,
    [
      total > 0 ? "income" : "expense", // a negative total is a corrective invoice: money going back
      converted.amount, issued, TZ(),
      `${total > 0 ? "Invoice" : "Corrective invoice"} ${inv.number ?? inv.id}`,
      inv.guestName || null, accountId, categoryId, `bluebill:${inv.id}`,
      currency, currency === BASE_CURRENCY ? null : Math.abs(total), converted.rate,
    ],
  );
  return rows.length > 0;
}

// ---------- Synced invoices ----------

export type StoredInvoice = {
  id: string; number: string | null; type: string | null; total: number; currency: string | null; issued_at: string;
  guest_name: string | null; buyer_nuis: string | null; iic: string | null; fic: string | null; verification_url: string | null;
  transaction_id: string | null;
};

export async function listInvoices(from: string, to: string, q = "", limit = 200): Promise<StoredInvoice[]> {
  return query<StoredInvoice>(
    `select i.id, i.number, i.type, i.total::float8 as total, i.currency,
            to_char(i.issued_at at time zone $3, 'YYYY-MM-DD HH24:MI') as issued_at,
            i.guest_name, i.buyer_nuis, i.iic, i.fic, i.verification_url, t.id as transaction_id
     from bluebill_invoices i left join fin_transactions t on t.external_id = 'bluebill:' || i.id
     where (i.issued_at at time zone $3)::date between $1::date and $2::date
       and ($4 = '' or (coalesce(i.number, '') || ' ' || coalesce(i.guest_name, '') || ' ' || coalesce(i.buyer_nuis, '')) ilike '%' || $4 || '%')
     order by i.issued_at desc limit ${Math.floor(limit)}`,
    [from, to, TZ(), q.replace(/[\\%_]/g, "\\$&")],
  );
}

export async function invoiceTotals(from: string, to: string): Promise<{ count: number; total: number }> {
  const [row] = await query<{ count: number; total: number }>(
    `select count(*)::int as count,
            coalesce(sum(case when t.type = 'income' then t.amount else -t.amount end), 0)::float8 as total -- EUR
     from bluebill_invoices i left join fin_transactions t on t.external_id = 'bluebill:' || i.id
     where (i.issued_at at time zone $3)::date between $1::date and $2::date`,
    [from, to, TZ()],
  );
  return row;
}
