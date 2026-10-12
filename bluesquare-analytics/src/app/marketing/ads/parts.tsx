import Link from "next/link";
import { Modal } from "@/components/Modal";
import { ActionForm } from "@/components/ActionForm";
import { BASE_CURRENCY, type Account } from "@/lib/finance";
import {
  AD_STATUSES, OBJECTIVES, PLACEMENTS, metrics, type Ad, type AdResult, type AdStatus, type Placement,
} from "@/lib/ads";
import { money, num } from "@/lib/format";
import { addAd, addAdResult, removeAd, removeAdResult, saveAd, saveAdResult } from "./actions";
import s from "../marketing.module.css";

const PLACEMENT_LIST = Object.entries(PLACEMENTS) as [Placement, (typeof PLACEMENTS)[Placement]][];

export const STATUS_CLASS: Record<AdStatus, string> = {
  draft: "tag tag--muted", active: "tag tag--ok", paused: "tag tag--warn", completed: "tag tag--muted",
};

export const ratio = (v: number | null, digits = 2) => (v === null ? "–" : v.toFixed(digits));
export const eur = (v: number | null) => (v === null ? "–" : money(v));

export function PlacementBadges({ value }: { value: readonly string[] }) {
  return (
    <span className={s.badges}>
      {PLACEMENT_LIST.filter(([key]) => value.includes(key)).map(([key, { label, short, color }]) => (
        <span key={key} className={s.badge} style={{ background: color }} title={label}>{short}</span>
      ))}
    </span>
  );
}

