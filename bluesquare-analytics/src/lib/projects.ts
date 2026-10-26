import "server-only";
import { randomUUID } from "node:crypto";
import { query } from "./db";
import {
  AUTH_PROVIDERS, DEPLOYMENTS, HOSTINGS, PRIORITIES, PROJECT_STATUSES, PROJECT_TYPES, TASK_STATUSES,
  type Priority, type ProjectStatus, type TaskStatus,
} from "./project-options";

export * from "./project-options";

const TZ = () => process.env.REPORT_TIMEZONE || "Europe/Tirane";

// ---------- Projects ----------

export type Project = {
  id: string; name: string; type: string | null; status: ProjectStatus;
  start_date: string | null; deadline: string | null; budget: number | null;
  notes: string; database: string; github_url: string; hosting: string | null; auth: string | null; deployment: string | null;
  logo_version: number | null; // null: no logo
  tasks_total: number; tasks_done: number; tasks_open: number; tasks_overdue: number;
};

const PROJECT_SELECT = `
  select p.id, p.name, p.type, p.status, to_char(p.start_date, 'YYYY-MM-DD') as start_date, to_char(p.deadline, 'YYYY-MM-DD') as deadline,
         p.budget::float8 as budget, p.notes, p.database, p.github_url, p.hosting, p.auth, p.deployment,
         case when p.logo is null then null else p.logo_version end as logo_version,
         count(t.id)::int as tasks_total,
         count(t.id) filter (where t.status = 'done')::int as tasks_done,
         count(t.id) filter (where t.status <> 'done')::int as tasks_open,
         count(t.id) filter (where t.status <> 'done' and t.due_date < (now() at time zone $1)::date)::int as tasks_overdue
  from pm_projects p left join pm_tasks t on t.project_id = p.id`;

// Active work first, then by deadline.
export const listProjects = () =>
  query<Project>(
    `${PROJECT_SELECT} group by p.id
     order by case p.status when 'In Progress' then 0 when 'Testing' then 1 when 'Not Started' then 2 when 'On Hold' then 3 else 4 end,
              p.deadline nulls last, p.name`,
    [TZ()],
  );

export async function getProject(id: string): Promise<Project | null> {
  const [row] = await query<Project>(`${PROJECT_SELECT} where p.id = $2 group by p.id`, [TZ(), id]);
  return row ?? null;
}

export type ProjectInput = Omit<Project, "id" | "logo_version" | "tasks_total" | "tasks_done" | "tasks_open" | "tasks_overdue">;

