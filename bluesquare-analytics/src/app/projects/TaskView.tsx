"use client";

import { useEffect, useState, useTransition } from "react";
import { PRIORITY_LABEL, TASK_STATUS_LABEL } from "@/lib/project-options";
import type { Task } from "@/lib/projects";
import { commentOnTask, removeTaskComment, taskComments, type CommentView } from "./actions";
import { TaskEditor } from "./TaskEditor";
import type { Option } from "./TaskFields";
import s from "./projects.module.css";

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";
const day = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const when = (iso: string) => {
  const mins = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (mins < 24 * 60) return `${Math.round(mins / 60)} h ago`;
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

/**
 * What a task dialog opens on: the task's details and its comments. "Edit" switches to the form (TaskEditor); new
 * comments notify the assignee and whoever created the task.
 */
export function TaskView({ task: t, projects, users, today }: { task: Task; projects: Option[]; users: Option[]; today: string }) {
  const [editing, setEditing] = useState(false);
  const [comments, setComments] = useState<CommentView[] | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, startSending] = useTransition();

  useEffect(() => {
    let live = true;
    taskComments(t.id).then((r) => live && ("error" in r ? setError(r.error) : setComments(r.comments)));
    return () => { live = false; };
  }, [t.id]);

  const run = (job: () => Promise<{ comments: CommentView[] } | { error: string }>, after?: () => void) =>
    startSending(async () => {
      const r = await job();
      if ("error" in r) return setError(r.error);
      setError(null);
      setComments(r.comments);
      after?.();
    });
  const send = () => draft.trim() && !sending && run(() => commentOnTask(t.id, draft), () => setDraft(""));

  if (editing) {
    return (
      <>
        <button type="button" className={s.backlink} onClick={() => setEditing(false)}>← Back to the task</button>
        <TaskEditor task={t} projects={projects} users={users} today={today} />
      </>
    );
  }

  return (
    <div className={s.view}>
      <div className={s.viewhead}>
        <h3 className={s.viewtitle}>{t.title}</h3>
        <button type="button" className="btn btn--small" onClick={() => setEditing(true)}>Edit</button>
      </div>
      <p className={s.viewchips}>
        <span className={`${s.statuschip} ${s[`status_${t.status}`]}`}>{TASK_STATUS_LABEL[t.status]}</span>
        <span className={`${s.prio} ${s[`prio_${t.priority}`]}`}>{PRIORITY_LABEL[t.priority]}</span>
        {t.project_name && <span className={s.cardproject}>{t.project_name}</span>}
        {t.overdue && <span className={`${s.due} ${s.overdue}`}>⚠ Overdue</span>}
      </p>

      <dl className={s.facts}>
        <div><dt>Assigned to</dt><dd>{t.assignee_name ? <><span className={s.avatar}>{initials(t.assignee_name)}</span>{t.assignee_name}</> : <span className="muted">Nobody</span>}</dd></div>
        <div><dt>Created by</dt><dd>{t.creator_name ?? <span className="muted">Unknown</span>}</dd></div>
        <div><dt>Added</dt><dd>{day(t.added_on)}</dd></div>
        <div><dt>Due</dt><dd>{t.due_date ? day(t.due_date) : <span className="muted">No date</span>}</dd></div>
        {t.done_at && <div><dt>Done</dt><dd>{day(t.done_at)}</dd></div>}
      </dl>

      {t.notes ? <p className={s.notes}>{t.notes}</p> : <p className={`${s.notes} ${s.notesempty}`}>No description.</p>}
      {t.screenshot && (
        <a href={`/api/projects/tasks/${t.id}/screenshot?v=${t.screenshot_version}`} target="_blank" rel="noopener" className={s.viewshot}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/projects/tasks/${t.id}/screenshot?v=${t.screenshot_version}`} alt={`Screenshot for task #${t.id}`} />
        </a>
      )}

      <section className={s.thread} aria-label="Comments">
        <h4>Comments{comments && comments.length > 0 ? ` · ${comments.length}` : ""}</h4>
        {comments === null && !error && <p className="muted">Loading comments…</p>}
        {comments?.length === 0 && <p className="muted">No comments yet. Ask a question or share an update.</p>}
        {comments && comments.length > 0 && (
          <ul className={s.comments}>
            {comments.map((c) => (
              <li key={c.id}>
                <span className={s.avatar} aria-hidden="true">{initials(c.user_name ?? "?")}</span>
                <div>
                  <p className={s.commenthead}>
                    <strong>{c.user_name ?? "Former user"}</strong>
                    <time dateTime={c.created_at}>{when(c.created_at)}</time>
                    {c.canDelete && (
                      <button type="button" className={s.commentdelete} disabled={sending}
                        onClick={() => confirm("Delete this comment?") && run(() => removeTaskComment(c.id))}>Delete</button>
                    )}
                  </p>
                  <p className={s.commentbody}>{c.body}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className={s.composer}>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={2} maxLength={4000}
            placeholder="Write a comment… (⌘ / Ctrl + Enter to send)" aria-label="New comment"
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); } }} />
          <button type="button" className="btn btn--primary btn--small" disabled={sending || !draft.trim()} onClick={send}>
            {sending ? "Sending…" : "Comment"}
          </button>
        </div>
        {error && <p className="form__error" role="alert">{error}</p>}
        <p className={s.hint}>The person assigned and whoever created the task are notified.</p>
      </section>
    </div>
  );
}
