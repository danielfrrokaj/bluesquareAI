import "server-only";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { query } from "./db";

export type Role = "admin" | "member";
export const ROLES: Record<Role, string> = { admin: "Admin", member: "Member" };

export type User = {
  id: string; email: string; name: string; role: Role; active: boolean; created_at: string; last_login_at: string | null;
  avatar_version: number | null; // null: no photo
};

const COLS = "id, email, name, role, active, created_at::text, last_login_at::text, case when avatar is null then null else avatar_version end as avatar_version";

export const avatarUrl = (u: Pick<User, "id" | "avatar_version">) => (u.avatar_version === null ? null : `/api/users/${u.id}/avatar?v=${u.avatar_version}`);

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return timingSafeEqual(actual, expected);
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const listUsers = () => query<User>(`select ${COLS} from users order by active desc, name`);

export async function getUser(id: string): Promise<User | null> {
  const [user] = await query<User>(`select ${COLS} from users where id = $1`, [id]);
  return user ?? null;
}

/** Returns the user when the email/password pair is valid and the account is active. */
export async function findByLogin(email: string, password: string): Promise<User | null> {
  const [row] = await query<User & { password_hash: string }>(
    `select ${COLS}, password_hash from users where email = $1 and active`,
    [normalizeEmail(email)],
  );
  if (!row || !verifyPassword(password, row.password_hash)) return null;
  await query("update users set last_login_at = now() where id = $1", [row.id]);
  const { password_hash: _, ...user } = row;
  return user;
}

export async function countUsers(): Promise<number> {
  const [{ n }] = await query<{ n: number }>("select count(*)::int as n from users");
  return n;
}

export async function createUser(input: { email: string; name: string; password: string; role: Role }): Promise<User> {
  const id = randomUUID();
  await query("insert into users (id, email, name, password_hash, role) values ($1, $2, $3, $4, $5)", [
    id, normalizeEmail(input.email), input.name.trim(), hashPassword(input.password), input.role,
  ]);
  return (await getUser(id))!;
}

export async function emailTaken(email: string, exceptId = ""): Promise<boolean> {
  const rows = await query("select 1 from users where email = $1 and id <> $2", [normalizeEmail(email), exceptId]);
  return rows.length > 0;
}

export const updateUser = (id: string, fields: { name: string; email: string; role: Role; active: boolean }) =>
  query("update users set name = $2, email = $3, role = $4, active = $5 where id = $1", [
    id, fields.name.trim(), normalizeEmail(fields.email), fields.role, fields.active,
  ]);

export const setPassword = (id: string, password: string) =>
  query("update users set password_hash = $2 where id = $1", [id, hashPassword(password)]);

export async function countActiveAdmins(exceptId = ""): Promise<number> {
  const [{ n }] = await query<{ n: number }>("select count(*)::int as n from users where role = 'admin' and active and id <> $1", [exceptId]);
  return n;
}

/** True when the password is this user's current one (for changes that need re-confirmation). */
export async function checkPassword(id: string, password: string): Promise<boolean> {
  const [row] = await query<{ password_hash: string }>("select password_hash from users where id = $1", [id]);
  return !!row && verifyPassword(password, row.password_hash);
}

export const setName = (id: string, name: string) => query("update users set name = $2 where id = $1", [id, name.trim()]);

export const setEmail = (id: string, email: string) => query("update users set email = $2 where id = $1", [id, normalizeEmail(email)]);

/** Replaces the profile photo (null removes it); the version bump gives it a new URL. */
export const setAvatar = (id: string, image: { data: Buffer; type: string } | null) =>
  query("update users set avatar = $2, avatar_type = $3, avatar_version = avatar_version + 1 where id = $1", [id, image?.data ?? null, image?.type ?? null]);

export async function getAvatar(id: string): Promise<{ data: Uint8Array; type: string } | null> {
  const [row] = await query<{ avatar: Uint8Array | null; avatar_type: string | null }>("select avatar, avatar_type from users where id = $1", [id]);
  return row?.avatar && row.avatar_type ? { data: row.avatar, type: row.avatar_type } : null;
}
