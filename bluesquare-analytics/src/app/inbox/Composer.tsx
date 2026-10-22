"use client";

import { useEffect, useRef, useState } from "react";
import type { CannedResponse, Channel, Conversation, Message } from "@/lib/chatwoot";
import { typing } from "./actions";
import { fileSize, Icon } from "./parts";
import { record, type Recorder } from "./voice";
import s from "./inbox.module.css";

const draftKey = (id: number) => `inbox-draft:${id}`;
const readDraft = (id: number) => { try { return localStorage.getItem(draftKey(id)) ?? ""; } catch { return ""; } };
const saveDraft = (id: number, text: string) => { try { if (text) localStorage.setItem(draftKey(id), text); else localStorage.removeItem(draftKey(id)); } catch { /* private mode */ } };
const mmss = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

/** The reply box: text, saved replies ("/"), files (pick, paste or drop), voice messages, and private notes for the team. */
export function Composer({ conversation, channel, canned, onSent }: {
  conversation: Conversation; channel: Channel; canned: CannedResponse[]; onSent: (m: Message) => void;
}) {
  const id = conversation.id;
  const [mode, setMode] = useState<"reply" | "note">("reply");
  const [text, setText] = useState(() => readDraft(id));
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recorder, setRecorder] = useState<Recorder | null>(null);
  const [recTime, setRecTime] = useState(0);
  const [levels, setLevels] = useState<number[]>([]);
  const [dragging, setDragging] = useState(false);
  const [pick, setPick] = useState(0); // highlighted saved reply
  const input = useRef<HTMLTextAreaElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const typingOff = useRef<number | null>(null);
  const note = mode === "note";
  const closed = !conversation.canReply && !note;

  useEffect(() => saveDraft(id, text), [id, text]);
  useEffect(() => {
    const el = input.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [text]);
  // Live timer and level meter while recording.
  useEffect(() => {
    if (!recorder) return;
    const timer = window.setInterval(() => {
      setRecTime(recorder.seconds());
      setLevels((l) => [...l.slice(-31), recorder.level()]);
    }, 90);
    return () => window.clearInterval(timer);
  }, [recorder]);
  useEffect(() => () => recorder?.cancel(), [recorder]);

  // The customer sees "typing…" while a reply (not a note) is being written.
  const signalTyping = () => {
    if (note || !conversation.canReply) return;
    if (typingOff.current === null) void typing(id, true);
    else window.clearTimeout(typingOff.current);
    typingOff.current = window.setTimeout(() => { typingOff.current = null; void typing(id, false); }, 2500);
  };
  const stopTyping = () => {
    if (typingOff.current === null) return;
    window.clearTimeout(typingOff.current);
    typingOff.current = null;
    void typing(id, false);
  };

  const slash = text.startsWith("/") && !text.includes(" ") && !text.includes("\n");
  const matches = slash ? canned.filter((c) => c.shortCode.toLowerCase().includes(text.slice(1).toLowerCase())).slice(0, 6) : [];
  const applyCanned = (c: CannedResponse) => { setText(c.content); setPick(0); input.current?.focus(); };

  const add = (list: FileList | File[]) => {
    const next = [...files, ...Array.from(list)].slice(0, 10);
    setFiles(next);
    setError(null);
  };

  const send = async (extra: File[] = []) => {
    const all = [...files, ...extra];
    const content = text.trim();
    if ((!content && !all.length) || sending || closed) return;
    setSending(true);
    setError(null);
    stopTyping();
    const form = new FormData();
    form.set("content", content);
    if (note) form.set("private", "1");
    for (const f of all) form.append("files", f, f.name);
    try {
      const res = await fetch(`/api/inbox/conversations/${id}/messages`, { method: "POST", body: form });
      const data = await res.json().catch(() => ({ error: "The message couldn't be sent." }));
      if (!res.ok) throw new Error(data.error);
      onSent(data.message);
      setText("");
      setFiles([]);
      input.current?.focus();
    } catch (e) {
      setError(e instanceof Error ? e.message : "The message couldn't be sent.");
    } finally {
      setSending(false);
    }
  };

  const startRecording = async () => {
    setError(null);
    try {
      setLevels([]);
      setRecTime(0);
      setRecorder(await record(channel));
    } catch {
      setError("Allow the microphone in your browser to record voice messages.");
    }
  };
  const finishRecording = async () => {
    if (!recorder) return;
    const r = recorder;
    setRecorder(null);
    setSending(true);
    try {
      const file = await r.stop();
      setSending(false);
      await send([file]);
    } catch {
      setSending(false);
      setError("The recording couldn't be prepared. Try again.");
    }
  };

  return (
    <div
      className={`${s.composer}${note ? ` ${s.composerNote}` : ""}${dragging ? ` ${s.dropping}` : ""}`}
      onDragOver={(e) => { if (e.dataTransfer.types.includes("Files")) { e.preventDefault(); setDragging(true); } }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) add(e.dataTransfer.files); }}
    >
      <div className={s.modes} role="tablist" aria-label="Message type">
        <button type="button" role="tab" aria-selected={!note} onClick={() => setMode("reply")}>Reply</button>
        <button type="button" role="tab" aria-selected={note} onClick={() => setMode("note")}><Icon name="note" size={14} /> Private note</button>
      </div>

      {closed && (
        <p className={s.windowClosed}>
          The 24-hour reply window has closed: {channel === "whatsapp" ? "WhatsApp" : "this channel"} only allows a template message until the customer writes again.
          Send one from Chatwoot, or add a private note here.
        </p>
      )}

      {matches.length > 0 && (
        <ul className={s.canned} role="listbox" aria-label="Saved replies">
          {matches.map((c, i) => (
            <li key={c.id}>
              <button type="button" role="option" aria-selected={i === pick} onMouseDown={(e) => { e.preventDefault(); applyCanned(c); }}>
                <b>/{c.shortCode}</b><span>{c.content}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <ul className={s.pending}>
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`}>
              {f.type.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={URL.createObjectURL(f)} alt="" onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)} />
              ) : (
                <span className={s.pendingIcon}><Icon name={f.type.startsWith("audio/") ? "mic" : "file"} size={18} /></span>
              )}
              <span className={s.pendingName}><strong>{f.name}</strong><small>{fileSize(f.size)}</small></span>
              <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`}><Icon name="close" size={14} /></button>
            </li>
          ))}
        </ul>
      )}

      {recorder ? (
        <div className={s.recording}>
          <button type="button" className={s.iconButton} onClick={() => { recorder.cancel(); setRecorder(null); }} aria-label="Discard recording"><Icon name="trash" /></button>
          <span className={s.recDot} aria-hidden="true" />
          <span className={s.recTime}>{mmss(recTime)}</span>
          <span className={s.recLevels} aria-hidden="true">
            {Array.from({ length: 32 }, (_, i) => <i key={i} style={{ height: `${12 + (levels[levels.length - 32 + i] ?? 0) * 88}%` }} />)}
          </span>
          <button type="button" className={s.sendButton} onClick={finishRecording} aria-label="Send voice message"><Icon name="send" /></button>
        </div>
      ) : (
        <div className={s.inputRow}>
          <button type="button" className={s.iconButton} onClick={() => picker.current?.click()} aria-label="Attach files" title="Attach pictures, videos or documents" disabled={closed}>
            <Icon name="attach" />
          </button>
          <input ref={picker} type="file" multiple hidden onChange={(e) => { if (e.target.files) add(e.target.files); e.target.value = ""; }} />
          <textarea
            ref={input} rows={1} value={text} disabled={closed}
            placeholder={note ? "A note only your team sees…" : canned.length ? "Write a reply… ( / for saved replies)" : "Write a reply…"}
            onChange={(e) => { setText(e.target.value); setPick(0); signalTyping(); }}
            onPaste={(e) => { const pasted = [...e.clipboardData.files]; if (pasted.length) { e.preventDefault(); add(pasted); } }}
            onKeyDown={(e) => {
              if (matches.length && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
                e.preventDefault();
                setPick((p) => (p + (e.key === "ArrowDown" ? 1 : matches.length - 1)) % matches.length);
              } else if (matches.length && (e.key === "Enter" || e.key === "Tab")) {
                e.preventDefault();
                applyCanned(matches[pick] ?? matches[0]);
              } else if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void send();
              }
            }}
          />
          {canned.length > 0 && !text && (
            <button type="button" className={s.iconButton} onClick={() => { setText("/"); input.current?.focus(); }} aria-label="Saved replies" title="Saved replies"><Icon name="bolt" /></button>
          )}
          {text.trim() || files.length ? (
            <button type="button" className={s.sendButton} onClick={() => void send()} disabled={sending || closed} aria-label={note ? "Add note" : "Send"}>
              {sending ? <span className={s.spinner} /> : <Icon name={note ? "check" : "send"} />}
            </button>
          ) : (
            <button type="button" className={s.sendButton} onClick={startRecording} disabled={sending || closed || note} aria-label="Record a voice message" title="Record a voice message">
              {sending ? <span className={s.spinner} /> : <Icon name="mic" />}
            </button>
          )}
        </div>
      )}
      {error && <p className={s.composerError} role="alert">{error}</p>}
      {dragging && <div className={s.dropHint}>Drop to attach</div>}
    </div>
  );
}
