import { requireAuth } from "@/lib/auth";
import { Shell } from "@/components/Shell";

export const metadata = { title: "Projects & Tasks" };

export default async function Page() {
  await requireAuth();
  return (
    <Shell department="projects">
      <h1>Projects &amp; Tasks</h1>
      <p className="empty empty--big">This department is coming soon.</p>
    </Shell>
  );
}
