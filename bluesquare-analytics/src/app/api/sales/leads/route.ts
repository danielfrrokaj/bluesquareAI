import { revalidatePath } from "next/cache";
import { apiKeyFor } from "@/lib/api-keys";
import { intakeLeads, MAX_LEADS_PER_CALL } from "@/lib/lead-intake";
import { publicUrl } from "@/lib/public-url";

export const dynamic = "force-dynamic";

/**
 * Adds sales leads for a program, such as a Claude automation, with an API key instead of a sign-in:
 *   POST /api/sales/leads   Authorization: Bearer <key with the "leads" scope, from Users → API keys>
 *   { "leads": [{ "hotel": "…", "city": "…", "phone": "…", … }], "dry_run": false }   (or one lead object, or an array)
 * Leads Sales already has are skipped and reported as duplicates. With "dry_run": true nothing is saved: the answer
 * only says which would be new. See README, "Sales: adding leads through the API".
 */
export async function POST(req: Request) {
  const key = await apiKeyFor(req, "leads");
  if (!key) return Response.json({ error: "Missing or invalid API key. Send it as: Authorization: Bearer <key>" }, { status: 401 });
  const body = await req.text();
  if (body.length > 1_000_000) return Response.json({ error: "The request is too large." }, { status: 413 });
  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch {
    return Response.json({ error: "The body must be JSON." }, { status: 400 });
  }
  const wrapped = data && typeof data === "object" && !Array.isArray(data) && "leads" in data ? (data as { leads: unknown; dry_run?: unknown }) : null;
  const items = wrapped ? wrapped.leads : Array.isArray(data) ? data : data && typeof data === "object" ? [data] : null;
  if (!Array.isArray(items) || !items.length) {
    return Response.json({ error: 'Send a lead object, an array of leads, or { "leads": [ … ] }.' }, { status: 400 });
  }
  if (items.length > MAX_LEADS_PER_CALL) return Response.json({ error: `Send at most ${MAX_LEADS_PER_CALL} leads per call.` }, { status: 413 });
  const dryRun = wrapped?.dry_run === true;

  const results = await intakeLeads(items, { addedBy: key.name, dryRun });
  const count = (status: string) => results.filter((r) => r.status === status).length;
  const created = count("created");
  if (created) revalidatePath("/sales", "layout");
  const base = await publicUrl();
  return Response.json(
    {
      dry_run: dryRun, created, new: count("new"), duplicates: count("duplicate"), invalid: count("invalid"),
      results: results.map((r) => ("id" in r && r.id ? { ...r, url: `${base}/sales/leads/${r.id}` } : r)),
    },
    { status: created ? 201 : 200 },
  );
}
