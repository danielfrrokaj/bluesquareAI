"use client";

import { useEffect, useState } from "react";
import { reveal } from "./actions";
import s from "./archive.module.css";

const HIDE_AFTER = 30_000;

/** A masked secret: Reveal shows it for 30 seconds, Copy puts it on the clipboard. Both are logged. */
export function SecretView({ id, label = "Secret" }: { id: string; label?: string }) {
  const [value, setValue] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (value === null) return;
    const t = setTimeout(() => setValue(null), HIDE_AFTER);
    return () => clearTimeout(t);
  }, [value]);

  async function fetchValue() {
    setBusy(true);
    const v = await reveal(id, "secret").catch(() => null);
    setBusy(false);
    return v;
  }

  return (
    <div className={s.secret}>
      <span className={s.secretlabel}>{label}</span>
      <code className={s.secretvalue}>{value ?? "••••••••••••"}</code>
      <span className={s.secretbtns}>
        <button type="button" className={s.iconbtn} disabled={busy} aria-label={value === null ? `Reveal ${label}` : `Hide ${label}`}
          title={value === null ? "Reveal for 30 seconds" : "Hide"}
          onClick={async () => setValue(value === null ? await fetchValue() : null)}>
          {value === null ? "👁" : "🙈"}
        </button>
        <button type="button" className={s.iconbtn} disabled={busy} aria-label={`Copy ${label}`} title="Copy to clipboard"
          onClick={async () => {
            const v = value ?? (await fetchValue());
            if (v === null) return;
            await navigator.clipboard.writeText(v);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}>
          {copied ? "✓" : "⧉"}
        </button>
      </span>
    </div>
  );
}

/** Encrypted notes, shown on request. */
export function NotesView({ id }: { id: string }) {
  const [notes, setNotes] = useState<string | null>(null);
  if (notes !== null) return <p className={s.notes}>{notes}</p>;
  return (
    <button type="button" className={s.shownotes} onClick={async () => setNotes((await reveal(id, "notes").catch(() => null)) ?? "")}>
      Show notes
    </button>
  );
}

/** Copies plain (non-secret) text, e.g. a username. */
export function CopyText({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" className={s.iconbtn} aria-label="Copy" title="Copy"
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
      {copied ? "✓" : "⧉"}
    </button>
  );
}
