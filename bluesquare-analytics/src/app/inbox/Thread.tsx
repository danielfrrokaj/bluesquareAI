"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Attachment, Conversation, Message } from "@/lib/chatwoot";
import type { LeadLink } from "@/lib/inbox";
import { changeConversation, removeMessage, type ConversationChange } from "./actions";
import type { Directory } from "./InboxApp";
import { Composer } from "./Composer";
import { ContactPanel } from "./ContactPanel";
import { AudioPlayer, Avatar, CHANNEL_NAMES, clock, dayKey, dayLabel, fileSize, Icon, Linkified, Menu, Ticks } from "./parts";
import s from "./inbox.module.css";

const THREAD_EVERY = 4_000;
const sortMessages = (a: Message, b: Message) => a.createdAt - b.createdAt || a.id - b.id;

/** One conversation: its messages (refreshed every few seconds while visible), the reply box and the contact. */
export function Thread({ id, summary, directory, onChange, onClose }: {
  id: number; summary: Conversation | null; directory: Directory; onChange: (c: Conversation) => void; onClose: () => void;
}) {
  const [conv, setConv] = useState<Conversation | null>(summary);
  const [messages, setMessages] = useState<Message[]>([]);
  const [lead, setLead] = useState<LeadLink | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasOlder, setHasOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [panel, setPanel] = useState(false);
  const [lightbox, setLightbox] = useState<Attachment | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const stick = useRef(true); // keep to the newest message unless the person scrolled up
  const keepFrom = useRef<number | null>(null); // scroll height before older messages were added on top
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const inbox = directory.inboxes.find((i) => i.id === conv?.inboxId);

  useEffect(() => setPanel(window.matchMedia("(min-width: 1360px)").matches), []);

  const merge = useCallback((incoming: Message[]) => setMessages((prev) => {
    const all = new Map(prev.map((m) => [m.id, m]));
    for (const m of incoming) all.set(m.id, m);
    return [...all.values()].sort(sortMessages);
  }), []);

  const load = useCallback(async () => {
    try {
      const visible = document.visibilityState === "visible";
      const res = await fetch(`/api/inbox/conversations/${id}?read=${visible ? 1 : 0}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "This conversation couldn't load.");
      setConv(data.conversation);
      setLead(data.lead);
      merge(data.messages);
      setLoaded((was) => {
        if (!was) setHasOlder(data.hasOlder ?? data.messages.length >= 20);
        return true;
      });
      setError(null);
      onChangeRef.current(data.conversation);
    } catch (e) {
      setError(e instanceof Error ? e.message : "This conversation couldn't load.");
    }
  }, [id, merge]);

  useEffect(() => {
    void load();
    const tick = () => document.visibilityState === "visible" && void load();
    const timer = window.setInterval(tick, THREAD_EVERY);
    document.addEventListener("visibilitychange", tick);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", tick); };
  }, [load]);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (keepFrom.current !== null) {
      el.scrollTop += el.scrollHeight - keepFrom.current;
      keepFrom.current = null;
    } else if (stick.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const older = async () => {
    if (!messages.length) return;
    setLoadingOlder(true);
    try {
      const res = await fetch(`/api/inbox/conversations/${id}?before=${messages[0].id}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      keepFrom.current = scroller.current?.scrollHeight ?? null;
      merge(data.messages);
      setHasOlder(data.messages.length >= 20);
    } catch {
      setError("Older messages couldn't load.");
    } finally {
      setLoadingOlder(false);
    }
  };

  const act = async (change: ConversationChange) => {
    const result = await changeConversation(id, change);
    if ("error" in result) return setError(result.error);
    setConv(result.conversation);
    onChange(result.conversation);
  };

  const sent = (m: Message) => {
    stick.current = true;
    merge([m]);
    if (conv) {
      const next = { ...conv, lastActivity: m.createdAt, preview: { text: m.content ?? "", incoming: false, private: m.private, attachment: m.attachments[0]?.type ?? null } };
      setConv(next);
      onChange(next);
    }
  };

  const remove = async (m: Message) => {
    if (!window.confirm("Delete this message? It's removed here; on WhatsApp and Instagram the customer may still have it.")) return;
    const result = await removeMessage(id, m.id);
    if ("error" in result) setError(result.error);
    else void load();
  };

  const tomorrow9 = () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return Math.floor(d.getTime() / 1000); };
  const now = () => Math.floor(Date.now() / 1000);

  return (
    <section className={`${s.thread}${panel ? ` ${s.withPanel}` : ""}`} aria-label="Conversation">
      <div className={s.threadMain}>
        <header className={s.threadHead}>
          <button type="button" className={`${s.iconButton} ${s.back}`} onClick={onClose} aria-label="Back to conversations"><Icon name="back" /></button>
          {conv && <Avatar person={conv.contact} size={40} channel={inbox?.channel} />}
          <div className={s.threadWho}>
            <strong>{conv?.contact.name ?? "Loading…"}</strong>
            <span>
              {inbox ? `${CHANNEL_NAMES[inbox.channel]} · ${inbox.name}` : ""}
              {conv?.status && conv.status !== "open" && <em className={`${s.statusTag} ${s[`st_${conv.status}`]}`}>{conv.status}</em>}
              {conv?.muted && <em className={s.statusTag}>muted</em>}
            </span>
          </div>
          {conv && (
            <div className={s.headActions}>
              <Menu
                label="More actions" icon={<Icon name="more" />}
                items={[
                  ...(conv.status !== "pending" ? [{ label: "Mark as pending", onSelect: () => act({ status: "pending" }) }] : []),
                  { label: "Snooze for an hour", onSelect: () => act({ status: "snoozed", snoozedUntil: now() + 3600 }) },
                  { label: "Snooze until tomorrow 09:00", onSelect: () => act({ status: "snoozed", snoozedUntil: tomorrow9() }) },
                  { label: "Snooze for a week", onSelect: () => act({ status: "snoozed", snoozedUntil: now() + 7 * 86400 }) },
                  "divider",
                  { label: conv.muted ? "Unmute conversation" : "Mute conversation", onSelect: () => act({ muted: !conv.muted }) },
                ]}
              />
              <button type="button" className={`${s.iconButton}${panel ? ` ${s.iconOn}` : ""}`} onClick={() => setPanel((p) => !p)} aria-label="Contact and details" title="Contact and details" aria-pressed={panel}>
                <Icon name="info" />
              </button>
              {conv.status === "resolved" ? (
                <button type="button" className={s.resolve} onClick={() => act({ status: "open" })}>Reopen</button>
              ) : (
                <button type="button" className={`${s.resolve} ${s.resolveGo}`} onClick={() => act({ status: "resolved" })}><Icon name="check" size={16} /> Resolve</button>
              )}
            </div>
          )}
        </header>

        <div
          className={s.messages} ref={scroller}
          onScroll={(e) => { const el = e.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; }}
        >
          {hasOlder && (
            <button type="button" className={s.older} onClick={older} disabled={loadingOlder}>{loadingOlder ? "Loading…" : "Show earlier messages"}</button>
          )}
          {!loaded && !error && <div className={s.loadingDots}><i /><i /><i /></div>}
          {error && <p className={s.threadError} role="alert">{error} <button type="button" onClick={() => void load()}>Try again</button></p>}
          {messages.map((m, i) => {
            const prev = messages[i - 1];
            const newDay = !prev || dayKey(prev.createdAt) !== dayKey(m.createdAt);
            // Senders compare by name too: everything sent from the CRM shares one Chatwoot agent id.
            const grouped = !newDay && prev && prev.kind === m.kind && prev.private === m.private
              && prev.sender?.id === m.sender?.id && prev.sender?.name === m.sender?.name && m.createdAt - prev.createdAt < 300;
            return (
              <div key={m.id} className={s.messageRow}>
                {newDay && <div className={s.day}><span>{dayLabel(m.createdAt)}</span></div>}
                {m.kind === "activity" ? (
                  <div className={s.activity}>{m.content}</div>
                ) : (
                  <MessageBubble message={m} grouped={!!grouped} onImage={setLightbox} onDelete={m.kind === "outgoing" ? () => remove(m) : undefined} />
                )}
              </div>
            );
          })}
        </div>

        {conv && inbox && <Composer conversation={conv} channel={inbox.channel} canned={directory.canned} onSent={sent} />}
      </div>

      {panel && conv && (
        <ContactPanel conversation={conv} inbox={inbox} lead={lead} directory={directory} onAct={act} onLead={setLead} onClose={() => setPanel(false)} onContact={() => void load()} />
      )}

      {lightbox && (
        <div className={s.lightbox} role="dialog" aria-label="Picture" onClick={() => setLightbox(null)} onKeyDown={(e) => e.key === "Escape" && setLightbox(null)} tabIndex={-1} ref={(el) => el?.focus()}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox.url} alt={lightbox.name} onClick={(e) => e.stopPropagation()} />
          <div className={s.lightboxBar} onClick={(e) => e.stopPropagation()}>
            <a href={lightbox.url} target="_blank" rel="noopener noreferrer" download><Icon name="download" size={16} /> Download</a>
            <button type="button" onClick={() => setLightbox(null)}><Icon name="close" size={16} /> Close</button>
          </div>
        </div>
      )}
    </section>
  );
}

