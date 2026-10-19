import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { query } from "./db";

// Keys for programs, such as a Claude automation, to call the API without signing in. Each key has one scope, is shown
// once when created (only its hash is stored) and can be revoked.

export const API_SCOPES = { leads: "Add sales leads" } as const;
export type ApiScope = keyof typeof API_SCOPES;
export const isApiScope = (v: unknown): v is ApiScope => typeof v === "string" && v in API_SCOPES;

export type ApiKey = {
  id: string; name: string; scope: ApiScope; prefix: string; created_by_name: string | null;
  created_at: string; last_used_at: string | null; revoked: boolean;
};

const hash = (key: string) => createHash("sha256").update(key).digest("hex");

/** A new key; the returned value is the only time it can be seen. */
export async function createApiKey(name: string, scope: ApiScope, createdBy: string): Promise<string> {
  const key = `bsa_${randomBytes(30).toString("base64url")}`;
  await query("insert into api_keys (id, name, scope, prefix, hash, created_by) values ($1, $2, $3, $4, $5, $6)", [
    randomUUID(), name, scope, key.slice(0, 12), hash(key), createdBy,
  ]);
  return key;
}

/** Live keys first, newest first. */
export const listApiKeys = () =>
  query<ApiKey>(
    `select k.id, k.name, k.scope, k.prefix, u.name as created_by_name,
            to_char(k.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
            to_char(k.last_used_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as last_used_at,
            k.revoked_at is not null as revoked
     from api_keys k left join users u on u.id = k.created_by
     order by k.revoked_at is not null, k.created_at desc`,
  );

export const revokeApiKey = (id: string) => query("update api_keys set revoked_at = now() where id = $1 and revoked_at is null", [id]);

/** The live key a request carries as "Authorization: Bearer <key>", if it allows `scope`. Marks it as used. */
export async function apiKeyFor(req: Request, scope: ApiScope): Promise<{ id: string; name: string } | null> {
  const given = req.headers.get("authorization")?.match(/^Bearer\s+(bsa_[\w-]{20,100})$/i)?.[1];
  if (!given) return null;
  const [key] = await query<{ id: string; name: string }>(
    "update api_keys set last_used_at = now() where hash = $1 and scope = $2 and revoked_at is null returning id, name",
    [hash(given), scope],
  );
  return key ?? null;
}
