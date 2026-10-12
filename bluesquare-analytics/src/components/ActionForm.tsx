"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { useModalClose } from "./Modal";

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
  const [state, run, pending] = useActionState(action, null);
  const closeModal = useModalClose();
  const ref = useRef<HTMLFormElement>(null);
  // On success: in a modal, close it (the message shows as a toast); otherwise clear the form.
  useEffect(() => {
    if (!state?.ok) return;
    if (closeModal) closeModal(state.ok);
    else ref.current?.reset();
  }, [state, closeModal]);
  return (
    <form
      ref={ref}
      className={className}
      // Submitted by hand rather than with action={run}: React resets an action form after every
      // submit, which would wipe what the user typed whenever the server returns an error.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => run(data));
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
