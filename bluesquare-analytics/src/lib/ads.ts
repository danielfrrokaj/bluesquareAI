import "server-only";
import { randomUUID } from "node:crypto";
import { query } from "./db";
import { BASE_CURRENCY, currencyCode, ensureCategory, getRates, toBase } from "./finance";
import { isDate } from "./period";

// Meta ads entered by hand from Ads Manager. Every results row's spend is mirrored as a Finance
// expense (source 'meta_ads', external_id 'meta_ads:<result id>') in the "Advertising" category,
// so Finance reports, budgets and forecasts include ad spend without entering it twice.

export const OBJECTIVES = {
  awareness: { label: "Awareness", result: "Reach / ad recall" },
  traffic: { label: "Traffic", result: "Link clicks / landing page views" },
  engagement: { label: "Engagement", result: "Engagements / messages" },
  leads: { label: "Leads", result: "Leads" },
  app: { label: "App promotion", result: "App installs" },
  sales: { label: "Sales", result: "Purchases" },
} as const;
export type Objective = keyof typeof OBJECTIVES;

export const PLACEMENTS = {
  facebook: { label: "Facebook", short: "FB", color: "#1877f2" },
  instagram: { label: "Instagram", short: "IG", color: "#d62976" },
  messenger: { label: "Messenger", short: "MSG", color: "#0099ff" },
  audience_network: { label: "Audience Network", short: "AN", color: "#4b5563" },
} as const;
export type Placement = keyof typeof PLACEMENTS;

export const AD_STATUSES = { draft: "Draft", active: "Active", paused: "Paused", completed: "Completed" } as const;
export type AdStatus = keyof typeof AD_STATUSES;

export const AD_CATEGORY = "Advertising";
export const AD_SOURCE = "meta_ads";
const COUNTERPARTY = "Meta Platforms Ireland Ltd.";
const txId = (resultId: string) => `${AD_SOURCE}:${resultId}`;

const is = <T extends object>(map: T) => (v: unknown): v is keyof T => typeof v === "string" && v in map;
export const isObjective = is(OBJECTIVES);
export const isPlacement = is(PLACEMENTS);
export const isAdStatus = is(AD_STATUSES);

// ---------- Ads ----------

export type Ad = {
  id: string; name: string; campaign: string; objective: Objective; placements: Placement[]; status: AdStatus;
  start_on: string | null; end_on: string | null; budget_type: "daily" | "lifetime"; budget: number | null; currency: string;
  ads_manager_url: string | null; notes: string; account_id: string | null; account_name: string | null;
  created_by: string | null; author: string | null;
};

/** An ad with its totals for the selected period (spend in EUR). */
export type AdWithStats = Ad & Totals & { entries: number };

export type Totals = { spend: number; impressions: number; reach: number; clicks: number; results: number };

const AD_SELECT = `
  select a.id, a.name, a.campaign, a.objective, a.placements, a.status,
         to_char(a.start_on, 'YYYY-MM-DD') as start_on, to_char(a.end_on, 'YYYY-MM-DD') as end_on,
         a.budget_type, a.budget::float8 as budget, a.currency, a.ads_manager_url, a.notes,
         a.account_id, fa.name as account_name, a.created_by, u.name as author
  from mk_ads a
  left join fin_accounts fa on fa.id = a.account_id
  left join users u on u.id = a.created_by`;

export async function getAd(id: string): Promise<Ad | null> {
  const [row] = await query<Ad>(`${AD_SELECT} where a.id = $1`, [id]);
  return row ?? null;
}

/**
 * All ads with results that overlap [from, to]. Spend is the EUR amount booked in Finance,
 * so totals match Finance reports exactly (including the exchange rate used at the time).
 */
