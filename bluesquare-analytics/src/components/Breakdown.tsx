import { num, pct } from "@/lib/format";

type Row = { key: string; label: React.ReactNode; value: number; extra?: React.ReactNode };

/** Ranked list with proportional bars, used for countries, referrers, devices… */
export function Breakdown({ title, rows, valueLabel, empty = "No data yet" }: { title: string; rows: Row[]; valueLabel: string; empty?: string }) {
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
          {rows.map((r) => (
            <li key={r.key}>
              <span className="breakdown__bar" style={{ width: `${pct(r.value, total)}%` }} aria-hidden="true" />
              <span className="breakdown__label">{r.label}</span>
              {r.extra && <span className="breakdown__extra">{r.extra}</span>}
              <span className="breakdown__value">{num(r.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
