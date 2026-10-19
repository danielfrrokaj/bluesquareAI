import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { listSaved, syncState, unreadCounts } from "@/lib/lux-feeds";
import { recordHref } from "@/lib/luxhotel-data";
import { Shell } from "@/components/Shell";
import { luxhotelNav } from "@/components/nav";
import { FeedNotice, NewDot, Pager, ReadAllButton, pageOf, propertyNames, when } from "../feeds";
import s from "../feeds.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "AI chats · LuxHotel" };

/** Staff conversations with the LuxHotel support assistant ("Bisedat me AI"), newest first, from our saved copy. */
export default async function AiChatsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await requireAuth();
  const page = pageOf(await searchParams);
  const [{ rows, more, total }, unread, state, names] = await Promise.all([
    listSaved("ai-chats", user.id, page), unreadCounts(user.id), syncState(), propertyNames(),
  ]);

  return (
    <Shell department="luxhotel" subnav={luxhotelNav("ai-chats", unread)}>
      <div className="pagehead">
        <div>
          <h1>AI chats</h1>
          <p className="muted">Hotel staff asking the LuxHotel assistant for help, newest first. Opening one marks it read for you.</p>
        </div>
        <ReadAllButton kind="ai-chats" unread={unread["ai-chats"]} />
      </div>
      <FeedNotice state={state} />
      <section className="panel">
        {rows.length === 0 ? (
          <p className="empty">{total ? "No conversations on this page." : "No conversations saved yet."}</p>
        ) : (
          <ul className={s.list}>
            {rows.map(({ item: c, unread: isNew }) => {
              const human = c.messages.filter((m) => m.needs_human).length;
              const shots = c.messages.filter((m) => m.has_screenshot).length;
              const up = c.feedback.filter((f) => f.vote === "up").length;
              const down = c.feedback.length - up;
              const first = c.messages.find((m) => m.question)?.question;
              return (
                <li key={c.id} className={`${s.row}${isNew ? ` ${s.unread}` : ""}`}>
                  <div className={s.rowMain}>
                    <Link href={recordHref("ai-chats", c.id)} prefetch={false} className={`${s.title} stretched`}>
                      {isNew && <NewDot />}{first ?? "(no question)"}
                    </Link>
                    <p className={s.meta}>
                      {c.user.email ?? "Unknown user"}{c.user.role ? ` · ${c.user.role}` : ""}
                      {c.vendor_id && <> · {names.byVendor.get(c.vendor_id) ?? "Unknown property"}</>}
                    </p>
                  </div>
                  <div className={s.flags}>
                    {human > 0 && <span className={`${s.tag} ${s.tagWarn}`}>Needs a person{human > 1 ? ` ×${human}` : ""}</span>}
                    {shots > 0 && <span className={s.tag}>{shots} screenshot{shots === 1 ? "" : "s"}</span>}
                    {up > 0 && <span className={`${s.tag} ${s.tagGood}`}>👍 {up}</span>}
                    {down > 0 && <span className={`${s.tag} ${s.tagBad}`}>👎 {down}</span>}
                  </div>
                  <div className={s.side}>
                    <span>{c.messages.length} message{c.messages.length === 1 ? "" : "s"}</span>
                    <time dateTime={c.started_at ?? undefined}>{when(c.started_at)}</time>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <Pager base="/luxhotel/ai-chats" page={page} more={more} />
      </section>
    </Shell>
  );
}
