import "server-only";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { query } from "./db";
import { phoneKey } from "./format";

export type Role = "admin" | "member";
export const ROLES: Record<Role, string> = { admin: "Admin", member: "Member" };

export type User = {
  id: string; username: string; phone: string | null; email: string | null;
  name: string; role: Role; active: boolean; created_at: string; last_login_at: string | null;
  avatar_version: number | null; // null: no photo
  departments: string[] | null; // sidebar departments a member may open; null: all (see lib/departments.ts)
};

const COLS = "id, username, phone, email, name, role, active, created_at::text, last_login_at::text, case when avatar is null then null else avatar_version end as avatar_version, departments";

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
export const normalizeUsername = (username: string) => username.trim().toLowerCase();
/** 3–32 characters, starting with a letter: never confused with a phone number or an email when signing in. */
export const USERNAME = /^[a-z][a-z0-9._-]{2,31}$/;
const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const looksLikePhone = (v: string) => /^\+?[\d\s().-]+$/.test(v);
const validPhone = (v: string) => looksLikePhone(v) && /^\d{8,15}$/.test(v.replace(/\D/g, ""));

/** How someone signs in: a username, and optionally a phone number and an email. */
export type SignIn = { username: string; phone: string | null; email: string | null };

/** The username, phone and email fields of a form, checked; an error message when one is invalid or someone else has it. */
export async function readSignIn(form: FormData, exceptId = ""): Promise<SignIn | string> {
  const username = normalizeUsername(String(form.get("username") ?? "").slice(0, 40));
  const phone = String(form.get("phone") ?? "").trim().slice(0, 40) || null;
  const email = normalizeEmail(String(form.get("email") ?? "").slice(0, 200)) || null;
  if (!USERNAME.test(username)) return "Choose a username of 3 to 32 letters, numbers, dots, dashes or underscores, starting with a letter.";
  if (phone && !validPhone(phone)) return "Enter the phone number with 8 to 15 digits, e.g. 069 123 4567, or leave it empty.";
  if (email && !validEmail(email)) return "Enter a valid email address, or leave it empty.";
  const [taken] = await query<{ what: string }>(
    `select case when username = $1 then 'username' when phone_key = $2 then 'phone number' else 'email' end as what
     from users where id <> $4 and (username = $1 or phone_key = $2 or email = $3) limit 1`,
    [username, phoneKey(phone), email, exceptId],
  );
  if (taken) return `Someone else already uses that ${taken.what}.`;
  return { username, phone, email };
}

export const listUsers = () => query<User>(`select ${COLS} from users order by active desc, name`);

export async function getUser(id: string): Promise<User | null> {
  const [user] = await query<User>(`select ${COLS} from users where id = $1`, [id]);
  return user ?? null;
}

/**
 * The active user signing in as "anna", "069 123 4567" (written any way) or, for accounts that have one, their email,
 * when the password matches.
 */
export async function findByLogin(login: string, password: string): Promise<User | null> {
  const name = login.trim().toLowerCase();
  const [row] = await query<User & { password_hash: string }>(
    `select ${COLS}, password_hash from users where active and (username = $1 or email = $1 or phone_key = $2) limit 1`,
    [name, looksLikePhone(name) ? phoneKey(name) : null],
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

export async function createUser(input: SignIn & { name: string; password: string; role: Role; departments?: string[] | null }): Promise<User> {
  const id = randomUUID();
  await query(
    `insert into users (id, username, phone, phone_key, email, name, password_hash, role, departments)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9::text[])`,
    [id, input.username, input.phone, phoneKey(input.phone), input.email, input.name.trim(), hashPassword(input.password), input.role, input.departments ?? null],
  );
  return (await getUser(id))!;
}

export const updateUser = (id: string, fields: SignIn & { name: string; role: Role; active: boolean; departments: string[] | null }) =>
  query(
    `update users set name = $2, username = $3, phone = $4, phone_key = $5, email = $6, role = $7, active = $8, departments = $9::text[]
     where id = $1`,
    [id, fields.name.trim(), fields.username, fields.phone, phoneKey(fields.phone), fields.email, fields.role, fields.active, fields.departments],
  );

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

export const setSignIn = (id: string, s: SignIn) =>
  query("update users set username = $2, phone = $3, phone_key = $4, email = $5 where id = $1", [id, s.username, s.phone, phoneKey(s.phone), s.email]);

/** Replaces the profile photo (null removes it); the version bump gives it a new URL. */
export const setAvatar = (id: string, image: { data: Buffer; type: string } | null) =>
  query("update users set avatar = $2, avatar_type = $3, avatar_version = avatar_version + 1 where id = $1", [id, image?.data ?? null, image?.type ?? null]);

export async function getAvatar(id: string): Promise<{ data: Uint8Array; type: string } | null> {
  const [row] = await query<{ avatar: Uint8Array | null; avatar_type: string | null }>("select avatar, avatar_type from users where id = $1", [id]);
  return row?.avatar && row.avatar_type ? { data: row.avatar, type: row.avatar_type } : null;
}
