"use server";

import { revalidatePath } from "next/cache";
import { isAdmin, requireAuth } from "@/lib/auth";
import {
  addResult, createAd, deleteAd, deleteResult, getAd, getResult, hasResults, readAdInput, readResultInput, updateAd, updateResult,
} from "@/lib/ads";
import { listAccounts } from "@/lib/finance";
import type { User } from "@/lib/users";
import type { FormState } from "@/components/ActionForm";

// Anyone signed in can add ads and results (as with Finance transactions);
// the person who created an ad or result, or an admin, can change or delete it.

const refresh = () => {
  revalidatePath("/marketing/ads");
  revalidatePath("/finance", "layout"); // results book expenses there
  revalidatePath("/");
};

const id = (form: FormData) => String(form.get("id") ?? "");
const canEdit = (user: User, createdBy: string | null) => isAdmin(user) || createdBy === user.id;

async function accountExists(accountId: string | null) {
  return !accountId || (await listAccounts(true)).some((a) => a.id === accountId);
}

export async function addAd(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireAuth();
  const input = readAdInput(form);
  if (typeof input === "string") return { error: input };
  if (!(await accountExists(input.accountId))) return { error: "That Finance account no longer exists." };
  await createAd(input, user.id);
  refresh();
  return { ok: `“${input.name}” added.` };
}

export async function saveAd(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireAuth();
  const ad = await getAd(id(form));
  if (!ad) return { error: "This ad no longer exists." };
  if (!canEdit(user, ad.created_by)) return { error: "Only the person who added this ad, or an admin, can change it." };
  const input = readAdInput(form);
  if (typeof input === "string") return { error: input };
  if (!(await accountExists(input.accountId))) return { error: "That Finance account no longer exists." };
  if (input.currency !== ad.currency && (await hasResults(ad.id)))
    return { error: `Results were already entered in ${ad.currency}, so the currency can't change.` };
  await updateAd(ad.id, input);
  refresh();
  return { ok: "Saved." };
}

export async function removeAd(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireAuth();
  const ad = await getAd(id(form));
  if (!ad) return { ok: "Deleted." };
  if (!canEdit(user, ad.created_by)) return { error: "Only the person who added this ad, or an admin, can delete it." };
  await deleteAd(ad.id);
  refresh();
  return { ok: `“${ad.name}” and its expenses were deleted.` };
}

export async function addAdResult(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireAuth();
  const ad = await getAd(String(form.get("ad_id") ?? ""));
  if (!ad) return { error: "This ad no longer exists." };
  const input = readResultInput(form);
  if (typeof input === "string") return { error: input };
  const error = await addResult(ad, input, user.id);
  if (error) return { error };
  refresh();
  return { ok: "Results added and the spend booked in Finance." };
}

export async function saveAdResult(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireAuth();
  const result = await getResult(id(form));
  const ad = result && (await getAd(result.ad_id));
  if (!result || !ad) return { error: "These results no longer exist." };
  if (!canEdit(user, result.created_by) && !canEdit(user, ad.created_by)) return { error: "Only the person who entered these results, or an admin, can change them." };
  const input = readResultInput(form);
  if (typeof input === "string") return { error: input };
  const error = await updateResult(ad, result.id, input);
  if (error) return { error };
  refresh();
  return { ok: "Saved, and the Finance expense updated." };
}

export async function removeAdResult(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireAuth();
  const result = await getResult(id(form));
  if (!result) return { ok: "Deleted." };
  const ad = await getAd(result.ad_id);
  if (!canEdit(user, result.created_by) && !canEdit(user, ad?.created_by ?? null)) return { error: "Only the person who entered these results, or an admin, can delete them." };
  await deleteResult(result.id);
  refresh();
  return { ok: "Results and their Finance expense deleted." };
}
