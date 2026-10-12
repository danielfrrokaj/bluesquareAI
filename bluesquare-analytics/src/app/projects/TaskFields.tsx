import { PRIORITIES, PRIORITY_LABEL, TASK_STATUSES, TASK_STATUS_LABEL, type Priority, type TaskStatus } from "@/lib/project-options";
import s from "./projects.module.css";

export type Option = { id: string; name: string };
export type TaskValues = {
  id?: number; title?: string; notes?: string; status?: TaskStatus; priority?: Priority;
  project_id?: string | null; assignee_id?: string | null; added_on?: string; due_date?: string | null;
};

/** Inputs for a task (inside an ActionForm). */
export function TaskFields({ task = {}, projects, users, today }: { task?: TaskValues; projects: Option[]; users: Option[]; today: string }) {
  return (
    <div className={s.formgrid}>
      {task.id && <input type="hidden" name="id" value={task.id} />}
      <label className={`field ${s.wide}`}>
        <span>Task</span>
        <input name="title" defaultValue={task.title} required maxLength={200} placeholder="e.g. Fix the booking calendar on mobile" autoFocus={!task.id} />
      </label>
      <label className={`field ${s.wide}`}>
        <span>Notes</span>
        <textarea name="notes" rows={3} defaultValue={task.notes} maxLength={5000} placeholder="Details, steps, links… (optional)" />
      </label>
      <fieldset className={`${s.segment} ${s.wide}`}>
        <legend>Priority</legend>
        {PRIORITIES.map((p) => (
          <label key={p}>
            <input type="radio" name="priority" value={p} defaultChecked={(task.priority ?? "medium") === p} />
            <span className={s[`prio_${p}`]}>{PRIORITY_LABEL[p]}</span>
          </label>
        ))}
      </fieldset>
      <label className="field">
        <span>Project</span>
        <select name="project_id" defaultValue={task.project_id ?? ""}>
          <option value="">No project</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Assigned to</span>
        <select name="assignee_id" defaultValue={task.assignee_id ?? ""}>
          <option value="">Nobody</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Status</span>
        <select name="status" defaultValue={task.status ?? "pending"}>
          {TASK_STATUSES.map((st) => <option key={st} value={st}>{TASK_STATUS_LABEL[st]}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Due date</span>
        <input type="date" name="due_date" defaultValue={task.due_date ?? ""} />
      </label>
      <label className="field">
        <span>Date added</span>
        <input type="date" name="added_on" defaultValue={task.added_on ?? today} />
      </label>
    </div>
  );
}