export async function listAdsWithStats(from: string, to: string): Promise<AdWithStats[]> {
  return query<AdWithStats>(
    `with r as (
       select r.ad_id, count(*)::int as entries,
              coalesce(sum(t.amount), 0)::float8 as spend,
              coalesce(sum(r.impressions), 0)::int as impressions, coalesce(sum(r.reach), 0)::int as reach,
              coalesce(sum(r.clicks), 0)::int as clicks, coalesce(sum(r.results), 0)::int as results
       from mk_ad_results r
       left join fin_transactions t on t.external_id = '${AD_SOURCE}:' || r.id
       where r.period_to >= $1::date and r.period_from <= $2::date
       group by r.ad_id)
     ${AD_SELECT.replace("from mk_ads a", "from mk_ads a left join r on r.ad_id = a.id")
       .replace("a.created_by, u.name as author", `a.created_by, u.name as author, coalesce(r.entries, 0) as entries,
         coalesce(r.spend, 0) as spend, coalesce(r.impressions, 0) as impressions, coalesce(r.reach, 0) as reach,
         coalesce(r.clicks, 0) as clicks, coalesce(r.results, 0) as results`)}
     order by case a.status when 'active' then 0 when 'paused' then 1 when 'draft' then 2 else 3 end, a.start_on desc nulls last, a.name`,
    [from, to],
  );
}

export type AdInput = {
  name: string; campaign: string; objective: Objective; placements: Placement[]; status: AdStatus;
  startOn: string | null; endOn: string | null; budgetType: "daily" | "lifetime"; budget: number | null; currency: string;
  adsManagerUrl: string | null; notes: string; accountId: string | null;
};

