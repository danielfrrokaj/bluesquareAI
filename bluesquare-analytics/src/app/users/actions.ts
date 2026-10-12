"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { countActiveAdmins, createUser, emailTaken, getUser, setPassword, updateUser, type Role } from "@/lib/users";
import type { FormState } from "@/components/ActionForm";

const str = (form: FormData, key: string, max = 200) => String(form.get(key) ?? "").trim().slice(0, max);
const isRole = (v: string): v is Role => v === "admin" || v === "member";
const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export async function addUser(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  const name = str(form, "name", 80);
  const email = str(form, "email");
  const password = String(form.get("password") ?? "");
  const role = str(form, "role");
  if (!name) return { error: "Enter a name." };
  if (!validEmail(email)) return { error: "Enter a valid email address." };
  if (password.length < 10 || password.length > 200) return { error: "The password needs at least 10 characters." };
  if (!isRole(role)) return { error: "Choose a role." };
  if (await emailTaken(email)) return { error: "Someone already uses that email." };
  await createUser({ name, email, password, role });
  revalidatePath("/users");
  return { ok: `${name} can now sign in with ${email.toLowerCase()}.` };
}

export async function saveUser(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireRole("admin");
  const id = str(form, "id");
  const user = await getUser(id);
  if (!user) return { error: "This user no longer exists." };
  const name = str(form, "name", 80);
  const email = str(form, "email");
  const role = str(form, "role");
  const active = form.get("active") === "on";
  if (!name) return { error: "Enter a name." };
  if (!validEmail(email) && email !== user.email) return { error: "Enter a valid email address." };
  if (!isRole(role)) return { error: "Choose a role." };
  if (await emailTaken(email, id)) return { error: "Someone else already uses that email." };
  // There must always be at least one active admin left.
  if ((role !== "admin" || !active) && user.role === "admin" && (await countActiveAdmins(id)) === 0) {
    return { error: "This is the last active admin. Make someone else admin first." };
  }
  if (id === me.id && !active) return { error: "You can't deactivate your own account." };
  await updateUser(id, { name, email, role, active });
  const password = String(form.get("password") ?? "");
  if (password) {
    if (password.length < 10 || password.length > 200) return { error: "The new password needs at least 10 characters." };
    await setPassword(id, password);
  }
  revalidatePath("/", "layout");
  return { ok: "Saved." };
}
