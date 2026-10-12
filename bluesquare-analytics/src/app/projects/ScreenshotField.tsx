"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import s from "./projects.module.css";

/** A task's screenshot: choose a file, drop it, or paste it (⌘V) while the dialog is open. */
export function ScreenshotField({ taskId, has, version }: { taskId: number; has: boolean; version: number }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shown, setShown] = useState({ has, version });
  const url = `/api/projects/tasks/${taskId}/screenshot?v=${shown.version}`;

  async function upload(file: File | undefined | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Choose an image.");
    setBusy(true);
    setError(null);
    const body = new FormData();
    body.set("file", file);
    const res = await fetch(`/api/projects/tasks/${taskId}/screenshot`, { method: "POST", body });
    setBusy(false);
    if (!res.ok) return setError((await res.json().catch(() => ({}))).error ?? "Upload failed.");
    setShown((v) => ({ has: true, version: v.version + 1 }));
    router.refresh();
  }

  async function remove() {
    setBusy(true);
    await fetch(`/api/projects/tasks/${taskId}/screenshot`, { method: "DELETE" });
    setBusy(false);
    setShown((v) => ({ has: false, version: v.version + 1 }));
    router.refresh();
  }

  // Paste a screenshot straight from the clipboard, while this task's dialog is open.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (!root.current?.closest("dialog")?.open) return;
      const file = [...(e.clipboardData?.files ?? [])].find((f) => f.type.startsWith("image/"));
      if (file) {
        e.preventDefault();
        upload(file);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  });

  return (
    <div ref={root} className={s.shot} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files[0]); }}>
      <span className={s.shotlabel}>Screenshot</span>
      {shown.has ? (
        <a href={url} target="_blank" rel="noopener" className={s.shotimg}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Task screenshot" />
        </a>
      ) : (
        <button type="button" className={s.shotempty} onClick={() => input.current?.click()} disabled={busy}>
          {busy ? "Uploading…" : <>Paste with <kbd>⌘V</kbd>, drop an image, or <u>choose a file</u></>}
        </button>
      )}
      {shown.has && (
        <span className={s.shotactions}>
          <button type="button" className="btn btn--small" onClick={() => input.current?.click()} disabled={busy}>{busy ? "Uploading…" : "Replace"}</button>
          <button type="button" className="btn btn--small" onClick={remove} disabled={busy}>Remove</button>
        </span>
      )}
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
      {error && <p className="form__error" role="alert">{error}</p>}
    </div>
  );
}
