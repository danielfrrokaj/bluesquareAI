import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getSaved, markRead, unreadCounts } from "@/lib/lux-feeds";
import { Shell } from "@/components/Shell";
import { luxhotelNav } from "@/components/nav";
import { propertyNames, when } from "../../feeds";
import s from "../../feeds.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "AI chat · LuxHotel" };

/** One saved conversation with the support assistant. Opening it marks it read for this person. */
export default async function AiChatPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;
  const saved = /^[\w-]{1,128}$/.test(id) ? await getSaved("ai-chats", id, user.id) : null;
  // Read before the frame counts what's unread, so the bell and tab drop on this very page.
  if (saved?.unread) await markRead(user.id, "ai-chats", id);
  const [names, unread] = await Promise.all([propertyNames(), unreadCounts(user.id)]);
  const chat = saved?.item ?? null;

  return (
    <Shell department="luxhotel" subnav={luxhotelNav("ai-chats", unread)}>
      <p className={s.back}><Link href="/luxhotel/ai-chats">← All AI chats</Link></p>
      {!chat ? (
        <section className="panel"><p className="empty">This conversation isn&apos;t saved here.</p></section>
      ) : (
        <>
          <div className="pagehead">
            <div>
              <h1>{chat.user.email ?? "Unknown user"}</h1>
              <p className="muted">
                {chat.user.role ?? "No role"}
                {chat.vendor_id && <> · {names.byVendor.get(chat.vendor_id) ?? "Unknown property"}</>}
                {" · "}started {when(chat.started_at)}{chat.updated_at && chat.updated_at !== chat.started_at ? `, last message ${when(chat.updated_at)}` : ""}
              </p>
            </div>
          </div>

          <section className="panel">
            {chat.messages.length === 0 ? (
              <p className="empty">No messages in this conversation.</p>
            ) : (
              <ol className={s.thread}>
                {chat.messages.map((m, i) => (
                  <li key={i} className={s.exchange}>
                    <div className={s.question}>
                      <span className={s.who}>{chat.user.email ?? "Staff"} · {when(m.asked_at)}</span>
                      <p>{m.question ?? "(empty question)"}</p>
                      {m.has_screenshot && <span className={s.tag}>Screenshot attached (not shared)</span>}
                    </div>
                    <div className={s.answer}>
                      <span className={s.who}>
                        Assistant
                        {m.needs_human && <span className={`${s.tag} ${s.tagWarn}`}>Asked for a person</span>}
                      </span>
                      <p>{m.answer ?? "(no answer)"}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {chat.feedback.length > 0 && (
            <section className="panel">
              <header className="panel__head"><h2>Feedback</h2></header>
              <ul className={s.feedback}>
                {chat.feedback.map((f, i) => (
                  <li key={i}>
                    <span className={`${s.tag} ${f.vote === "up" ? s.tagGood : s.tagBad}`}>{f.vote === "up" ? "👍 Helpful" : "👎 Not helpful"}</span>
                    <p>{f.comment ?? <span className="muted">No comment</span>}</p>
                    <time className="muted">{when(f.at)}</time>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </Shell>
  );
}
