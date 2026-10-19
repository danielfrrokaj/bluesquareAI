import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { query } from "./db";
import {
  deadlineTitle, listPersonal, markAllPersonalRead, notify, notifyReviewed, notifyTaskAssigned, openPersonal, personalUnread, sendReminders,
} from "./notifications";
import { today } from "./period";
import { createUser } from "./users";

// A throwaway embedded database. The connection opens on the first query, so this is in time.
const dir = mkdtempSync(join(tmpdir(), "bsa-notifications-"));
process.env.PGLITE_DIR = dir;
delete process.env.DATABASE_URL;
after(() => rmSync(dir, { recursive: true, force: true }));

const person = (username: string, departments: string[] | null, role: "admin" | "member" = "member") =>
  createUser({ username, phone: null, email: null, name: username[0].toUpperCase() + username.slice(1), password: "x".repeat(12), role, departments });
const titles = async (userId: string) => (await listPersonal(userId, false)).map((n) => n.title);

test("events reach the people concerned, never whoever caused them or someone without access", async () => {
  const [boss, ana, ben, eve] = await Promise.all([
    person("boss", null, "admin"), person("ana", ["finance", "finance:transactions", "projects"]),
    person("ben", ["finance", "finance:register"]), person("eve", ["sales"]),
  ]);
  await notify([ana.id, boss.id, eve.id], "projects", { kind: "task", title: "Hello" }, boss.id);
  assert.deepEqual(await titles(ana.id), ["Hello"]);
  assert.deepEqual(await titles(boss.id), []); // caused it
  assert.deepEqual(await titles(eve.id), []); // can't open Projects

  // The Register: one note per person, linked where they can see it.
  await notifyReviewed([
    { id: "t1", type: "income", amount: 120, description: "Cash from guest", owner_id: ana.id },
    { id: "t2", type: "expense", amount: 30, description: "Taxi", owner_id: ben.id },
    { id: "t3", type: "expense", amount: 20, description: "Parking", owner_id: ben.id },
    { id: "t4", type: "expense", amount: 5, description: "Own coffee", owner_id: boss.id },
  ], "confirmed", boss.id);
  const [anaTx] = await listPersonal(ana.id, false, 1);
  assert.equal(anaTx.title, "Your income was confirmed");
  assert.equal(anaTx.body, "Cash from guest · EUR 120");
  assert.equal(anaTx.href, "/finance/transactions/t1");
  assert.equal(anaTx.actorName, "Boss");
  const [benTx] = await listPersonal(ben.id, false, 1);
  assert.equal(benTx.title, "2 of your transactions were confirmed");
  assert.equal(benTx.body, "Taxi and Parking · EUR 50 in all");
  assert.equal(benTx.href, "/finance/register"); // no Transactions tab
  assert.deepEqual(await titles(boss.id), []);

  // Tasks: given by someone else notifies; giving yourself one doesn't.
  await notifyTaskAssigned({ id: 7, title: "Call the bank", dueDate: "2026-10-20", assigneeId: ana.id }, boss, false);
  await notifyTaskAssigned({ id: 8, title: "Self note", dueDate: null, assigneeId: ana.id }, ana, false);
  const [task] = await listPersonal(ana.id, false, 1);
  assert.equal(task.title, "Boss gave you task #7");
  assert.equal(task.body, "Call the bank · due 20 Oct");
  assert.equal((await titles(ana.id)).filter((t) => t.includes("#8")).length, 0);
});

test("reading: unread count, opening one, marking all", async () => {
  const sam = await person("sam", ["projects"]);
  await notify([sam.id], "projects", { kind: "task", title: "One", href: "/projects?who=me" });
  await notify([sam.id], "projects", { kind: "task", title: "Two" });
  assert.equal(await personalUnread(sam.id), 2);
  const [two, one] = await listPersonal(sam.id, true);
  assert.equal(await openPersonal(sam.id, one.id), "/projects?who=me");
  assert.equal(await openPersonal("someone-else", two.id), null); // not theirs: untouched
  assert.equal(await personalUnread(sam.id), 1);
  await markAllPersonalRead(sam.id);
  assert.equal(await personalUnread(sam.id), 0);
  assert.equal((await listPersonal(sam.id, false)).length, 2);
});

