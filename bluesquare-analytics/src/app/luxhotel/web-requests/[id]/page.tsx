import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getSaved, markRead, unreadCounts } from "@/lib/lux-feeds";
import { Shell } from "@/components/Shell";
import { luxhotelNav } from "@/components/nav";
import { when } from "../../feeds";
import { RequestBody } from "../parts";
import s from "../../feeds.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Website request · LuxHotel" };

/** One saved website request. Opening it marks it read for this person. */
export default async function WebRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;
  const saved = /^[\w-]{1,128}$/.test(id) ? await getSaved("web-requests", id, user.id) : null;
  if (saved?.unread) await markRead(user.id, "web-requests", id);
  const unread = await unreadCounts(user.id);
  const r = saved?.item ?? null;

  return (
    <Shell department="luxhotel" subnav={luxhotelNav("web-requests", unread)}>
      <p className={s.back}><Link href="/luxhotel/web-requests">← All website requests</Link></p>
      {!r ? (
        <section className="panel"><p className="empty">This request isn&apos;t saved here.</p></section>
      ) : (
        <>
          <div className="pagehead">
            <div>
              <h1>{r.name ?? "No name"}</h1>
              <p className="muted">{r.property_name ?? "No property given"} · received {when(r.created_at)}</p>
            </div>
          </div>
          <section className="panel">
            <RequestBody r={r} />
          </section>
        </>
      )}
    </Shell>
  );
}
