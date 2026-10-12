"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/** A page shown as a modal over the previous one (intercepted route). Closing goes back. */
export function RouteModal({ label, children }: { label: string; children: React.ReactNode }) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!ref.current?.open) ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal modal--route"
      aria-label={label}
      onCancel={(e) => {
        // React passes a nested dialog's cancel (Esc) up the tree: only handle our own.
        if (e.target !== ref.current) return;
        e.preventDefault(); // Esc: leave the closing to the router
        router.back();
      }}
      onClick={(e) => e.target === ref.current && router.back()}
    >
      <div className="modal__box">
        <button type="button" className="modal__x modal__x--float" onClick={() => router.back()} aria-label="Close">
          ×
        </button>
        {children}
      </div>
    </dialog>
  );
}