export async function createAd(a: AdInput, userId: string): Promise<string> {
  const id = randomUUID();
  await query(
    `insert into mk_ads (id, name, campaign, objective, placements, status, start_on, end_on, budget_type, budget, currency,
                         ads_manager_url, notes, account_id, created_by)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
    [id, a.name, a.campaign, a.objective, a.placements, a.status, a.startOn, a.endOn, a.budgetType, a.budget, a.currency,
      a.adsManagerUrl, a.notes, a.accountId, userId],
  );
  return id;
}

/** The currency can't change once results exist: their amounts were entered in it. */
export async function updateAd(id: string, a: AdInput) {
  await query(
    `update mk_ads set name = $2, campaign = $3, objective = $4, placements = $5, status = $6, start_on = $7, end_on = $8,
            budget_type = $9, budget = $10, currency = $11, ads_manager_url = $12, notes = $13, account_id = $14
     where id = $1`,
    [id, a.name, a.campaign, a.objective, a.placements, a.status, a.startOn, a.endOn, a.budgetType, a.budget, a.currency,
      a.adsManagerUrl, a.notes, a.accountId],
  );
  // Keep the booked expenses' descriptions in step with the ad's name.
  for (const r of await listResults(id)) await query("update fin_transactions set description = $2 where external_id = $1", [txId(r.id), describe(a.name, r)]);
}

/** Deletes the ad, its results and the expenses they booked in Finance. */
export async function deleteAd(id: string) {
  await query(
    `delete from fin_transactions where external_id in (select '${AD_SOURCE}:' || id from mk_ad_results where ad_id = $1)`,
    [id],
  );
  await query("delete from mk_ads where id = $1", [id]);
}

export const hasResults = async (adId: string) => (await query("select 1 from mk_ad_results where ad_id = $1 limit 1", [adId])).length > 0;

// ---------- Results ----------

export type AdResult = {
  id: string; ad_id: string; period_from: string; period_to: string; spend: number; currency: string;
  impressions: number; reach: number; clicks: number; results: number;
  spend_eur: number | null; // as booked in Finance
  transaction_id: string | null;
};

export const listResults = (adId: string) =>
  query<AdResult>(
    `select r.id, r.ad_id, to_char(r.period_from, 'YYYY-MM-DD') as period_from, to_char(r.period_to, 'YYYY-MM-DD') as period_to,
            r.spend::float8 as spend, r.currency, r.impressions, r.reach, r.clicks, r.results,
            t.amount::float8 as spend_eur, t.id as transaction_id
     from mk_ad_results r left join fin_transactions t on t.external_id = '${AD_SOURCE}:' || r.id
     where r.ad_id = $1 order by r.period_to desc, r.created_at desc`,
    [adId],
  );

export async function getResult(id: string): Promise<(AdResult & { created_by: string | null }) | null> {
  const [row] = await query<AdResult & { created_by: string | null }>(
    `select r.id, r.ad_id, to_char(r.period_from, 'YYYY-MM-DD') as period_from, to_char(r.period_to, 'YYYY-MM-DD') as period_to,
            r.spend::float8 as spend, r.currency, r.impressions, r.reach, r.clicks, r.results, r.created_by,
            null::float8 as spend_eur, null::text as transaction_id
     from mk_ad_results r where r.id = $1`,
    [id],
  );
  return row ?? null;
}

export type ResultInput = { periodFrom: string; periodTo: string; spend: number; impressions: number; reach: number; clicks: number; results: number };

const describe = (adName: string, r: { period_from?: string; period_to?: string; periodFrom?: string; periodTo?: string }) => {
  const from = r.period_from ?? r.periodFrom!, to = r.period_to ?? r.periodTo!;
  return `Meta Ads · ${adName} (${from === to ? from : `${from} – ${to}`})`.slice(0, 300);
};

/**
 * Adds a results row and books its spend as a Finance expense in EUR.
 * Returns an error message when the ad's currency has no exchange rate yet.
 */
export async function addResult(ad: Ad, r: ResultInput, userId: string): Promise<string | null> {
  const converted = toBase(r.spend, ad.currency, await getRates());
  if (!converted) return `There's no ${ad.currency} rate yet. An admin can add it in Finance → Settings → Currency rates.`;
  const id = randomUUID();
  await query(
    `insert into mk_ad_results (id, ad_id, period_from, period_to, spend, currency, impressions, reach, clicks, results, created_by)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [id, ad.id, r.periodFrom, r.periodTo, r.spend, ad.currency, r.impressions, r.reach, r.clicks, r.results, userId],
  );
  const categoryId = await ensureCategory("expense", AD_CATEGORY);
  const foreign = ad.currency !== BASE_CURRENCY;
  await query(
    `insert into fin_transactions (id, type, amount, occurred_on, description, counterparty, account_id, category_id, user_id, created_by,
                                   source, external_id, currency, original_amount, fx_rate)
     values ($1, 'expense', $2, $3, $4, $5, $6, $7, $8, $8, '${AD_SOURCE}', $9, $10, $11, $12)
     on conflict (external_id) do nothing`,
    [randomUUID(), converted.amount, r.periodTo, describe(ad.name, r), COUNTERPARTY, ad.account_id, categoryId, userId, txId(id),
      ad.currency, foreign ? r.spend : null, foreign ? converted.rate : null],
  );
  return null;
}

/** Updates a results row and its Finance expense. The expense's account, category and user stay as booked in Finance. */
export async function updateResult(ad: Ad, resultId: string, r: ResultInput): Promise<string | null> {
  const converted = toBase(r.spend, ad.currency, await getRates());
  if (!converted) return `There's no ${ad.currency} rate yet. An admin can add it in Finance → Settings → Currency rates.`;
  await query(
    `update mk_ad_results set period_from = $2, period_to = $3, spend = $4, impressions = $5, reach = $6, clicks = $7, results = $8
     where id = $1`,
    [resultId, r.periodFrom, r.periodTo, r.spend, r.impressions, r.reach, r.clicks, r.results],
  );
  const foreign = ad.currency !== BASE_CURRENCY;
  await query(
    `update fin_transactions set amount = $2, occurred_on = $3, description = $4, currency = $5, original_amount = $6, fx_rate = $7,
            updated_at = now()
     where external_id = $1`,
    [txId(resultId), converted.amount, r.periodTo, describe(ad.name, r), ad.currency, foreign ? r.spend : null, foreign ? converted.rate : null],
  );
  return null;
}

export async function deleteResult(resultId: string) {
  await query("delete from fin_transactions where external_id = $1", [txId(resultId)]);
  await query("delete from mk_ad_results where id = $1", [resultId]);
}

/** Ad id behind a Finance transaction booked from Ads, for linking back from Finance. */
export async function adForTransaction(externalId: string): Promise<{ id: string; name: string } | null> {
  if (!externalId.startsWith(`${AD_SOURCE}:`)) return null;
  const [row] = await query<{ id: string; name: string }>(
    "select a.id, a.name from mk_ad_results r join mk_ads a on a.id = r.ad_id where r.id = $1",
    [externalId.slice(AD_SOURCE.length + 1)],
  );
  return row ?? null;
}

// ---------- Metrics ----------

export const sumTotals = (rows: Totals[]): Totals =>
  rows.reduce((t, r) => ({
    spend: t.spend + r.spend, impressions: t.impressions + r.impressions, reach: t.reach + r.reach,
    clicks: t.clicks + r.clicks, results: t.results + r.results,
  }), { spend: 0, impressions: 0, reach: 0, clicks: 0, results: 0 });

/** Ratios shown in Ads Manager; null when the denominator is 0. */
export function metrics(t: Totals) {
  return {
    ctr: t.impressions ? (t.clicks / t.impressions) * 100 : null, // %
    cpc: t.clicks ? t.spend / t.clicks : null,
    cpm: t.impressions ? (t.spend / t.impressions) * 1000 : null,
    costPerResult: t.results ? t.spend / t.results : null,
  };
}

// ---------- Form parsing ----------

/** "12,000.50" or "12000,5" -> 12000.5; null when not a number. */
export function parseAmount(raw: string): number | null {
  const s = raw.replace(/\s/g, "");
  const normalized = /,\d{1,2}$/.test(s) && !s.includes(".") ? s.replace(",", ".") : s.replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const n = Number(normalized);
  return Number.isFinite(n) && n < 1e12 ? n : null;
}

/** Whole, non-negative count; "" counts as 0. Accepts "12,500" and "12 500". */
function parseCount(raw: string): number | null {
  const s = raw.replace(/[\s,.]/g, "");
  if (s === "") return 0;
  if (!/^\d{1,10}$/.test(s)) return null;
  const n = Number(s);
  return n <= 2_000_000_000 ? n : null;
}

const text = (form: FormData, key: string, max = 200) => String(form.get(key) ?? "").trim().slice(0, max);

export function readAdInput(form: FormData): AdInput | string {
  const name = text(form, "name", 120);
  const objective = text(form, "objective");
  const status = text(form, "status");
  const budgetType = text(form, "budget_type");
  const placements = [...new Set(form.getAll("placements").map(String).filter(isPlacement))];
  const startOn = text(form, "start_on", 10) || null;
  const endOn = text(form, "end_on", 10) || null;
  const budgetRaw = text(form, "budget", 30);
  const budget = budgetRaw ? parseAmount(budgetRaw) : null;
  const currency = currencyCode(text(form, "currency", 3) || BASE_CURRENCY);
  const url = text(form, "ads_manager_url", 500);
  if (!name) return "Give the ad a name.";
  if (!isObjective(objective)) return "Choose the campaign objective.";
  if (!isAdStatus(status)) return "Choose a status.";
  if (budgetType !== "daily" && budgetType !== "lifetime") return "Choose a daily or lifetime budget.";
  if (startOn && !isDate(startOn)) return "Enter a valid start date.";
  if (endOn && !isDate(endOn)) return "Enter a valid end date.";
  if (startOn && endOn && endOn < startOn) return "The end date is before the start date.";
  if (budgetRaw && budget === null) return "Enter the budget as a number, e.g. 10 or 250.50.";
  if (!currency) return "Choose a currency.";
  if (url && !/^https:\/\/([a-z0-9-]+\.)*(facebook|fb|meta)\.com\//i.test(url)) return "The Ads Manager link should be a facebook.com or meta.com address.";
  return {
    name, campaign: text(form, "campaign", 120), objective, placements, status, startOn, endOn, budgetType, budget, currency,
    adsManagerUrl: url || null, notes: text(form, "notes", 2000), accountId: text(form, "account_id") || null,
  };
}

export function readResultInput(form: FormData): ResultInput | string {
  const periodFrom = text(form, "period_from", 10);
  const periodTo = text(form, "period_to", 10);
  const spend = parseAmount(text(form, "spend", 30));
  const counts = (["impressions", "reach", "clicks", "results"] as const).map((k) => [k, parseCount(text(form, k, 20))] as const);
  if (!isDate(periodFrom) || !isDate(periodTo)) return "Enter the period's start and end dates.";
  if (periodTo < periodFrom) return "The period ends before it starts.";
  if (spend === null || spend <= 0) return "Enter the amount spent, e.g. 45.20.";
  const bad = counts.find(([, v]) => v === null);
  if (bad) return `Enter ${bad[0]} as a whole number (or leave it empty).`;
  const c = Object.fromEntries(counts) as Record<(typeof counts)[number][0], number>;
  if (c.clicks > c.impressions && c.impressions > 0) return "Clicks can't be more than impressions.";
  if (c.reach > c.impressions && c.impressions > 0) return "Reach can't be more than impressions.";
  return { periodFrom, periodTo, spend, ...c };
}
