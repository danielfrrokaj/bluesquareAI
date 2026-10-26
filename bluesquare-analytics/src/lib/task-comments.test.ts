import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { listPersonal, notifyTaskComment } from "./notifications";
import { addTaskComment, createTask, deleteTaskComment, getTask, listTaskComments, listTasks } from "./projects";
import { createUser } from "./users";

// A throwaway embedded database. The connection opens on the first query, so this is in time.
const dir = mkdtempSync(join(tmpdir(), "bsa-task-comments-"));
process.env.PGLITE_DIR = dir;
delete process.env.DATABASE_URL;
after(() => rmSync(dir, { recursive: true, force: true }));

const person = (username: string) =>
  createUser({ username, phone: null, email: null, name: username[0].toUpperCase() + username.slice(1), password: "x".repeat(12), role: "member", departments: ["projects"] });
const task = (title: string, assigneeId: string | null, by: string) =>
  createTask({ title, notes: "", status: "pending", priority: "medium", projectId: null, assigneeId, addedOn: "2026-10-26", dueDate: null }, by);
const titles = async (userId: string) => (await listPersonal(userId, false)).map((n) => n.title);

test("comments are kept in order, counted on the task, and can be deleted", async () => {
  const ana = await person("ana");
  const id = await task("Fix the login page", null, ana.id);
  await addTaskComment(id, ana.id, "First");
  await addTaskComment(id, ana.id, "Second");
  const list = await listTaskComments(id);
  assert.deepEqual(list.map((c) => [c.body, c.user_name]), [["First", "Ana"], ["Second", "Ana"]]);
  assert.equal((await listTasks()).find((t) => t.id === id)?.comments, 2);
  const t = await getTask(id);
  assert.equal(t?.creator_name, "Ana");
  await deleteTaskComment(list[0].id);
  assert.equal((await listTaskComments(id)).length, 1);
});

test("a comment notifies the assignee and the creator, never the commenter, and nobody twice", async () => {
  const [boss, dev, qa] = await Promise.all([person("boss"), person("dev"), person("qa")]);
  const id = await task("Ship the invoice export", dev.id, boss.id);
  const t = (await getTask(id))!;

  await notifyTaskComment(t, qa, "Found a bug in the totals");
  assert.deepEqual(await titles(dev.id), [`Qa commented on task #${id}`]);
  assert.deepEqual(await titles(boss.id), [`Qa commented on task #${id}`]);
  assert.deepEqual(await titles(qa.id), []);
  const [note] = await listPersonal(dev.id, false);
  assert.equal(note.body, "Ship the invoice export: “Found a bug in the totals”");
  assert.equal(note.href, `/projects?task=${id}`);

  // The assignee answers: only the creator hears; the creator answers: only the assignee.
  await notifyTaskComment(t, dev, "Fixed");
  assert.equal((await titles(boss.id)).length, 2);
  assert.equal((await titles(dev.id)).length, 1);
  await notifyTaskComment(t, boss, "Thanks");
  assert.equal((await titles(dev.id)).length, 2);
  assert.equal((await titles(boss.id)).length, 2);

  // Created and assigned to the same person: one note, not two.
  const solo = (await getTask(await task("Own task", dev.id, dev.id)))!;
  await notifyTaskComment(solo, qa, "Need help?");
  assert.equal((await titles(dev.id)).length, 3);
});
