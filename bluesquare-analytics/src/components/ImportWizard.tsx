"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { analyzeImport, confirmImport, type AnalyzeState, type ImportState } from "@/app/sales/actions";
import { LEAD_FIELDS, type LeadField } from "@/lib/sales-fields";
import type { Mapping } from "@/lib/sales-import";

/** Paste or upload → check the (AI) column mapping → import. */
export function ImportWizard({ users, meId, aiOn }: { users: { id: string; name: string }[]; meId: string; aiOn: boolean }) {
  const [analysis, analyzeRun, analyzing] = useActionState<AnalyzeState, FormData>(analyzeImport, null);
  const [done, importRun, importing] = useActionState<ImportState, FormData>(confirmImport, null);
  const [mapping, setMapping] = useState<Mapping | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const a = analysis?.analysis;
  const current = mapping && a && Object.keys(mapping).join("|") === a.headers.join("|") ? mapping : a?.mapping;
  const used = Object.values(current ?? {}).filter(Boolean);

  const submit = (run: (fd: FormData) => void) => (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // keep inputs when the server answers with an error
    const fd = new FormData(e.currentTarget);
    startTransition(() => run(fd));
  };

  if (done?.result) {
    const r = done.result;
    return (
      <section className="panel importdone">
        <span className="importdone__icon" aria-hidden="true">✓</span>
        <h2>{r.created} lead{r.created === 1 ? "" : "s"} imported</h2>
        <p className="muted">
          {r.duplicates > 0 && `${r.duplicates} skipped: their phone number is already in Sales. `}
          {r.empty > 0 && `${r.empty} empty row${r.empty === 1 ? "" : "s"} skipped.`}
        </p>
        <div className="btnrow">
          <Link href="/sales" className="btn btn--primary">Open leads</Link>
          <a href="/sales/import" className="btn">Import more</a>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="panel">
        <header className="panel__head">
          <div>
            <h2>1 · Paste or upload</h2>
            <p className="muted panel__sub">
              Copy rows from Excel or Google Sheets (with the header row), or upload a CSV.
              {aiOn ? " Gemini maps the columns; it can also read a record copied as plain text." : " Columns are matched by name (set GEMINI_API_KEY to let AI map them)."}
            </p>
          </div>
          {aiOn && <span className="ai-badge">✦ AI mapping on</span>}
        </header>
        <form className="form" onSubmit={submit(analyzeRun)}>
          <textarea
            name="text"
            rows={a ? 4 : 10}
            className="importbox"
            placeholder={"Hotel\tPhone\tQyteti\tRooms\tTelefonuar?\tShenimet\nHotel Piemonte\t0676663538\tDhërmi\t13\tPo\tDo vijë të martën…"}
          />
          <div className="btnrow importrow">
            <label className="btn btn--small">
              {fileName ?? "Upload CSV"}
              <input type="file" name="file" accept=".csv,.tsv,.txt,text/csv,text/plain" className="sr-only" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)} />
            </label>
            <button className="btn btn--primary" disabled={analyzing}>{analyzing ? (aiOn ? "Gemini is reading…" : "Reading…") : a ? "Read again" : "Read data"}</button>
          </div>
          {analysis?.error && <p className="form__error" role="alert">{analysis.error}</p>}
        </form>
      </section>

      {a && current && (
        <section className="panel">
          <header className="panel__head">
            <div>
              <h2>2 · Check the columns</h2>
              <p className="muted panel__sub">
                {a.total} row{a.total === 1 ? "" : "s"} found.{" "}
                {a.mode === "extracted" ? "Gemini read these leads from your text." : a.ai === "used" ? "Gemini matched the columns; change any that are wrong." : a.ai === "failed" ? "Gemini wasn't available, so columns were matched by name." : "Columns were matched by name."}
                {" "}Columns set to “Keep as extra info” are saved on the lead as they are.
              </p>
            </div>
          </header>
          <div className="tablewrap">
            <table className="table mapping">
              <thead>
                <tr><th>Column</th><th>Imports as</th><th>Examples</th></tr>
              </thead>
              <tbody>
                {a.headers.map((h, i) => {
                  const dup = current[h] && used.filter((f) => f === current[h]).length > 1;
                  return (
                    <tr key={h}>
                      <td className="mapping__col">{h}</td>
                      <td>
                        <select
                          value={current[h]}
                          aria-invalid={dup || undefined}
                          onChange={(e) => setMapping({ ...current, [h]: e.target.value as LeadField | "" })}
                        >
                          <option value="">Keep as extra info</option>
                          {(Object.keys(LEAD_FIELDS) as LeadField[]).map((f) => (
                            <option key={f} value={f}>{LEAD_FIELDS[f]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="mapping__ex">{a.sample.map((r) => r[i]).filter(Boolean).slice(0, 3).join(" · ") || <span className="muted">empty</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <form className="form importfinal" onSubmit={submit(importRun)}>
            <input type="hidden" name="id" value={a.id} />
            <input type="hidden" name="mapping" value={JSON.stringify(current)} />
            <label className="field">
              <span>Owner of the new leads</span>
              <select name="owner_id" defaultValue={meId}>
                <option value="">Nobody</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </label>
            <button className="btn btn--primary" disabled={importing}>{importing ? "Importing…" : `Import ${a.total} lead${a.total === 1 ? "" : "s"}`}</button>
            <p className="muted note">Rows whose phone number is already in Sales are skipped, so importing the same sheet twice is safe.</p>
            {done?.error && <p className="form__error" role="alert">{done.error}</p>}
          </form>
        </section>
      )}
    </>
  );
}
