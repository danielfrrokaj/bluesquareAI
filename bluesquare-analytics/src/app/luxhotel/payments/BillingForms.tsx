"use client";

import { useState, useTransition } from "react";
import { ActionForm } from "@/components/ActionForm";
import { toast } from "@/components/Toaster";
import { createPaymentLinkAction, issueInvoiceAction } from "./actions";
import s from "./payments.module.css";

/** The issue-invoice form, shown inside a Modal. Prices mirror the LuxHotel admin panel; the server reprices from the hotel. */
export function IssueInvoiceForm({ hotels, defaultPeriod }: {
  hotels: { id: string; name: string }[]; defaultPeriod: { start: string; end: string };
}) {
  const [base, setBase] = useState(true);
  return (
    <ActionForm action={issueInvoiceAction} submit="Issue invoice" pending="Issuing…">
      <label className="field">
        <span>Hotel</span>
        <select name="hotel_id" required defaultValue="">
          <option value="" disabled>Choose a property…</option>
          {hotels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
      </label>
      <div className={s.formRow}>
        <label className="field"><span>Period start</span><input type="date" name="period_start" defaultValue={defaultPeriod.start} required /></label>
        <label className="field"><span>Period end</span><input type="date" name="period_end" defaultValue={defaultPeriod.end} required /></label>
      </div>

      <fieldset className={s.lines}>
        <legend>What to bill</legend>
        <label className="check">
          <input type="checkbox" name="include_base_plan" defaultChecked onChange={(e) => setBase(e.target.checked)} />
          Base plan — PMS + Channel Manager (€2 / room / month)
        </label>
        <label className="check">
          <input type="checkbox" name="addon_messages" />
          Messages Inbox add-on (€1 / room / month)
        </label>
        <div className={s.formRow}>
          <label className="field"><span>Custom line (optional)</span><input name="custom_label" maxLength={120} placeholder="e.g. Setup" /></label>
          <label className="field"><span>Monthly price</span><input name="custom_price" type="number" min="0" step="0.01" inputMode="decimal" placeholder="0.00" /></label>
        </div>
        {!base && <p className={s.hint}>With the base plan off, at least one add-on or custom line is required.</p>}
      </fieldset>

      <div className={s.formRow}>
        <label className="field">
          <span>Currency</span>
          <select name="currency" defaultValue="EUR"><option value="EUR">EUR</option><option value="ALL">ALL</option></select>
        </label>
        <label className="field"><span>Notes (optional)</span><input name="notes" maxLength={2000} placeholder="Printed on the invoice" /></label>
      </div>

      <label className="check"><input type="checkbox" name="payment_link" defaultChecked /> Also create a POK payment link</label>
      <p className={s.hint}>The invoice is priced from the hotel&apos;s current room count and appears on its LuxHotel billing page straight away. Invoice numbers are used in sequence, so issue it once.</p>
    </ActionForm>
  );
}

/** Creates (or refreshes) a POK payment link for one invoice, inline in its table row. */
export function PaymentLinkButton({ invoiceId, hasLink }: { invoiceId: string; hasLink: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button" className="btn btn--small" disabled={pending}
      onClick={() => start(async () => {
        const form = new FormData();
        form.set("invoice_id", invoiceId);
        const result = await createPaymentLinkAction(null, form);
        toast(result?.ok ?? result?.error ?? "Done.");
      })}
    >
      {pending ? "…" : hasLink ? "New link" : "Payment link"}
    </button>
  );
}