const pick = <T extends string>(v: unknown, allowed: readonly T[]) => (allowed as readonly string[]).includes(String(v)) ? (String(v) as T) : null;
const date = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function readProject(form: FormData): ProjectInput | string {
  const name = text(form.get("name"), 120);
  const status = pick(form.get("status"), PROJECT_STATUSES);
  const rawBudget = text(form.get("budget"), 30).replace(/\s/g, "").replace(",", ".");
  const budget = rawBudget ? Number(rawBudget) : null;
  const github = text(form.get("github_url"), 300);
  if (!name) return "Give the project a name.";
  if (!status) return "Choose a status.";
  if (budget !== null && (!Number.isFinite(budget) || budget < 0)) return "Enter the budget as a number, e.g. 2500.";
  if (github && !/^https?:\/\//i.test(github)) return "The GitHub URL should start with https://";
  const start = date(form.get("start_date")), deadline = date(form.get("deadline"));
  if (start && deadline && deadline < start) return "The deadline is before the start date.";
  return {
    name, status, type: pick(form.get("type"), PROJECT_TYPES), start_date: start, deadline, budget,
    notes: text(form.get("notes"), 10_000), database: text(form.get("database"), 200), github_url: github,
    hosting: pick(form.get("hosting"), HOSTINGS), auth: pick(form.get("auth"), AUTH_PROVIDERS), deployment: pick(form.get("deployment"), DEPLOYMENTS),
  };
}

const PROJECT_COLS = ["name", "type", "status", "start_date", "deadline", "budget", "notes", "database", "github_url", "hosting", "auth", "deployment"] as const;

export async function createProject(p: ProjectInput, userId: string): Promise<string> {
  const id = randomUUID();
  await query(
    `insert into pm_projects (id, created_by, ${PROJECT_COLS.join(", ")}) values ($1, $2, ${PROJECT_COLS.map((_, i) => `$${i + 3}`).join(", ")})`,
    [id, userId, ...PROJECT_COLS.map((c) => p[c])],
  );
  return id;
}

export const updateProject = (id: string, p: ProjectInput) =>
  query(`update pm_projects set ${PROJECT_COLS.map((c, i) => `${c} = $${i + 2}`).join(", ")}, updated_at = now() where id = $1`, [
    id, ...PROJECT_COLS.map((c) => p[c]),
  ]);

export const deleteProject = (id: string) => query("delete from pm_projects where id = $1", [id]);

/** Replaces the logo (null removes it); the version bump gives the image a new URL. */
export const setProjectLogo = (id: string, logo: { data: Buffer; type: string } | null) =>
  query("update pm_projects set logo = $2, logo_type = $3, logo_version = logo_version + 1 where id = $1", [id, logo?.data ?? null, logo?.type ?? null]);

export async function getProjectLogo(id: string): Promise<{ data: Uint8Array; type: string } | null> {
  const [row] = await query<{ logo: Uint8Array | null; logo_type: string | null }>("select logo, logo_type from pm_projects where id = $1", [id]);
  return row?.logo && row.logo_type ? { data: row.logo, type: row.logo_type } : null;
}

/** Projects for the sidebar: not completed, active first, with their open task count. */
export const sidebarProjects = () =>
  query<{ id: string; name: string; logo_version: number | null; open: number }>(
    `select p.id, p.name, case when p.logo is null then null else p.logo_version end as logo_version,
            count(t.id) filter (where t.status <> 'done')::int as open
     from pm_projects p left join pm_tasks t on t.project_id = p.id
     where p.status <> 'Completed'
     group by p.id
     order by case p.status when 'In Progress' then 0 when 'Testing' then 1 when 'Not Started' then 2 else 3 end, lower(p.name)`,
  );

// ---------- Tasks ----------

export type Task = {
  id: number; title: string; notes: string; status: TaskStatus; priority: Priority;
  project_id: string | null; project_name: string | null;
  assignee_id: string | null; assignee_name: string | null;
  added_on: string; due_date: string | null; overdue: boolean; done_at: string | null;
  screenshot: boolean; screenshot_version: number;
  created_by: string | null; creator_name: string | null; comments: number;
};

const TASK_SELECT = `
  select t.id::int as id, t.title, t.notes, t.status, t.priority, t.project_id, p.name as project_name,
         t.assignee_id, u.name as assignee_name, to_char(t.added_on, 'YYYY-MM-DD') as added_on, to_char(t.due_date, 'YYYY-MM-DD') as due_date,
         (t.status <> 'done' and t.due_date < (now() at time zone $1)::date) as overdue, to_char(t.done_at at time zone $1, 'YYYY-MM-DD') as done_at,
         (t.screenshot_key is not null) as screenshot, t.screenshot_version, t.created_by, cu.name as creator_name,
         (select count(*)::int from pm_task_comments c where c.task_id = t.id) as comments
  from pm_tasks t left join pm_projects p on p.id = t.project_id left join users u on u.id = t.assignee_id
       left join users cu on cu.id = t.created_by`;

export type TaskFilter = { projectId?: string; assigneeId?: string; priority?: Priority };

/** Board order: by position within a column; done tasks newest first, limited to the last 60 days. */
export async function listTasks(f: TaskFilter = {}): Promise<Task[]> {
  const params: unknown[] = [TZ()];
  const where = ["(t.status <> 'done' or t.done_at > now() - interval '60 days')"];
  if (f.projectId) where.push(`t.project_id = $${params.push(f.projectId)}`);
  if (f.assigneeId) where.push(`t.assignee_id = $${params.push(f.assigneeId)}`);
  if (f.priority) where.push(`t.priority = $${params.push(f.priority)}`);
  return query<Task>(
    `${TASK_SELECT} where ${where.join(" and ")}
     order by case when t.status = 'done' then 1 else 0 end, t.position, t.done_at desc nulls last, t.id desc`,
    params,
  );
}

export async function getTask(id: number): Promise<(Task & { screenshot_key: string | null; screenshot_mime: string | null }) | null> {
  if (!Number.isSafeInteger(id)) return null;
  const [row] = await query<Task & { screenshot_key: string | null; screenshot_mime: string | null }>(
    `${TASK_SELECT.replace("t.screenshot_version,", "t.screenshot_version, t.screenshot_key, t.screenshot_mime,")} where t.id = $2`,
    [TZ(), id],
  );
  return row ?? null;
}

export type TaskInput = {
  title: string; notes: string; status: TaskStatus; priority: Priority;
  projectId: string | null; assigneeId: string | null; addedOn: string; dueDate: string | null;
};

export function readTask(form: FormData, today: string): TaskInput | string {
  const title = text(form.get("title"), 200);
  const status = pick(form.get("status"), TASK_STATUSES) ?? "pending";
  const priority = pick(form.get("priority"), PRIORITIES);
  if (!title) return "Describe the task.";
  if (!priority) return "Choose a priority.";
  return {
    title, notes: text(form.get("notes"), 5000), status, priority,
    projectId: text(form.get("project_id"), 64) || null, assigneeId: text(form.get("assignee_id"), 64) || null,
    addedOn: date(form.get("added_on")) ?? today, dueDate: date(form.get("due_date")),
  };
}

/** New tasks go to the top of their column. */
export async function createTask(t: TaskInput, userId: string): Promise<number> {
  const [row] = await query<{ id: number }>(
    `insert into pm_tasks (title, notes, status, priority, project_id, assignee_id, added_on, due_date, created_by, position, done_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9,
             coalesce((select min(position) from pm_tasks where status = $3), 0) - 1,
             case when $3 = 'done' then now() end)
     returning id::int as id`,
    [t.title, t.notes, t.status, t.priority, t.projectId, t.assigneeId, t.addedOn, t.dueDate, userId],
  );
  return row.id;
}

export const updateTask = (id: number, t: TaskInput) =>
  query(
    `update pm_tasks set title = $2, notes = $3, priority = $4, project_id = $5, assignee_id = $6, added_on = $7, due_date = $8,
            done_at = case when $9 = 'done' then coalesce(done_at, now()) else null end,
            status = $9, updated_at = now()
     where id = $1`,
    [id, t.title, t.notes, t.priority, t.projectId, t.assigneeId, t.addedOn, t.dueDate, t.status],
  );

/** Moves a task to a column, placed before `beforeId` (or at the end). */
export async function moveTask(id: number, status: TaskStatus, beforeId: number | null) {
  let position: number;
  if (beforeId) {
    const [r] = await query<{ before: number; prev: number | null }>(
      `select b.position::float8 as before,
              (select max(position)::float8 from pm_tasks where status = $1 and position < b.position and id <> $3) as prev
       from pm_tasks b where b.id = $2`,
      [status, beforeId, id],
    );
    position = r ? (r.prev === null ? r.before - 1 : (r.prev + r.before) / 2) : 0;
  } else {
    const [r] = await query<{ max: number | null }>("select max(position)::float8 as max from pm_tasks where status = $1 and id <> $2", [status, id]);
    position = (r?.max ?? 0) + 1;
  }
  await query(
    `update pm_tasks set status = $2, position = $3, updated_at = now(),
            done_at = case when $2 = 'done' then coalesce(done_at, now()) else null end
     where id = $1`,
    [id, status, position],
  );
}

export const deleteTask = (id: number) => query("delete from pm_tasks where id = $1", [id]);

export const setTaskScreenshot = (id: number, s: { key: string; mime: string } | null) =>
  query("update pm_tasks set screenshot_key = $2, screenshot_mime = $3, screenshot_version = screenshot_version + 1 where id = $1", [
    id, s?.key ?? null, s?.mime ?? null,
  ]);

// ---------- Task comments ----------

export type TaskComment = { id: string; body: string; user_id: string | null; user_name: string | null; created_at: string };

export const listTaskComments = (taskId: number) =>
  query<TaskComment>(
    `select c.id, c.body, c.user_id, u.name as user_name, to_char(c.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at
     from pm_task_comments c left join users u on u.id = c.user_id where c.task_id = $1 order by c.created_at, c.id`,
    [taskId],
  );

export const addTaskComment = (taskId: number, userId: string, body: string) =>
  query("insert into pm_task_comments (id, task_id, user_id, body) values ($1, $2, $3, $4)", [randomUUID(), taskId, userId, body]);

export const getTaskComment = async (id: string) =>
  (await query<{ id: string; task_id: number; user_id: string | null }>("select id, task_id::int as task_id, user_id from pm_task_comments where id = $1", [id]))[0] ?? null;

export const deleteTaskComment = (id: string) => query("delete from pm_task_comments where id = $1", [id]);
