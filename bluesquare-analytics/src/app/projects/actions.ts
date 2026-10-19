"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdmin, requireAuth } from "@/lib/auth";
import {
  createProject, createTask, deleteProject, deleteTask, getProject, getTask, moveTask as move, readProject, readTask,
  setProjectLogo, TASK_STATUSES, updateProject, updateTask, type TaskStatus,
} from "@/lib/projects";
import { removeMedia } from "@/lib/media-store";
import { notifyTaskAssigned } from "@/lib/notifications";
import { readLogo } from "@/lib/logo";
import type { FormState } from "@/components/ActionForm";

const refresh = () => revalidatePath("/projects", "layout");
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: process.env.REPORT_TIMEZONE || "Europe/Tirane" }).format(new Date());

// ---------- Projects ----------

export async function addProject(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireAuth();
  const input = readProject(form);
  if (typeof input === "string") return { error: input };
  const logo = await readLogo(form);
  if (typeof logo === "string") return { error: logo };
  const id = await createProject(input, user.id);
  if (logo) await setProjectLogo(id, logo);
  refresh();
  redirect(`/projects/${id}`);
}

export async function saveProject(_: FormState, form: FormData): Promise<FormState> {
  await requireAuth();
  const id = String(form.get("id") ?? "");
  if (!(await getProject(id))) return { error: "This project no longer exists." };
  const input = readProject(form);
  if (typeof input === "string") return { error: input };
  const logo = await readLogo(form);
  if (typeof logo === "string") return { error: logo };
  await updateProject(id, input);
  if (logo) await setProjectLogo(id, logo);
  else if (form.get("remove_logo") === "on") await setProjectLogo(id, null);
  refresh();
  return { ok: "Project saved." };
}

/** Admins only; the project's tasks stay, without a project. */
export async function removeProject(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireAuth();
  if (!isAdmin(user)) return { error: "Only admins can delete projects." };
  if (String(form.get("confirm") ?? "").trim().toUpperCase() !== "DELETE") return { error: "Type DELETE to confirm." };
  await deleteProject(String(form.get("id") ?? ""));
  refresh();
  redirect("/projects/list");
}

// ---------- Tasks ----------

export async function addTask(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireAuth();
  const input = readTask(form, today());
  if (typeof input === "string") return { error: input };
  const id = await createTask(input, user.id);
  await notifyTaskAssigned({ id, ...input }, user, false);
  refresh();
  return { ok: `Task #${id} added.` };
}

export async function saveTask(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireAuth();
  const task = await getTask(Number(form.get("id")));
  if (!task) return { error: "This task no longer exists." };
  const input = readTask(form, today());
  if (typeof input === "string") return { error: input };
  await updateTask(task.id, input);
  // Only a change of assignee notifies (the new one), not every edit.
  if (input.assigneeId !== task.assignee_id) await notifyTaskAssigned({ id: task.id, ...input }, user, true);
  refresh();
  return { ok: `Task #${task.id} saved.` };
}

export async function removeTask(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireAuth();
  const task = await getTask(Number(form.get("id")));
  if (!task) return { ok: "Deleted." };
  if (!isAdmin(user) && task.created_by !== user.id) return { error: "Only whoever created the task or an admin can delete it." };
  if (task.screenshot_key) await removeMedia(task.screenshot_key).catch(() => {});
  await deleteTask(task.id);
  refresh();
  return { ok: `Task #${task.id} deleted.` };
}

/** Drag and drop on the board: a new column and/or place. */
export async function moveTask(id: number, status: TaskStatus, beforeId: number | null) {
  await requireAuth();
  if (!TASK_STATUSES.includes(status) || !Number.isSafeInteger(id)) return;
  await move(id, status, beforeId && Number.isSafeInteger(beforeId) ? beforeId : null);
  refresh();
}
