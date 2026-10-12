import Link from "next/link";
import { RANGES, type RangeKey } from "@/lib/stats";

/** `keep` is extra query string to carry over, e.g. active filters ("country=AL"). */
export function RangeTabs({ base, current, keep = "" }: { base: string; current: RangeKey; keep?: string }) {
  return (
    <nav className="tabs" aria-label="Date range">
      {(Object.keys(RANGES) as RangeKey[]).map((key) => (
        <Link key={key} href={`${base}?range=${key}${keep ? `&${keep}` : ""}`} className="tabs__link" aria-current={key === current ? "page" : undefined}>
          {RANGES[key].label}
        </Link>
      ))}
    </nav>
  );
}
