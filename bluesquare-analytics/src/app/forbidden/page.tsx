import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { homeFor } from "@/lib/departments";
import { Shell } from "@/components/Shell";

export const metadata = { title: "No access" };

export default async function Forbidden() {
  const user = await requireAuth();
  return (
    <Shell>
      <h1>No access</h1>
      <p className="empty empty--big">
        You don&apos;t have access to this page. Ask an admin if you need it. <Link href={homeFor(user)}>Back to your workspace</Link>
      </p>
    </Shell>
  );
}
