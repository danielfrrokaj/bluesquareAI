"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** Opens/closes the mobile menu by toggling a class on the header. */
export function MenuToggle({ openLabel, closeLabel }: { openLabel: string; closeLabel: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.getElementById("site-header")?.classList.toggle("is-open", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <button
      type="button"
      className="menu-toggle"
      aria-expanded={open}
      aria-controls="site-nav"
      aria-label={open ? closeLabel : openLabel}
      onClick={() => setOpen((v) => !v)}
    >
      <span aria-hidden="true" />
    </button>
  );
}
