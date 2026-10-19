import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getSaved, markRead, unreadCounts } from "@/lib/lux-feeds";
import { Shell } from "@/components/Shell";
import { luxhotelNav } from "@/components/nav";
import { propertyNames, when } from "../../feeds";
import { IssueFlags, IssueSource, propertyOf } from "../parts";
import s from "../../feeds.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Technical issue · LuxHotel" };

/** One saved technical issue. Opening it marks it read for this person. */
export default async function TechnicalIssuePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;
  const saved = /^[\w-]{1,128}$/.test(id) ? await getSaved("technical-issues", id, user.id) : null;
  if (saved?.unread) await markRead(user.id, "technical-issues", id);
  const [unread, names] = await Promise.all([unreadCounts(user.id), propertyNames()]);
  const t = saved?.item ?? null;

  return (
    <Shell department="luxhotel" subnav={luxhotelNav("technical-issues", unread)}>
      <p className={s.back}><Link href="/luxhotel/technical-issues">← All technical issues</Link></p>
      {!t ? (
        <section className="panel"><p className="empty">This issue isn&apos;t saved here.</p></section>
      ) : (
        <>
          <div className="pagehead">
            <div>
              <h1>Technical issue</h1>
              <p className="muted">Reported {when(t.created_at)} · resolution is tracked on the MultiSystem board</p>
            </div>
          </div>
          <section className="panel">
            <IssueFlags t={t} />
            <p className={s.body}>{t.description ?? "(no description)"}</p>
            <IssueSource t={t} property={propertyOf(t, names)} />
          </section>
        </>
      )}
    </Shell>
  );
}
