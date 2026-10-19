import Link from "next/link";
import { savedHotels } from "@/lib/lux-properties";
import type { SyncState } from "@/lib/lux-feeds";
import type { FeedKind } from "@/lib/luxhotel-data";
import { TZ } from "@/lib/period";
import { readAll } from "@/app/notifications/actions";
import s from "./feeds.module.css";

// Shared parts of the LuxHotel record pages (AI chats, website requests, technical issues), read from our database.

export const when = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: TZ() }).format(new Date(iso)) : "–";

/** Property names by hotel id and by account (vendor) id, from the saved properties. Empty when there are none. */
export async function propertyNames() {
  const read = await savedHotels();
  const hotels = read.data?.hotels ?? [];
  return {
    byHotel: new Map(hotels.map((h) => [h.id, h.name])),
    byVendor: new Map(hotels.filter((h) => h.vendor_id).map((h) => [h.vendor_id, h.name])),
  };
}

const PROBLEM: Record<NonNullable<SyncState["error"]>, string> = {
  unconfigured: "LuxHotel isn't connected (LUXHOTEL_API_KEY), so nothing new can arrive.",
  not_published: "LuxHotel hasn't published this data yet. Records appear here, and in your notifications, as soon as their update is live.",
  rejected: "LuxHotel refused the API key. Ask an administrator to check it. What was already saved is shown.",
  unavailable: "LuxHotel couldn't be reached on the last try; it's retried every minute. What was already saved is shown.",
};

/** Why nothing new may be arriving. Records already saved stay listed either way. */
export function FeedNotice({ state }: { state: SyncState }) {
  const problem = !state.configured ? "unconfigured" : state.error;
  if (!problem) return null;
  return (
    <div className={s.notice} role="status">
      <p>{PROBLEM[problem]}</p>
    </div>
  );
}

/** "Mark all as read" for one feed. */
export function ReadAllButton({ kind, unread }: { kind: FeedKind; unread: number }) {
  if (!unread) return null;
  return (
    <form action={readAll}>
      <input type="hidden" name="kind" value={kind} />
      <button className="btn btn--small">Mark all as read ({unread})</button>
    </form>
  );
}

export const NewDot = () => <span className={s.newDot} title="Unread"><span className="sr-only">Unread</span></span>;

/** Newer and older pages of 50. */
export function Pager({ base, page, more }: { base: string; page: number; more: boolean }) {
  if (page === 1 && !more) return null;
  return (
    <nav className={s.pager} aria-label="Pages">
      {page > 1 ? <Link href={page === 2 ? base : `${base}?page=${page - 1}`} className="btn btn--small">Newer</Link> : <span />}
      {more && <Link href={`${base}?page=${page + 1}`} className="btn btn--small">Older</Link>}
    </nav>
  );
}

export const pageOf = (sp: { page?: string }) => Math.min(1000, Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1));
