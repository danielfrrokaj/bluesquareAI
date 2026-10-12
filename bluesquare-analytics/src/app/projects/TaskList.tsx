"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { PRIORITY_LABEL, TASK_STATUSES, TASK_STATUS_LABEL, type TaskStatus } from "@/lib/project-options";
import type { Task } from "@/lib/projects";
import { moveTask } from "./actions";
import type { Option } from "./TaskFields";
import { TaskEditor } from "./TaskEditor";
import s from "./projects.module.css";

type SortKey = "id" | "title" | "project" | "assignee" | "priority" | "status" | "due" | "added";

const RANK = { priority: { high: 0, medium: 1, low: 2 }, status: { in_progress: 0, pending: 1, done: 2 } } as const;
const shortDate = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

// Empty values sort last whichever way the column is sorted.
function compare(a: Task, b: Task, key: SortKey, dir: 1 | -1): number {
  const v = (t: Task): string | number | null =>
    key === "id" ? t.id
    : key === "title" ? t.title.toLowerCase()
    : key === "project" ? t.project_name?.toLowerCase() ?? null
    : key === "assignee" ? t.assignee_name?.toLowerCase() ?? null
    : key === "priority" ? RANK.priority[t.priority]
    : key === "status" ? RANK.status[t.status]
    : key === "due" ? t.due_date
    : t.added_on;
  const x = v(a), y = v(b);
  if (x === y) return 0;
  if (x === null) return 1;
  if (y === null) return -1;
  return (x < y ? -1 : 1) * dir;
}

/** Table of tasks: sort by any column, tick to complete, change status inline, click a row to edit. */
export function TaskList({ tasks, projects, users, today, showProject = true }: {
  tasks: Task[]; projects: Option[]; users: Option[]; today: string; showProject?: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(tasks);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "due", dir: 1 });
  const [, startTransition] = useTransition();
  useEffect(() => setItems(tasks), [tasks]);

  function setStatus(id: number, status: TaskStatus) {
    setItems((list) => list.map((t) => (t.id === id ? { ...t, status, overdue: status === "done" ? false : t.overdue } : t)));
    startTransition(async () => {
      await moveTask(id, status, null);
      router.refresh();
    });
  }

  // Finished tasks always sink to the bottom; the chosen column orders the rest.
  const rows = [...items].sort((a, b) =>
    Number(a.status === "done") - Number(b.status === "done") || compare(a, b, sort.key, sort.dir) || b.id - a.id,
  );

  const Th = ({ k, children, className }: { k: SortKey; children: React.ReactNode; className?: string }) => (
    <th className={className} aria-sort={sort.key === k ? (sort.dir === 1 ? "ascending" : "descending") : undefined}>
      <button type="button" className={s.sortbtn} onClick={() => setSort((cur) => ({ key: k, dir: cur.key === k ? (cur.dir === 1 ? -1 : 1) : 1 }))}>
        {children}
        <span aria-hidden="true">{sort.key === k ? (sort.dir === 1 ? "↑" : "↓") : ""}</span>
      </button>
    </th>
  );

  if (!items.length) return <p className="empty empty--big">No tasks here. Use “New task” to add one.</p>;

  return (
    <div className={`tablewrap ${s.listwrap}`}>
      <table className={`table ${s.tasktable}`}>
        <thead>
          <tr>
            <th className={s.tick}><span className="sr-only">Done</span></th>
            <Th k="id">#</Th>
            <Th k="title">Task</Th>
            {showProject && <Th k="project">Project</Th>}
            <Th k="assignee">Assigned</Th>
            <Th k="priority">Priority</Th>
            <Th k="status">Status</Th>
            <Th k="due">Due</Th>
            <Th k="added">Added</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} className={`${s.taskrow}${t.status === "done" ? ` ${s.rowdone}` : ""}`}>
              <td className={s.tick}>
                <input type="checkbox" checked={t.status === "done"} aria-label={`Task #${t.id} done`}
                  onChange={(e) => setStatus(t.id, e.target.checked ? "done" : "pending")} />
              </td>
              <td className={s.cardid}>{t.id}</td>
              <td className={s.titlecell}>
                <Modal title={`Task #${t.id}`} triggerClassName={s.rowbtn} trigger={
                  <>
                    {t.title}
                    {(t.notes || t.screenshot) && (
                      <small>{t.notes && "≡ notes"}{t.notes && t.screenshot && " · "}{t.screenshot && "🖼 screenshot"}</small>
                    )}
                  </>
                }>
                  <TaskEditor task={t} projects={projects} users={users} today={today} />
                </Modal>
              </td>
              {showProject && <td>{t.project_name ? <span className={s.cardproject}>{t.project_name}</span> : <span className="muted">—</span>}</td>}
              <td>{t.assignee_name ?? <span className="muted">—</span>}</td>
              <td><span className={`${s.prio} ${s[`prio_${t.priority}`]}`}>{PRIORITY_LABEL[t.priority]}</span></td>
              <td>
                <select className={`${s.statussel} ${s[`st_${t.status}`]}`} value={t.status} aria-label={`Status of task #${t.id}`}
                  onChange={(e) => setStatus(t.id, e.target.value as TaskStatus)}>
                  {TASK_STATUSES.map((st) => <option key={st} value={st}>{TASK_STATUS_LABEL[st]}</option>)}
                </select>
              </td>
              <td>
                {t.due_date ? (
                  <span className={`${s.due}${t.overdue ? ` ${s.overdue}` : ""}`}>{t.overdue ? "⚠ " : ""}{shortDate(t.due_date)}</span>
                ) : <span className="muted">—</span>}
              </td>
              <td className="muted">{shortDate(t.added_on)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
