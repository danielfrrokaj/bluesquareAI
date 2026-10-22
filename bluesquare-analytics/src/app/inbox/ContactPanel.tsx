"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Conversation, Inbox, Priority } from "@/lib/chatwoot";
import type { LeadLink } from "@/lib/inbox";
import { addToSales, contactHistory, newLabel, saveContact, type ConversationChange } from "./actions";
import type { Directory } from "./InboxApp";
import { Avatar, CHANNEL_NAMES, Icon, Menu, shortTime } from "./parts";
import s from "./inbox.module.css";

const PRIORITIES: [Priority | null, string][] = [[null, "None"], ["urgent", "Urgent"], ["high", "High"], ["medium", "Medium"], ["low", "Low"]];

/** The right panel: the contact, assignment, priority, labels, Sales, and their other conversations. */
export function ContactPanel({ conversation: c, inbox, lead, directory, onAct, onLead, onClose, onContact }: {
  conversation: Conversation; inbox: Inbox | undefined; lead: LeadLink | null; directory: Directory;
  onAct: (change: ConversationChange) => Promise<void>; onLead: (l: LeadLink) => void; onClose: () => void; onContact: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [history, setHistory] = useState<Conversation[] | null>(null);

  useEffect(() => {
    let gone = false;
    void contactHistory(c.contact.id).then((r) => !gone && setHistory("error" in r ? [] : r.conversations.filter((x) => x.id !== c.id)));
    return () => { gone = true; };
  }, [c.contact.id, c.id]);

  const run = async (name: string, go: () => Promise<void>) => {
    setBusy(name);
    setNotice(null);
    try {
      await go();
    } finally {
      setBusy(null);
    }
  };

  const toSales = () => run("sales", async () => {
    const result = await addToSales(c.id);
    if ("error" in result) return setNotice(result.error);
    onLead(result.lead);
    setNotice(result.created ? "Added to Sales." : "Already in Sales.");
  });

  const toggleLabel = (title: string) =>
    run(`label:${title}`, () => onAct({ labels: c.labels.includes(title) ? c.labels.filter((l) => l !== title) : [...c.labels, title] }));

  const createLabel = () => {
    const title = window.prompt("Name for the new label (e.g. vip, complaint, booking):")?.trim();
    if (!title) return;
    void run("newlabel", async () => {
      const made = await newLabel(title, "#4a84d0");
      if ("error" in made) return setNotice(made.error);
      await onAct({ labels: [...c.labels, title.toLowerCase().replace(/\s+/g, "-")] });
    });
  };

  return (
    <aside className={s.panel} aria-label="Contact and details">
      <header className={s.panelHead}>
        <h2>Details</h2>
        <button type="button" className={s.iconButton} onClick={onClose} aria-label="Close details"><Icon name="close" /></button>
      </header>

      <div className={s.panelBody}>
        <div className={s.contactCard}>
          <Avatar person={c.contact} size={56} channel={inbox?.channel} />
          <strong>{c.contact.name}</strong>
          {c.contact.company && <span className={s.contactCompany}>{c.contact.company}</span>}
          <div className={s.contactRows}>
            {c.contact.phone && (
              <div><Icon name="phone" size={15} /><a href={`tel:${c.contact.phone}`}>{c.contact.phone}</a>
                {inbox?.channel !== "whatsapp" && <a className={s.waLink} href={`https://wa.me/${c.contact.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
              </div>
            )}
            {c.contact.email && <div><Icon name="mail" size={15} /><a href={`mailto:${c.contact.email}`}>{c.contact.email}</a></div>}
            {c.contact.location && <div><Icon name="pin" size={15} /><span>{c.contact.location}</span></div>}
            {inbox && <div><Icon name="inbox" size={15} /><span>{CHANNEL_NAMES[inbox.channel]} · {inbox.name}</span></div>}
          </div>
          <button type="button" className={s.subtle} onClick={() => setEditing((e) => !e)}>{editing ? "Cancel" : "Edit contact"}</button>
        </div>

        {editing && (
          <form
            className={s.contactForm}
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              void run("contact", async () => {
                const saved = await saveContact(c.contact.id, { name: String(f.get("name")), email: String(f.get("email")), phone: String(f.get("phone")) });
                if ("error" in saved) return setNotice(saved.error);
                setEditing(false);
                onContact();
              });
            }}
          >
            <label><span>Name</span><input name="name" defaultValue={c.contact.name} required maxLength={120} /></label>
            <label><span>Email</span><input name="email" type="email" defaultValue={c.contact.email ?? ""} maxLength={160} /></label>
            <label><span>Phone</span><input name="phone" defaultValue={c.contact.phone ?? ""} maxLength={25} placeholder="+355 69 123 4567" /></label>
            <button className={s.primary} disabled={busy === "contact"}>{busy === "contact" ? "Saving…" : "Save contact"}</button>
          </form>
        )}

        <section className={s.panelSection}>
          <h3>Sales</h3>
          {lead ? (
            <Link className={s.leadCard} href={`/sales/leads/${lead.id}`}>
              <Icon name="sales" size={16} />
              <span><strong>{lead.title}</strong><small>{lead.status === "won" ? "Customer" : lead.status === "lost" ? "Archived lead" : "Open lead"} · open in Sales</small></span>
              <Icon name="external" size={14} />
            </Link>
          ) : (
            <button type="button" className={s.primary} onClick={toSales} disabled={busy === "sales"}>
              {busy === "sales" ? "Adding…" : "Add to Sales as a lead"}
            </button>
          )}
        </section>

        <section className={s.panelSection}>
          <h3>Assignment</h3>
          <div className={s.assignRow}>
            <span>Assigned to</span>
            <Menu
              label="Hand the conversation to someone" align="left" className={s.assignPick}
              icon={<>{c.assignee ? <><Avatar person={c.assignee} size={20} />{c.assignee.name}</> : "Nobody"}<i className={s.chev} /></>}
              items={[
                { label: "Nobody", checked: !c.assignee, onSelect: () => void onAct({ assigneeId: null }) },
                { label: `${directory.me.name} (me)`, checked: c.assignee?.id === directory.me.id, onSelect: () => void onAct({ assigneeId: directory.me.id }) },
                ...directory.users.filter((u) => u.id !== directory.me.id).map((u) => ({
                  key: u.id, label: u.name, checked: c.assignee?.id === u.id, onSelect: () => void onAct({ assigneeId: u.id }),
                })),
              ]}
            />
          </div>
          {directory.teams.length > 0 && (
            <div className={s.assignRow}>
              <span>Team</span>
              <Menu
                label="Assign a team" align="left" className={s.assignPick}
                icon={<>{c.team?.name ?? "None"}<i className={s.chev} /></>}
                items={[
                  { label: "None", checked: !c.team, onSelect: () => void onAct({ teamId: null }) },
                  ...directory.teams.map((t) => ({ label: t.name, checked: c.team?.id === t.id, onSelect: () => void onAct({ teamId: t.id }) })),
                ]}
              />
            </div>
          )}
          <div className={s.assignRow}>
            <span>Priority</span>
            <Menu
              label="Set the priority" align="left" className={s.assignPick}
              icon={<>{c.priority ? <span className={`${s.priority} ${s[`p_${c.priority}`]}`}>{c.priority}</span> : "None"}<i className={s.chev} /></>}
              items={PRIORITIES.map(([value, label]) => ({ label, checked: c.priority === value, onSelect: () => void onAct({ priority: value }) }))}
            />
          </div>
        </section>

        <section className={s.panelSection}>
          <h3>Labels</h3>
          <div className={s.assignRow}>
            <span>Labels</span>
            <Menu
              label="Choose labels" align="left" className={s.assignPick}
              icon={<>{c.labels.length ? `${c.labels.length} chosen` : "None"}<i className={s.chev} /></>}
              items={[
                ...directory.labels.map((l) => ({
                  key: l.title, stayOpen: true, checked: c.labels.includes(l.title), onSelect: () => toggleLabel(l.title),
                  label: <><i className={s.labelDot} style={{ background: l.color }} /> {l.title}</>,
                })),
                // Labels this conversation has that aren't in the account's list anymore.
                ...c.labels.filter((t) => !directory.labels.some((l) => l.title === t)).map((t) => ({
                  key: t, stayOpen: true, checked: true, onSelect: () => toggleLabel(t), label: <><i className={s.labelDot} /> {t}</>,
                })),
                ...(directory.labels.length ? ["divider" as const] : []),
                { key: "new", label: "+ New label…", onSelect: createLabel },
              ]}
            />
          </div>
          {c.labels.length > 0 && (
            <div className={s.labelGrid}>
              {c.labels.map((t) => {
                const color = directory.labels.find((l) => l.title === t)?.color;
                return (
                  <button
                    key={t} type="button" className={`${s.labelPick} ${s.labelOn}`} style={{ "--label": color } as React.CSSProperties}
                    onClick={() => toggleLabel(t)} disabled={busy === `label:${t}`} title={`Remove “${t}”`}
                  >
                    {t} ×
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className={s.panelSection}>
          <h3>Previous conversations</h3>
          {!history && <p className={s.panelMuted}>Loading…</p>}
          {history?.length === 0 && <p className={s.panelMuted}>This is the first one with {c.contact.name}.</p>}
          {!!history?.length && (
            <ul className={s.historyList}>
              {history.slice(0, 6).map((h) => {
                const hi = directory.inboxes.find((i) => i.id === h.inboxId);
                return (
                  <li key={h.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {hi && <img src={`/icons/channels/${hi.channel}.svg`} alt="" width={16} height={16} />}
                    <span>{h.preview?.text || "Attachment"}</span>
                    <small>{shortTime(h.lastActivity)} · {h.status}</small>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {notice && <p className={s.panelNotice} role="status">{notice}</p>}
      </div>
    </aside>
  );
}