function MessageBubble({ message: m, grouped, onImage, onDelete }: {
  message: Message; grouped: boolean; onImage: (a: Attachment) => void; onDelete?: () => void;
}) {
  const mine = m.kind === "outgoing";
  const images = m.attachments.filter((a) => a.type === "image");
  const others = m.attachments.filter((a) => a.type !== "image");
  const deleted = m.content === "This message was deleted";
  return (
    <div className={`${s.bubbleRow} ${mine ? s.mine : s.theirs}${grouped ? ` ${s.grouped}` : ""}`}>
      <div className={`${s.bubble}${m.private ? ` ${s.note}` : ""}${images.length && !m.content && !others.length ? ` ${s.mediaOnly}` : ""}${deleted ? ` ${s.deleted}` : ""}`}>
        {m.private && <span className={s.noteLabel}><Icon name="note" size={12} /> Private note{m.sender ? ` · ${m.sender.name}` : ""}</span>}
        {mine && !m.private && !grouped && m.sender && <span className={s.senderName}>{m.sender.name}</span>}
        {images.length > 0 && (
          <div className={`${s.images} ${images.length > 1 ? s.imagesGrid : ""}`}>
            {images.map((a) => (
              <button key={a.id} type="button" onClick={() => onImage(a)} aria-label="Open picture">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.thumb ?? a.url} alt={a.name} loading="lazy" />
              </button>
            ))}
          </div>
        )}
        {others.map((a) =>
          a.type === "audio" ? <AudioPlayer key={a.id} src={a.url} mine={mine && !m.private} />
          : a.type === "video" ? <video key={a.id} className={s.video} src={a.url} controls preload="metadata" />
          : a.type === "location" ? (
            <a key={a.id} className={s.fileChip} href={a.url} target="_blank" rel="noopener noreferrer"><Icon name="pin" size={18} /><span><strong>{a.name || "Location"}</strong><small>Open in maps</small></span></a>
          ) : (
            <a key={a.id} className={s.fileChip} href={a.url} target="_blank" rel="noopener noreferrer" download>
              <Icon name="file" size={18} />
              <span><strong>{a.name}</strong><small>{[fileSize(a.size), "Download"].filter(Boolean).join(" · ")}</small></span>
            </a>
          ),
        )}
        {m.content && <p className={s.text}><Linkified text={m.content} /></p>}
        <span className={s.meta}>
          {clock(m.createdAt)}
          {mine && !m.private && <Ticks message={m} />}
        </span>
        {m.status === "failed" && m.error && <span className={s.failedReason}>{m.error}</span>}
      </div>
      {onDelete && !deleted && (
        <button type="button" className={s.bubbleAction} onClick={onDelete} aria-label="Delete message" title="Delete message"><Icon name="trash" size={14} /></button>
      )}
    </div>
  );
}
