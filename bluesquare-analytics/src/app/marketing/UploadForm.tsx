"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useModalClose } from "@/components/Modal";
import { PlatformPicker } from "./PlatformPicker";
import s from "./marketing.module.css";

const MAX = 2 * 1024 ** 3;

/** Upload an image or video with its plan (title, caption, publish time, networks), in chunks with progress. */
export function UploadForm({ defaultPublish }: { defaultPublish: string }) {
  const router = useRouter();
  const close = useModalClose();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function pick(f: File | undefined | null) {
    setError(null);
    if (!f) return;
    if (!/^(image|video)\//.test(f.type)) return setError("Choose an image or a video.");
    if (f.size > MAX) return setError("Files can be up to 2 GB.");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return setError("Choose a file to upload.");
    const form = new FormData(e.currentTarget);
    setError(null);
    setProgress(0);
    try {
      const start = await fetch("/api/marketing/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name, mime: file.type, size: file.size,
          title: form.get("title"), caption: form.get("caption"), publish: form.get("publish"), platforms: form.getAll("platforms"),
        }),
      });
      const init = await start.json();
      if (!start.ok) throw new Error(init.error ?? "Couldn't start the upload.");

      // Same protocol for both stores: PUT each chunk with its Content-Range. Cloud Storage answers
      // 308 until the last chunk; the local store answers 204.
      for (let from = 0; from < file.size; from += init.chunk) {
        const to = Math.min(from + init.chunk, file.size);
        let res: Response | null = null;
        for (let attempt = 0; attempt < 3 && !(res && (res.ok || res.status === 308)); attempt++) {
          res = await fetch(init.uploadUrl, {
            method: "PUT",
            headers: { "Content-Range": `bytes ${from}-${to - 1}/${file.size}` },
            body: file.slice(from, to),
          }).catch(() => null);
        }
        if (!res || !(res.ok || res.status === 308)) throw new Error("The upload was interrupted. Check your connection and try again.");
        setProgress(Math.round((to / file.size) * 100));
      }

      const done = await fetch(`/api/marketing/uploads/${init.id}/complete`, { method: "POST" });
      if (!done.ok) throw new Error((await done.json().catch(() => ({}))).error ?? "Couldn't finish the upload.");
      router.refresh();
      close?.(`Uploaded ${file.name}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setProgress(null);
    }
  }

  const busy = progress !== null;
  return (
    <form className={`form ${s.modalform}`} onSubmit={submit}>
      <div
        className={`${s.drop}${dragging ? ` ${s.dragging}` : ""}`}
        role="button"
        tabIndex={0}
        onClick={() => !busy && input.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files[0]); }}
      >
        {preview && file ? (
          file.type.startsWith("video/") ? <video src={preview} muted playsInline controls /> : /* eslint-disable-next-line @next/next/no-img-element */ <img src={preview} alt="" />
        ) : (
          <>
            <strong>Drop an image or video here</strong>
            <span>or click to choose · any format · up to 2 GB</span>
          </>
        )}
        {file && <small>{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</small>}
      </div>
      <input ref={input} type="file" accept="image/*,video/*" hidden onChange={(e) => pick(e.target.files?.[0])} />

      <label className="field"><span>Title</span><input name="title" maxLength={120} placeholder="Autumn offer reel" disabled={busy} /></label>
      <label className="field"><span>Caption</span><textarea name="caption" rows={3} maxLength={2200} placeholder="Optional" disabled={busy} /></label>
      <label className="field">
        <span>Publish on</span>
        <input type="datetime-local" name="publish" defaultValue={defaultPublish} disabled={busy} />
      </label>
      <PlatformPicker disabled={busy} />

      {busy && (
        <div className={s.progress} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
          <i style={{ width: `${progress}%` }} />
        </div>
      )}
      {error && <p className="form__error" role="alert">{error}</p>}
      <button className="btn btn--primary" disabled={busy}>{busy ? `Uploading… ${progress}%` : "Upload"}</button>
    </form>
  );
}
