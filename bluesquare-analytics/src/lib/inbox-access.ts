import "server-only";
import { currentUser } from "./auth";
import { ChatwootError, getConversation, type Conversation } from "./chatwoot";
import { allowedInboxIds, canAccess } from "./departments";
import type { User } from "./users";

/** The signed-in user if they may open Inbox, for its API routes. */
export async function inboxUser() {
  const user = await currentUser();
  return user && canAccess(user, "inbox") ? user : null;
}

/** Whether this user may see this inbox (some members are granted only certain inbox accounts). */
export const canSeeInbox = (user: Pick<User, "role" | "departments">, inboxId: number) => {
  const allowed = allowedInboxIds(user);
  return allowed === null || allowed.includes(inboxId);
};

/** The conversation, if this user's inbox grants reach it; to anyone else it doesn't exist. */
export async function conversationFor(user: Pick<User, "role" | "departments">, id: number): Promise<Conversation> {
  const conversation = await getConversation(id);
  if (!canSeeInbox(user, conversation.inboxId)) throw new ChatwootError("Unknown conversation.", 404);
  return conversation;
}

/** A Chatwoot failure as an API answer; anything else is a bug and is thrown. */
export function chatwootFailure(err: unknown): Response {
  if (err instanceof ChatwootError) return Response.json({ error: err.message }, { status: err.status === 404 ? 404 : 502 });
  throw err;
}
