"use client";

import { useState } from "react";
import { GRANTABLE, GRANTABLE_TABS, tabKey, type TabbedDepartment } from "@/lib/departments";
import { NavIcon, type NavIconName } from "@/components/NavIcon";
import s from "./users.module.css";

type Role = "admin" | "member";
const ALL = GRANTABLE.map((d) => d.key as string);
const TABBED = Object.keys(GRANTABLE_TABS) as TabbedDepartment[];
const hasTabs = (keys: Set<string>, department: TabbedDepartment) => [...keys].some((k) => k.startsWith(`${department}:`));
// Supplier tabs show their own logo, as in Finance's tab bar.
const TAB_LOGOS: Record<string, string> = { "finance:gcloud": "/icons/google.png", "finance:channex": "/icons/channex.webp" };
const TAB_ICONS: Record<string, NavIconName> = { "finance:accounts": "wallet" };
const TAB_NOTES: Record<TabbedDepartment, string> = { finance: "Finance settings stay with admins", archive: "The vault holds passwords and API keys" };

/** A department turned on without a choice of tabs gets its default tabs. */
function withDefaultTabs(keys: Set<string>) {
  for (const d of TABBED) if (keys.has(d) && !hasTabs(keys, d)) GRANTABLE_TABS[d].defaults.forEach((tab) => keys.add(tabKey(d, tab)));
  return keys;
}

/**
 * Role, then the sidebar sections a member may open, picked by their icons, and with Finance and Archive their tabs.
 * Submits `role` and one `departments` value per pick ("<section>:<tab>" for tabs). Admins open everything, so they get
 * no picker (a member's picks are kept while switching). Without a choice of tabs (as stored before tabs existed), a
 * section shows its default tabs.
 */
export function PermissionPicker({ role: initialRole, departments }: { role: Role; departments: string[] | null }) {
  const [role, setRole] = useState<Role>(initialRole);
  const [picked, setPicked] = useState(() => withDefaultTabs(new Set(departments ?? ALL)));
  const admin = role === "admin";
  const sections = ALL.filter((k) => picked.has(k)).length;

  const toggle = (key: string) => setPicked((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key);
    // Turning Finance on starts from its default tabs (no supplier costs); Archive from both of its tabs.
    else withDefaultTabs(next.add(key));
    return next;
  });
  const selectAll = () => setPicked((prev) => withDefaultTabs(new Set([...prev, ...ALL])));

  return (
    <>
      <label className="field">
        <span>Role</span>
        <select name="role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      {admin ? <p className={s.adminNote}>Admins open every section, including Users.</p> : <fieldset className={s.picker}>
        <legend>
          Sections
          <small>{sections} of {ALL.length} · Settings is always available</small>
        </legend>
        <div className={s.quick}>
          <button type="button" onClick={selectAll}>Select all</button>
          <button type="button" onClick={() => setPicked(new Set())}>Clear</button>
        </div>
        <div className={s.tiles}>
          {GRANTABLE.map((d) => {
            const on = picked.has(d.key);
            return (
              <label key={d.key} className={`${s.tile} ${on ? s.on : ""}`}>
                <input type="checkbox" name="departments" value={d.key} checked={on} onChange={() => toggle(d.key)} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/icons/${d.key}.png`} alt="" width={34} height={34} />
                <span>{d.label}</span>
                <svg className={s.tick} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
              </label>
            );
          })}
        </div>

        {TABBED.filter((d) => picked.has(d)).map((d) => (
          <div key={d} className={s.tabs} role="group" aria-labelledby={`${d}-tabs-label`}>
            <p className={s.tabsHead} id={`${d}-tabs-label`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/icons/${d}.png`} alt="" width={22} height={22} />
              {GRANTABLE_TABS[d].label} tabs
              <small>{TAB_NOTES[d]}</small>
            </p>
            <div className={s.chips}>
              {GRANTABLE_TABS[d].tabs.map((t) => {
                const key = tabKey(d, t.key);
                const on = picked.has(key);
                return (
                  <label key={key} className={`${s.chip} ${on ? s.on : ""}`}>
                    <input type="checkbox" name="departments" value={key} checked={on} onChange={() => toggle(key)} />
                    {TAB_LOGOS[key]
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={TAB_LOGOS[key]} alt="" width={16} height={16} />
                      : <NavIcon name={TAB_ICONS[key] ?? (t.key as NavIconName)} />}
                    {t.label}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </fieldset>}
    </>
  );
}
