"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/content";
import type { Locale } from "@/lib/i18n";
import s from "./ChatWidget.module.css";

type Strings = Dictionary["chat"];
type Msg = { id: number; role: "visitor" | "assistant" | "agent"; text: string; at: number; agentName: string | null };
type Session = { contact: string; conversation: number; human?: boolean };

const STORE = "bsa-chat-v1";
const readSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(STORE);
    const v = raw ? (JSON.parse(raw) as Session) : null;
    return v?.contact && v?.conversation ? v : null;
  } catch {
    return null;
  }
};
const writeSession = (v: Session | null) => {
  try {
    if (v) localStorage.setItem(STORE, JSON.stringify(v));
    else localStorage.removeItem(STORE);
  } catch {
    /* private mode */
  }
};

const timeFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

/** The site's chat: a small AI assistant bottom-right that the team can take over from the CRM. */
export function ChatWidget({ lang, t }: { lang: Locale; t: Strings }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [human, setHuman] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const lastId = useRef(0);

  useEffect(() => {
    setMounted(true);
    const kept = readSession();
    if (kept) {
      setSession(kept);
      setHuman(!!kept.human);
    }
  }, []);

  const merge = useCallback((incoming: Msg[]) => {
    if (!incoming.length) return;
    setMessages((prev) => {
      const all = new Map(prev.map((m) => [m.id, m]));
      for (const m of incoming) all.set(m.id, m);
      const next = [...all.values()].sort((a, b) => a.at - b.at || a.id - b.id);
      lastId.current = Math.max(lastId.current, ...next.map((m) => m.id));
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    writeSession(null);
    setSession(null);
    setMessages([]);
    setHuman(false);
    setNotice(null);
    lastId.current = 0;
  }, []);

  /** New messages from the team (or another tab); every few seconds while open, slower while closed. */
  const poll = useCallback(async () => {
    const sess = session;
    if (!sess) return;
    try {
      const res = await fetch(`/api/chat/messages?contact=${encodeURIComponent(sess.contact)}&conversation=${sess.conversation}&after=${lastId.current}`, { cache: "no-store" });
      if (res.status === 404) return reset();
      if (res.status === 503) return setOffline(true);
      if (!res.ok) return;
      const { messages: fresh } = (await res.json()) as { messages: Msg[] };
      if (fresh.some((m) => m.role === "agent")) setHuman(true);
      if (!open && fresh.some((m) => m.role !== "visitor")) setUnread((n) => n + fresh.filter((m) => m.role !== "visitor").length);
      merge(fresh);
    } catch {
      /* next tick */
    }
  }, [session, open, merge, reset]);

  useEffect(() => {
    if (!session) return;
    const every = open ? 4000 : 30_000;
    const timer = window.setInterval(() => document.visibilityState === "visible" && void poll(), every);
    void poll();
    return () => window.clearInterval(timer);
  }, [session, open, poll]);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy, open]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      input.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [open]);

  const send = async (raw?: string) => {
    const value = (raw ?? text).trim();
    if (!value || busy) return;
    setBusy(true);
    setNotice(null);
    setText("");
    const local: Msg = { id: -Date.now(), role: "visitor", text: value, at: Math.floor(Date.now() / 1000), agentName: null };
    setMessages((prev) => [...prev, local]);
    try {
      let sess = session;
      if (!sess) {
        const made = await fetch("/api/chat/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lang }) });
        if (made.status === 503) {
          setOffline(true);
          return;
        }
        if (!made.ok) throw new Error();
        sess = (await made.json()) as Session;
        setSession(sess);
        writeSession(sess);
      }
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sess, text: value, lang }),
      });
      if (res.status === 404) {
        reset();
        throw new Error();
      }
      if (!res.ok) throw new Error((await res.json().catch(() => ({})) as { error?: string }).error);
      const data = (await res.json()) as { messages: Msg[]; human?: boolean; note?: string };
      setMessages((prev) => prev.filter((m) => m.id !== local.id));
      merge(data.messages);
      if (data.human) {
        setHuman(true);
        writeSession({ ...sess, human: true });
      }
      if (data.note === "ai-unavailable") setNotice(t.aiFailed);
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== local.id));
      setText(value);
      setNotice(e instanceof Error && e.message ? e.message : t.retry);
    } finally {
      setBusy(false);
      input.current?.focus();
    }
  };

  if (!mounted) return null;
  const started = messages.some((m) => m.role === "visitor");

  return (
    <div className={s.root} data-open={open || undefined}>
      {open && (
        <section className={s.panel} role="dialog" aria-label={t.title}>
          <header className={s.head}>
            <span className={s.mark} aria-hidden="true">
              <Spark />
            </span>
            <div className={s.who}>
              <strong>{t.title}</strong>
              <span>
                <i className={s.dot} aria-hidden="true" /> {human ? t.humanNote : t.subtitle}
              </span>
            </div>
            {messages.length > 0 && (
              <button type="button" className={s.headBtn} onClick={reset} title={t.restart} aria-label={t.restart}>
                <Restart />
              </button>
            )}
            <button type="button" className={s.headBtn} onClick={() => setOpen(false)} aria-label={t.close}>
              <Chevron />
            </button>
          </header>

          <div className={s.scroll} ref={scroller}>
            <div className={s.day}>{offline ? t.offline : t.greeting}</div>
            {messages.map((m) => (
              <div key={m.id} className={`${s.row} ${m.role === "visitor" ? s.mine : s.theirs}`}>
                {m.role !== "visitor" && (
                  <span className={`${s.avatar}${m.role === "agent" ? ` ${s.avatarHuman}` : ""}`} aria-hidden="true">
                    {m.role === "agent" ? initials(m.agentName) : <Spark />}
                  </span>
                )}
                <div className={s.bubble}>
                  {m.role === "agent" && m.agentName && <small className={s.sender}>{m.agentName}</small>}
                  <p>{m.text}</p>
                  <time dateTime={new Date(m.at * 1000).toISOString()}>{timeFmt.format(new Date(m.at * 1000))}</time>
                </div>
              </div>
            ))}
            {busy && (
              <div className={`${s.row} ${s.theirs}`}>
                <span className={s.avatar} aria-hidden="true">
                  <Spark />
                </span>
                <div className={`${s.bubble} ${s.typing}`} aria-label="…">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            )}
            {!started && !offline && (
              <div className={s.chips}>
                {t.suggestions.map((q) => (
                  <button key={q} type="button" onClick={() => void send(q)} disabled={busy}>
                    {q}
                  </button>
                ))}
              </div>
            )}
            {notice && <p className={s.notice} role="status">{notice}</p>}
          </div>

          <form
            className={s.compose}
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <textarea
              ref={input}
              rows={1}
              value={text}
              placeholder={t.placeholder}
              aria-label={t.placeholder}
              disabled={offline}
              onChange={(e) => {
                setText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 110)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <button type="submit" className={s.send} disabled={busy || offline || !text.trim()} aria-label={t.send}>
              <SendIcon />
            </button>
          </form>
          <p className={s.fine}>{t.disclaimer}</p>
        </section>
      )}

      <button type="button" className={s.launcher} onClick={() => setOpen((o) => !o)} aria-label={open ? t.close : t.open} aria-expanded={open}>
        {open ? <Chevron /> : <BubbleIcon />}
        {!open && unread > 0 && <b className={s.badge}>{unread > 9 ? "9+" : unread}</b>}
      </button>
    </div>
  );
}

const initials = (name: string | null) =>
  (name ?? "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "BS";

/* Inline icons: stroke inherits the surrounding colour. */
const BubbleIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5c0 4.1-4 7.5-9 7.5-1 0-2-.14-2.9-.4L4 20l1.2-3.4A7 7 0 0 1 3 11.5C3 7.4 7 4 12 4s9 3.4 9 7.5z" />
    <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" strokeWidth="2.6" />
  </svg>
);
const Chevron = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 10 6 6 6-6" />
  </svg>
);
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 12 20 4l-4 16-4-6.5zM12 13.5 20 4" />
  </svg>
);
const Restart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
  </svg>
);
const Spark = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.5c.8 4.6 2.9 6.7 7.5 7.5-4.6.8-6.7 2.9-7.5 7.5-.8-4.6-2.9-6.7-7.5-7.5 4.6-.8 6.7-2.9 7.5-7.5zM19 15.5c.4 2.1 1.4 3.1 3.5 3.5-2.1.4-3.1 1.4-3.5 3.5-.4-2.1-1.4-3.1-3.5-3.5 2.1-.4 3.1-1.4 3.5-3.5z" />
  </svg>
);
