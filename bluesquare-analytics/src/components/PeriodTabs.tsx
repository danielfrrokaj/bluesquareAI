import Link from "next/link";
import { PERIODS, type Period } from "@/lib/period";

/** Period presets plus a custom from/to range. `keep` carries other filters along. */
export function PeriodTabs({ base, current, keep = {} }: { base: string; current: Period; keep?: Record<string, string | undefined> }) {
  const qs = (extra: Record<string, string>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...keep, ...extra })) if (v) p.set(k, v);
    return `${base}?${p}`;
  };
  return (
    <div className="periodbar">
      <nav className="tabs" aria-label="Period">
        {(Object.keys(PERIODS) as (keyof typeof PERIODS)[]).map((key) => (
          <Link key={key} href={qs({ period: key })} className="tabs__link" aria-current={key === current.key ? "page" : undefined}>
            {PERIODS[key]}
          </Link>
        ))}
      </nav>
      <form action={base} className="customrange">
        {Object.entries(keep).map(([k, v]) => v && <input key={k} type="hidden" name={k} value={v} />)}
        <input type="hidden" name="period" value="custom" />
        <label>
          <span className="sr-only">From</span>
          <input type="date" name="from" defaultValue={current.from} required />
        </label>
        <span aria-hidden="true">–</span>
        <label>
          <span className="sr-only">To</span>
          <input type="date" name="to" defaultValue={current.to} required />
        </label>
        <button className="btn btn--small" aria-current={current.key === "custom" ? "true" : undefined}>
          Apply
        </button>
      </form>
    </div>
  );
}
