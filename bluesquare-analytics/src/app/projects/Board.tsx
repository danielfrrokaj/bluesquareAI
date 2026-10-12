"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { PRIORITY_LABEL, TASK_STATUSES, TASK_STATUS_LABEL, type TaskStatus } from "@/lib/project-options";
import type { Task } from "@/lib/projects";
import { moveTask } from "./actions";
import type { Option } from "./TaskFields";
import { TaskEditor } from "./TaskEditor";
import s from "./projects.module.css";

const COLUMN_HINT: Record<TaskStatus, string> = { pending: "Nothing waiting", in_progress: "Nothing in progress", done: "Nothing finished yet" };
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
const shortDate = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/** Kanban board: drag cards between columns (or within one to reorder); click a card to edit it. */
export function Board({ tasks, projects, users, today, showProject = true }: {
  tasks: Task[]; projects: Option[]; users: Option[]; today: string; showProject?: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(tasks);
  const [dragId, setDragId] = useState<number | null>(null);
  const [drop, setDropState] = useState<{ status: TaskStatus; before: number | null } | null>(null);
  // Drag events can fire before React re-renders, so the handlers read these refs, not state.
  const dragRef = useRef<number | null>(null);
  const dropRef = useRef<typeof drop>(null);
  const setDrop = (d: typeof drop) => {
    dropRef.current = d;
    setDropState(d);
  };
  const [, startTransition] = useTransition();
  useEffect(() => setItems(tasks), [tasks]);

  function commit(id: number, status: TaskStatus, before: number | null) {
    // Optimistic: move the card locally, then save and refresh.
    setItems((list) => {
      const card = list.find((t) => t.id === id);
      if (!card) return list;
      const rest = list.filter((t) => t.id !== id);
      const moved = { ...card, status, overdue: status === "done" ? false : card.overdue };
      const at = before ? rest.findIndex((t) => t.id === before) : -1;
      if (at >= 0) rest.splice(at, 0, moved);
      else rest.push(moved);
      return rest;
    });
    startTransition(async () => {
      await moveTask(id, status, before);
      router.refresh();
    });
  }

  function overColumn(e: React.DragEvent<HTMLElement>, status: TaskStatus) {
    const dragId = dragRef.current;
    if (dragId === null) return;
    e.preventDefault();
    // Insert before the first card whose middle is below the pointer.
    const cards = [...e.currentTarget.querySelectorAll<HTMLElement>("[data-task]")].filter((el) => Number(el.dataset.task) !== dragId);
    const next = cards.find((el) => {
      const r = el.getBoundingClientRect();
      return e.clientY < r.top + r.height / 2;
    });
    const before = next ? Number(next.dataset.task) : null;
    const cur = dropRef.current;
    if (cur?.status !== status || cur.before !== before) setDrop({ status, before });
  }

  return (
    <div className={s.board}>
      {TASK_STATUSES.map((status) => {
        const column = items.filter((t) => t.status === status);
        return (
          <section
            key={status}
            className={`${s.column} ${s[`col_${status}`]}${drop?.status === status ? ` ${s.over}` : ""}`}
            onDragOver={(e) => overColumn(e, status)}
            // Leaving this column clears only its own target (the next column may already have set one).
            onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && dropRef.current?.status === status && setDrop(null)}
            onDrop={(e) => {
              e.preventDefault();
              const id = dragRef.current, target = dropRef.current;
              if (id !== null && target) commit(id, target.status, target.before);
              dragRef.current = null;
              setDragId(null);
              setDrop(null);
            }}
            aria-label={TASK_STATUS_LABEL[status]}
          >
            <header className={s.colhead}>
              <i aria-hidden="true" />
              <h2>{TASK_STATUS_LABEL[status]}</h2>
              <span>{column.length}</span>
            </header>
            <ul className={s.cards}>
              {column.map((t) => (
                <li
                  key={t.id}
                  data-task={t.id}
                  className={`${s.card}${dragId === t.id ? ` ${s.dragging}` : ""}${drop?.before === t.id && dragId !== t.id ? ` ${s.dropbefore}` : ""}`}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", String(t.id));
                    dragRef.current = t.id;
                    setDragId(t.id);
                  }}
                  onDragEnd={() => {
                    dragRef.current = null;
                    setDragId(null);
                    setDrop(null);
                  }}
                >
                  <Modal title={`Task #${t.id}`} triggerClassName={s.cardbtn} trigger={<CardBody task={t} showProject={showProject} />}>
                    <TaskEditor task={t} projects={projects} users={users} today={today} />
                  </Modal>
                  {status !== "done" && (
                    <button type="button" className={s.quickdone} title="Mark as done" aria-label={`Mark task #${t.id} as done`}
                      onClick={() => commit(t.id, "done", items.find((x) => x.status === "done")?.id ?? null)}>
                      ✓
                    </button>
                  )}
                </li>
              ))}
              {drop?.status === status && drop.before === null && dragId !== null && column.length > 0 && <li className={s.droptail} aria-hidden="true" />}
              {/* Kept while dragging over it: removing the element under the pointer would cancel the drop. */}
              {column.length === 0 && <li className={s.emptycol}>{drop?.status === status ? "Drop here" : COLUMN_HINT[status]}</li>}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function CardBody({ task: t, showProject }: { task: Task; showProject: boolean }) {
  return (
    <>
      <span className={s.cardtop}>
        <span className={`${s.prio} ${s[`prio_${t.priority}`]}`}>{PRIORITY_LABEL[t.priority]}</span>
        <span className={s.cardid}>#{t.id}</span>
      </span>
      <span className={s.cardtitle}>{t.title}</span>
      {t.screenshot && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={s.cardshot} src={`/api/projects/tasks/${t.id}/screenshot?v=${t.screenshot_version}`} alt="" loading="lazy" />
      )}
      <span className={s.cardmeta}>
        {showProject && t.project_name && <span className={s.cardproject}>{t.project_name}</span>}
        {t.due_date && (
          <span className={`${s.due}${t.overdue ? ` ${s.overdue}` : ""}`} title={t.overdue ? "Overdue" : "Due date"}>
            {t.overdue ? "⚠ " : ""}{shortDate(t.due_date)}
          </span>
        )}
        {t.notes && <span className={s.hasnotes} title="Has notes">≡</span>}
        <span className={s.spacer} />
        {t.assignee_name ? (
          <span className={s.avatar} title={t.assignee_name}>{initials(t.assignee_name)}</span>
        ) : (
          <span className={`${s.avatar} ${s.avatarnone}`} title="Unassigned">?</span>
        )}
      </span>
    </>
  );
}
