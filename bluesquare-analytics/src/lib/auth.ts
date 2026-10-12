import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { countUsers, createUser, findByLogin, getUser, normalizeEmail, type Role, type User } from "./users";

// Users sign in with email and password; the session is a signed, httpOnly cookie holding the user id.
// The very first sign-in uses ADMIN_EMAIL / ADMIN_PASSWORD and creates that admin account.

const COOKIE = "bsa_session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

// Values are trimmed: secrets created from files often end with a stray newline.
export function secret(): string {
  const s = process.env.SESSION_SECRET?.trim();
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET must be set (32+ characters).");
  return "dev-only-secret-dev-only-secret-dev-only";
}

function adminPassword(): string {
  const p = process.env.ADMIN_PASSWORD?.trim();
  if (p) return p;
  if (process.env.NODE_ENV === "production") throw new Error("ADMIN_PASSWORD must be set.");
  return "admin";
}

const adminEmail = () => normalizeEmail(process.env.ADMIN_EMAIL || "admin");

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("hex");

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Checks the credentials; on an empty user table the ADMIN_* pair creates the first admin. */
export async function signIn(email: string, password: string): Promise<User | null> {
  if ((await countUsers()) === 0) {
    if (!safeEqual(sign(normalizeEmail(email)), sign(adminEmail())) || !safeEqual(sign(password), sign(adminPassword()))) return null;
    await createUser({ email: adminEmail(), name: "Administrator", password, role: "admin" });
  }
  return findByLogin(email, password);
}

export async function createSession(userId: string) {
  const payload = `${userId}.${Date.now() + MAX_AGE * 1000}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

/** The signed-in, active user, or null. Cached per request. */
export const currentUser = cache(async (): Promise<User | null> => {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [id, expires, sig] = raw.split(".");
  if (!id || !expires || !sig || !safeEqual(sig, sign(`${id}.${expires}`)) || Number(expires) < Date.now()) return null;
  const user = await getUser(id);
  return user?.active ? user : null;
});

export async function isAuthenticated(): Promise<boolean> {
  return !!(await currentUser());
}

/** Use at the top of every dashboard page, server action and private API route. */
export async function requireAuth(): Promise<User> {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}

/** Like requireAuth, but also requires a role. Others are sent to the forbidden page. */
export async function requireRole(role: Role): Promise<User> {
  const user = await requireAuth();
  if (user.role !== role) redirect("/forbidden");
  return user;
}

export const isAdmin = (user: User | null) => user?.role === "admin";
