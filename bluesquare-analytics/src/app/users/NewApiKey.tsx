"use client";

import { useState, useTransition } from "react";
import { CopyButton } from "@/components/CopyButton";
import { newApiKey } from "./actions";
import s from "./users.module.css";

/** Creates an API key and shows it once, with an example request to copy. Closing the dialog hides it for good. */
export function NewApiKey({ endpoint }: { endpoint: string }) {
  const [key, setKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (key) {
    const example = `curl -X POST ${endpoint} \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{"leads": [{"hotel": "Hotel Example", "city": "Sarandë", "phone": "+355 69 123 4567", "website": "https://example.com", "notes": "Why it is worth contacting"}]}'`;
    return (
      <div className="form">
        <p className={s.warn}>Copy the key now. It won&apos;t be shown again.</p>
        <div className={s.key}>
          <code>{key}</code>
          <CopyButton text={key} />
        </div>
        <p className="muted">Send it as a Bearer token. The key can only add sales leads; leads Sales already has are skipped.</p>
        <pre className={s.example}>{example}</pre>
        <span><CopyButton text={example} /></span>
      </div>
    );
  }
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        const name = String(new FormData(e.currentTarget).get("name") ?? "");
        startTransition(async () => {
          const result = await newApiKey(name);
          if ("key" in result) setKey(result.key);
          else setError(result.error);
        });
      }}
    >
      <label className="field">
        <span>Name</span>
        <input name="name" required maxLength={80} placeholder="Claude lead finder" />
      </label>
      <p className="muted">What will use it. It can only add sales leads, and can be revoked at any time.</p>
      <button className="btn btn--primary" disabled={pending}>{pending ? "Creating…" : "Create key"}</button>
      {error && <p className="form__error" role="alert">{error}</p>}
    </form>
  );
}
