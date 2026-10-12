"use client";

import { useState } from "react";
import s from "./archive.module.css";

const KINDS = { password: "Password", api_key: "API key", note: "Note", other: "Other" } as const;
type Kind = keyof typeof KINDS;

/** 20 characters from a 74-symbol alphabet, using the browser's secure random generator. */
function generate(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+?";
  const bytes = crypto.getRandomValues(new Uint32Array(20));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export type EntryDefaults = { id?: string; title?: string; kind?: Kind; username?: string; url?: string; tags?: string[]; admins_only?: boolean; has_secret?: boolean; has_notes?: boolean };

/** Vault entry inputs. Editing never pre-fills the secret or notes: leave them empty to keep them. */
export function EntryFields({ entry = {}, canAdminOnly }: { entry?: EntryDefaults; canAdminOnly: boolean }) {
  const editing = !!entry.id;
  const [kind, setKind] = useState<Kind>(entry.kind ?? "password");
  const [secret, setSecret] = useState("");
  const [show, setShow] = useState(false);
  const [notesChanged, setNotesChanged] = useState(false);
  const secretLabel = kind === "api_key" ? "API key" : kind === "password" ? "Password" : "Secret";

  return (
    <div className={s.formgrid}>
      {editing && <input type="hidden" name="id" value={entry.id} />}
      <input type="hidden" name="notes_changed" value={notesChanged ? "1" : "0"} />
      <label className="field"><span>Title</span><input name="title" defaultValue={entry.title} required maxLength={120} placeholder="e.g. Google Cloud console" autoFocus={!editing} /></label>
      <label className="field">
        <span>Type</span>
        <select name="kind" value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
          {(Object.keys(KINDS) as Kind[]).map((k) => <option key={k} value={k}>{KINDS[k]}</option>)}
        </select>
      </label>
      {kind !== "note" && (
        <label className="field"><span>Username / email</span><input name="username" defaultValue={entry.username} maxLength={200} autoComplete="off" /></label>
      )}
      {kind !== "note" && (
        <label className="field"><span>URL</span><input name="url" type="url" defaultValue={entry.url} maxLength={500} placeholder="https://…" /></label>
      )}
      {kind !== "note" && (
        <div className={`field ${s.wide}`}>
          <span>{secretLabel}</span>
          <div className={s.secretinput}>
            <input name="secret" type={show ? "text" : "password"} value={secret} onChange={(e) => setSecret(e.target.value)} autoComplete="new-password"
              placeholder={editing && entry.has_secret ? "Leave empty to keep the current one" : ""} spellCheck={false} />
            <button type="button" className="btn btn--small" onClick={() => setShow((v) => !v)}>{show ? "Hide" : "Show"}</button>
            {kind === "password" && <button type="button" className="btn btn--small" onClick={() => { setSecret(generate()); setShow(true); }}>Generate</button>}
          </div>
          {editing && entry.has_secret && <label className="check"><input type="checkbox" name="clear_secret" /> Remove the stored {secretLabel.toLowerCase()}</label>}
        </div>
      )}
      <label className={`field ${s.wide}`}>
        <span>{kind === "note" ? "Note" : "Notes"} <small className="muted">(encrypted)</small></span>
        <textarea name="notes" rows={kind === "note" ? 8 : 3} maxLength={20_000} onChange={() => setNotesChanged(true)}
          placeholder={editing && entry.has_notes ? "Leave empty to keep the current notes; anything typed here replaces them" : kind === "note" ? "Internal note…" : "Recovery codes, who owns it, renewal date…"} />
      </label>
      <label className="field"><span>Tags</span><input name="tags" defaultValue={entry.tags?.join(", ")} maxLength={300} placeholder="e.g. hosting, client X" /></label>
      {canAdminOnly && (
        <label className={`check ${s.adminonly}`}><input type="checkbox" name="admins_only" defaultChecked={entry.admins_only} /> Admins only</label>
      )}
    </div>
  );
}
