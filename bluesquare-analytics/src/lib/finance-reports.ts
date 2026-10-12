import "server-only";
import { query } from "./db";
import type { TxType } from "./finance";
import { addMonths, daysInMonth, monthOf, monthRange, today, type Period } from "./period";
import { forecast, projectMonth, recentAverage, shareByDay } from "./forecast";

export type MonthRow = { month: string; income: number; expense: number };

/** Income and expense per month, empty months filled in. */
export async function monthlyTotals(from: string, to: string): Promise<MonthRow[]> {
  const rows = await query<MonthRow>(
    `select to_char(occurred_on, 'YYYY-MM') as month,
            coalesce(sum(amount) filter (where type = 'income'), 0)::float8 as income,
            coalesce(sum(amount) filter (where type = 'expense'), 0)::float8 as expense
     from fin_transactions where occurred_on >= $1::date and occurred_on < ($2::date + interval '1 month')
     group by 1`,
    [`${from}-01`, `${to}-01`],
  );
  const byMonth = new Map(rows.map((r) => [r.month, r]));
  return monthRange(from, to).map((month) => byMonth.get(month) ?? { month, income: 0, expense: 0 });
}

export type AccountReport = { id: string; name: string; logo: number | null; archived: boolean; opening: number; balance: number; income: number; expense: number; count: number };

/** Balance of each virtual account (all time) plus its income and expense inside the period. */
export async function accountReport(p: Period): Promise<AccountReport[]> {
  return query<AccountReport>(
    `select a.id, a.name, case when a.logo is null then null else a.logo_version end as logo, a.archived, a.opening_balance::float8 as opening,
            (a.opening_balance + coalesce(sum(case when t.type = 'income' then t.amount else -t.amount end), 0))::float8 as balance,
            coalesce(sum(t.amount) filter (where t.type = 'income' and t.occurred_on between $1::date and $2::date), 0)::float8 as income,
            coalesce(sum(t.amount) filter (where t.type = 'expense' and t.occurred_on between $1::date and $2::date), 0)::float8 as expense,
            (count(t.id) filter (where t.occurred_on between $1::date and $2::date))::int as count
     from fin_accounts a left join fin_transactions t on t.account_id = a.id
     group by a.id
     having not a.archived or count(t.id) > 0
     order by a.archived, a.name`,
    [p.from, p.to],
  );
}

/** Movements with no virtual account in the period (shown as its own row so totals add up). */
export async function unassignedAccountTotals(p: Period): Promise<{ income: number; expense: number; count: number }> {
  const [row] = await query<{ income: number; expense: number; count: number }>(
    `select coalesce(sum(amount) filter (where type = 'income'), 0)::float8 as income,
            coalesce(sum(amount) filter (where type = 'expense'), 0)::float8 as expense, count(*)::int as count
     from fin_transactions where account_id is null and occurred_on between $1::date and $2::date`,
    [p.from, p.to],
  );
  return row;
}

export type CategoryReport = { id: string | null; name: string; total: number; count: number; previous: number; budget: number | null };

/**
 * Totals per category of one type in the period, compared with the same-length period just before it.
 * Uncategorised transactions come back as one row with id null.
 */
export async function categoryReport(type: TxType, p: Period): Promise<CategoryReport[]> {
  return query<CategoryReport>(
    `with bounds as (select $2::date as f, $3::date as t, ($3::date - $2::date + 1) as len)
     select c.id, coalesce(c.name, 'Uncategorised') as name,
            coalesce(sum(x.amount) filter (where x.occurred_on between b.f and b.t), 0)::float8 as total,
            (count(*) filter (where x.occurred_on between b.f and b.t))::int as count,
            coalesce(sum(x.amount) filter (where x.occurred_on between b.f - b.len and b.f - 1), 0)::float8 as previous,
            c.monthly_budget::float8 as budget
     from bounds b
     join fin_transactions x on x.type = $1 and x.occurred_on between b.f - b.len and b.t
     left join fin_categories c on c.id = x.category_id
     group by c.id, c.name, c.monthly_budget
     having coalesce(sum(x.amount) filter (where x.occurred_on between b.f and b.t), 0) > 0
     order by total desc`,
    [type, p.from, p.to],
  );
}

export type UserReport = { id: string | null; name: string; income: number; expense: number; count: number };

export async function userReport(p: Period): Promise<UserReport[]> {
  return query<UserReport>(
    `select u.id, coalesce(u.name, case when bool_or(t.source = 'bluebill') then 'BlueBill (synced)' else 'Unassigned' end) as name,
            coalesce(sum(t.amount) filter (where t.type = 'income'), 0)::float8 as income,
            coalesce(sum(t.amount) filter (where t.type = 'expense'), 0)::float8 as expense, count(*)::int as count
     from fin_transactions t left join users u on u.id = t.user_id
     where t.occurred_on between $1::date and $2::date
     group by u.id, u.name order by count desc`,
    [p.from, p.to],
  );
}

