"use client";

import { useEffect, useRef, useState } from "react";

const EVENT = "bsa:toast";

/** Shows a confirmation toast from anywhere, even after the component that asked has gone. */
export const toast = (message: string) => window.dispatchEvent(new CustomEvent(EVENT, { detail: message }));

/** Mounted once in the root layout: stacks toasts at the bottom and drops each after a few seconds. */
export function Toaster() {
  const [items, setItems] = useState<{ id: number; message: string }[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  // A popover sits in the top layer, so toasts show above an open dialog too. Re-showing it puts it
  // above dialogs opened since.
  useEffect(() => {
    const el = ref.current;
    if (!el?.showPopover) return;
    if (el.matches(":popover-open")) el.hidePopover();
    if (items.length) el.showPopover();
  }, [items]);
  useEffect(() => {
    let n = 0;
    const onToast = (e: Event) => {
      const id = ++n;
      setItems((list) => [...list.slice(-2), { id, message: String((e as CustomEvent).detail) }]);
      setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 3500);
    };
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);
  return (
    <div ref={ref} popover="manual" className="toasts" role="status" aria-live="polite">
      {items.map((t) => <p key={t.id} className="toast">{t.message}</p>)}
    </div>
  );
}
