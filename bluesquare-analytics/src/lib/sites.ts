import "server-only";
import { randomUUID } from "node:crypto";
import { query } from "./db";

export type Site = { id: string; name: string; domain: string; created_at: string };

export const listSites = () => query<Site>("select id, name, domain, created_at::text from sites order by created_at");

export async function getSite(id: string): Promise<Site | null> {
  const [site] = await query<Site>("select id, name, domain, created_at::text from sites where id = $1", [id]);
  return site ?? null;
}

/** "https://www.Example.com/path" -> "example.com" */
export function normalizeDomain(input: string): string {
  let host = input.trim().toLowerCase();
  try {
    host = new URL(host.includes("://") ? host : `https://${host}`).hostname;
  } catch {}
  return host.replace(/^www\./, "");
}

export async function createSite(name: string, domain: string): Promise<Site> {
  const id = randomUUID();
  await query("insert into sites (id, name, domain) values ($1, $2, $3)", [id, name.trim(), normalizeDomain(domain)]);
  return (await getSite(id))!;
}

export const deleteSite = (id: string) => query("delete from sites where id = $1", [id]);

// Short in-memory cache so the collect endpoint doesn't hit the database for every event.
const cache = new Map<string, { domain: string | null; at: number }>();

export async function siteDomain(id: string): Promise<string | null> {
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < 60_000) return hit.domain;
  const site = /^[0-9a-f-]{36}$/i.test(id) ? await getSite(id) : null;
  cache.set(id, { domain: site?.domain ?? null, at: Date.now() });
  return site?.domain ?? null;
}

/** Accept events from the site's domain and its subdomains only. */
export function originAllowed(origin: string | null, domain: string): boolean {
  if (!origin) return false;
  try {
    const host = new URL(origin).hostname.toLowerCase().replace(/^www\./, "");
    return host === domain || host.endsWith(`.${domain}`);
  } catch {
    return false;
  }
}
