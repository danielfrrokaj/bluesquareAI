"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { canAccess } from "@/lib/departments";
import { markAllRead } from "@/lib/lux-feeds";
import { markAllPersonalRead } from "@/lib/notifications";
import { isFeedKind } from "@/lib/luxhotel-data";

/** Marks everything this person hasn't read as read (only one LuxHotel feed's, when the form posts `kind`). */
export async function readAll(form: FormData) {
  const user = await requireAuth();
  const kind = form.get("kind");
  if (isFeedKind(kind)) await markAllRead(user.id, kind);
  else await Promise.all([markAllPersonalRead(user.id), canAccess(user, "luxhotel") ? markAllRead(user.id) : null]);
  revalidatePath("/", "layout");
}
