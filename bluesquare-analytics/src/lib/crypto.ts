import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { secret } from "./auth";

// AES-256-GCM for secrets stored in the database (e.g. API tokens). The key is derived from
// SESSION_SECRET, so rotating that secret means re-entering stored tokens.

const key = () => createHash("sha256").update(`bsa-secrets:${secret()}`).digest();

/**
 * Key for the Archive vault (passwords, API keys). Set VAULT_KEY so the vault doesn't depend on
 * SESSION_SECRET: rotating the session secret then signs everyone out but keeps the vault readable.
 * Changing VAULT_KEY itself makes existing vault entries unreadable.
 */
export const vaultKey = () => createHash("sha256").update(`bsa-vault:${process.env.VAULT_KEY?.trim() || secret()}`).digest();

export function encrypt(plain: string, k: Buffer = key()): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", k, iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64url")).join(".");
}

export function decrypt(sealed: string, k: Buffer = key()): string | null {
  try {
    const [iv, tag, data] = sealed.split(".").map((p) => Buffer.from(p, "base64url"));
    const decipher = createDecipheriv("aes-256-gcm", k, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
