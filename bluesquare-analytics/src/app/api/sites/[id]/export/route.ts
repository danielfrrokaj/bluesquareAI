import { isAuthenticated } from "@/lib/auth";
import { getSite } from "@/lib/sites";
import { activity, countries, parseRange, topClicks, topPages } from "@/lib/stats";
import { countryName } from "@/lib/format";

export const dynamic = "force-dynamic";

const cell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  // Quote fields and neutralise spreadsheet formulas (CSV injection).
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};
const csv = (header: string[], rows: unknown[][]) => [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const site = await getSite(id);
  if (!site) return new Response("Not found", { status: 404 });

  const url = new URL(req.url);
  const range = parseRange(url.searchParams.get("range") ?? undefined);
  const type = url.searchParams.get("type") ?? "activity";

  let body: string;
  if (type === "pages") {
    const rows = await topPages(id, range, 1000);
    body = csv(["page", "views", "visitors", "avg_seconds", "total_seconds"], rows.map((r) => [r.path, r.views, r.visitors, r.avgSeconds, r.totalSeconds]));
  } else if (type === "countries") {
    const rows = await countries(id, range);
    body = csv(["country_code", "country", "visitors", "views"], rows.map((r) => [r.key, countryName(r.key), r.visitors, r.views]));
  } else if (type === "clicks") {
    const rows = await topClicks(id, range, 1000);
    body = csv(["label", "link", "clicks", "visitors"], rows.map((r) => [r.label, r.href, r.clicks, r.visitors]));
  } else {
    const rows = await activity(id, range);
    body = csv(["period", "visitors", "page_views", "clicks", "avg_seconds"], rows.map((r) => [r.bucket, r.visitors, r.views, r.clicks, r.avgSeconds]));
  }

  const file = `${site.domain}-${type}-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response("﻿" + body, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${file}"`, "Cache-Control": "no-store" },
  });
}
