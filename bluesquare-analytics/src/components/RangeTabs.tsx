import Link from "next/link";
import { RANGES, type RangeKey } from "@/lib/stats";

export function RangeTabs({ base, current }: { base: string; current: RangeKey }) {
  return (
    <nav className="tabs" aria-label="Date range">
      {(Object.keys(RANGES) as RangeKey[]).map((key) => (
        <Link key={key} href={`${base}?range=${key}`} className="tabs__link" aria-current={key === current ? "page" : undefined}>
          {RANGES[key].label}
        </Link>
      ))}
    </nav>
  );
}
