import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { listSaved, syncState, unreadCounts } from "@/lib/lux-feeds";
import { recordHref } from "@/lib/luxhotel-data";
import { Shell } from "@/components/Shell";
import { luxhotelNav } from "@/components/nav";
import { FeedNotice, NewDot, Pager, ReadAllButton, pageOf, when } from "../feeds";
import { RequestBody } from "./parts";
import s from "../feeds.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Website requests · LuxHotel" };

/** Contact forms sent from the LuxHotel website ("Website → Kërkesa kontakti"), newest first, from our saved copy. */
export default async function WebRequestsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await requireAuth();
  const page = pageOf(await searchParams);
  const [{ rows, more, total }, unread, state] = await Promise.all([listSaved("web-requests", user.id, page), unreadCounts(user.id), syncState()]);

  return (
    <Shell department="luxhotel" subnav={luxhotelNav("web-requests", unread)}>
      <div className="pagehead">
        <div>
          <h1>Website requests</h1>
          <p className="muted">Contact forms sent from the LuxHotel website, newest first. Open one to mark it read.</p>
        </div>
        <ReadAllButton kind="web-requests" unread={unread["web-requests"]} />
      </div>
      <FeedNotice state={state} />
      <section className="panel">
        {rows.length === 0 ? (
          <p className="empty">{total ? "No requests on this page." : "No requests saved yet."}</p>
        ) : (
          <ul className={s.list}>
            {rows.map(({ item: r, unread: isNew }) => (
              <li key={r.id} className={`${s.row} ${s.rowTop}${isNew ? ` ${s.unread}` : ""}`}>
                <div className={s.rowMain}>
                  <Link href={recordHref("web-requests", r.id)} prefetch={false} className={s.title}>
                    {isNew && <NewDot />}{r.name ?? "No name"}{r.property_name && <span className={s.property}> · {r.property_name}</span>}
                  </Link>
                  <RequestBody r={r} />
                </div>
                <div className={s.side}>
                  <time dateTime={r.created_at ?? undefined}>{when(r.created_at)}</time>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Pager base="/luxhotel/web-requests" page={page} more={more} />
      </section>
    </Shell>
  );
}
