"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSession, destroySession, requireAuth, signIn } from "@/lib/auth";
import { createSite, deleteSite, parseDomains, setSiteLogo, updateSite } from "@/lib/sites";
import { readLogo } from "@/lib/logo";
import type { FormState } from "@/components/ActionForm";

export async function login(_: string | null, form: FormData): Promise<string | null> {
  const email = String(form.get("email") ?? "").slice(0, 200);
  const password = String(form.get("password") ?? "").slice(0, 200);
  // Small fixed delay slows down password guessing.
  await new Promise((r) => setTimeout(r, 400));
  const user = await signIn(email, password);
  if (!user) return "Wrong email or password.";
  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

export async function addSite(_: FormState, form: FormData): Promise<FormState> {
  await requireAuth();
  const name = String(form.get("name") ?? "").trim();
  const domains = parseDomains(String(form.get("domains") ?? "").slice(0, 2000));
  if (!name || name.length > 80) return { error: "Enter a name (up to 80 characters)." };
  if (typeof domains === "string") return { error: domains };
  const logo = await readLogo(form);
  if (typeof logo === "string") return { error: logo };
  const site = await createSite(name, domains);
  if (logo) await setSiteLogo(site.id, logo);
  revalidatePath("/analytics");
  redirect(`/sites/${site.id}?setup=1`);
}

export async function saveSite(_: FormState, form: FormData): Promise<FormState> {
  await requireAuth();
  const id = String(form.get("id") ?? "");
  const name = String(form.get("name") ?? "").trim();
  const domains = parseDomains(String(form.get("domains") ?? "").slice(0, 2000));
  if (!name || name.length > 80) return { error: "Enter a name (up to 80 characters)." };
  if (typeof domains === "string") return { error: domains };
  const logo = await readLogo(form);
  if (typeof logo === "string") return { error: logo };
  await updateSite(id, name, domains);
  if (logo) await setSiteLogo(id, logo);
  else if (form.get("remove_logo") === "on") await setSiteLogo(id, null);
  revalidatePath("/analytics");
  revalidatePath(`/sites/${id}`);
  return { ok: `Saved. Tracking ${domains.length} domain${domains.length === 1 ? "" : "s"}.` };
}

export async function removeSite(form: FormData) {
  await requireAuth();
  const id = String(form.get("id") ?? "");
  if (String(form.get("confirm") ?? "") !== "DELETE") redirect(`/sites/${id}?error=confirm#setup`);
  await deleteSite(id);
  revalidatePath("/analytics");
  redirect("/analytics");
}
