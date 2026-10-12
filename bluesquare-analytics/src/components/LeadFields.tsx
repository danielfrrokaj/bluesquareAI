import type { Lead } from "@/lib/sales";
import type { User } from "@/lib/users";
import { PROPERTY_TYPES, SOURCES } from "@/lib/sales-fields";

/** Inputs for a lead; with `note`, also a first note (for new leads). */
export function LeadFields({ lead, users, meId, note }: { lead?: Lead; users: User[]; meId: string; note?: boolean }) {
  const sources = [...new Set([...SOURCES, ...(lead?.source ? [lead.source] : [])])];
  const types = [...new Set([...PROPERTY_TYPES, ...(lead?.property_type ? [lead.property_type] : [])])];
  return (
    <div className="formgrid">
      {lead && <input type="hidden" name="id" value={lead.id} />}
      <label className="field field--wide"><span>Property / hotel</span><input name="hotel" defaultValue={lead?.hotel ?? ""} maxLength={120} placeholder="Hotel Piemonte" /></label>
      <label className="field"><span>Contact person</span><input name="contact" defaultValue={lead?.contact ?? ""} maxLength={120} /></label>
      <label className="field"><span>Phone</span><input name="phone" type="tel" defaultValue={lead?.phone ?? ""} maxLength={40} placeholder="067 666 3538" /></label>
      <label className="field"><span>Email</span><input name="email" type="email" defaultValue={lead?.email ?? ""} maxLength={160} /></label>
      <label className="field"><span>City</span><input name="city" defaultValue={lead?.city ?? ""} maxLength={80} placeholder="Dhërmi" /></label>
      <label className="field">
        <span>Property type</span>
        <select name="property_type" defaultValue={lead?.property_type ?? ""}>
          <option value="">–</option>
          {types.map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      <label className="field"><span>Rooms</span><input name="rooms" inputMode="numeric" defaultValue={lead?.rooms ?? ""} maxLength={6} /></label>
      <label className="field"><span>Current PMS / channel manager</span><input name="current_system" defaultValue={lead?.current_system ?? ""} maxLength={120} placeholder="Excel, none…" /></label>
      <label className="field">
        <span>Source</span>
        <select name="source" defaultValue={lead?.source ?? ""}>
          <option value="">–</option>
          {sources.map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      <label className="field"><span>Next follow-up</span><input name="due_date" type="date" defaultValue={lead?.due_date ?? ""} /></label>
      <label className="field">
        <span>Owner</span>
        <select name="owner_id" defaultValue={lead ? (lead.owner_id ?? "") : meId}>
          <option value="">Nobody</option>
          {users.filter((u) => u.active || u.id === lead?.owner_id).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </label>
      {note && (
        <label className="field field--full"><span>Note</span><textarea name="note" rows={3} maxLength={5000} placeholder="What did you talk about? What's next?" /></label>
      )}
    </div>
  );
}
