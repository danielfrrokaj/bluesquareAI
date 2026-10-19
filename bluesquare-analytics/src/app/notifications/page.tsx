import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { canAccess } from "@/lib/departments";
import { listNotifications, syncState, unreadCounts } from "@/lib/lux-feeds";
import { listPersonal, NOTIFICATION_LABELS, personalUnread } from "@/lib/notifications";
import { FEED_LABELS, recordHref, recordSummary } from "@/lib/luxhotel-data";
import { Shell } from "@/components/Shell";
import { FeedNotice, NewDot, when } from "@/app/luxhotel/feeds";
import { readAll } from "./actions";
import s from "@/app/luxhotel/feeds.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications" };

type Row = { key: string; label: string; title: string; detail: string | null; href: string | null; unread: boolean; at: string | null };
const LIMIT = 60;

/**
 * Everything for this person, newest first: their own notifications (transactions reviewed, tasks given to them,
 * follow-ups and publishing for today) and, if they open LuxHotel, its AI chats, website requests and technical issues.
 * Opening one marks it read; a LuxHotel AI chat turns unread again with a new message.
 */
export default async function NotificationsPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const user = await requireAuth();
  const lux = canAccess(user, "luxhotel");
  const all = (await searchParams).show === "all";
  const [personal, personalCount, feed, feedCounts, state] = await Promise.all([
    listPersonal(user.id, !all, LIMIT), personalUnread(user.id),
    lux ? listNotifications(user.id, !all, LIMIT) : [], lux ? unreadCounts(user.id) : null, lux ? syncState() : null,
  ]);
  const unread = personalCount + (feedCounts?.total ?? 0);

  const rows: Row[] = [
    ...personal.map((n) => ({
      key: `n:${n.id}`, label: NOTIFICATION_LABELS[n.kind], title: n.title, unread: n.unread, at: n.createdAt,
      detail: [n.body, n.kind === "transaction" && n.actorName ? `by ${n.actorName}` : ""].filter(Boolean).join(" · ") || null,
      // Opening goes through /notifications/<id>, which marks it read first.
      href: n.href ? `/notifications/${n.id}` : null,
    })),
    ...feed.map(({ kind, item, unread: isNew, changedAt }) => {
      const { title, detail } = recordSummary(kind, item);
      return { key: `${kind}:${item.id}`, label: FEED_LABELS[kind], title, detail: detail || null, href: recordHref(kind, item.id), unread: isNew, at: changedAt };
    }),
  ].sort((a, b) => (b.at ?? "").localeCompare(a.at ?? "")).slice(0, LIMIT);

  return (
    <Shell>
      <div className="pagehead">
        <div>
          <h1>Notifications</h1>
          <p className="muted">
            {unread ? `${unread} unread. ` : "Nothing unread. "}
            Your transactions, tasks, follow-ups and publishing{lux ? ", and LuxHotel's AI chats, website requests and technical issues" : ""}.
          </p>
        </div>
        {unread > 0 && (
          <form action={readAll}>
            <button className="btn btn--small">Mark all as read</button>
          </form>
        )}
      </div>
      {state && <FeedNotice state={state} />}
      <nav className="tabs" aria-label="Show">
        <Link href="/notifications" aria-current={!all ? "page" : undefined}>Unread{unread ? ` (${unread})` : ""}</Link>
        <Link href="/notifications?show=all" aria-current={all ? "page" : undefined}>All</Link>
      </nav>
      <section className="panel">
        {rows.length === 0 ? (
          <p className="empty">{all ? "No notifications yet." : "You're all caught up."}</p>
        ) : (
          <ul className={s.list}>
            {rows.map((r) => (
              <li key={r.key} className={`${s.row} ${s.rowTop}${r.unread ? ` ${s.unread}` : ""}`}>
                <div className={s.rowMain}>
                  <p className={s.flags}><span className={s.tag}>{r.label}</span></p>
                  {r.href ? (
                    <Link href={r.href} prefetch={false} className={`${s.title} ${s.issueTitle} stretched`}>{r.unread && <NewDot />}{r.title}</Link>
                  ) : (
                    <p className={`${s.title} ${s.issueTitle}`}>{r.unread && <NewDot />}{r.title}</p>
                  )}
                  {r.detail && <p className={s.meta}>{r.detail}</p>}
                </div>
                <div className={s.side}>
                  <time dateTime={r.at ?? undefined}>{when(r.at)}</time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Shell>
  );
}
