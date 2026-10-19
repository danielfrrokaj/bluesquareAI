import { importFromMultiSystem } from "@/app/sales/actions";
import { ActionForm } from "./ActionForm";
import { Modal } from "./Modal";

/** Light green "Import from MultiSystem" button: pulls the new leads of MultiSystem's Leads table into Sales. */
export function MultiSystemImport() {
  return (
    <Modal trigger="Import from MultiSystem" title="Import from MultiSystem" triggerClassName="btn btn--mint">
      <p className="muted">
        Reads the Leads table in MultiSystem and adds the leads that aren&apos;t in Sales yet, with their notes, checklist, status
        and source. Leads imported before, or with a phone number already in Sales, are skipped, so you can run it again any time.
        New leads are unassigned.
      </p>
      <ActionForm action={importFromMultiSystem} submit="Import leads" pending="Importing…" />
    </Modal>
  );
}
