import { listConversations, type ConvStatus } from "@/lib/chatwoot";
import { allowedInboxIds } from "@/lib/departments";
import { withAssignees } from "@/lib/inbox";
import { chatwootFailure, inboxUser } from "@/lib/inbox-access";

export const dynamic = "force-dynamic";

const STATUSES = ["open", "pending", "resolved", "snoozed", "all"] as const;

/** A page of conversations: ?inboxes=1,2&status=open&assignee=all&page=1 (no inboxes: every inbox). */
export async function GET(req: Request) {
  const user = await inboxUser();
  if (!user) return Response.json({ error: "Sign in again." }, { status: 401 });
  const sp = new URL(req.url).searchParams;
  let inboxIds = (sp.get("inboxes") ?? "").split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0);
  // Some members are granted only certain inbox accounts: "everything" means those, and others are off-limits.
  const allowed = allowedInboxIds(user);
  if (allowed) inboxIds = inboxIds.length ? inboxIds.filter((i) => allowed.includes(i)) : allowed;
  // A group without inboxes (or with none this user may see) shows nothing rather than every inbox.
  if (sp.get("inboxes") === "none" || (allowed && !inboxIds.length)) return Response.json({ conversations: [], counts: { all: 0 }, hasMore: false });
  try {
    const page = await listConversations({
      inboxIds,
      status: STATUSES.find((s) => s === sp.get("status")) ?? ("open" satisfies ConvStatus),
      page: Math.min(200, Math.max(1, Number(sp.get("page")) || 1)),
    });
    // "Mine" and "Unassigned" mean the CRM's own assignments, filtered here after the page is fetched.
    const assignee = sp.get("assignee");
    const conversations = (await withAssignees(page.conversations)).filter((c) =>
      assignee === "me" ? c.assignee?.id === user.id : assignee === "unassigned" ? !c.assignee : true,
    );
    return Response.json({ ...page, conversations });
  } catch (err) {
    return chatwootFailure(err);
  }
}
