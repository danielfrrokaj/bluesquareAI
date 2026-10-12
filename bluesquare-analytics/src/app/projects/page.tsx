import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { listTasks, PRIORITIES, PRIORITY_LABEL, type Priority } from "@/lib/projects";
import { Shell } from "@/components/Shell";
import { projectsNav } from "@/components/nav";
import { Board } from "./Board";
import { NewTaskButton, pickLists, today } from "./parts";
import s from "./projects.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tasks board" };

type SP = { project?: string; who?: string; priority?: string };

export default async function TasksBoard({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireAuth();
  const sp = await searchParams;
  const assigneeId = sp.who === "me" ? user.id : sp.who || undefined;
  const priority = (PRIORITIES as readonly string[]).includes(sp.priority ?? "") ? (sp.priority as Priority) : undefined;
  const [tasks, { projects, users }] = await Promise.all([listTasks({ projectId: sp.project || undefined, assigneeId, priority }), pickLists()]);

  const open = tasks.filter((t) => t.status !== "done");
  const stats = [
    { label: "To do", value: tasks.filter((t) => t.status === "pending").length, tone: s.stat_pending },
    { label: "In progress", value: tasks.filter((t) => t.status === "in_progress").length, tone: s.stat_progress },
    { label: "Overdue", value: open.filter((t) => t.overdue).length, tone: s.stat_overdue },
    { label: "High priority open", value: open.filter((t) => t.priority === "high").length, tone: s.stat_high },
  ];
  const filtered = !!(sp.project || sp.who || priority);
  const link = (patch: Partial<SP>) => {
    const p = new URLSearchParams(Object.entries({ ...sp, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/projects${p.size ? `?${p}` : ""}`;
  };

  return (
    <Shell department="projects" subnav={projectsNav("board")}>
      <div className={s.page}>
        <div className="pagehead">
          <div>
            <h1>Tasks board</h1>
            <p className="muted">Drag cards between columns to change their status. Click a card to edit it.</p>
          </div>
          <NewTaskButton projects={projects} users={users} />
        </div>

        <ul className={s.stats}>
          {stats.map((x) => <li key={x.label} className={x.tone}><strong>{x.value}</strong><span>{x.label}</span></li>)}
        </ul>

        <form className={s.filters} action="/projects">
          <Link href={link({ who: sp.who === "me" ? undefined : "me" })} className={`${s.filterchip}${sp.who === "me" ? ` ${s.on}` : ""}`}>
            My tasks
          </Link>
          <select name="project" defaultValue={sp.project ?? ""} aria-label="Project">
            <option value="">All projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select name="who" defaultValue={sp.who ?? ""} aria-label="Assigned to">
            <option value="">Everyone</option>
            <option value="me">Me</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select name="priority" defaultValue={priority ?? ""} aria-label="Priority">
            <option value="">Any priority</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
          </select>
          <button className="btn btn--small">Filter</button>
          {filtered && <Link href="/projects" className={s.clear}>Clear</Link>}
        </form>

        <Board tasks={tasks} projects={projects} users={users} today={today()} />
      </div>
    </Shell>
  );
}
