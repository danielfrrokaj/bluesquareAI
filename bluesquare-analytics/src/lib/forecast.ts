// Forecasting for monthly finance series. Pure functions, no database access.
//
// Method: damped-trend exponential smoothing (Holt); for series with empty months, the recent average. Recent months weigh more than old ones,
// a trend is followed but flattens out over the horizon, so a few unusual months can't
// project runaway numbers. Results are never negative.

const ALPHA = 0.5; // level: how fast it reacts to the latest month
const BETA = 0.2; // trend: how fast the trend adapts
const PHI = 0.85; // damping: how quickly the trend fades in the future

/** Months needed before a forecast is shown. */
export const MIN_HISTORY = 2;

/**
 * history: complete months, oldest first. Leading empty months (before the books started) are ignored.
 * Returns `horizon` forecasts, or [] when there is too little history.
 */
export function forecast(history: number[], horizon: number): number[] {
  const start = history.findIndex((v) => v !== 0);
  const h = start < 0 ? [] : history.slice(start);
  if (h.length < MIN_HISTORY) return [];

  // On-and-off spending (empty months among the recent ones) has no trend to follow: use its average.
  const recent = h.slice(-6);
  if (recent.some((v) => v === 0)) return Array(horizon).fill(recentAverage(recent, recent.length));

  // The trend starts flat and is learned from the data: the first month is often partial
  // (the books started mid-month), and its jump to the next month is not a real trend.
  let level = h[0];
  let trend = 0;
  for (let t = 1; t < h.length; t++) {
    const prev = level;
    level = ALPHA * h[t] + (1 - ALPHA) * (prev + PHI * trend);
    trend = BETA * (level - prev) + (1 - BETA) * PHI * trend;
  }

  const out: number[] = [];
  let damp = 0;
  for (let k = 1; k <= horizon; k++) {
    damp += PHI ** k;
    out.push(Math.max(0, level + damp * trend));
  }
  return out;
}

/**
 * Expected month total, given what's booked so far this month.
 * `doneShare` is the part of a month's total that is usually booked by today (from history), so
 * front-loaded costs such as rent on the 1st aren't counted twice. Without a forecast, the run-rate
 * so far is used (only from day 7, earlier it's too noisy).
 */
export function projectMonth(actualSoFar: number, expectedMonth: number | undefined, doneShare: number, day: number, days: number): number | null {
  if (expectedMonth !== undefined) return actualSoFar + expectedMonth * Math.min(1, Math.max(0, 1 - doneShare));
  if (day >= 7) return (actualSoFar / day) * days;
  return null;
}

/** Share of the totals booked by a day of the month, e.g. (900, 1000) -> 0.9; the calendar share when there's no history. */
export function shareByDay(bookedByDay: number, total: number, day: number, days: number): number {
  return total > 0 ? bookedByDay / total : day / days;
}

/** Average of the last n values (fewer if there aren't n). */
export function recentAverage(values: number[], n = 3): number {
  const last = values.slice(-n);
  return last.length ? last.reduce((s, v) => s + v, 0) / last.length : 0;
}
