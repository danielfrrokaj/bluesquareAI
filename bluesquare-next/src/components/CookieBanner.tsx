"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readConsent, saveConsent, type Consent } from "@/lib/consent";

type Labels = { title: string; text: string; accept: string; decline: string; learnMore: string };

/** Shown until the visitor makes a choice; rendered only on the client to avoid a flash. */
export function CookieBanner({ labels, privacyHref }: { labels: Labels; privacyHref: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(readConsent() === null), []);

  if (!open) return null;

  const choose = (value: Consent) => {
    saveConsent(value);
    setOpen(false);
  };

  return (
    <section className="cookie" role="region" aria-labelledby="cookie-title">
      <div className="cookie__body">
        <h2 id="cookie-title" className="cookie__title">
          {labels.title}
        </h2>
        <p>
          {labels.text} <Link href={privacyHref}>{labels.learnMore}</Link>
        </p>
      </div>
      <div className="cookie__actions">
        <button type="button" className="btn btn--secondary btn--sm" onClick={() => choose("declined")}>
          {labels.decline}
        </button>
        <button type="button" className="btn btn--primary btn--sm" onClick={() => choose("accepted")}>
          {labels.accept}
        </button>
      </div>
    </section>
  );
}
