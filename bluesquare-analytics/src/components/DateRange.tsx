"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

/** From/To dates that apply as soon as both are valid, keeping the page's other filters. */
export function DateRange({ base, keep, from, to }: { base: string; keep: Record<string, string>; from: string; to: string }) {
  const router = useRouter();
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);
  const apply = () => {
    const f = fromRef.current?.value, t = toRef.current?.value;
    if (!f || !t || f > t) return;
    const p = new URLSearchParams(keep);
    p.set("period", "custom");
    p.set("from", f);
    p.set("to", t);
    router.push(`${base}?${p}`, { scroll: false });
  };
  return (
    <div className="pbar__range" key={`${from}|${to}`}>
      <label className="pbar__date">
        <span className="sr-only">From</span>
        <input ref={fromRef} type="date" defaultValue={from} max={to} onChange={apply} />
      </label>
      <span aria-hidden="true">–</span>
      <label className="pbar__date">
        <span className="sr-only">To</span>
        <input ref={toRef} type="date" defaultValue={to} min={from} onChange={apply} />
      </label>
    </div>
  );
}
