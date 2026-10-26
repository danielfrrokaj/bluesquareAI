"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { BillingError, billingMessage, createPaymentLink, issueInvoice, type AddOn, type IssueInvoiceBody } from "@/lib/lux-billing";
import type { FormState } from "@/components/ActionForm";

const str = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const isDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value));

/**
 * Issues a subscription invoice (admin only; it uses a real invoice number and is shown to the hotel). The idempotency
 * key is derived from the invoice's own contents, so an accidental double submit returns the same invoice.
 */
export async function issueInvoiceAction(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");

  const hotelId = str(form, "hotel_id");
  const periodStart = str(form, "period_start");
  const periodEnd = str(form, "period_end");
  const currency = str(form, "currency") === "ALL" ? "ALL" : "EUR";
  const notes = str(form, "notes").slice(0, 2000);
  const includeBasePlan = form.get("include_base_plan") !== null;
  const withMessages = form.get("addon_messages") !== null;
  const customLabel = str(form, "custom_label").slice(0, 120);
  const customPrice = Number(str(form, "custom_price"));
  const paymentLink = form.get("payment_link") !== null;

  if (!hotelId) return { error: "Pick the hotel to bill." };
  if (!isDate(periodStart) || !isDate(periodEnd)) return { error: "Enter the billing period as two dates." };
  if (Date.parse(periodEnd) < Date.parse(periodStart)) return { error: "The period's end can't be before its start." };

  const addOns: AddOn[] = [];
  if (withMessages) addOns.push({ key: "messages_inbox" });
  if (customLabel || str(form, "custom_price")) {
    if (!customLabel) return { error: "Name the custom line, or clear its price." };
    if (!Number.isFinite(customPrice) || customPrice <= 0) return { error: "Enter a monthly price for the custom line." };
    addOns.push({ label: customLabel, monthly_price: customPrice });
  }
  if (!includeBasePlan && addOns.length === 0) return { error: "With the base plan off, add at least one add-on." };

  const body: IssueInvoiceBody = {
    hotel_id: hotelId,
    period_start: periodStart,
    period_end: periodEnd,
    ...(addOns.length && { add_ons: addOns }),
    ...(!includeBasePlan && { include_base_plan: false }),
    currency,
    ...(notes && { notes }),
    ...(paymentLink && { payment_link: true }),
  };
  // Same contents → same key → the API returns the already-issued invoice instead of a second one.
  const idempotencyKey = createHash("sha256").update(JSON.stringify(body)).digest("hex").slice(0, 40);

  try {
    const { invoice, paymentLinkError } = await issueInvoice(body, idempotencyKey);
    revalidatePath("/luxhotel/payments");
    return { ok: paymentLinkError ? `Invoice ${invoice.number} issued, but its payment link failed — create it from the invoice.` : `Invoice ${invoice.number} issued.` };
  } catch (err) {
    if (err instanceof BillingError) return { error: billingMessage(err) };
    throw err;
  }
}

/** Creates a fresh POK payment link for an unpaid invoice (admin only). */
export async function createPaymentLinkAction(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  const invoiceId = str(form, "invoice_id");
  if (!invoiceId) return { error: "Unknown invoice." };
  try {
    const { invoice } = await createPaymentLink(invoiceId);
    revalidatePath("/luxhotel/payments");
    revalidatePath(`/luxhotel/payments/invoices/${invoiceId}`);
    return { ok: `Payment link created for invoice ${invoice.number}.` };
  } catch (err) {
    if (err instanceof BillingError) return { error: billingMessage(err) };
    throw err;
  }
}
