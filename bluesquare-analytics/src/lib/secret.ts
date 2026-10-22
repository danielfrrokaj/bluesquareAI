import "server-only";

// The signing/encryption secret, its own module so crypto.ts (and what it encrypts for, e.g. stored API
// tokens) doesn't drag the whole session machinery into tests. Trimmed: secrets created from files often
// end with a stray newline.
export function secret(): string {
  const s = process.env.SESSION_SECRET?.trim();
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET must be set (32+ characters).");
  return "dev-only-secret-dev-only-secret-dev-only";
}
