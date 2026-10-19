"use client";

import { useEffect, useState } from "react";
import s from "./Shell.module.css";

// The department whose list the sidebar showed last. Every page renders the sidebar afresh, so this is what tells
// opening a department (unfold its list) apart from moving between its tabs (leave it still).
let shown: string | null = null;

/** The list under the open department in the sidebar; it unfolds only when that department has just been opened. */
export function SubList({ department, label, children }: { department: string; label: string; children: React.ReactNode }) {
  const [unfold] = useState(() => shown !== department);
  useEffect(() => {
    shown = department;
  }, [department]);
  return (
    <div className={`${s.fold}${unfold ? ` ${s.unfold}` : ""}`}>
      <ul className={s.subitems} aria-label={label}>
        {children}
      </ul>
    </div>
  );
}

/** On pages without such a list: the next department opened unfolds again, even the one that was open before. */
export function NoSubList() {
  useEffect(() => {
    shown = null;
  }, []);
  return null;
}
