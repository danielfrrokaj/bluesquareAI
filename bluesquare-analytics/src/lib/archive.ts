import "server-only";
import { randomUUID } from "node:crypto";
import { query } from "./db";
import { decrypt, encrypt, vaultKey } from "./crypto";

const TZ = () => process.env.REPORT_TIMEZONE || "Europe/Tirane";

// ---------- Files ----------

export type ArchiveFile = {
  id: string; name: string; folder: string; note: string; mime: string; size: number; media_key: string;
  status: "uploading" | "ready"; created_by: string | null; author: string | null; created_at: string;
};

const FILE_SELECT = `
  select f.id, f.name, f.folder, f.note, f.mime, f.size::float8 as size, f.media_key, f.status, f.created_by, u.name as author,
         to_char(f.created_at at time zone $1, 'DD Mon YYYY') as created_at
  from ar_files f left join users u on u.id = f.created_by`;

export async function listFiles(folder: string | null, q: string): Promise<ArchiveFile[]> {
  const params: unknown[] = [TZ()];
  const where = ["f.status = 'ready'"];
  if (folder !== null) where.push(`f.folder = $${params.push(folder)}`);
  if (q) where.push(`(f.name || ' ' || f.note || ' ' || f.folder) ilike $${params.push(`%${q.replace(/[\\%_]/g, "\\$&")}%`)}`);
  return query<ArchiveFile>(`${FILE_SELECT} where ${where.join(" and ")} order by f.created_at desc limit 500`, params);
}

export async function getFile(id: string): Promise<ArchiveFile | null> {
  const [row] = await query<ArchiveFile>(`${FILE_SELECT} where f.id = $2`, [TZ(), id]);
  return row ?? null;
}

export const folderCounts = () =>
  query<{ folder: string; count: number }>("select folder, count(*)::int as count from ar_files where status = 'ready' group by folder order by folder");

/** "Contracts / 2026" -> "Contracts/2026": trimmed, single slashes, no leading/trailing ones. */
export const cleanFolder = (raw: unknown) =>
  (typeof raw === "string" ? raw : "").split("/").map((p) => p.trim()).filter(Boolean).join("/").slice(0, 120);

export async function createFile(f: { name: string; folder: string; note: string; mime: string; size: number; userId: string }) {
  const id = randomUUID();
  const ext = f.name.match(/\.([a-z0-9]{1,10})$/i)?.[1]?.toLowerCase() ?? "bin";
  const key = `archive/${id}.${ext}`;
  await query("insert into ar_files (id, name, folder, note, mime, size, media_key, created_by) values ($1, $2, $3, $4, $5, $6, $7, $8)", [
    id, f.name, f.folder, f.note, f.mime, f.size, key, f.userId,
  ]);
  return { id, key };
}

export const markFileReady = (id: string) => query("update ar_files set status = 'ready' where id = $1", [id]);
export const updateFile = (id: string, f: { name: string; folder: string; note: string }) =>
  query("update ar_files set name = $2, folder = $3, note = $4 where id = $1", [id, f.name, f.folder, f.note]);
export const deleteFileRow = (id: string) => query("delete from ar_files where id = $1", [id]);
export const staleFileUploads = () =>
  query<{ id: string; media_key: string }>("select id, media_key from ar_files where status = 'uploading' and created_at < now() - interval '1 day'");

// ---------- Vault ----------
// Secret values and notes are encrypted (AES-256-GCM with VAULT_KEY) and only decrypted on request.

export const VAULT_KINDS = { password: "Password", api_key: "API key", note: "Note", other: "Other" } as const;
export type VaultKind = keyof typeof VAULT_KINDS;
export const isVaultKind = (v: unknown): v is VaultKind => typeof v === "string" && v in VAULT_KINDS;

export type VaultEntry = {
  id: string; title: string; kind: VaultKind; username: string; url: string; tags: string[]; admins_only: boolean;
  has_secret: boolean; has_notes: boolean; updated_at: string; updated_by_name: string | null;
  last_reveal: string | null; // "Name · 12 Oct, 10:31"
};