/** Inputs for an ad. `currencies` are those with a Finance rate; EUR is always offered. */
function AdFields({ ad, accounts, currencies, currencyLocked }: { ad?: Ad; accounts: Account[]; currencies: string[]; currencyLocked?: boolean }) {
  const accountOptions = accounts.filter((a) => !a.archived || a.id === ad?.account_id);
  return (
    <div className="formgrid">
      {ad && <input type="hidden" name="id" value={ad.id} />}
      <label className="field field--wide">
        <span>Ad name</span>
        <input name="name" maxLength={120} defaultValue={ad?.name} placeholder="e.g. LuxHotel – free trial (October)" required autoFocus={!ad} />
      </label>
      <label className="field">
        <span>Campaign</span>
        <input name="campaign" maxLength={120} defaultValue={ad?.campaign} placeholder="Optional" />
      </label>
      <label className="field">
        <span>Objective</span>
        <select name="objective" defaultValue={ad?.objective ?? "traffic"}>
          {Object.entries(OBJECTIVES).map(([k, o]) => <option key={k} value={k}>{o.label}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Status</span>
        <select name="status" defaultValue={ad?.status ?? "active"}>
          {Object.entries(AD_STATUSES).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Start date</span>
        <input type="date" name="start_on" defaultValue={ad?.start_on ?? ""} />
      </label>
      <label className="field">
        <span>End date</span>
        <input type="date" name="end_on" defaultValue={ad?.end_on ?? ""} />
      </label>
      <label className="field">
        <span>Budget</span>
        <select name="budget_type" defaultValue={ad?.budget_type ?? "daily"}>
          <option value="daily">Daily budget</option>
          <option value="lifetime">Lifetime budget</option>
        </select>
      </label>
      <label className="field">
        <span>Budget amount</span>
        <input name="budget" inputMode="decimal" placeholder="e.g. 10" defaultValue={ad?.budget ?? ""} />
      </label>
      <label className="field">
        <span>Currency</span>
        {currencyLocked && <input type="hidden" name="currency" value={ad!.currency} />}
        <select name={currencyLocked ? undefined : "currency"} defaultValue={ad?.currency ?? BASE_CURRENCY} disabled={currencyLocked}
          title={currencyLocked ? "Results were entered in this currency" : "Currency of your Meta ad account"}>
          {[...new Set([BASE_CURRENCY, ...currencies, ...(ad ? [ad.currency] : [])])].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Paid from (Finance account)</span>
        <select name="account_id" defaultValue={ad?.account_id ?? ""}>
          <option value="">No account</option>
          {accountOptions.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </label>
      <fieldset className={`${s.platforms} field--wide`}>
        <legend>Placements</legend>
        {PLACEMENT_LIST.map(([key, { label, color }]) => (
          <label key={key}>
            <input type="checkbox" name="placements" value={key} defaultChecked={ad ? ad.placements.includes(key) : key === "facebook" || key === "instagram"} />
            <span><i style={{ background: color }} />{label}</span>
          </label>
        ))}
      </fieldset>
      <label className="field field--wide">
        <span>Ads Manager link</span>
        <input type="url" name="ads_manager_url" maxLength={500} defaultValue={ad?.ads_manager_url ?? ""} placeholder="https://adsmanager.facebook.com/…" />
      </label>
      <label className="field field--wide">
        <span>Notes</span>
        <textarea name="notes" rows={3} maxLength={2000} defaultValue={ad?.notes} placeholder="Audience, creative, offer…" />
      </label>
    </div>
  );
}

/** Inputs for one period of results, copied from Ads Manager. */
function ResultFields({ ad, result, today }: { ad: Ad; result?: AdResult; today: string }) {
  return (
    <div className="formgrid">
      {result ? <input type="hidden" name="id" value={result.id} /> : <input type="hidden" name="ad_id" value={ad.id} />}
      <label className="field">
        <span>From</span>
        <input type="date" name="period_from" defaultValue={result?.period_from ?? ad.start_on ?? today} required />
      </label>
      <label className="field">
        <span>To</span>
        <input type="date" name="period_to" defaultValue={result?.period_to ?? today} required />
      </label>
      <label className="field">
        <span>Amount spent ({ad.currency})</span>
        <input name="spend" inputMode="decimal" placeholder="e.g. 45.20" defaultValue={result?.spend ?? ""} required autoFocus={!result} />
      </label>
      <label className="field">
        <span>Impressions</span>
        <input name="impressions" inputMode="numeric" placeholder="0" defaultValue={result?.impressions ?? ""} />
      </label>
      <label className="field">
        <span>Reach</span>
        <input name="reach" inputMode="numeric" placeholder="0" defaultValue={result?.reach ?? ""} />
      </label>
      <label className="field">
        <span>Clicks (all)</span>
        <input name="clicks" inputMode="numeric" placeholder="0" defaultValue={result?.clicks ?? ""} />
      </label>
      <label className="field">
        <span>Results</span>
        <input name="results" inputMode="numeric" placeholder="0" defaultValue={result?.results ?? ""} title={OBJECTIVES[ad.objective].result} />
      </label>
      <p className="muted field--wide">
        Results for a <b>{OBJECTIVES[ad.objective].label}</b> ad are usually <b>{OBJECTIVES[ad.objective].result}</b> (the “Results” column in
        Ads Manager). The spend is booked in Finance as an <b>Advertising</b> expense.
      </p>
    </div>
  );
}

export function NewAdButton({ accounts, currencies }: { accounts: Account[]; currencies: string[] }) {
  return (
    <Modal trigger="New ad" title="New Meta ad">
      <ActionForm action={addAd} submit="Add ad" className="form">
        <AdFields accounts={accounts} currencies={currencies} />
      </ActionForm>
    </Modal>
  );
}

export function AddResultsButton({ ad, today }: { ad: Ad; today: string }) {
  return (
    <Modal trigger="Add results" title={`Results · ${ad.name}`} triggerClassName="btn btn--primary btn--small">
      <ActionForm action={addAdResult} submit="Add results" className="form">
        <ResultFields ad={ad} today={today} />
      </ActionForm>
    </Modal>
  );
}

/** Details of one ad: results history (each editable), the ad's settings and delete. */
export function ManageAd({
  ad, results, accounts, currencies, canEdit, today,
}: {
  ad: Ad; results: AdResult[]; accounts: Account[]; currencies: string[]; canEdit: boolean; today: string;
}) {
  return (
    <Modal trigger="Manage" title={ad.name} triggerClassName="btn btn--small">
      <section>
        <h3 className="modal__section">Results by period</h3>
        {results.length === 0 ? (
          <p className="empty">No results yet. Use “Add results” after checking Ads Manager.</p>
        ) : (
          <ul className="editlist">
            {results.map((r) => {
              const m = metrics({ spend: r.spend_eur ?? 0, impressions: r.impressions, reach: r.reach, clicks: r.clicks, results: r.results });
              return (
                <li key={r.id}>
                  <details>
                    <summary>
                      <span><b>{r.period_from === r.period_to ? r.period_from : `${r.period_from} → ${r.period_to}`}</b></span>
                      <span className="muted">
                        {money(r.spend, r.currency)}{r.currency !== BASE_CURRENCY && r.spend_eur !== null ? ` (${money(r.spend_eur)})` : ""} ·{" "}
                        {num(r.impressions)} impr. · {num(r.clicks)} clicks · CTR {ratio(m.ctr)}% · {num(r.results)} results
                      </span>
                    </summary>
                    <div className="editlist__body">
                      {r.transaction_id && (
                        <p className="muted">
                          Booked in Finance: <Link href={`/finance/transactions/${r.transaction_id}`}>view expense</Link>
                        </p>
                      )}
                      {canEdit && (
                        <>
                          <ActionForm action={saveAdResult} submit="Save results" className="form">
                            <ResultFields ad={ad} result={r} today={today} />
                          </ActionForm>
                          <ActionForm action={removeAdResult} submit="Delete these results" pending="Deleting…" danger className="form--row">
                            <input type="hidden" name="id" value={r.id} />
                          </ActionForm>
                        </>
                      )}
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {canEdit ? (
        <section>
          <h3 className="modal__section">Ad settings</h3>
          <ActionForm action={saveAd} submit="Save ad" className="form">
            <AdFields ad={ad} accounts={accounts} currencies={currencies} currencyLocked={results.length > 0} />
          </ActionForm>
          <h3 className="modal__section">Delete</h3>
          <p className="muted">Deletes the ad, all its results and the Advertising expenses they booked in Finance.</p>
          <ActionForm action={removeAd} submit="Delete ad" pending="Deleting…" danger className="form--row">
            <input type="hidden" name="id" value={ad.id} />
          </ActionForm>
        </section>
      ) : (
        <p className="muted">Only {ad.author ?? "the person who added this ad"} or an admin can change it.</p>
      )}
    </Modal>
  );
}
