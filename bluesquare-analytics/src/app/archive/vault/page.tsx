import Link from "next/link";
import { isAdmin, requireAuth } from "@/lib/auth";
import { entryLog, listVault, VAULT_KINDS, type VaultEntry, type VaultKind } from "@/lib/archive";
import { Shell } from "@/components/Shell";
import { archiveNav } from "@/components/nav";
import { Modal } from "@/components/Modal";
import { ActionForm } from "@/components/ActionForm";
import { addEntry, removeEntry, saveEntry } from "../actions";
import { EntryFields } from "../EntryFields";
import { CopyText, NotesView, SecretView } from "../SecretView";
import s from "../archive.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vault" };

const ICON: Record<VaultKind, string> = { password: "🔑", api_key: "🧩", note: "📝", other: "🔒" };
const ACTION: Record<string, string> = { create: "created it", edit: "edited it", reveal: "revealed the secret", notes: "opened the notes" };

export default async function Vault({ searchParams }: { searchParams: Promise<{ q?: string; kind?: string }> }) {
  const user = await requireAuth();
  const admin = isAdmin(user);
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const kind = sp.kind && sp.kind in VAULT_KINDS ? (sp.kind as VaultKind) : null;
  const all = await listVault(admin, q);
  const entries = kind ? all.filter((e) => e.kind === kind) : all;
  const logs = admin ? new Map(await Promise.all(entries.map(async (e) => [e.id, await entryLog(e.id)] as const))) : null;

  return (
    <Shell department="archive" subnav={archiveNav("vault")}>
      <div className={s.page}>
        <div className="pagehead">
          <div>
            <h1>Vault</h1>
            <p className="muted">Passwords, API keys and internal notes, encrypted. Values stay hidden until you reveal or copy them, and every reveal is logged.</p>
          </div>
          <Modal trigger="New entry" title="New vault entry">
            <ActionForm action={addEntry} submit="Save to vault" className="form">
              <EntryFields canAdminOnly={admin} />
            </ActionForm>
          </Modal>
        </div>

        <div className={s.toolbar}>
          <nav className={s.kinds} aria-label="Type">
            <Link href={q ? `/archive/vault?q=${encodeURIComponent(q)}` : "/archive/vault"} aria-current={!kind ? "page" : undefined}>All <b>{all.length}</b></Link>
            {(Object.keys(VAULT_KINDS) as VaultKind[]).map((k) => {
              const n = all.filter((e) => e.kind === k).length;
              return n ? (
                <Link key={k} href={`/archive/vault?kind=${k}${q ? `&q=${encodeURIComponent(q)}` : ""}`} aria-current={kind === k ? "page" : undefined}>
                  {ICON[k]} {VAULT_KINDS[k]} <b>{n}</b>
                </Link>
              ) : null;
            })}
          </nav>
          <form action="/archive/vault" className={s.search}>
            {kind && <input type="hidden" name="kind" value={kind} />}
            <input name="q" defaultValue={q} placeholder="Search titles, usernames, URLs, tags…" aria-label="Search the vault" />
            <button className="btn btn--small">Search</button>
          </form>
        </div>

        {entries.length === 0 ? (
          <p className="empty empty--big">{q || kind ? "Nothing matches." : "The vault is empty. Use “New entry” to store a password, API key or note."}</p>
        ) : (
          <ul className={s.vault}>
            {entries.map((e) => <Entry key={e.id} e={e} admin={admin} log={logs?.get(e.id)} />)}
          </ul>
        )}
      </div>
    </Shell>
  );
}

function Entry({ e, admin, log }: { e: VaultEntry; admin: boolean; log?: { action: string; who: string | null; at: string }[] }) {
  let host = "";
  try {
    host = e.url ? new URL(e.url).host : "";
  } catch {}
  return (
    <li className={s.entry}>
      <header className={s.entryhead}>
        <span className={s.entryicon} aria-hidden="true">{ICON[e.kind]}</span>
        <div>
          <strong>{e.title}</strong>
          <small>{VAULT_KINDS[e.kind]}{e.admins_only && <span className={s.lock}> · 🔒 Admins only</span>}</small>
        </div>
        <Modal trigger="Edit" title={`Edit ${e.title}`} triggerClassName="btn btn--small">
          <ActionForm action={saveEntry} submit="Save" className="form">
            <EntryFields entry={e} canAdminOnly={admin} />
          </ActionForm>
          {log && log.length > 0 && (
            <details className={s.log}>
              <summary>Activity</summary>
              <ul>{log.map((l, i) => <li key={i}><b>{l.who ?? "Someone"}</b> {ACTION[l.action] ?? l.action} · {l.at}</li>)}</ul>
            </details>
          )}
          <div className="danger">
            <ActionForm action={removeEntry} submit="Delete entry" pending="Deleting…" danger className="form form--row">
              <input type="hidden" name="id" value={e.id} />
              <label className="field"><span>Type DELETE to remove it for good</span><input name="confirm" autoComplete="off" /></label>
            </ActionForm>
          </div>
        </Modal>
      </header>

      {e.username && (
        <div className={s.row}>
          <span className={s.secretlabel}>Username</span>
          <code className={s.plain}>{e.username}</code>
          <CopyText text={e.username} />
        </div>
      )}
      {e.has_secret && <SecretView id={e.id} label={e.kind === "api_key" ? "API key" : e.kind === "password" ? "Password" : "Secret"} />}
      {e.url && <a href={e.url} target="_blank" rel="noopener noreferrer" className={s.url}>{host || e.url} ↗</a>}
      {e.has_notes && <NotesView id={e.id} />}
      {e.tags.length > 0 && <span className={s.tags}>{e.tags.map((t) => <span key={t}>{t}</span>)}</span>}
      <footer className={s.entryfoot}>
        Updated {e.updated_at}{e.updated_by_name ? ` by ${e.updated_by_name}` : ""}
        {e.last_reveal && <> · last revealed: {e.last_reveal}</>}
      </footer>
    </li>
  );
}
