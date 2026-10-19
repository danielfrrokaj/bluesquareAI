import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { apiKeyFor, createApiKey, listApiKeys, revokeApiKey } from "./api-keys";
import { query } from "./db";
import { intakeLeads } from "./lead-intake";
import { createLead, getLead } from "./sales";
import { createUser } from "./users";

// A throwaway embedded database. The connection opens on the first query, so this is in time.
const dir = mkdtempSync(join(tmpdir(), "bsa-lead-intake-"));
process.env.PGLITE_DIR = dir;
delete process.env.DATABASE_URL;
after(() => rmSync(dir, { recursive: true, force: true }));

const call = (authorization?: string) => new Request("http://x/api/sales/leads", { method: "POST", headers: authorization ? { authorization } : {} });
const intake = (leads: unknown[], dryRun = false) => intakeLeads(leads, { addedBy: "Claude lead finder", dryRun });

test("API keys: only a live key, sent as a Bearer token, gets in; it's stored as a hash and marked when used", async () => {
  const admin = await createUser({ username: "boss", phone: null, email: null, name: "Boss", password: "x".repeat(12), role: "admin", departments: null });
  const key = await createApiKey("Claude lead finder", "leads", admin.id);
  assert.match(key, /^bsa_[\w-]{40}$/);
  assert.equal((await query("select 1 from api_keys where hash = $1 or prefix = $1", [key])).length, 0); // never the key itself
  assert.equal((await apiKeyFor(call(`Bearer ${key}`), "leads"))?.name, "Claude lead finder");
  assert.ok((await listApiKeys())[0].last_used_at);
  for (const wrong of [undefined, key, `Basic ${key}`, `Bearer ${key}x`, `Bearer bsa_${"a".repeat(40)}`]) {
    assert.equal(await apiKeyFor(call(wrong), "leads"), null, String(wrong));
  }
  await revokeApiKey((await listApiKeys())[0].id);
  assert.equal(await apiKeyFor(call(`Bearer ${key}`), "leads"), null);
  assert.ok((await listApiKeys())[0].revoked);
});

test("creates new leads with their details, and says why the others aren't", async () => {
  const results = await intake([
    { hotel: "Hotel Riviera", city: "Sarandë", phone: "+355 69 111 2233", email: "Info@Riviera.al", rooms: 24, website: "https://riviera.al",
      notes: "Family-run, no channel manager on their site", extra: { "Booking.com rating": 8.7 }, external_id: "maps:riviera" },
    { city: "Vlorë" },
    { hotel: "Bad rooms", rooms: "a few" },
    "not an object",
  ]);
  assert.deepEqual(results.map((r) => r.status), ["created", "invalid", "invalid", "invalid"]);
  const created = results[0];
  assert.ok(created.status === "created");
  const lead = (await getLead(created.id))!;
  assert.equal(lead.source, "Claude");
  assert.equal(lead.email, "info@riviera.al");
  assert.equal(lead.rooms, 24);
  assert.deepEqual(lead.extra, {
    Website: "https://riviera.al", Notes: "Family-run, no channel manager on their site", "Booking.com rating": "8.7", "Added by": "Claude lead finder",
  });
});

test("skips leads Sales already has: same external id, phone in any format, email, or name in the same city", async () => {
  await createLead({ hotel: "Vila Blu", contact: null, phone: "069 444 5566", email: "stay@vilablu.al", city: "Himarë", property_type: null, rooms: null,
    current_system: null, source: "Manual", due_date: null, owner_id: null, status: "lost" }, null);
  const results = await intake([
    { hotel: "Somewhere else", external_id: "maps:riviera" },
    { hotel: "Vila Blu Annex", phone: "+355694445566" },
    { contact: "Ana", email: "STAY@vilablu.al" },
    { hotel: "vila blu", city: "himarë" },
    { hotel: "Vila Blu", city: "Durrës" }, // same name, another city: a different property
    { hotel: "Vila Blu", city: "Durrës", phone: "068 000 1111" }, // repeats the one above, in the same call
  ]);
  assert.deepEqual(results.map((r) => (r.status === "duplicate" ? r.match : r.status)), ["external_id", "phone", "email", "name", "created", "name"]);
  const lost = results[1];
  assert.ok(lost.status === "duplicate" && lost.lead_status === "lost");
  const repeat = results[5];
  assert.ok(repeat.status === "duplicate" && repeat.same_as_index === 4 && repeat.id === (results[4] as { id: string }).id);
});

test("a dry run saves nothing and only says which leads would be new", async () => {
  const before = (await query("select count(*)::int as n from sales_leads"))[0].n;
  const results = await intake([{ hotel: "Hotel Nova", city: "Korçë" }, { hotel: "Hotel Nova", city: "Korçë" }, { hotel: "Hotel Riviera", city: "Sarandë" }], true);
  assert.deepEqual(results.map((r) => r.status), ["new", "duplicate", "duplicate"]);
  const inCall = results[1];
  assert.ok(inCall.status === "duplicate" && inCall.same_as_index === 0 && !inCall.id);
  assert.equal((await query("select count(*)::int as n from sales_leads"))[0].n, before);
});
