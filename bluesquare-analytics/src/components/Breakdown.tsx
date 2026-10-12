import Link from "next/link";
import { num, pct } from "@/lib/format";

type Row = { key: string; label: React.ReactNode; value: number; extra?: React.ReactNode; href?: string; active?: boolean };

/**
 * Ranked list with proportional bars, used for countries, referrers, devices…
 * Rows with an `href` are links (e.g. to filter the report by that row); `active` marks the applied filter.
 */
export function Breakdown({
  title, rows, valueLabel, empty = "No data yet", format = num, share = false,
}: { title: string; rows: Row[]; valueLabel: string; empty?: string; format?: (n: number) => string; share?: boolean }) {
  const total = rows.reduce((s, r) => s + r.value, 0);
  return (
    <section className="panel">
      <header className="panel__head">
        <h2>{title}</h2>
        <span>{valueLabel}</span>
      </header>
      {rows.length === 0 ? (
        <p className="empty">{empty}</p>
      ) : (
        <ul className="breakdown">
          {rows.map((r) => {
            const body = (
              <>
                <span className="breakdown__bar" style={{ width: `${pct(r.value, total)}%` }} aria-hidden="true" />
                <span className="breakdown__label">{r.label}</span>
                {r.extra && <span className="breakdown__extra">{r.extra}</span>}
                {share && <span className="breakdown__extra">{pct(r.value, total)}%</span>}
                <span className="breakdown__value">{format(r.value)}</span>
              </>
            );
            return (
              <li key={r.key} className={r.active ? "is-active" : undefined}>
                {r.href ? (
                  <Link href={r.href} className="breakdown__link" scroll={false} aria-current={r.active ? "true" : undefined}
                    title={r.active ? "Remove this filter" : "Filter the report by this"}>
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
