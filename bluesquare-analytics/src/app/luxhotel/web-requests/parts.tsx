import type { WebRequest } from "@/lib/luxhotel-data";
import s from "../feeds.module.css";

/** A website request's contact details and message, shown in the list and on its own page. */
export function RequestBody({ r }: { r: WebRequest }) {
  return (
    <>
      <p className={s.meta}>
        {r.email && <a href={`mailto:${r.email}`}>{r.email}</a>}
        {r.email && r.phone && " · "}
        {r.phone && <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`}>{r.phone}</a>}
        {!r.email && !r.phone && "No contact details"}
      </p>
      {r.message && <p className={s.body}>{r.message}</p>}
    </>
  );
}
