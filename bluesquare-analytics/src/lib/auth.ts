import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { countUsers, createUser, findByLogin, getUser, USERNAME, type Role, type User } from "./users";
import { archiveHomeFor, canOpenArchiveTab, canOpenFinanceTab, financeHomeFor, type ArchiveTab, type FinanceTab } from "./departments";
import { secret } from "./secret";

export { secret };

// Users sign in with their username or phone number and a password; the session is a signed, httpOnly cookie
// holding the user id. The very first sign-in uses ADMIN_USERNAME / ADMIN_PASSWORD and creates that admin account.

const COOKIE = "bsa_session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

function adminPassword(): string {
  const p = process.env.ADMIN_PASSWORD?.trim();
  if (p) return p;
  if (process.env.NODE_ENV === "production") throw new Error("ADMIN_PASSWORD must be set.");
  return "admin";
}

// ADMIN_EMAIL is still read, for deployments set up before usernames.
const adminLogin = () => (process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL || "admin").trim().toLowerCase();

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("hex");

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Checks the credentials (username, phone or email); on an empty user table the ADMIN_* pair creates the first admin. */
export async function signIn(login: string, password: string): Promise<User | null> {
  if ((await countUsers()) === 0) {
    const first = adminLogin();
    if (!safeEqual(sign(login.trim().toLowerCase()), sign(first)) || !safeEqual(sign(password), sign(adminPassword()))) return null;
    // An email-style ADMIN_EMAIL gives the name before the @ as the username, and is kept as the email.
    const name = first.split("@")[0];
    const username = USERNAME.test(name) ? name : "admin";
    await createUser({ username, phone: null, email: first.includes("@") ? first : null, name: "Administrator", password, role: "admin" });
    return findByLogin(username, password);
  }
  return findByLogin(login, password);
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

/** Like requireAuth, for a Finance tab: users without it are sent to the first Finance tab they have (or their home). */
export async function requireFinanceTab(tab: FinanceTab): Promise<User> {
  const user = await requireAuth();
  if (!canOpenFinanceTab(user, tab)) redirect(financeHomeFor(user));
  return user;
}

/** Like requireAuth, for an Archive tab: users without it are sent to the other tab if they have it (or their home). */
export async function requireArchiveTab(tab: ArchiveTab): Promise<User> {
  const user = await requireAuth();
  if (!canOpenArchiveTab(user, tab)) redirect(archiveHomeFor(user));
  return user;
}

export const isAdmin = (user: User | null) => user?.role === "admin";
