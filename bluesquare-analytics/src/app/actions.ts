"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, createSession, destroySession, requireAuth } from "@/lib/auth";
import { createSite, deleteSite, normalizeDomain } from "@/lib/sites";

export async function login(_: string | null, form: FormData): Promise<string | null> {
  const password = String(form.get("password") ?? "");
  // Small fixed delay slows down password guessing.
  await new Promise((r) => setTimeout(r, 400));
  if (!checkPassword(password)) return "Wrong password.";
  await createSession();
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

export async function addSite(_: string | null, form: FormData): Promise<string | null> {
  await requireAuth();
  const name = String(form.get("name") ?? "").trim();
  const domain = normalizeDomain(String(form.get("domain") ?? ""));
  if (!name || name.length > 80) return "Enter a name (up to 80 characters).";
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$|^localhost$/.test(domain)) return "Enter a valid domain, e.g. bluesquare.ai";
  const site = await createSite(name, domain);
  revalidatePath("/");
  redirect(`/sites/${site.id}?setup=1`);
}

export async function removeSite(form: FormData) {
  await requireAuth();
  const id = String(form.get("id") ?? "");
  if (String(form.get("confirm") ?? "") !== "DELETE") redirect(`/sites/${id}?error=confirm#setup`);
  await deleteSite(id);
  revalidatePath("/");
  redirect("/");
}