/** Entries the user may see (admins see admin-only ones too). Never includes the secret values. */
export function listVault(admin: boolean, q: string): Promise<VaultEntry[]> {
  const params: unknown[] = [TZ()];
  const where = admin ? ["true"] : ["not v.admins_only"];
  if (q) where.push(`(v.title || ' ' || v.username || ' ' || v.url || ' ' || array_to_string(v.tags, ' ')) ilike $${params.push(`%${q.replace(/[\\%_]/g, "\\$&")}%`)}`);
  return query<VaultEntry>(
    `select v.id, v.title, v.kind, v.username, v.url, v.tags, v.admins_only,
            v.secret is not null as has_secret, v.notes is not null as has_notes,
            to_char(v.updated_at at time zone $1, 'DD Mon YYYY') as updated_at, ub.name as updated_by_name,
            (select coalesce(u.name, 'Someone') || ' · ' || to_char(l.at at time zone $1, 'DD Mon, HH24:MI')
             from ar_vault_log l left join users u on u.id = l.user_id
             where l.entry_id = v.id and l.action = 'reveal' order by l.at desc limit 1) as last_reveal
     from ar_vault v left join users ub on ub.id = v.updated_by
     where ${where.join(" and ")}
     order by lower(v.title)`,
    params,
  );
}

async function vaultRow(id: string) {
  const [row] = await query<{ id: string; admins_only: boolean; secret: string | null; notes: string | null; title: string }>(
    "select id, admins_only, secret, notes, title from ar_vault where id = $1",
    [id],
  );
  return row ?? null;
}

/** Whether the user may see the entry at all. */
export async function canSeeEntry(id: string, admin: boolean) {
  const row = await vaultRow(id);
  return row && (admin || !row.admins_only) ? row : null;
}

/** Decrypts one field and records who looked. */
export async function revealField(id: string, field: "secret" | "notes", userId: string, admin: boolean): Promise<string | null> {
  const row = await canSeeEntry(id, admin);
  const sealed = row?.[field];
  if (!sealed) return null;
  const plain = decrypt(sealed, vaultKey());
  await query("insert into ar_vault_log (entry_id, user_id, action) values ($1, $2, $3)", [id, userId, field === "secret" ? "reveal" : "notes"]);
  return plain;
}

export type VaultInput = {
  title: string; kind: VaultKind; username: string; url: string; tags: string[]; adminsOnly: boolean;
  secret: string | null; // null: leave unchanged (edit); "" clears it
  notes: string | null;
};

const seal = (v: string) => (v ? encrypt(v, vaultKey()) : null);

export async function createEntry(v: VaultInput, userId: string) {
  const id = randomUUID();
  await query(
    `insert into ar_vault (id, title, kind, username, url, tags, admins_only, secret, notes, created_by, updated_by)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)`,
    [id, v.title, v.kind, v.username, v.url, v.tags, v.adminsOnly, seal(v.secret ?? ""), seal(v.notes ?? ""), userId],
  );
  await query("insert into ar_vault_log (entry_id, user_id, action) values ($1, $2, 'create')", [id, userId]);
}

export async function updateEntry(id: string, v: VaultInput, userId: string) {
  await query(
    `update ar_vault set title = $2, kind = $3, username = $4, url = $5, tags = $6, admins_only = $7,
            secret = case when $8::boolean then $9 else secret end,
            notes = case when $10::boolean then $11 else notes end,
            updated_by = $12, updated_at = now()
     where id = $1`,
    [id, v.title, v.kind, v.username, v.url, v.tags, v.adminsOnly, v.secret !== null, v.secret === null ? null : seal(v.secret),
      v.notes !== null, v.notes === null ? null : seal(v.notes), userId],
  );
  await query("insert into ar_vault_log (entry_id, user_id, action) values ($1, $2, 'edit')", [id, userId]);
}

export const deleteEntry = (id: string) => query("delete from ar_vault where id = $1", [id]);

export const entryLog = (id: string) =>
  query<{ action: string; who: string | null; at: string }>(
    `select l.action, u.name as who, to_char(l.at at time zone $2, 'DD Mon YYYY, HH24:MI') as at
     from ar_vault_log l left join users u on u.id = l.user_id where l.entry_id = $1 order by l.at desc limit 20`,
    [id, TZ()],
  );
