"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, requireRole } from "@/lib/auth";
import { canAccess } from "@/lib/departments";
import {
  assign, ChatwootError, connectChatwoot, contactConversations, createLabel, deleteMessage, disconnectChatwoot, listInboxes,
  setLabels, setMuted, setPriority, setStatus, setTyping, updateContact, type Conversation, type ConvStatus, type Priority,
} from "@/lib/chatwoot";
import { canSeeInbox, conversationFor } from "@/lib/inbox-access";
import type { User } from "@/lib/users";
import { addLeadFor, assignConversation, deleteGroup, isGroupColor, leadFor, saveGroup, withAssignees, type LeadLink } from "@/lib/inbox";
import { getUser } from "@/lib/users";
import type { FormState } from "@/components/ActionForm";

type Result<T = object> = ({ ok: true } & T) | { error: string };

/** Runs a Chatwoot change for someone who may open Inbox, turning Chatwoot's errors into a message. */
async function attempt<T extends object>(run: (user: User) => Promise<T | void>): Promise<Result<T>> {
  const user = await requireAuth();
  if (!canAccess(user, "inbox")) return { error: "You can't open Inbox." };
  try {
    return { ok: true, ...((await run(user)) ?? ({} as T)) };
  } catch (err) {
    if (err instanceof ChatwootError) return { error: err.message };
    throw err;
  }
}

const isId = (n: unknown): n is number => Number.isInteger(n) && (n as number) > 0;

export type ConversationChange =
  | { status: ConvStatus; snoozedUntil?: number }
  | { priority: Priority | null }
  | { assigneeId: string | null } // a CRM user; kept by the CRM, not Chatwoot
  | { teamId: number | null }
  | { labels: string[] }
  | { muted: boolean };

/** Status, priority, assignee, team, labels or mute; answers the conversation as it is now. */
export const changeConversation = async (id: number, change: ConversationChange) =>
  attempt<{ conversation: Conversation }>(async (user) => {
    if (!isId(id)) throw new ChatwootError("Unknown conversation.", 404);
    await conversationFor(user, id); // their inbox grants must reach it
    if ("status" in change) await setStatus(id, change.status, change.snoozedUntil);
    else if ("priority" in change) await setPriority(id, change.priority);
    else if ("assigneeId" in change) {
      if (change.assigneeId !== null) {
        const to = await getUser(change.assigneeId);
        if (!to?.active || !canAccess(to, "inbox")) throw new ChatwootError("That user can't open Inbox.", 400);
      }
      await assignConversation(id, change.assigneeId, user.id);
    } else if ("teamId" in change) await assign(id, { teamId: change.teamId });
    else if ("labels" in change) await setLabels(id, change.labels.map((l) => String(l).trim().toLowerCase().replace(/\s+/g, "-")).filter(Boolean).slice(0, 20));
    else if ("muted" in change) await setMuted(id, change.muted);
    return { conversation: (await withAssignees([await conversationFor(user, id)]))[0] };
  });

export const removeMessage = async (conversationId: number, messageId: number) =>
  attempt(async (user) => {
    await conversationFor(user, conversationId);
    await deleteMessage(conversationId, messageId);
  });

/** Shown to the customer as "typing…" while someone writes a reply. */
export const typing = async (conversationId: number, on: boolean) => attempt(() => setTyping(conversationId, on).then(() => undefined));

/** The contact's conversations this user may see. */
export const contactHistory = async (contactId: number) =>
  attempt<{ conversations: Conversation[] }>(async (user) => ({
    conversations: (await contactConversations(contactId)).filter((c) => canSeeInbox(user, c.inboxId)),
  }));

export const saveContact = async (contactId: number, c: { name: string; email: string; phone: string }) =>
  attempt(async () => {
    const name = c.name.trim().slice(0, 120);
    if (!name) throw new ChatwootError("The contact needs a name.", 400);
    const email = c.email.trim().slice(0, 160) || null;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ChatwootError("That email doesn't look right.", 400);
    const phone = c.phone.replace(/[^\d+]/g, "").slice(0, 20) || null;
    if (phone && !/^\+\d{7,15}$/.test(phone)) throw new ChatwootError("Write the phone number with its country code, e.g. +355 69 123 4567.", 400);
    await updateContact(contactId, { name, email, phone });
  });

export const newLabel = async (title: string, color: string) =>
  attempt(async () => {
    const t = title.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\p{L}\p{N}_-]/gu, "").slice(0, 40);
    if (!t) throw new ChatwootError("Name the label.", 400);
    await createLabel(t, /^#[0-9a-f]{6}$/i.test(color) ? color : "#4a84d0");
  });

/** Adds the conversation's contact to Sales as a lead (or finds the one it already is). */
export const addToSales = async (conversationId: number) =>
  attempt<{ lead: LeadLink; created: boolean }>(async (user) => {
    const conversation = await conversationFor(user, conversationId);
    const existing = await leadFor(conversation.contact);
    if (existing) return { lead: existing, created: false };
    const channel = (await listInboxes()).find((i) => i.id === conversation.inboxId)?.channel ?? "api";
    await addLeadFor(conversation.contact, channel, user.id);
    revalidatePath("/sales", "layout");
    return { lead: (await leadFor(conversation.contact))!, created: true };
  });

// ---------- Admin: groups and the connection ----------

export async function saveInboxGroup(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  const name = String(form.get("name") ?? "").trim().slice(0, 60);
  const color = String(form.get("color") ?? "blue");
  const inboxIds = form.getAll("inbox").map(Number).filter(isId);
  if (!name) return { error: "Name the group." };
  if (!inboxIds.length) return { error: "Pick at least one inbox." };
  await saveGroup({ id: String(form.get("id") ?? "") || undefined, name, color: isGroupColor(color) ? color : "blue", inboxIds });
  revalidatePath("/inbox");
  return { ok: `Group “${name}” saved.` };
}

export async function removeInboxGroup(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  await deleteGroup(String(form.get("id") ?? ""));
  revalidatePath("/inbox");
  return { ok: "Group deleted. Its inboxes and conversations stay." };
}

export async function connectInbox(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  const url = String(form.get("url") ?? "").trim() || "https://app.chatwoot.com";
  const accountId = Number(form.get("account_id"));
  const token = String(form.get("token") ?? "").trim();
  if (!/^https:\/\/[^\s/]+/.test(url)) return { error: "Enter Chatwoot's address, starting with https://" };
  if (!isId(accountId)) return { error: "Enter the account ID: the number after /accounts/ in Chatwoot's address bar." };
  if (!token) return { error: "Paste the access token from Chatwoot → Profile settings." };
  try {
    await connectChatwoot(url, accountId, token);
  } catch (err) {
    if (err instanceof ChatwootError) return { error: err.status === 401 ? "Chatwoot rejected this token." : err.message };
    throw err;
  }
  revalidatePath("/inbox");
  return { ok: "Chatwoot connected." };
}

export async function disconnectInbox(): Promise<FormState> {
  await requireRole("admin");
  await disconnectChatwoot();
  revalidatePath("/inbox");
  return { ok: "Chatwoot disconnected. Nothing was deleted there." };
}
