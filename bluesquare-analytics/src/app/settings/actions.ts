"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { readLogo } from "@/lib/logo";
import { checkPassword, readSignIn, setAvatar, setName, setPassword, setSignIn } from "@/lib/users";
import type { FormState } from "@/components/ActionForm";

const str = (form: FormData, key: string, max = 200) => String(form.get(key) ?? "").trim().slice(0, max);

/** Name and photo: no password needed. */
export async function saveProfile(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireAuth();
  const name = str(form, "name", 80);
  if (!name) return { error: "Enter your name." };
  const photo = await readLogo(form, "avatar");
  if (typeof photo === "string") return { error: photo };
  await setName(me.id, name);
  if (photo) await setAvatar(me.id, photo);
  else if (form.get("remove_avatar") === "on") await setAvatar(me.id, null);
  revalidatePath("/", "layout");
  return { ok: "Profile saved." };
}

/** Username, phone, email and password: changes need the current password. */
export async function saveSignIn(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireAuth();
  const next = String(form.get("new_password") ?? "");
  const repeat = String(form.get("repeat_password") ?? "");
  const current = String(form.get("current_password") ?? "").slice(0, 200);
  const signIn = await readSignIn(form, me.id);
  if (typeof signIn === "string") return { error: signIn };
  const changed = signIn.username !== me.username || signIn.phone !== me.phone || signIn.email !== me.email;
  if (!changed && !next) return { error: "Nothing to change: edit your username, phone or email, or enter a new password." };
  if (next && (next.length < 10 || next.length > 200)) return { error: "The new password needs at least 10 characters." };
  if (next && next !== repeat) return { error: "The two new passwords don't match." };
  // Small fixed delay slows down guessing the current password.
  await new Promise((r) => setTimeout(r, 300));
  if (!(await checkPassword(me.id, current))) return { error: "Your current password is wrong." };
  if (changed) await setSignIn(me.id, signIn);
  if (next) await setPassword(me.id, next);
  revalidatePath("/", "layout");
  const how = `You sign in as ${signIn.username}${signIn.phone ? ` or with ${signIn.phone}` : ""}`;
  return { ok: changed && next ? `${how}, with your new password.` : changed ? `${how}.` : "Password updated." };
}
