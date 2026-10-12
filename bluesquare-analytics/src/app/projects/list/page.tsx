import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { listProjects } from "@/lib/projects";
import { money } from "@/lib/format";
import { Shell } from "@/components/Shell";
import { projectsNav } from "@/components/nav";
import { longDate, NewProjectButton, Progress, ProjectMark, StatusPill, TechChips, today } from "../parts";
import s from "../projects.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Projects" };

export default async function ProjectsList() {
  await requireAuth();
  const projects = await listProjects();
  const now = today();
  const active = projects.filter((p) => p.status !== "Completed");
  const done = projects.filter((p) => p.status === "Completed");

  const grid = (list: typeof projects) => (
    <ul className={s.projects}>
      {list.map((p) => (
        <li key={p.id} className={s.project}>
          <div className={s.projecttop}>
            <StatusPill status={p.status} />
            {p.type && <span className={s.ptype}>{p.type}</span>}
          </div>
          <div className={s.ptitle}>
            <ProjectMark project={p} size={40} />
            <h2><Link href={`/projects/${p.id}`} className="stretched">{p.name}</Link></h2>
          </div>
          <Progress project={p} />
          <dl className={s.pfacts}>
            <div>
              <dt>Deadline</dt>
              <dd className={p.deadline && p.deadline < now && p.status !== "Completed" ? s.late : undefined}>{p.deadline ? longDate(p.deadline) : "—"}</dd>
            </div>
            <div><dt>Open tasks</dt><dd>{p.tasks_open}{p.tasks_overdue > 0 && <small className={s.late}> · {p.tasks_overdue} overdue</small>}</dd></div>
            {p.budget !== null && <div><dt>Budget</dt><dd>{money(p.budget)}</dd></div>}
          </dl>
          <TechChips project={p} />
        </li>
      ))}
    </ul>
  );

  return (
    <Shell department="projects" subnav={projectsNav("projects")}>
      <div className={s.page}>
        <div className="pagehead">
          <div>
            <h1>Projects</h1>
            <p className="muted">{active.length} active · {done.length} completed</p>
          </div>
          <NewProjectButton />
        </div>
        {projects.length === 0 ? <p className="empty empty--big">No projects yet. Create the first one with “New project”.</p> : grid(active)}
        {done.length > 0 && (
          <details className={s.completed}>
            <summary>Completed ({done.length})</summary>
            {grid(done)}
          </details>
        )}
      </div>
    </Shell>
  );
}
