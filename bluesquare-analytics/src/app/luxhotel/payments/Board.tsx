"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BILLING_COLUMNS, dateLabel, money, number, planLabel, type HotelBilling } from "@/lib/luxhotel-data";
import { PaymentLinkButton } from "./BillingForms";
import s from "./payments.module.css";

/** Hotels grouped by how their subscription stands — unpaid, active, expiring, expired — with a live search. */
export function BillingBoard({ hotels, admin }: { hotels: HotelBilling[]; admin: boolean }) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();

  const shown = useMemo(
    () =>
      query
        ? hotels.filter((b) =>
            [b.hotel.name, b.hotel.location.city, b.hotel.location.country, b.hotel.owner?.name, b.hotel.owner?.email]
              .filter(Boolean).join(" ").toLowerCase().includes(query),
          )
        : hotels,
    [hotels, query],
  );

  return (
    <div>
      <label className={s.search}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search a hotel or owner…" aria-label="Search hotels" />
      </label>

      <div className={s.board}>
        {BILLING_COLUMNS.map(({ key, label, tone }) => {
          const cards = shown.filter((b) => b.column === key);
          return (
            <section key={key} className={`${s.column} ${s[`col_${key}`]}`} aria-label={label}>
              <header className={s.colHead}>
                <span className={`${s.dot} ${s[`dot_${tone}`]}`} aria-hidden="true" />
                {label}
                <b>{cards.length}</b>
              </header>
              <div className={s.cards}>
                {cards.map((b) => <HotelCard key={b.hotel.id} billing={b} admin={admin} />)}
                {cards.length === 0 && <p className={s.colEmpty}>None</p>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function HotelCard({ billing: b, admin }: { billing: HotelBilling; admin: boolean }) {
  const { hotel, daysLeft } = b;
  const expiry = hotel.subscription.expires_at;
  return (
    <article className={s.card}>
      <div className={s.cardTop}>
        <Link href={`/luxhotel/${hotel.id}`} className={s.cardName}>{hotel.name}</Link>
        <span className={s.rooms}>{number(hotel.rooms.physical)} rooms</span>
      </div>
      <dl className={s.cardRows}>
        <div><dt>Plan</dt><dd>{planLabel(hotel.subscription.plan)}</dd></div>
        {b.lastPayment && (
          <div><dt>Last payment</dt><dd>{dateLabel(b.lastPayment.at)} · {money(b.lastPayment.amount, b.lastPayment.currency)}</dd></div>
        )}
        {expiry && (
          <div>
            <dt>{b.column === "expired" ? "Expired" : "Renews"}</dt>
            <dd>
              {dateLabel(expiry)}
              {b.column === "expiring" && daysLeft !== null && <span className={s.daysWarn}> · {daysLeft}d left</span>}
              {b.column === "expired" && <span className={s.daysBad}> · overdue</span>}
            </dd>
          </div>
        )}
      </dl>

      {hotel.subscription.suspended && <span className={s.suspended}>Service suspended</span>}

      {b.pending && (
        <div className={s.pending}>
          <div className={s.pendingInfo}>
            <Link href={`/luxhotel/payments/invoices/${encodeURIComponent(b.pending.id)}`}>Pending · {b.pending.number}</Link>
            <span>{money(b.pending.total, b.pending.currency)}</span>
          </div>
          {admin && <PaymentLinkButton invoiceId={b.pending.id} hasLink={false} />}
        </div>
      )}
    </article>
  );
}
