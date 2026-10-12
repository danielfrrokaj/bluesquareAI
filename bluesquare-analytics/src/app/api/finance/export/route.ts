import { currentUser } from "@/lib/auth";
import { BASE_CURRENCY, isTxType, listTransactions } from "@/lib/finance";
import { parsePeriod } from "@/lib/period";
import { csv } from "@/lib/csv";

export const dynamic = "force-dynamic";

/** Transactions as CSV, with the same filters as the transactions page. */
export async function GET(req: Request) {
  if (!(await currentUser())) return new Response("Unauthorized", { status: 401 });
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const period = parsePeriod(sp);
  const rows = await listTransactions(
    {
      from: period.from,
      to: period.to,
      type: isTxType(sp.type) ? sp.type : undefined,
      accountId: sp.account || undefined,
      categoryId: sp.category || undefined,
      userId: sp.user || undefined,
      source: sp.source === "bluebill" || sp.source === "manual" ? sp.source : undefined,
      q: sp.q?.trim().slice(0, 100) || undefined,
    },
    50_000,
  );
  const body = csv(
    ["date", "type", "amount", "currency", "original_amount", "original_currency", "rate", "description", "client_supplier", "category", "account", "user", "source"],
    rows.map((t) => [
      t.occurred_on, t.type, t.amount.toFixed(2), BASE_CURRENCY,
      t.original_amount?.toFixed(2) ?? "", t.original_amount !== null ? t.currency : "", t.fx_rate ?? "", t.description, t.counterparty, t.category_name, t.account_name, t.user_name, t.source,
    ]),
  );
  const file = `transactions-${period.from}-to-${period.to}.csv`;
  return new Response("﻿" + body, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${file}"`, "Cache-Control": "no-store" },
  });
}
