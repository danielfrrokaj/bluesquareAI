import "server-only";
import { BASE_URL } from "./luxhotel";
import {
  parseHotelInvoices, parseInvoice, parseInvoicePage, parsePayment, parsePaymentPage,
  type Invoice, type InvoicePage, type Payment, type PaymentPage,
} from "./luxhotel-data";

// Subscription invoices and payments on LuxHotel, read and issued live through the Hotels API. Reads are shown as they
// come back (no local copy); the two POSTs change real billing, so they go behind an admin action with an idempotency key.

export class BillingError extends Error {
  constructor(readonly reason: "unconfigured" | "rejected" | "not_found" | "conflict" | "invalid" | "in_progress" | "unavailable", readonly detail?: string) {
    super(reason);
  }
}

/** A user-facing sentence for each failure, for the page and the action results. */
export const billingMessage = (err: BillingError): string =>
  ({
    unconfigured: "LuxHotel isn't connected (LUXHOTEL_API_KEY). Ask an administrator to connect it.",
    rejected: "LuxHotel refused the API key. Ask an administrator to check it.",
    not_found: "That invoice or payment no longer exists on LuxHotel.",
    conflict: "That invoice can't take this action — it's already paid or cancelled.",
    in_progress: "An identical request is still being processed. Try again in a moment.",
    invalid: err.detail ? `LuxHotel rejected the request: ${err.detail}` : "LuxHotel rejected the request.",
    unavailable: "LuxHotel couldn't be reached. Please try again in a moment.",
  })[err.reason];

const errorText = (body: unknown): string | undefined => {
  const message = (body as { message?: unknown } | null)?.message;
  return typeof message === "string" && message.trim() ? message.trim() : undefined;
};

async function request<T>(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown; idempotencyKey?: string },
  parse: (value: unknown) => T,
): Promise<T> {
  const key = process.env.LUXHOTEL_API_KEY?.trim();
  if (!key) throw new BillingError("unconfigured");
  let response: Response;
  try {
    response = await fetch(BASE_URL + path, {
      method: init.method ?? "GET",
      headers: {
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
        ...(init.body !== undefined && { "Content-Type": "application/json" }),
        ...(init.idempotencyKey && { "Idempotency-Key": init.idempotencyKey }),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    throw new BillingError("unavailable");
  }
  const body = await response.json().catch(() => null);
  if (response.ok) {
    try {
      return parse(body);
    } catch {
      throw new BillingError("unavailable");
    }
  }
  if (response.status === 401 || response.status === 403) throw new BillingError("rejected");
  if (response.status === 404) throw new BillingError("not_found");
  if (response.status === 400) throw new BillingError("invalid", errorText(body));
  if (response.status === 409) throw new BillingError((body as { error?: string } | null)?.error === "in_progress" ? "in_progress" : "conflict", errorText(body));
  throw new BillingError("unavailable");
}

const queryString = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== "") search.set(key, String(value));
  const text = search.toString();
  return text ? `?${text}` : "";
};

// ---------- Reads ----------

export const listInvoices = (options: { cursor?: string; limit?: number; since?: string; until?: string } = {}): Promise<InvoicePage> =>
  request(`/invoices${queryString({ limit: options.limit ?? 50, cursor: options.cursor, since: options.since, until: options.until })}`, {}, parseInvoicePage);

/** Every invoice, following the cursor (capped), for the board and its totals. */
export async function listAllInvoices(maxPages = 6): Promise<Invoice[]> {
  const all: Invoice[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < maxPages; page++) {
    const { invoices, next_cursor } = await listInvoices({ cursor, limit: 200 });
    all.push(...invoices);
    if (!next_cursor) break;
    cursor = next_cursor;
  }
  return all;
}

export const listPayments = (options: { cursor?: string; limit?: number; since?: string; until?: string } = {}): Promise<PaymentPage> =>
  request(`/payments${queryString({ limit: options.limit ?? 50, cursor: options.cursor, since: options.since, until: options.until })}`, {}, parsePaymentPage);

export const getInvoice = (id: string): Promise<Invoice> =>
  request(`/invoices/${encodeURIComponent(id)}`, {}, parseInvoice);

export const getPayment = (id: string): Promise<Payment> =>
  request(`/payments/${encodeURIComponent(id)}`, {}, parsePayment);

export const getHotelInvoices = (hotelId: string): Promise<Invoice[]> =>
  request(`/hotels/${encodeURIComponent(hotelId)}/invoices`, {}, parseHotelInvoices);

// ---------- Writes (admin only; change real billing) ----------

export type AddOn = { key: "messages_inbox" } | { label: string; monthly_price: number };
export type IssueInvoiceBody = {
  hotel_id: string;
  period_start: string;
  period_end: string;
  add_ons?: AddOn[];
  include_base_plan?: boolean;
  currency?: "EUR" | "ALL";
  notes?: string;
  payment_link?: boolean;
};

/** Issues a new invoice. The idempotency key makes a timed-out retry safe: the same key returns the same invoice. */
export const issueInvoice = (body: IssueInvoiceBody, idempotencyKey: string): Promise<{ invoice: Invoice; paymentLinkError: string | null }> =>
  request(`/invoices`, { method: "POST", body, idempotencyKey }, (value) => ({
    invoice: parseInvoice(value),
    paymentLinkError: typeof (value as { payment_link_error?: unknown }).payment_link_error === "string" ? (value as { payment_link_error: string }).payment_link_error : null,
  }));

/** Creates a fresh POK payment link for an invoice still awaiting payment. */
export const createPaymentLink = (invoiceId: string): Promise<{ paymentUrl: string; paymentId: string; invoice: Invoice }> =>
  request(`/invoices/${encodeURIComponent(invoiceId)}/payment-link`, { method: "POST", body: {} }, (value) => {
    const v = value as { payment_url?: unknown; payment_id?: unknown; invoice?: unknown };
    if (typeof v.payment_url !== "string" || typeof v.payment_id !== "string") throw new Error("invalid_response");
    return { paymentUrl: v.payment_url, paymentId: v.payment_id, invoice: parseInvoice(v.invoice) };
  });
