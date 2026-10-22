import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import {
  addLeadFor, assignConversation, deleteGroup, leadFor, listGroups, recordSender, saveGroup, sendersFor, withAssignees,
} from "./inbox";
import { createLead } from "./sales";
import type { Conversation } from "./chatwoot";

// A throwaway embedded database. The connection opens on the first query, so this is in time.
const dir = mkdtempSync(join(tmpdir(), "bsa-inbox-"));
process.env.PGLITE_DIR = dir;
delete process.env.DATABASE_URL;
after(() => rmSync(dir, { recursive: true, force: true }));

test("groups: created, renamed, deleted, and listed in the order they were made", async () => {
  const a = await saveGroup({ name: "LuxHotel channels", color: "blue", inboxIds: [149189, 149172] });
  await saveGroup({ name: "Website", color: "teal", inboxIds: [149171] });
  await saveGroup({ id: a, name: "LuxHotel", color: "violet", inboxIds: [149189] });
  assert.deepEqual((await listGroups()).map((g) => [g.name, g.color, g.inboxIds]), [["LuxHotel", "violet", [149189]], ["Website", "teal", [149171]]]);
  await deleteGroup(a);
  assert.deepEqual((await listGroups()).map((g) => g.name), ["Website"]);
});

test("a chat contact finds its lead by this chat, phone in any format, or email; new ones become leads", async () => {
  const contact = { id: 555, name: "Daniel", avatar: null, phone: "+355 68 228 2262", email: "dani@example.com", location: "Tiranë, Albania", company: "Hotel Mira" };
  assert.equal(await leadFor(contact), null);
  await addLeadFor(contact, "whatsapp", null as never);
  const byChat = await leadFor({ id: 555, phone: null, email: null });
  assert.equal(byChat?.title, "Hotel Mira");
  assert.equal((await leadFor({ id: 1, phone: "0682282262", email: null }))?.id, byChat!.id);
  assert.equal((await leadFor({ id: 1, phone: null, email: "DANI@example.com" }))?.id, byChat!.id);
  assert.equal(await leadFor({ id: 1, phone: "+355690000000", email: null }), null);
  // A lead typed into Sales earlier is found by phone, and an open one is preferred.
  await createLead({ hotel: "Vila Toni", contact: null, phone: "069 111 2233", email: null, city: null, property_type: null, rooms: null,
    current_system: null, source: "Manual", due_date: null, owner_id: null }, null);
  assert.equal((await leadFor({ id: 2, phone: "+355691112233", email: null }))?.title, "Vila Toni");
});

test("conversations are handed to CRM users, and the CRM remembers who wrote each sent message", async () => {
  const { query } = await import("./db");
  await query("insert into users (id, username, email, name, password_hash) values ('u-dani', 'dani', 'dani@bsa.test', 'Daniel', 'x'), ('u-ana', 'ana', 'ana@bsa.test', 'Ana', 'x')");

  await assignConversation(42, "u-dani", "u-dani");
  await assignConversation(42, "u-ana", "u-dani"); // reassigned
  await assignConversation(43, "u-dani", "u-dani");
  const convs = [{ id: 42, assignee: null }, { id: 43, assignee: null }, { id: 44, assignee: null }] as Conversation[];
  assert.deepEqual((await withAssignees(convs)).map((c) => c.assignee?.name ?? null), ["Ana", "Daniel", null]);
  await assignConversation(42, null, "u-dani"); // unassigned again
  assert.equal((await withAssignees([convs[0]]))[0].assignee, null);

  await recordSender(9001, 42, { id: "u-dani", name: "Daniel" });
  await recordSender(9001, 42, { id: "u-ana", name: "Ana" }); // a second claim on the same message changes nothing
  const senders = await sendersFor([9001, 9002]);
  assert.equal(senders.get(9001)?.name, "Daniel");
  assert.equal(senders.has(9002), false);
});
