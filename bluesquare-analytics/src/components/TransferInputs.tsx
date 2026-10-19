"use client";

import { useId, useState } from "react";
import { money, parseAmount } from "@/lib/format";
import { LogoMark } from "./AccountMark";
import s from "./TransferInputs.module.css";

type Option = { id: string; name: string; archived: boolean; logo: string | null; balance: number | null };

/** The transfer form's inputs: a "from → to" pair of accounts that can be swapped, the amount and its currency, date and note. */
export function TransferInputs(props: {
  id?: string;
  options: Option[];
  from: string;
  to: string;
  amount: string;
  currency: string;
  currencies: string[];
  base: string; // EUR
  rates: Record<string, number> | null; // units of a currency per 1 EUR; null hides the balance preview
  date: string;
  description: string;
}) {
  const { options, base, rates } = props;
  const [from, setFrom] = useState(props.from);
  const [to, setTo] = useState(props.to);
  const [amount, setAmount] = useState(props.amount);
  const [currency, setCurrency] = useState(props.currency);
  const amountId = useId();

  // Picking the account already on the other side swaps the two, so they never end up the same.
  const pickFrom = (id: string) => { if (id === to) setTo(from); setFrom(id); };
  const pickTo = (id: string) => { if (id === from) setFrom(to); setTo(id); };

  // The amount in EUR, as the server will book it (see toBase); null until it's a usable number.
  const value = parseAmount(amount);
  const rate = currency === base ? 1 : rates?.[currency];
  const inBase = value !== null && value > 0 && rate ? Math.max(Math.round((value / rate) * 100) / 100, 0.01) : null;

  return (
    <div className="formgrid">
      {props.id && <input type="hidden" name="id" value={props.id} />}
      <div className={s.route}>
        <Side kind="from" value={from} options={options} onPick={pickFrom} change={rates && inBase !== null ? -inBase : null} />
        <button type="button" className={s.swap} onClick={() => { setFrom(to); setTo(from); }} aria-label="Swap the accounts" title="Swap the accounts">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
        <Side kind="to" value={to} options={options} onPick={pickTo} change={rates && inBase !== null ? inBase : null} />
      </div>

      <div className={s.field}>
        <label htmlFor={amountId} className={s.label}>Amount</label>
        <div className={s.amount}>
          <input id={amountId} className={s.amountInput} name="amount" inputMode="decimal" placeholder="1200" autoComplete="off"
            value={amount} onChange={(e) => setAmount(e.target.value)} required />
          {currency !== base && inBase !== null && <span className={s.converted} title={`1 ${base} = ${rate} ${currency}`}>≈ {money(inBase)}</span>}
          <select className={s.currency} name="currency" aria-label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {props.currencies.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <label className="field">
        <span>Date</span>
        <input type="date" name="occurred_on" defaultValue={props.date} required />
      </label>
      <label className="field field--wide">
        <span>Description</span>
        <input name="description" maxLength={300} placeholder="Optional, e.g. Cash deposited at the bank" defaultValue={props.description} />
      </label>
    </div>
  );
}

/** One end of the transfer: the account, its logo, and its balance before → after. */
function Side({ kind, value, options, onPick, change }: {
  kind: "from" | "to"; value: string; options: Option[]; onPick: (id: string) => void; change: number | null;
}) {
  const account = options.find((o) => o.id === value);
  const balance = account?.balance ?? null;
  const after = balance !== null && change !== null ? balance + change : null;
  return (
    <label className={`${s.side} ${kind === "from" ? s.from : s.to}`}>
      <span className={s.eyebrow}>{kind === "from" ? "From" : "To"}</span>
      <span className={s.pick}>
        <LogoMark src={account?.logo ?? null} name={account?.name ?? "?"} size={40} />
        <select className={s.select} name={kind === "from" ? "account_id" : "to_account_id"} value={value} onChange={(e) => onPick(e.target.value)} required>
          {options.map((o) => <option key={o.id} value={o.id}>{o.name}{o.archived ? " (archived)" : ""}</option>)}
        </select>
      </span>
      {balance !== null && (
        <span className={s.balance}>
          {after === null ? <>Balance <strong>{money(balance)}</strong></> : (
            <>
              {money(balance)} <span aria-hidden="true">→</span><span className="sr-only">becomes</span>{" "}
              <strong className={after < 0 ? s.negative : kind === "to" ? s.positive : undefined}>{money(after)}</strong>
            </>
          )}
        </span>
      )}
    </label>
  );
}
