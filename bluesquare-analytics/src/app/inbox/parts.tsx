"use client";

import { useEffect, useRef, useState } from "react";
import type { Channel, Message, Person } from "@/lib/chatwoot";
import { CHANNEL_NAMES } from "./channels";
import s from "./inbox.module.css";

export { CHANNEL_NAMES };

const HUES = [210, 160, 265, 25, 340, 190];
const hue = (id: number | string) =>
  HUES[(typeof id === "number" ? id : [...id].reduce((n, ch) => n + ch.charCodeAt(0), 0)) % HUES.length];
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";

/** A person's picture, else their initials on a colour picked from their id; with the channel's mark in the corner. */
export function Avatar({ person, size = 40, channel }: { person: Pick<Person, "name" | "avatar"> & { id: number | string }; size?: number; channel?: Channel }) {
  const [broken, setBroken] = useState(false);
  return (
    <span className={s.avatar} style={{ width: size, height: size, fontSize: size * 0.38, "--hue": hue(person.id) } as React.CSSProperties}>
      {person.avatar && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={person.avatar} alt="" onError={() => setBroken(true)} />
      ) : (
        initials(person.name)
      )}
      {channel && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={s.avatarChannel} src={`/icons/channels/${channel}.svg`} alt={CHANNEL_NAMES[channel]} width={size * 0.42} height={size * 0.42} />
      )}
    </span>
  );
}

const timeFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
const weekdayFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short" });
const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const longDayFmt = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" });
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "14:05" today, "Mon" this week, "12 Oct" before. */
export function shortTime(unix: number): string {
  const d = new Date(unix * 1000);
  const days = (startOfDay(new Date()) - startOfDay(d)) / 86_400_000;
  return days < 1 ? timeFmt.format(d) : days < 7 ? weekdayFmt.format(d) : dayFmt.format(d);
}
export const clock = (unix: number) => timeFmt.format(new Date(unix * 1000));
export function dayLabel(unix: number): string {
  const days = (startOfDay(new Date()) - startOfDay(new Date(unix * 1000))) / 86_400_000;
  return days < 1 ? "Today" : days < 2 ? "Yesterday" : longDayFmt.format(new Date(unix * 1000));
}
export const dayKey = (unix: number) => startOfDay(new Date(unix * 1000));

export function fileSize(bytes: number | null): string {
  if (!bytes) return "";
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Text with its links clickable. */
export function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s<>"]+)/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? <a key={i} href={p} target="_blank" rel="noopener noreferrer">{p}</a> : p,
      )}
    </>
  );
}

/** Sent ✓, delivered ✓✓, read ✓✓ (blue), failed (with Chatwoot's reason). */
export function Ticks({ message }: { message: Message }) {
  if (message.status === "failed") return <span className={s.failed} title={message.error ?? "Not delivered"}>!</span>;
  const double = message.status === "delivered" || message.status === "read";
  return (
    <svg className={`${s.ticks}${message.status === "read" ? ` ${s.read}` : ""}`} width="16" height="11" viewBox="0 0 16 11" aria-label={message.status}>
      <path d="M1 5.5 4.5 9 11 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {double && <path d="M6.5 9 13 2.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
    </svg>
  );
}

const mmss = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

/** A compact player for voice messages and audio files. */
export function AudioPlayer({ src, mine }: { src: string; mine?: boolean }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const bars = useRef(Array.from({ length: 28 }, (_, i) => 0.35 + 0.65 * Math.abs(Math.sin(i * 1.7 + src.length))));
  const progress = duration ? time / duration : 0;
  return (
    <div className={`${s.audio}${mine ? ` ${s.audioMine}` : ""}`}>
      <button
        type="button" className={s.audioPlay} aria-label={playing ? "Pause" : "Play"}
        onClick={() => (ref.current?.paused ? void ref.current.play() : ref.current?.pause())}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" /> : <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />}
        </svg>
      </button>
      <div
        className={s.wave} role="slider" aria-label="Position" aria-valuemin={0} aria-valuemax={Math.round(duration)} aria-valuenow={Math.round(time)} tabIndex={0}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          if (ref.current && duration) ref.current.currentTime = ((e.clientX - r.left) / r.width) * duration;
        }}
      >
        {bars.current.map((h, i) => <i key={i} style={{ height: `${h * 100}%` }} className={i / bars.current.length < progress ? s.waveOn : undefined} />)}
      </div>
      <span className={s.audioTime}>{mmss(playing || time ? time : duration)}</span>
      <audio
        ref={ref} src={src} preload="metadata"
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => { setPlaying(false); setTime(0); }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => Number.isFinite(e.currentTarget.duration) && setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => Number.isFinite(e.currentTarget.duration) && setDuration(e.currentTarget.duration)}
      />
    </div>
  );
}

/** A button that opens a small menu of actions; closes on a pick, a click outside or Escape. */
export function Menu({ label, icon, items, align = "right", className }: {
  label: string; icon: React.ReactNode; align?: "left" | "right"; className?: string;
  items: ({ key?: string; label: React.ReactNode; onSelect: () => void; danger?: boolean; checked?: boolean; stayOpen?: boolean } | "divider")[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);
  return (
    <div className={s.menuWrap} ref={ref}>
      <button type="button" className={className ?? s.iconButton} aria-label={label} title={label} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {icon}
      </button>
      {open && (
        <div className={`${s.menu} ${align === "left" ? s.menuLeft : ""}`} role="menu">
          {items.map((item, i) =>
            item === "divider" ? <hr key={i} /> : (
              <button
                key={item.key ?? (typeof item.label === "string" ? item.label : i)} type="button" role="menuitem" className={item.danger ? s.menuDanger : undefined}
                onClick={() => { if (!item.stayOpen) setOpen(false); item.onSelect(); }}
              >
                <span className={s.menuCheck}>{item.checked ? "✓" : ""}</span>
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

/** Line icons used across Inbox. */
export function Icon({ name, size = 18 }: { name: keyof typeof ICONS; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}
const ICONS = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  send: <path d="M4 12 20 4l-4 16-4-6.5zM12 13.5 20 4" />,
  attach: <path d="m20.5 11.5-8.4 8.4a5.5 5.5 0 0 1-7.8-7.8l8.4-8.4a3.7 3.7 0 0 1 5.2 5.2l-8.4 8.4a1.8 1.8 0 0 1-2.6-2.6l7.8-7.8" />,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
  stop: <rect x="6" y="6" width="12" height="12" rx="2.5" />,
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  more: <><circle cx="5" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="19" cy="12" r="1.2" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.01" /></>,
  back: <path d="m15 5-7 7 7 7" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  bolt: <path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" />,
  note: <path d="M5 4h10l4 4v12H5zM14 4v5h5M9 13h6M9 17h4" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  flag: <path d="M5 21V4h11l-2 4 2 4H5" />,
  file: <path d="M6 3h8l5 5v13H6zM14 3v5h5" />,
  download: <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14" />,
  pin: <><path d="M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 0 1 13 0c0 5.3-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  tag: <><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1.3" /></>,
  bell: <path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10.3 20a1.9 1.9 0 0 0 3.4 0" />,
  bellOff: <path d="M6 8a6 6 0 0 1 9.6-4.8M18 8c0 7 3 8 3 8H8M10.3 20a1.9 1.9 0 0 0 3.4 0M3 3l18 18" />,
  sales: <path d="M4 19V9m6 10V5m6 14v-7m4 7H2" />,
  inbox: <path d="M4 13h4l2 3h4l2-3h4M4 13l2.5-8h11L20 13v6H4z" />,
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h9a1 1 0 0 1 1 1V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" />,
} as const;
