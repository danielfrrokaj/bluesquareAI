import { compact, money } from "@/lib/format";
import { monthLabel, monthShortLabel } from "@/lib/period";

export type MoneyBar = { month: string; income: number; expense: number; forecast?: boolean };

/**
 * Server-rendered SVG: income and expense side by side per month. Forecast months are hatched.
 * Hover a month for the exact numbers.
 */
export function MoneyChart({ rows, label = "Income and expenses per month" }: { rows: MoneyBar[]; label?: string }) {
  const W = 1000, H = 280, pad = { t: 16, r: 8, b: 30, l: 56 };
  const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
  const max = niceMax(Math.max(1, ...rows.flatMap((r) => [r.income, r.expense])));
  const step = innerW / Math.max(rows.length, 1);
  const barW = Math.max(3, Math.min(26, step * 0.32));
  const gap = 2;
  const y = (v: number) => pad.t + innerH - (v / max) * innerH;
  const x = (i: number) => pad.l + step * i + step / 2;
  const base = pad.t + innerH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={label}>
      <defs>
        <pattern id="hatch-income" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" className="mchart__hatchbg" />
          <line x1="0" y1="0" x2="0" y2="6" className="mchart__hatch mchart__hatch--income" />
        </pattern>
        <pattern id="hatch-expense" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(135)">
          <rect width="6" height="6" className="mchart__hatchbg" />
          <line x1="0" y1="0" x2="0" y2="6" className="mchart__hatch mchart__hatch--expense" />
        </pattern>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <line x1={pad.l} x2={W - pad.r} y1={y(max * f)} y2={y(max * f)} className="chart__grid" />
          <text x={pad.l - 8} y={y(max * f) + 4} textAnchor="end" className="chart__axis">
            {compact(max * f)}
          </text>
        </g>
      ))}
      {rows.map((r, i) => (
        <g key={r.month} className="chart__col">
          <rect x={x(i) - step / 2} y={pad.t} width={step} height={innerH} className="chart__hit" />
          <path d={bar(x(i) - barW - gap / 2, y(r.income), barW, base)} className={r.forecast ? "mchart__income--forecast" : "mchart__income"} />
          <path d={bar(x(i) + gap / 2, y(r.expense), barW, base)} className={r.forecast ? "mchart__expense--forecast" : "mchart__expense"} />
          <text x={x(i)} y={H - 10} textAnchor="middle" className={`chart__axis${r.forecast ? " mchart__axis--forecast" : ""}`}>
            {rows.length > 13 && i % 2 ? "" : monthShortLabel(r.month)}
          </text>
          <title>
            {`${monthLabel(r.month)}${r.forecast ? " (forecast)" : ""}\nIncome ${money(r.income)}\nExpenses ${money(r.expense)}\nNet ${money(r.income - r.expense)}`}
          </title>
        </g>
      ))}
    </svg>
  );
}

/** Bar with 4px rounded top corners, flat on the baseline. */
function bar(x: number, top: number, w: number, base: number) {
  const h = base - top;
  if (h <= 0) return "";
  const r = Math.min(4, w / 2, h);
  return `M${x},${base}V${top + r}Q${x},${top} ${x + r},${top}H${x + w - r}Q${x + w},${top} ${x + w},${top + r}V${base}Z`;
}

function niceMax(v: number) {
  const mag = 10 ** Math.floor(Math.log10(v));
  return [1, 2, 2.5, 5, 10].map((m) => m * mag).find((n) => n >= v) ?? v;
}
