import type { ActivityRow } from "@/lib/stats";
import { duration, num } from "@/lib/format";

/** Server-rendered SVG chart: bars = page views, line = visitors. Hover a bar for details. */
export function BarChart({ rows, hourly }: { rows: ActivityRow[]; hourly: boolean }) {
  const W = 1000, H = 260, pad = { t: 16, r: 8, b: 28, l: 40 };
  const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
  const max = Math.max(1, ...rows.map((r) => r.views));
  const nice = niceMax(max);
  const step = innerW / Math.max(rows.length, 1);
  const barW = Math.max(2, Math.min(36, step * 0.62));
  const y = (v: number) => pad.t + innerH - (v / nice) * innerH;
  const x = (i: number) => pad.l + step * i + step / 2;
  const labelEvery = Math.ceil(rows.length / 12);
  const label = (b: string) => (hourly ? b.slice(11, 13) + "h" : b.slice(5).replace("-", "/"));
  const line = rows.map((r, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(r.visitors).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Activity chart: page views and visitors">
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <line x1={pad.l} x2={W - pad.r} y1={y(nice * f)} y2={y(nice * f)} className="chart__grid" />
          <text x={pad.l - 8} y={y(nice * f) + 4} textAnchor="end" className="chart__axis">
            {num(Math.round(nice * f))}
          </text>
        </g>
      ))}
      {rows.map((r, i) => (
        <g key={r.bucket} className="chart__col">
          <rect x={x(i) - step / 2} y={pad.t} width={step} height={innerH} className="chart__hit" />
          <rect x={x(i) - barW / 2} y={y(r.views)} width={barW} height={pad.t + innerH - y(r.views)} rx={3} className="chart__bar" />
          {i % labelEvery === 0 && (
            <text x={x(i)} y={H - 8} textAnchor="middle" className="chart__axis">
              {label(r.bucket)}
            </text>
          )}
          <title>{`${r.bucket}\n${num(r.views)} views · ${num(r.visitors)} visitors · ${num(r.clicks)} clicks · avg ${duration(r.avgSeconds)}`}</title>
        </g>
      ))}
      <path d={line} className="chart__line" />
    </svg>
  );
}

function niceMax(v: number) {
  const mag = 10 ** Math.floor(Math.log10(v));
  return [1, 2, 2.5, 5, 10].map((m) => m * mag).find((n) => n >= v) ?? v;
}
