import { requireAuth } from "@/lib/auth";
import { Shell } from "@/components/Shell";

export const metadata = { title: "Marketing" };

export default async function Page() {
  await requireAuth();
  return (
    <Shell department="marketing">
      <h1>Marketing</h1>
      <p className="empty empty--big">This department is coming soon.</p>
    </Shell>
  );
}
