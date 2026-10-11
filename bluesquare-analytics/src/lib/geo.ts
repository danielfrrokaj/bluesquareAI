import "server-only";
import path from "node:path";
import maxmind, { type Reader, type Response } from "maxmind";

// Country lookup with the free DB-IP Lite database (CC BY 4.0, attribution shown in the dashboard).
// If a CDN or load balancer already provides the country, that header wins.

// DB-IP Lite records are { country_code: "AL" }, not the MaxMind GeoIP2 shape.
type DbIpRecord = { country_code?: string };
let reader: Promise<Reader<Response>> | null = null;

function open() {
  reader ??= maxmind.open(
    path.join(process.cwd(), "node_modules/@ip-location-db/dbip-country-mmdb/dbip-country.mmdb"),
  );
  return reader;
}

const COUNTRY_HEADERS = ["x-client-geo-country", "cf-ipcountry", "x-vercel-ip-country", "x-appengine-country"];

export function clientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip");
}

export async function countryFor(headers: Headers, ip: string | null): Promise<string | null> {
  for (const h of COUNTRY_HEADERS) {
    const v = headers.get(h);
    if (v && /^[A-Za-z]{2}$/.test(v) && v.toUpperCase() !== "XX") return v.toUpperCase();
  }
  if (!ip || !maxmind.validate(ip)) return null;
  try {
    return ((await open()).get(ip) as DbIpRecord | null)?.country_code ?? null;
  } catch {
    return null;
  }
}
