"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useModalClose } from "@/components/Modal";
import { uploadInChunks } from "@/lib/chunked-upload";
import s from "./archive.module.css";

type Item = { file: File; pct: number; error?: string; done?: boolean };
const MAX = 2 * 1024 ** 3;
const mb = (n: number) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);

/** Upload several files at once into a folder, one after another, with progress per file. */
export function FileUploader({ folders, folder: initialFolder }: { folders: string[]; folder: string }) {
  const router = useRouter();
  const close = useModalClose();
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [folder, setFolder] = useState(initialFolder);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  const add = (files: FileList | null) =>
    files && setItems((cur) => [...cur, ...[...files].map((file) => ({ file, pct: 0, error: file.size > MAX ? "Over 2 GB" : file.size === 0 ? "Empty file" : undefined }))]);

  async function start() {
    setBusy(true);
    let failed = 0;
    for (let i = 0; i < items.length; i++) {
      if (items[i].done || items[i].error) continue;
      const set = (patch: Partial<Item>) => setItems((cur) => cur.map((it, j) => (j === i ? { ...it, ...patch } : it)));
      try {
        await uploadInChunks(items[i].file, { url: "/api/archive/uploads", body: { folder, note } }, (id) => `/api/archive/uploads/${id}/complete`, (pct) => set({ pct }));
        set({ done: true, pct: 100 });
      } catch (err) {
        failed++;
        set({ error: err instanceof Error ? err.message : "Upload failed." });
      }
    }
    setBusy(false);
    router.refresh();
    if (!failed) close?.(`Uploaded ${items.filter((i) => !i.error).length} file(s).`);
  }

  const ready = items.filter((i) => !i.error && !i.done).length;
  return (
    <div className="form">
      <div
        className={`${s.drop}${dragging ? ` ${s.dragging}` : ""}`}
        role="button" tabIndex={0}
        onClick={() => !busy && input.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); add(e.dataTransfer.files); }}
      >
        <strong>Drop files here</strong>
        <span>or click to choose · any type · up to 2 GB each</span>
      </div>
      <input ref={input} type="file" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = ""; }} />

      {items.length > 0 && (
        <ul className={s.queue}>
          {items.map((it, i) => (
            <li key={i} className={it.error ? s.qerror : it.done ? s.qdone : undefined}>
              <span className={s.qname}>{it.file.name}</span>
              <span className={s.qsize}>{it.error ?? (it.done ? "Uploaded" : busy && it.pct ? `${it.pct}%` : mb(it.file.size))}</span>
              <span className={s.qbar}><i style={{ width: `${it.pct}%` }} /></span>
              {!busy && !it.done && (
                <button type="button" className={s.qremove} aria-label={`Remove ${it.file.name}`} onClick={() => setItems((cur) => cur.filter((_, j) => j !== i))}>×</button>
              )}
            </li>
          ))}
        </ul>
      )}

      <label className="field">
        <span>Folder</span>
        <input value={folder} onChange={(e) => setFolder(e.target.value)} list="archive-folders" placeholder="e.g. Contracts/2026 (optional)" disabled={busy} />
        <datalist id="archive-folders">{folders.map((f) => <option key={f} value={f} />)}</datalist>
      </label>
      <label className="field">
        <span>Note</span>
        <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} placeholder="Optional, applies to all files" disabled={busy} />
      </label>
      <button type="button" className="btn btn--primary" disabled={busy || ready === 0} onClick={start}>
        {busy ? "Uploading…" : ready > 1 ? `Upload ${ready} files` : "Upload"}
      </button>
    </div>
  );
}
