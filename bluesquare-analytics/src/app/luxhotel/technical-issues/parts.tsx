import Link from "next/link";
import type { TechnicalIssue } from "@/lib/luxhotel-data";
import s from "../feeds.module.css";

const PRIORITY_TONE: Record<string, string> = { urgent: s.tagBad, critical: s.tagBad, high: s.tagBad, medium: s.tagWarn, normal: s.tagWarn };
const dueFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const due = (v: string) => (Number.isFinite(Date.parse(v)) ? dueFmt.format(new Date(v)) : v);

/** Priority and due date. */
export function IssueFlags({ t }: { t: TechnicalIssue }) {
  if (!t.priority && !t.due_date) return null;
  return (
    <p className={s.flags}>
      {t.priority && <span className={`${s.tag} ${PRIORITY_TONE[t.priority] ?? ""}`}>{t.priority[0].toUpperCase() + t.priority.slice(1)}</span>}
      {t.due_date && <span className={s.tag}>Due {due(t.due_date)}</span>}
    </p>
  );
}

/** Where it was reported from: the property (linked to its LuxHotel page), who, and which page. */
export function IssueSource({ t, property }: { t: TechnicalIssue; property: string | null }) {
  return (
    <>
      <p className={s.meta}>
        {t.hotel_id && property ? <Link href={`/luxhotel/${encodeURIComponent(t.hotel_id)}`}>{property}</Link> : property ?? "Unknown property"}
        {" · "}{t.reported_by.email ?? "Unknown reporter"}
      </p>
      {t.page_url && <p className={s.url}>Reported from {t.page_url}</p>}
    </>
  );
}

export const propertyOf = (t: TechnicalIssue, names: { byHotel: Map<string, string>; byVendor: Map<string, string> }) =>
  (t.hotel_id && names.byHotel.get(t.hotel_id)) || (t.vendor_id && names.byVendor.get(t.vendor_id)) || null;