// ---------- Predictions ----------

const HISTORY_MONTHS = 12;
const HORIZON = 3;

export type Projection = {
  month: string; // current month
  day: number;
  days: number;
  actual: { income: number; expense: number };
  projected: { income: number | null; expense: number | null };
  next: { month: string; income: number; expense: number }[]; // the following HORIZON months
  history: MonthRow[]; // complete months, oldest first
  enoughHistory: boolean;
};

/** Where this month is heading and the next three months, from the last 12 complete months. */
export async function projection(): Promise<Projection> {
  const t = today();
  const month = monthOf(t);
  const day = Number(t.slice(8, 10));
  const days = daysInMonth(month);
  const [rows, [early]] = await Promise.all([
    monthlyTotals(addMonths(month, -HISTORY_MONTHS), month),
    // How much of past months' totals was already booked by this day of the month.
    query<{ income: number; expense: number }>(
      `select coalesce(sum(amount) filter (where type = 'income'), 0)::float8 as income,
              coalesce(sum(amount) filter (where type = 'expense'), 0)::float8 as expense
       from fin_transactions
       where occurred_on >= $1::date and occurred_on < $2::date and extract(day from occurred_on) <= $3`,
      [`${addMonths(month, -HISTORY_MONTHS)}-01`, `${month}-01`, day],
    ),
  ]);
  const history = rows.slice(0, -1);
  const current = rows[rows.length - 1];
  const inc = forecast(history.map((r) => r.income), HORIZON + 1);
  const exp = forecast(history.map((r) => r.expense), HORIZON + 1);
  const sum = (k: "income" | "expense") => history.reduce((s, r) => s + r[k], 0);
  return {
    month,
    day,
    days,
    actual: { income: current.income, expense: current.expense },
    projected: {
      income: projectMonth(current.income, inc[0], shareByDay(early.income, sum("income"), day, days), day, days),
      expense: projectMonth(current.expense, exp[0], shareByDay(early.expense, sum("expense"), day, days), day, days),
    },
    next: inc.length && exp.length
      ? Array.from({ length: HORIZON }, (_, i) => ({ month: addMonths(month, i + 1), income: inc[i + 1], expense: exp[i + 1] }))
      : [],
    history,
    enoughHistory: inc.length > 0 && exp.length > 0,
  };
}

export type CategoryOutlook = {
  id: string | null;
  name: string;
  soFar: number; // this month
  average: number; // last 3 complete months
  projected: number | null; // this month
  nextMonth: number | null;
  budget: number | null;
};

/** Expense outlook per category for this month and next. */
export async function expenseOutlook(): Promise<CategoryOutlook[]> {
  const t = today();
  const month = monthOf(t);
  const first = addMonths(month, -HISTORY_MONTHS);
  const months = monthRange(first, addMonths(month, -1));
  const day = Number(t.slice(8, 10));
  const days = daysInMonth(month);
  const rows = await query<{ id: string | null; name: string; month: string; total: number; early: number; budget: number | null }>(
    `select c.id, coalesce(c.name, 'Uncategorised') as name, to_char(x.occurred_on, 'YYYY-MM') as month,
            sum(x.amount)::float8 as total, coalesce(sum(x.amount) filter (where extract(day from x.occurred_on) <= $2), 0)::float8 as early,
            c.monthly_budget::float8 as budget
     from fin_transactions x left join fin_categories c on c.id = x.category_id
     where x.type = 'expense' and x.occurred_on >= $1::date
     group by c.id, c.name, 3, c.monthly_budget`,
    [`${first}-01`, day],
  );
  const groups = new Map<string, { id: string | null; name: string; budget: number | null; byMonth: Map<string, number>; early: number; total: number }>();
  for (const r of rows) {
    const key = r.id ?? "none";
    const g = groups.get(key) ?? { id: r.id, name: r.name, budget: r.budget, byMonth: new Map(), early: 0, total: 0 };
    g.byMonth.set(r.month, r.total);
    if (r.month !== month) {
      g.early += r.early;
      g.total += r.total;
    }
    groups.set(key, g);
  }
  return [...groups.values()]
    .map((g) => {
      const series = months.map((m) => g.byMonth.get(m) ?? 0);
      const f = forecast(series, 2);
      const soFar = g.byMonth.get(month) ?? 0;
      return {
        id: g.id,
        name: g.name,
        soFar,
        average: recentAverage(series),
        projected: projectMonth(soFar, f[0], shareByDay(g.early, g.total, day, days), day, days),
        nextMonth: f[1] ?? null,
        budget: g.budget,
      };
    })
    .filter((c) => c.soFar > 0 || c.average > 0 || (c.nextMonth ?? 0) > 0)
    .sort((a, b) => (b.projected ?? b.soFar) - (a.projected ?? a.soFar));
}
