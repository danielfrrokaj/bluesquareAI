import { requireAuth } from "@/lib/auth";
import { Shell } from "@/components/Shell";

export const metadata = { title: "Sales" };

export default async function Page() {
  await requireAuth();
  return (
    <Shell department="sales">
      <h1>Sales</h1>
      <p className="empty empty--big">This department is coming soon.</p>
    </Shell>
  );
}
