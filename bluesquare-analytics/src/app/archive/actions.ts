"use server";

import { revalidatePath } from "next/cache";
import { isAdmin, requireAuth } from "@/lib/auth";
import {
  canSeeEntry, cleanFolder, createEntry, deleteEntry, deleteFileRow, getFile, isVaultKind, revealField, updateEntry, updateFile,
  type VaultInput,
} from "@/lib/archive";
import { removeMedia } from "@/lib/media-store";
import type { FormState } from "@/components/ActionForm";

const str = (form: FormData, key: string, max = 200) => String(form.get(key) ?? "").trim().slice(0, max);
const refresh = () => revalidatePath("/archive", "layout");

// ---------- Files ----------

export async function saveFile(_: FormState, form: FormData): Promise<FormState> {
  await requireAuth();
  const file = await getFile(str(form, "id"));
  if (!file) return { error: "This file no longer exists." };
  const name = str(form, "name", 200);
  if (!name) return { error: "The file needs a name." };
  await updateFile(file.id, { name, folder: cleanFolder(form.get("folder")), note: str(form, "note", 1000) });
  refresh();
  return { ok: "Saved." };
}

export async function removeFile(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireAuth();
  const file = await getFile(str(form, "id"));
  if (!file) return { ok: "Deleted." };
  if (!isAdmin(user) && file.created_by !== user.id) return { error: "Only whoever uploaded it or an admin can delete this file." };
  await removeMedia(file.media_key);
  await deleteFileRow(file.id);
  refresh();
  return { ok: `${file.name} deleted.` };
}

// ---------- Vault ----------

/** On edit, an empty secret field means "keep the current one" unless "clear" is ticked. */
function readEntry(form: FormData, editing: boolean): VaultInput | string {
  const title = str(form, "title", 120);
  const kind = str(form, "kind");
  const url = str(form, "url", 500);
  if (!title) return "Give the entry a title.";
  if (!isVaultKind(kind)) return "Choose a type.";
  if (url && !/^https?:\/\//i.test(url)) return "The URL should start with https://";
  const secret = String(form.get("secret") ?? "").slice(0, 10_000);
  const notes = String(form.get("notes") ?? "").slice(0, 20_000);
  return {
    title, kind, url, username: str(form, "username", 200),
    tags: [...new Set(str(form, "tags", 300).split(",").map((t) => t.trim()).filter(Boolean))].slice(0, 10),
    adminsOnly: form.get("admins_only") === "on",
    secret: editing && !secret && form.get("clear_secret") !== "on" ? null : secret,
    notes: editing && form.get("notes_changed") !== "1" ? null : notes,
  };
}

export async function addEntry(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireAuth();
  const input = readEntry(form, false);
  if (typeof input === "string") return { error: input };
  if (input.adminsOnly && !isAdmin(user)) return { error: "Only admins can create admin-only entries." };
  await createEntry(input, user.id);
  refresh();
  return { ok: `“${input.title}” saved to the vault.` };
}

export async function saveEntry(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireAuth();
  const admin = isAdmin(user);
  const id = str(form, "id");
  if (!(await canSeeEntry(id, admin))) return { error: "This entry no longer exists." };
  const input = readEntry(form, true);
  if (typeof input === "string") return { error: input };
  if (input.adminsOnly && !admin) return { error: "Only admins can make entries admin-only." };
  await updateEntry(id, input, user.id);
  refresh();
  return { ok: "Saved." };
}

export async function removeEntry(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireAuth();
  const id = str(form, "id");
  if (!(await canSeeEntry(id, isAdmin(user)))) return { ok: "Deleted." };
  if (str(form, "confirm").toUpperCase() !== "DELETE") return { error: "Type DELETE to confirm." };
  await deleteEntry(id);
  refresh();
  return { ok: "Deleted." };
}

/** Decrypts a secret or the notes for display or copying; every call is logged. */
export async function reveal(id: string, field: "secret" | "notes"): Promise<string | null> {
  const user = await requireAuth();
  if (field !== "secret" && field !== "notes") return null;
  return revealField(id, field, user.id, isAdmin(user));
}
