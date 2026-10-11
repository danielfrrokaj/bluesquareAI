"use client";

import { useActionState } from "react";
import { addSite } from "@/app/actions";

export function AddSiteForm() {
  const [error, action, pending] = useActionState(addSite, null);
  return (
    <form action={action} className="form form--inline">
      <label className="field">
        <span>Name</span>
        <input name="name" placeholder="Blue Square AI" required maxLength={80} />
      </label>
      <label className="field">
        <span>Domain</span>
        <input name="domain" placeholder="bluesquare.ai" required />
      </label>
      <button className="btn btn--primary" disabled={pending}>
        {pending ? "Adding…" : "Add website"}
      </button>
      {error && (
        <p className="form__error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
