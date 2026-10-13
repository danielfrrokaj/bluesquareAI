import Link from "next/link";
import { addMonths, monthLabel, monthOf, PERIODS, today, type Period } from "@/lib/period";
import { DateRange } from "./DateRange";
import { FinIcon } from "./FinIcon";

/**
 * Period picker: a month stepper, a From/To range (applies on change) and presets.
 * `keep` carries the page's other filters along.
 */
export function PeriodTabs({ base, current, keep = {} }: { base: string; current: Period; keep?: Record<string, string | undefined> }) {
  const kept = Object.fromEntries(Object.entries(keep).filter((e): e is [string, string] => !!e[1]));
  const qs = (extra: Record<string, string>) => `${base}?${new URLSearchParams({ ...kept, ...extra })}`;
  const thisMonth = monthOf(today());
  const shown = current.month ?? monthOf(current.to);
  const prev = addMonths(shown, -1), next = addMonths(shown, 1);
  return (
    <div className="pbar">
      <div className="tabs pbar__month">
        <Link href={qs({ month: prev })} className="tabs__link" aria-label={`Previous month, ${monthLabel(prev)}`} scroll={false}><FinIcon name="prev" size={16} /></Link>
        <span className="pbar__label" aria-live="polite">{current.month ? monthLabel(current.month) : current.label}</span>
        {next <= thisMonth ? (
          <Link href={qs({ month: next })} className="tabs__link" aria-label={`Next month, ${monthLabel(next)}`} scroll={false}><FinIcon name="next" size={16} /></Link>
        ) : (
          <span className="tabs__link pbar__off" aria-hidden="true"><FinIcon name="next" size={16} /></span>
        )}
      </div>
      <DateRange base={base} keep={kept} from={current.from === "2000-01-01" ? "" : current.from} to={current.to} />
      <nav className="tabs" aria-label="Period">
        {(Object.keys(PERIODS) as (keyof typeof PERIODS)[]).map((key) => (
          <Link key={key} href={qs({ period: key })} className="tabs__link" aria-current={key === current.key ? "page" : undefined} scroll={false}>
            {PERIODS[key]}
          </Link>
        ))}
      </nav>
    </div>
  );
}
