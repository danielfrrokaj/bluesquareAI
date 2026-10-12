import { AUTH_PROVIDERS, DEPLOYMENTS, HOSTINGS, PROJECT_STATUSES, PROJECT_TYPES } from "@/lib/project-options";
import type { Project } from "@/lib/projects";
import s from "./projects.module.css";

function Select({ name, label, options, value, blank }: { name: string; label: string; options: readonly string[]; value?: string | null; blank?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select name={name} defaultValue={value ?? (blank ? "" : options[0])}>
        {blank && <option value="">{blank}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

/** Inputs for a project (inside an ActionForm). */
export function ProjectFields({ project }: { project?: Project }) {
  const p = project;
  return (
    <div className={s.formgrid}>
      {p && <input type="hidden" name="id" value={p.id} />}
      <label className={`field ${s.wide}`}>
        <span>Project name</span>
        <input name="name" defaultValue={p?.name} required maxLength={120} placeholder="LuxHotel PMS" autoFocus={!p} />
      </label>
      <Select name="type" label="Project type" options={PROJECT_TYPES} value={p?.type} blank="Choose…" />
      <Select name="status" label="Status" options={PROJECT_STATUSES} value={p?.status} />
      <label className="field"><span>Start date</span><input type="date" name="start_date" defaultValue={p?.start_date ?? ""} /></label>
      <label className="field"><span>Deadline</span><input type="date" name="deadline" defaultValue={p?.deadline ?? ""} /></label>
      <label className="field"><span>Budget (EUR)</span><input name="budget" inputMode="decimal" defaultValue={p?.budget ?? ""} placeholder="Optional" /></label>
      <label className="field"><span>Database</span><input name="database" defaultValue={p?.database} maxLength={200} placeholder="e.g. Cloud SQL Postgres" /></label>
      <label className={`field ${s.wide}`}><span>GitHub URL</span><input name="github_url" type="url" defaultValue={p?.github_url} maxLength={300} placeholder="https://github.com/…" /></label>
      <Select name="hosting" label="Hosting platform" options={HOSTINGS} value={p?.hosting} blank="—" />
      <Select name="auth" label="Authentication" options={AUTH_PROVIDERS} value={p?.auth} blank="—" />
      <Select name="deployment" label="Deployment type" options={DEPLOYMENTS} value={p?.deployment} blank="—" />
      <label className={`field ${s.wide}`}>
        <span>Notes</span>
        <textarea name="notes" rows={5} defaultValue={p?.notes} maxLength={10_000} placeholder="Scope, credentials location, client contacts…" />
      </label>
    </div>
  );
}
