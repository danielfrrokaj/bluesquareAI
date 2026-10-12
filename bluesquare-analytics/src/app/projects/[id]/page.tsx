import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isAdmin, requireAuth } from "@/lib/auth";
import { getProject, listTasks } from "@/lib/projects";
import { money } from "@/lib/format";
import { Shell } from "@/components/Shell";
import { projectsNav } from "@/components/nav";
import { Modal } from "@/components/Modal";
import { ActionForm } from "@/components/ActionForm";
import { removeProject, saveProject } from "../actions";
import { Board } from "../Board";
import { ProjectFields } from "../ProjectFields";
import { longDate, NewTaskButton, pickLists, Progress, StatusPill, TechChips, today } from "../parts";
import s from "../projects.module.css";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: (await getProject((await params).id))?.name ?? "Project" };
}

export default async function ProjectPage({ params }: Props) {
  const user = await requireAuth();
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  const [tasks, { projects, users }] = await Promise.all([listTasks({ projectId: id }), pickLists()]);
  const now = today();
  const p = project;

  return (
    <Shell department="projects" subnav={projectsNav(null)}>
      <div className={s.page}>
        <div className="pagehead">
          <div>
            <p className="muted"><Link href="/projects/list">← Projects</Link></p>
            <h1>{p.name}</h1>
            <div className={s.projecttop}>
              <StatusPill status={p.status} />
              {p.type && <span className={s.ptype}>{p.type}</span>}
              <TechChips project={p} />
            </div>
          </div>
          <span className="btnrow">
            <Modal trigger="Edit project" title="Edit project" triggerClassName="btn">
              <ActionForm action={saveProject} submit="Save project" className={`form ${s.dialogform}`}>
                <ProjectFields project={p} />
              </ActionForm>
              {isAdmin(user) && (
                <div className="danger">
                  <ActionForm action={removeProject} submit="Delete project" pending="Deleting…" danger className="form form--row">
                    <input type="hidden" name="id" value={p.id} />
                    <label className="field"><span>Type DELETE to remove the project (its tasks are kept)</span><input name="confirm" autoComplete="off" /></label>
                  </ActionForm>
                </div>
              )}
            </Modal>
            <NewTaskButton projects={projects} users={users} projectId={p.id} />
          </span>
        </div>

        <section className={`panel ${s.overview}`}>
          <Progress project={p} />
          <dl className={s.pfacts}>
            <div><dt>Start</dt><dd>{p.start_date ? longDate(p.start_date) : "—"}</dd></div>
            <div><dt>Deadline</dt><dd className={p.deadline && p.deadline < now && p.status !== "Completed" ? s.late : undefined}>{p.deadline ? longDate(p.deadline) : "—"}</dd></div>
            <div><dt>Budget</dt><dd>{p.budget !== null ? money(p.budget) : "—"}</dd></div>
            <div><dt>Database</dt><dd>{p.database || "—"}</dd></div>
            <div><dt>Hosting</dt><dd>{p.hosting ?? "—"}</dd></div>
            <div><dt>Authentication</dt><dd>{p.auth ?? "—"}</dd></div>
            <div><dt>Deployment</dt><dd>{p.deployment ?? "—"}</dd></div>
            <div>
              <dt>GitHub</dt>
              <dd>{p.github_url ? <a href={p.github_url} target="_blank" rel="noopener noreferrer">{p.github_url.replace(/^https?:\/\/(www\.)?github\.com\//, "")} ↗</a> : "—"}</dd>
            </div>
          </dl>
          {p.notes && <p className={s.notes}>{p.notes}</p>}
        </section>

        <Board tasks={tasks} projects={projects} users={users} today={now} showProject={false} />
      </div>
    </Shell>
  );
}
