import { currentUser } from "@/lib/auth";
import { canOpenFinanceTab } from "@/lib/departments";
import { BASE_CURRENCY, bookRecurring, isTxKind, isTxStatus, listTransactions } from "@/lib/finance";
import { optionalPeriod } from "@/lib/period";
import { csv } from "@/lib/csv";

export const dynamic = "force-dynamic";

/** Transactions as CSV, with the same filters as the transactions page (every date unless a period is given). */
export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!canOpenFinanceTab(user, "transactions")) return new Response("Forbidden", { status: 403 });
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const period = optionalPeriod(sp);
  await bookRecurring();
  const rows = await listTransactions(
    {
      from: period?.from,
      to: period?.to,
      type: isTxKind(sp.type) ? sp.type : undefined,
      status: isTxStatus(sp.status) ? sp.status : undefined,
      accountId: sp.account || undefined,
      categoryId: sp.category || undefined,
      userId: sp.user || undefined,
      source: sp.source === "bluebill" || sp.source === "manual" || sp.source === "meta_ads" || sp.source === "recurring" ? sp.source : undefined,
      q: sp.q?.trim().slice(0, 100) || undefined,
    },
    50_000,
  );
  const body = csv(
    ["date", "type", "amount", "currency", "original_amount", "original_currency", "rate", "description", "client_supplier", "category", "account", "to_account", "user", "source", "status", "reviewed_at"],
    rows.map((t) => [
      t.occurred_on, t.type, t.amount.toFixed(2), BASE_CURRENCY,
      t.original_amount?.toFixed(2) ?? "", t.original_amount !== null ? t.currency : "", t.fx_rate ?? "", t.description, t.counterparty, t.category_name, t.account_name, t.to_account_name, t.user_name, t.source, t.status, t.reviewed_at ?? "",
    ]),
  );
  const file = period ? `transactions-${period.from}-to-${period.to}.csv` : "transactions-all.csv";
  return new Response("﻿" + body, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${file}"`, "Cache-Control": "no-store" },
  });
}
