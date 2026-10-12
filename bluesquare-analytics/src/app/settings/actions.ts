"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { readLogo } from "@/lib/logo";
import { checkPassword, emailTaken, setAvatar, setEmail, setName, setPassword } from "@/lib/users";
import type { FormState } from "@/components/ActionForm";

const str = (form: FormData, key: string, max = 200) => String(form.get(key) ?? "").trim().slice(0, max);
const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

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

/** Email and password: both need the current password. */
export async function saveSignIn(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireAuth();
  const email = str(form, "email").toLowerCase();
  const next = String(form.get("new_password") ?? "");
  const repeat = String(form.get("repeat_password") ?? "");
  const current = String(form.get("current_password") ?? "").slice(0, 200);
  const emailChanged = email !== me.email;
  if (!emailChanged && !next) return { error: "Nothing to change: enter a new email or a new password." };
  if (emailChanged && !validEmail(email)) return { error: "Enter a valid email address." };
  if (next && (next.length < 10 || next.length > 200)) return { error: "The new password needs at least 10 characters." };
  if (next && next !== repeat) return { error: "The two new passwords don't match." };
  // Small fixed delay slows down guessing the current password.
  await new Promise((r) => setTimeout(r, 300));
  if (!(await checkPassword(me.id, current))) return { error: "Your current password is wrong." };
  if (emailChanged && (await emailTaken(email, me.id))) return { error: "Someone else already uses that email." };
  if (emailChanged) await setEmail(me.id, email);
  if (next) await setPassword(me.id, next);
  revalidatePath("/", "layout");
  return {
    ok: emailChanged && next ? "Email and password updated." : emailChanged ? `You now sign in with ${email}.` : "Password updated.",
  };
}
