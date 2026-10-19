"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { GRANTABLE, GRANTABLE_TABS, tabKey, type TabbedDepartment } from "@/lib/departments";
import { countActiveAdmins, createUser, getUser, readSignIn, setPassword, updateUser, type Role } from "@/lib/users";
import { createApiKey, revokeApiKey } from "@/lib/api-keys";
import type { FormState } from "@/components/ActionForm";

const str = (form: FormData, key: string, max = 200) => String(form.get(key) ?? "").trim().slice(0, max);
const isRole = (v: string): v is Role => v === "admin" || v === "member";

/**
 * The sections a member may open in sidebar order, then their Finance and Archive tabs ("<section>:<tab>"); null for
 * admins (they open everything). An error message when nothing is picked, or Finance or Archive is on without a tab.
 */
function readDepartments(form: FormData, role: Role): string[] | null | { error: string } {
  if (role === "admin") return null;
  const values = new Set(form.getAll("departments").map(String));
  const sections = GRANTABLE.map((d) => d.key as string).filter((key) => values.has(key));
  if (!sections.length) return { error: "Pick at least one section this person can open." };
  const tabs: string[] = [];
  for (const [department, { label, tabs: all }] of Object.entries(GRANTABLE_TABS) as [TabbedDepartment, (typeof GRANTABLE_TABS)[TabbedDepartment]][]) {
    if (!sections.includes(department)) continue;
    const picked = all.map((t) => tabKey(department, t.key)).filter((key) => values.has(key));
    if (!picked.length) return { error: `Pick at least one ${label} tab, or turn ${label} off.` };
    tabs.push(...picked);
  }
  return [...sections, ...tabs];
}

export async function addUser(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  const name = str(form, "name", 80);
  const password = String(form.get("password") ?? "");
  const role = str(form, "role");
  if (!name) return { error: "Enter a name." };
  if (password.length < 10 || password.length > 200) return { error: "The password needs at least 10 characters." };
  if (!isRole(role)) return { error: "Choose a role." };
  const departments = readDepartments(form, role);
  if (departments && "error" in departments) return departments;
  const signIn = await readSignIn(form);
  if (typeof signIn === "string") return { error: signIn };
  await createUser({ ...signIn, name, password, role, departments });
  revalidatePath("/users");
  return { ok: `${name} can now sign in as ${signIn.username}${signIn.phone ? ` or with ${signIn.phone}` : ""}.` };
}

export async function saveUser(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireRole("admin");
  const id = str(form, "id");
  const user = await getUser(id);
  if (!user) return { error: "This user no longer exists." };
  const name = str(form, "name", 80);
  const role = str(form, "role");
  const active = form.get("active") === "on";
  const password = String(form.get("password") ?? "");
  if (!name) return { error: "Enter a name." };
  if (!isRole(role)) return { error: "Choose a role." };
  if (password && (password.length < 10 || password.length > 200)) return { error: "The new password needs at least 10 characters." };
  const departments = readDepartments(form, role);
  if (departments && "error" in departments) return departments;
  const signIn = await readSignIn(form, id);
  if (typeof signIn === "string") return { error: signIn };
  // There must always be at least one active admin left.
  if ((role !== "admin" || !active) && user.role === "admin" && (await countActiveAdmins(id)) === 0) {
    return { error: "This is the last active admin. Make someone else admin first." };
  }
  if (id === me.id && !active) return { error: "You can't deactivate your own account." };
  await updateUser(id, { ...signIn, name, role, active, departments });
  if (password) await setPassword(id, password);
  revalidatePath("/", "layout");
  return { ok: "Saved." };
}

// ---------- API keys ----------

/** A key for a program to add sales leads; returned once, for the admin to copy. */
export async function newApiKey(name: string): Promise<{ key: string } | { error: string }> {
  const me = await requireRole("admin");
  const label = String(name ?? "").trim().slice(0, 80);
  if (!label) return { error: "Name the key after what will use it, e.g. Claude lead finder." };
  const key = await createApiKey(label, "leads", me.id);
  revalidatePath("/users");
  return { key };
}

export async function removeApiKey(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  await revokeApiKey(str(form, "id", 60));
  revalidatePath("/users");
  return { ok: "Key revoked. Programs using it can no longer add leads." };
}
