"use client";

import { useState, useTransition } from "react";
import { toast } from "@/components/Toaster";
import { saveChannexCategory } from "../actions";
import s from "./channex.module.css";

/** Saves as soon as it changes; `value` is null while the property has no category yet. */
export function CategorySelect({ hotelId, name, value }: { hotelId: string; name: string; value: string | null }) {
  const [selected, setSelected] = useState(value ?? "");
  const [pending, startTransition] = useTransition();
  return (
    <select
      className={s.select}
      aria-label={`Channex billing category of ${name}`}
      value={selected}
      disabled={pending}
      onChange={(e) => {
        const category = e.target.value;
        const form = new FormData();
        form.set("hotel_id", hotelId);
        form.set("category", category);
        setSelected(category);
        startTransition(async () => {
          const result = await saveChannexCategory(null, form);
          if (result?.error) setSelected(value ?? "");
          toast(result?.error ?? `${name}: ${result?.ok}`);
        });
      }}
    >
      {value === null && <option value="" disabled>Not set · hotel</option>}
      <option value="hotel">Hotel</option>
      <option value="vacation_rental">Vacation rental</option>
    </select>
  );
}
