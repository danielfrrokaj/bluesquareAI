import "server-only";
import { headers } from "next/headers";

/** Address of this analytics server, used in the tracking snippet. */
export async function publicUrl(): Promise<string> {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:4400";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export const snippetFor = (base: string, siteId: string) =>
  `<script defer src="${base}/t.js" data-site="${siteId}"></script>`;