test("reminders: one follow-up note per owner and day, media to publish for Marketing, refreshed only when they change", async () => {
  const [seller, marketer, other] = await Promise.all([person("seller", ["sales"]), person("marketer", ["marketing"]), person("other", ["projects"])]);
  const date = today();
  const lead = (hotel: string, owner: string, due: string) =>
    query("insert into sales_leads (id, hotel, owner_id, due_date) values ($1, $2, $3, $4::date)", [`lead-${hotel}`, hotel, owner, due]);
  await lead("Hotel Arta", seller.id, date);
  await lead("Villa Blu", seller.id, date);
  await lead("Later Inn", seller.id, "2099-01-01");
  await query(
    `insert into mk_posts (id, title, caption, platforms, publish_at, kind, mime, size, original_name, media_key, status)
     values ('post-1', 'Autumn offer', '', array['instagram', 'facebook'], ($1::date + time '14:00') at time zone $2, 'image', 'image/png', 1, 'a.png', 'k', 'ready')`,
    [date, process.env.REPORT_TIMEZONE || "Europe/Tirane"],
  );

  await sendReminders(true);
  const [followups] = await listPersonal(seller.id, false);
  assert.equal(followups.title, "2 follow-ups due today");
  assert.equal(followups.body, "Hotel Arta and Villa Blu");
  const [publish] = await listPersonal(marketer.id, false);
  assert.equal(publish.title, "Publish today: Autumn offer");
  assert.equal(publish.body, "14:00 · on Instagram and Facebook");
  assert.deepEqual(await titles(other.id), []);

  // Throttled, and idempotent: running again sends nothing new and keeps them read.
  await markAllPersonalRead(seller.id);
  await sendReminders();
  await sendReminders(true);
  assert.equal((await listPersonal(seller.id, false)).length, 1);
  assert.equal(await personalUnread(seller.id), 0);

  // A new follow-up for today updates the same note, unread again.
  await lead("Sea View", seller.id, date);
  await sendReminders(true);
  const notes = await listPersonal(seller.id, false);
  assert.equal(notes.length, 1);
  assert.equal(notes[0].title, "3 follow-ups due today");
  assert.equal(await personalUnread(seller.id), 1);
});

test("deadlines: each person hears once a day about their open tasks due today or overdue", async () => {
  const [dev, lead, outsider] = await Promise.all([person("dev", ["projects"]), person("lead", ["projects"]), person("outsider", ["sales"])]);
  const date = today();
  const yesterday = new Date(Date.parse(`${date}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
  const task = (title: string, assignee: string | null, due: string, status = "pending", createdBy: string | null = null) =>
    query("insert into pm_tasks (title, assignee_id, due_date, status, created_by) values ($1, $2, $3::date, $4, $5)", [title, assignee, due, status, createdBy]);
  await task("Ship invoice", dev.id, date);
  await task("Fix login", dev.id, yesterday, "in_progress");
  await task("Finished one", dev.id, yesterday, "done");
  await task("Next year", dev.id, "2099-01-01");
  await task("Plan sprint", null, yesterday, "pending", lead.id); // unassigned: whoever created it
  await task("Not their department", outsider.id, date);

  await sendReminders(true);
  const [mine] = (await listPersonal(dev.id, false)).filter((n) => n.kind === "deadlines");
  assert.equal(mine.title, "1 task overdue, 1 due today");
  assert.equal(mine.body, "Fix login and Ship invoice");
  assert.equal(mine.href, "/projects?who=me&view=list");
  const [created] = await listPersonal(lead.id, false);
  assert.equal(created.title, "1 task overdue");
  assert.equal(created.href, "/projects?view=list");
  assert.deepEqual(await titles(outsider.id), []);

  await sendReminders(true);
  assert.equal((await listPersonal(dev.id, false)).filter((n) => n.kind === "deadlines").length, 1);
  assert.equal(deadlineTitle(0, 3), "3 tasks due today");
  assert.equal(deadlineTitle(2, 0), "2 tasks overdue");
});
