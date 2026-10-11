import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Single admin login: password from ADMIN_PASSWORD, session in a signed, httpOnly cookie.

const COOKIE = "bsa_session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

// Values are trimmed: secrets created from files often end with a stray newline.
function secret(): string {
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

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("hex");

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(input: string): boolean {
  return safeEqual(sign(input), sign(adminPassword()));
}

export async function createSession() {
  const expires = String(Date.now() + MAX_AGE * 1000);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
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

export async function isAuthenticated(): Promise<boolean> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const [expires, sig] = raw.split(".");
  return !!expires && !!sig && safeEqual(sig, sign(expires)) && Number(expires) > Date.now();
}

/** Use at the top of every dashboard page, server action and private API route. */
export async function requireAuth() {
  if (!(await isAuthenticated())) redirect("/login");
}
