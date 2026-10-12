"use server";

import { revalidatePath } from "next/cache";
import { isAdmin, requireAuth } from "@/lib/auth";
import {
  createIdea, deleteIdea, deletePostRow, getIdea, getPost, IDEA_COLORS, readPostInput, setIdeaPinned, updatePost, type IdeaColor,
} from "@/lib/marketing";
import { removeMedia } from "@/lib/media-store";
import type { FormState } from "@/components/ActionForm";

const refresh = () => revalidatePath("/marketing");

// ---------- Ideas (anyone signed in; the author or an admin can delete) ----------

export async function addIdea(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireAuth();
  const body = String(form.get("body") ?? "").trim().slice(0, 1000);
  const color = String(form.get("color") ?? "yellow");
  if (!body) return { error: "Write the idea first." };
  await createIdea(body, (IDEA_COLORS as readonly string[]).includes(color) ? (color as IdeaColor) : "yellow", form.get("pinned") === "on", user.id);
  refresh();
  return { ok: form.get("pinned") === "on" ? "Idea pinned." : "Idea added." };
}

export async function toggleIdeaPin(form: FormData) {
  await requireAuth();
  await setIdeaPinned(String(form.get("id") ?? ""), form.get("pinned") === "1");
  refresh();
}

export async function removeIdea(form: FormData) {
  const user = await requireAuth();
  const idea = await getIdea(String(form.get("id") ?? ""));
  if (!idea || (!isAdmin(user) && idea.created_by !== user.id)) return;
  await deleteIdea(idea.id);
  refresh();
}

// ---------- Posts ----------

export async function savePost(_: FormState, form: FormData): Promise<FormState> {
  await requireAuth();
  const post = await getPost(String(form.get("id") ?? ""));
  if (!post) return { error: "This post no longer exists." };
  const input = readPostInput({
    title: form.get("title"), caption: form.get("caption"), publish: form.get("publish"), platforms: form.getAll("platforms"),
  });
  if (typeof input === "string") return { error: input };
  await updatePost(post.id, input);
  refresh();
  return { ok: "Saved." };
}

export async function removePost(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireAuth();
  const post = await getPost(String(form.get("id") ?? ""));
  if (!post) return { ok: "Deleted." };
  if (!isAdmin(user) && post.created_by !== user.id) return { error: "Only the uploader or an admin can delete this." };
  await removeMedia(post.media_key);
  await deletePostRow(post.id);
  refresh();
  return { ok: "Deleted." };
}
