"use client";

import { useRef, useState, useTransition } from "react";
import { useModalClose } from "./Modal";
import { toast } from "./Toaster";

export type FormState = { error?: string; ok?: string } | null;
export type FormAction = (state: FormState, form: FormData) => Promise<FormState>;

/** Form bound to a server action that returns { error } or { ok }; fields come in as children. Closes its Modal on success. */
export function ActionForm({
  action, submit, pending: pendingLabel, className = "form", danger, children,
}: {
  action: FormAction;
  submit: string;
  pending?: string;
  className?: string;
  danger?: boolean;
  children?: React.ReactNode;
}) {
  const [state, setState] = useState<FormState>(null);
  const [pending, startTransition] = useTransition();
  const closeModal = useModalClose();
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={ref}
      className={className}
      // The action is called by hand rather than with action={…}: React resets an action form after
      // every submit (wiping what was typed when the server answers with an error), and the result is
      // handled right here, before the refreshed page may have replaced this form (e.g. "Win" turning
      // into "Reopen"), so the confirmation toast is never lost.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await action(state, data);
          if (result?.ok) {
            // In a modal: close it and confirm with a toast. Otherwise clear the form.
            if (closeModal) closeModal(result.ok);
            else ref.current?.reset();
          }
          setState(result);
        });
      }}
    >
      {children}
      <button className={`btn ${danger ? "btn--danger btn--small" : "btn--primary"}`} disabled={pending}>
        {pending ? (pendingLabel ?? "Saving…") : submit}
      </button>
      {state?.error && (
        <p className="form__error" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && !closeModal && (
        <p className="form__ok" role="status">
          {state.ok}
        </p>
      )}
    </form>
  );
}
