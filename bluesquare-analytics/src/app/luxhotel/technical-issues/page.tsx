import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { listSaved, syncState, unreadCounts } from "@/lib/lux-feeds";
import { recordHref } from "@/lib/luxhotel-data";
import { Shell } from "@/components/Shell";
import { luxhotelNav } from "@/components/nav";
import { FeedNotice, NewDot, Pager, ReadAllButton, pageOf, propertyNames, when } from "../feeds";
import { IssueFlags, IssueSource, propertyOf } from "./parts";
import s from "../feeds.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Technical issues · LuxHotel" };

/** Problems reported from the PMS ("Raporto një Problem Teknik"), newest first, from our saved copy. */
export default async function TechnicalIssuesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await requireAuth();
  const page = pageOf(await searchParams);
  const [{ rows, more, total }, unread, state, names] = await Promise.all([
    listSaved("technical-issues", user.id, page), unreadCounts(user.id), syncState(), propertyNames(),
  ]);

  return (
    <Shell department="luxhotel" subnav={luxhotelNav("technical-issues", unread)}>
      <div className="pagehead">
        <div>
          <h1>Technical issues</h1>
          <p className="muted">Problems hotels reported from the PMS, newest first. Whether one is resolved is tracked on the MultiSystem board.</p>
        </div>
        <ReadAllButton kind="technical-issues" unread={unread["technical-issues"]} />
      </div>
      <FeedNotice state={state} />
      <section className="panel">
        {rows.length === 0 ? (
          <p className="empty">{total ? "No issues on this page." : "No issues saved yet."}</p>
        ) : (
          <ul className={s.list}>
            {rows.map(({ item: t, unread: isNew }) => (
              <li key={t.id} className={`${s.row} ${s.rowTop}${isNew ? ` ${s.unread}` : ""}`}>
                <div className={s.rowMain}>
                  <IssueFlags t={t} />
                  <Link href={recordHref("technical-issues", t.id)} prefetch={false} className={`${s.title} ${s.issueTitle}`}>
                    {isNew && <NewDot />}{t.description ?? "(no description)"}
                  </Link>
                  <IssueSource t={t} property={propertyOf(t, names)} />
                </div>
                <div className={s.side}>
                  <time dateTime={t.created_at ?? undefined}>{when(t.created_at)}</time>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Pager base="/luxhotel/technical-issues" page={page} more={more} />
      </section>
    </Shell>
  );
}
