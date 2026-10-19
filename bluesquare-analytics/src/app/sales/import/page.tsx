import { requireAuth } from "@/lib/auth";
import { aiEnabled } from "@/lib/ai";
import { listUsers } from "@/lib/users";
import { Shell } from "@/components/Shell";
import { salesNav } from "@/components/nav";
import { ImportWizard } from "@/components/ImportWizard";
import { MultiSystemImport } from "@/components/MultiSystemImport";

export const dynamic = "force-dynamic";
export const metadata = { title: "Import leads" };

export default async function ImportPage() {
  const me = await requireAuth();
  const users = (await listUsers()).filter((u) => u.active).map((u) => ({ id: u.id, name: u.name }));
  return (
    <Shell department="sales" subnav={salesNav("import")}>
      <div className="pagehead">
        <div>
          <h1>Import leads</h1>
          <p className="muted">Bring in a spreadsheet of leads at once. Nothing is saved until you confirm.</p>
        </div>
        <MultiSystemImport />
      </div>
      <ImportWizard users={users} meId={me.id} aiOn={aiEnabled()} />
    </Shell>
  );
}
