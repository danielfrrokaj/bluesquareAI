import "server-only";
import { randomUUID } from "node:crypto";
import { query } from "./db";

/** `domain` is the main one (first of `domains`); events are accepted from every domain in `domains`. */
export type Site = {
  id: string; name: string; domain: string; domains: string[]; created_at: string;
  logo_version: number | null; // null: no logo
};

const COLS = "id, name, domain, domains, created_at::text, case when logo is null then null else logo_version end as logo_version";

export const listSites = () => query<Site>(`select ${COLS} from sites order by created_at`);

export async function getSite(id: string): Promise<Site | null> {
  const [site] = await query<Site>(`select ${COLS} from sites where id = $1`, [id]);
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

const DOMAIN_RE = /^[a-z0-9.-]+\.[a-z]{2,}$|^localhost$/;

/**
 * Parses domains separated by commas, spaces or new lines, normalized and de-duplicated.
 * Returns an error message for the first invalid one.
 */
export function parseDomains(raw: string): string[] | string {
  const out: string[] = [];
  for (const part of raw.split(/[\s,;]+/).filter(Boolean)) {
    const d = normalizeDomain(part);
    if (!DOMAIN_RE.test(d)) return `“${part}” isn't a valid domain, e.g. bluesquare.ai`;
    if (!out.includes(d)) out.push(d);
  }
  if (!out.length) return "Enter at least one domain, e.g. bluesquare.ai";
  if (out.length > 20) return "Up to 20 domains per website.";
  return out;
}

export async function createSite(name: string, domains: string[]): Promise<Site> {
  const id = randomUUID();
  await query("insert into sites (id, name, domain, domains) values ($1, $2, $3, $4)", [id, name.trim(), domains[0], domains]);
  return (await getSite(id))!;
}

export async function updateSite(id: string, name: string, domains: string[]) {
  await query("update sites set name = $2, domain = $3, domains = $4 where id = $1", [id, name.trim(), domains[0], domains]);
  cache.delete(id);
}

/** Replaces the logo (null removes it); the version bump gives the image a new URL. */
export const setSiteLogo = (id: string, logo: { data: Buffer; type: string } | null) =>
  query("update sites set logo = $2, logo_type = $3, logo_version = logo_version + 1 where id = $1", [id, logo?.data ?? null, logo?.type ?? null]);

export async function getSiteLogo(id: string): Promise<{ data: Uint8Array; type: string } | null> {
  const [row] = await query<{ logo: Uint8Array | null; logo_type: string | null }>("select logo, logo_type from sites where id = $1", [id]);
  return row?.logo && row.logo_type ? { data: row.logo, type: row.logo_type } : null;
}

export const deleteSite = (id: string) => query("delete from sites where id = $1", [id]);

// Short in-memory cache so the collect endpoint doesn't hit the database for every event.
const cache = new Map<string, { domains: string[] | null; at: number }>();

export async function siteDomains(id: string): Promise<string[] | null> {
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < 60_000) return hit.domains;
  const site = /^[0-9a-f-]{36}$/i.test(id) ? await getSite(id) : null;
  const domains = site ? (site.domains.length ? site.domains : [site.domain]) : null;
  cache.set(id, { domains, at: Date.now() });
  return domains;
}

/**
 * The domain (from the site's list) an event's origin belongs to: the domain itself or one of its
 * subdomains. Null when the origin isn't allowed.
 */
export function matchOrigin(origin: string | null, domains: string[]): string | null {
  if (!origin) return null;
  try {
    const host = new URL(origin).hostname.toLowerCase().replace(/^www\./, "");
    return domains.find((d) => host === d || host.endsWith(`.${d}`)) ? host : null;
  } catch {
    return null;
  }
}
