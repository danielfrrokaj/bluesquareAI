"use client";

import { useEffect, useRef, useState } from "react";

const TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX = 300 * 1024;
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");

/**
 * Logo picker: upload, paste an image (Cmd/Ctrl+V while the form is open, or the Paste button) or
 * drop one on it. Shows a live preview; with a current logo, it can also be removed.
 */
export function LogoField({ current, name = "", label = "Logo", field = "logo", round }: {
  current?: string | null; name?: string; label?: string; field?: string; round?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  /** Puts an image into the file input, as if it had been chosen there. */
  function use(file: File | undefined | null) {
    if (!file) return;
    if (!TYPES.includes(file.type)) return setProblem("That isn't a PNG, JPG, WebP or SVG image.");
    if (file.size > MAX) return setProblem("That image is over 300 KB.");
    const named = file.name && file.name !== "image.png" ? file : new File([file], `pasted.${file.type.split("/")[1].replace("svg+xml", "svg")}`, { type: file.type });
    const dt = new DataTransfer();
    dt.items.add(named);
    if (input.current) input.current.files = dt.files;
    setProblem(null);
    setRemove(false);
    setPreview(URL.createObjectURL(named));
  }

  // Paste anywhere while this form is showing (in an open dialog, or on the page when not in one).
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const el = input.current;
      const dialog = el?.closest("dialog");
      if (!el || (dialog && !dialog.open)) return;
      const file = [...(e.clipboardData?.files ?? [])].find((f) => f.type.startsWith("image/"));
      if (!file) return; // plain text: let the focused field have it
      e.preventDefault();
      use(file);
    }
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function pasteButton() {
    try {
      for (const item of await navigator.clipboard.read()) {
        const type = item.types.find((t) => TYPES.includes(t));
        if (type) return use(new File([await item.getType(type)], "pasted", { type }));
      }
      setProblem("There's no image on the clipboard. Copy a logo first, or press Cmd/Ctrl+V.");
    } catch {
      setProblem("The browser didn't allow reading the clipboard. Press Cmd/Ctrl+V instead.");
    }
  }

  const shown = preview ?? (remove ? null : (current ?? null));
  return (
    <div
      className={`logofield${dragging ? " is-dragging" : ""}${round ? " logofield--round" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        use(e.dataTransfer.files[0]);
      }}
    >
      <span className="logofield__preview">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {shown ? <img src={shown} alt="" /> : <span>{initials(name) || label}</span>}
      </span>
      <div className="logofield__controls">
        <span className="logofield__label">{label}</span>
        <label className="btn btn--small">
          {shown ? "Upload new" : "Upload"}
          <input
            ref={input}
            type="file"
            name={field}
            accept={TYPES.join(",")}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return setPreview(null);
              if (file.size > MAX) {
                e.target.value = "";
                return setProblem("That image is over 300 KB.");
              }
              setProblem(null);
              setRemove(false);
              setPreview(URL.createObjectURL(file));
            }}
          />
        </label>
        <button type="button" className="btn btn--small" onClick={pasteButton}>
          Paste
        </button>
        {current && !preview && (
          <label className="check check--small">
            <input type="checkbox" name={`remove_${field}`} checked={remove} onChange={(e) => setRemove(e.target.checked)} /> Remove
          </label>
        )}
        <small className={problem ? "logofield__problem" : "muted"} role={problem ? "alert" : undefined}>
          {problem ?? "Upload, paste (Cmd/Ctrl+V) or drop an image. PNG, JPG, WebP or SVG, up to 300 KB."}
        </small>
      </div>
    </div>
  );
}
