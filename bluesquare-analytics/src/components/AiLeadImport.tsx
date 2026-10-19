"use client";

import { useState, useTransition } from "react";
import { addLead, readLeadText } from "@/app/sales/actions";
import type { User } from "@/lib/users";
import { ActionForm } from "./ActionForm";
import { LeadFields } from "./LeadFields";
import s from "./AiLeadImport.module.css";

const MAX = 8000;
const EXAMPLE = `Hi! Arben here from Hotel Riviera in Sarandë, 32 rooms right by the sea. We still manage everything in Excel and the Booking.com extranet, and the overbookings are killing us. Saw you on Instagram. Can you call me on 069 234 5678 next Tuesday after 10? arben@hotelriviera.al`;

type Result = { draft: Record<string, string>; filled: string[] };

/** The four-point sparkle used across the AI import. */
export function Sparkles({ size = 18 }: { size?: number }) {
  return (
    <svg className={s.spark} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path className={s.big} d="M10 2.5c.4 3.9 2.6 6.1 6.5 6.5-3.9.4-6.1 2.6-6.5 6.5-.4-3.9-2.6-6.1-6.5-6.5 3.9-.4 6.1-2.6 6.5-6.5Z" />
      <path className={s.small} d="M18 13c.2 2.1 1.4 3.3 3.5 3.5-2.1.2-3.3 1.4-3.5 3.5-.2-2.1-1.4-3.3-3.5-3.5 2.1-.2 3.3-1.4 3.5-3.5Z" />
    </svg>
  );
}

/**
 * AI import: free text in, a pre-filled lead form out. Gemini reads the text on the server; the person checks the fields
 * (the ones it filled glow) and adds the lead with the usual form, so nothing is saved unseen.
 */
export function AiLeadImport({ users, meId }: { users: Pick<User, "id" | "name" | "active">[]; meId: string }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reading, startReading] = useTransition();
  const ready = text.trim().length >= 12 && !reading;

  const read = () => {
    if (!ready) return;
    setError(null);
    startReading(async () => {
      const r = await readLeadText(text);
      if ("error" in r) setError(r.error);
      else setResult(r);
    });
  };

  if (result) {
    const n = result.filled.length;
    return (
      <div className={s.review}>
        <div className={s.banner}>
          <span className={s.badge}><Sparkles size={20} /></span>
          <p><strong>Filled {n} {n === 1 ? "field" : "fields"} from your text.</strong> Check them, change anything, then add the lead.</p>
          <button type="button" className={s.back} onClick={() => setResult(null)}>Edit text</button>
        </div>
        <ActionForm action={addLead} submit="Add lead">
          <LeadFields users={users} meId={meId} note draft={result.draft} ai={result.filled} />
        </ActionForm>
      </div>
    );
  }

  return (
    <div className={s.compose}>
      <p className={s.intro}>
        Paste anything about the property: a WhatsApp message, an email, a form or your call notes. Gemini fills in the lead,
        and you check it before it&apos;s saved.
      </p>
      <div className={`${s.frame}${reading ? ` ${s.busy}` : ""}`}>
        <div className={s.inner}>
          <textarea
            className={s.text}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX))}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); read(); } }}
            placeholder={"e.g. “Spoke with Elira from Vila Dafina in Ksamil, 14 apartments. They use Excel. Wants a demo, call her Friday on 068 555 1212.”"}
            aria-label="Text about the lead"
            readOnly={reading}
            autoFocus
          />
          {reading && <div className={s.scan} aria-hidden="true" />}
          <div className={s.toolbar}>
            <button type="button" className={s.example} onClick={() => setText(EXAMPLE)} disabled={reading}>Try an example</button>
            <span className={s.count}>{text.length.toLocaleString("en-US")} / {MAX.toLocaleString("en-US")}</span>
          </div>
        </div>
      </div>
      {error && <p className="form__error" role="alert">{error}</p>}
      <button type="button" className={s.go} onClick={read} disabled={!ready} aria-busy={reading}>
        <Sparkles />
        {reading ? <span>Reading your text<span className={s.dots} aria-hidden="true" /></span> : "Fill in with AI"}
      </button>
      <p className={s.hint} aria-live="polite">{reading ? "Gemini is finding the property, the contact and the next step…" : "⌘ / Ctrl + Enter"}</p>
    </div>
  );
}
