import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { Shell } from "@/components/Shell";

export const metadata = { title: "No access" };

export default async function Forbidden() {
  await requireAuth();
  return (
    <Shell department="overview">
      <h1>No access</h1>
      <p className="empty empty--big">
        This page needs the admin role. Ask an admin if you need access. <Link href="/">Back to the overview</Link>
      </p>
    </Shell>
  );
}
