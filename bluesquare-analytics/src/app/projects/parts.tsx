import Link from "next/link";
import { Modal } from "@/components/Modal";
import { ActionForm } from "@/components/ActionForm";
import { PROJECT_STATUS_TONE, type ProjectStatus } from "@/lib/project-options";
import { listProjects, type Project } from "@/lib/projects";
import { listUsers } from "@/lib/users";
import { addProject, addTask } from "./actions";
import { TaskFields, type Option } from "./TaskFields";
import { ProjectFields } from "./ProjectFields";
import s from "./projects.module.css";

// Pieces shared by the Projects & Tasks pages.

export const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: process.env.REPORT_TIMEZONE || "Europe/Tirane" }).format(new Date());

export const longDate = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** Projects and active people, for the task form selects. */
export async function pickLists(): Promise<{ projects: Option[]; users: Option[] }> {
  const [projects, users] = await Promise.all([listProjects(), listUsers()]);
  return {
    projects: projects.filter((p) => p.status !== "Completed").map((p) => ({ id: p.id, name: p.name })),
    users: users.filter((u) => u.active).map((u) => ({ id: u.id, name: u.name })),
  };
}

export function NewTaskButton({ projects, users, projectId, small }: { projects: Option[]; users: Option[]; projectId?: string; small?: boolean }) {
  return (
    <Modal trigger="New task" title="New task" triggerClassName={`btn btn--primary${small ? " btn--small" : ""}`}>
      <ActionForm action={addTask} submit="Add task" className={`form ${s.dialogform}`}>
        <TaskFields task={{ project_id: projectId }} projects={projects} users={users} today={today()} />
      </ActionForm>
    </Modal>
  );
}

export function NewProjectButton() {
  return (
    <Modal trigger="New project" title="New project">
      <ActionForm action={addProject} submit="Create project" className={`form ${s.dialogform}`}>
        <ProjectFields />
      </ActionForm>
    </Modal>
  );
}

export function StatusPill({ status }: { status: ProjectStatus }) {
  return <span className={`${s.pill} ${s[`tone_${PROJECT_STATUS_TONE[status]}`]}`}>{status}</span>;
}

export function Progress({ project: p }: { project: Project }) {
  const pct = p.tasks_total ? Math.round((p.tasks_done / p.tasks_total) * 100) : 0;
  return (
    <div className={s.progress} title={`${p.tasks_done} of ${p.tasks_total} tasks done`}>
      <span className={s.progressbar}><i style={{ width: `${pct}%` }} /></span>
      <span>{p.tasks_total ? `${p.tasks_done}/${p.tasks_total} · ${pct}%` : "No tasks yet"}</span>
    </div>
  );
}

export function TechChips({ project: p }: { project: Project }) {
  const chips = [p.hosting, p.auth, p.deployment].filter(Boolean) as string[];
  if (!chips.length) return null;
  return <span className={s.chips}>{chips.map((c) => <span key={c} className={s.techchip}>{c}</span>)}</span>;
}

/** Board / List switch; `href(view)` builds the link keeping the page's other parameters. */
export function ViewToggle({ view, href }: { view: "board" | "list"; href: (v: "board" | "list") => string }) {
  return (
    <nav className={s.viewtoggle} aria-label="View">
      {(["board", "list"] as const).map((v) => (
        <Link key={v} href={href(v)} aria-current={view === v ? "page" : undefined} scroll={false}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d={v === "board" ? "M4 4h4v16H4zM10 4h4v10h-4zM16 4h4v6h-4z" : "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"} />
          </svg>
          {v === "board" ? "Board" : "List"}
        </Link>
      ))}
    </nav>
  );
}
