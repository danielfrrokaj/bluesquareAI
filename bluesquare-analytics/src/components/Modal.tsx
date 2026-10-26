"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import { toast } from "./Toaster";

const CloseContext = createContext<((message?: string) => void) | null>(null);

/** Inside a Modal: closes it, optionally showing a confirmation toast. Null outside a modal. */
export const useModalClose = () => useContext(CloseContext);

/**
 * Button that opens a native <dialog> (focus trap, Esc to close, backdrop). The content is
 * mounted fresh on every open, so old errors and inputs don't linger.
 */
export function Modal({ trigger, title, triggerClassName = "btn btn--primary", defaultOpen = false, children }: {
  trigger: React.ReactNode;
  title: string;
  triggerClassName?: string;
  defaultOpen?: boolean; // open as soon as it's shown (e.g. a task opened from a notification's link)
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [open, setOpen] = useState(defaultOpen ? 1 : 0); // increments per open; 0 = never opened

  const close = useCallback((message?: string) => {
    ref.current?.close();
    if (message) toast(message);
  }, []);

  useEffect(() => {
    if (open) ref.current?.showModal();
  }, [open]);

  return (
    <>
      <button type="button" className={triggerClassName} onClick={() => setOpen((n) => n + 1)}>
        {trigger}
      </button>
      <dialog
        ref={ref}
        className="modal"
        aria-labelledby={titleId}
        // A click on the dialog element itself (not its box) is a click on the backdrop.
        onClick={(e) => e.target === ref.current && close()}
      >
        {open > 0 && (
          <div className="modal__box" key={open}>
            <header className="modal__head">
              <h2 id={titleId}>{title}</h2>
              <button type="button" className="modal__x" onClick={() => close()} aria-label="Close">
                ×
              </button>
            </header>
            <CloseContext.Provider value={close}>{children}</CloseContext.Provider>
          </div>
        )}
      </dialog>
    </>
  );
}
