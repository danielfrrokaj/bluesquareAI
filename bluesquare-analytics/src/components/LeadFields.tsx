import type { Lead } from "@/lib/sales";
import type { User } from "@/lib/users";
import { PROPERTY_TYPES, SOURCES } from "@/lib/sales-fields";

type Values = Partial<Record<"hotel" | "contact" | "phone" | "email" | "city" | "property_type" | "rooms" | "current_system" | "source" | "due_date" | "note", string>>;

/**
 * Inputs for a lead; with `note`, also a first note (for new leads). `draft` pre-fills a new lead (AI import), and the
 * inputs named in `ai` carry `data-ai` so the AI form can highlight what it filled.
 */
export function LeadFields({ lead, users, meId, note, draft, ai }: {
  lead?: Lead; users: Pick<User, "id" | "name" | "active">[]; meId: string; note?: boolean; draft?: Values; ai?: readonly string[];
}) {
  const sources = [...new Set([...SOURCES, ...(lead?.source ? [lead.source] : [])])];
  const types = [...new Set([...PROPERTY_TYPES, ...(lead?.property_type ? [lead.property_type] : [])])];
  const v = (name: keyof Values) => (lead ? String(lead[name as keyof Lead] ?? "") : draft?.[name] ?? "");
  const mark = (name: keyof Values) => (ai?.includes(name) ? { "data-ai": "" } : {});
  return (
    <div className="formgrid">
      {lead && <input type="hidden" name="id" value={lead.id} />}
      <label className="field field--wide"><span>Property / hotel</span><input name="hotel" defaultValue={v("hotel")} maxLength={120} placeholder="Hotel Piemonte" {...mark("hotel")} /></label>
      <label className="field"><span>Contact person</span><input name="contact" defaultValue={v("contact")} maxLength={120} {...mark("contact")} /></label>
      <label className="field"><span>Phone</span><input name="phone" type="tel" defaultValue={v("phone")} maxLength={40} placeholder="067 666 3538" {...mark("phone")} /></label>
      <label className="field"><span>Email</span><input name="email" type="email" defaultValue={v("email")} maxLength={160} {...mark("email")} /></label>
      <label className="field"><span>City</span><input name="city" defaultValue={v("city")} maxLength={80} placeholder="Dhërmi" {...mark("city")} /></label>
      <label className="field">
        <span>Property type</span>
        <select name="property_type" defaultValue={v("property_type")} {...mark("property_type")}>
          <option value="">–</option>
          {types.map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      <label className="field"><span>Rooms</span><input name="rooms" inputMode="numeric" defaultValue={v("rooms")} maxLength={6} {...mark("rooms")} /></label>
      <label className="field"><span>Current PMS / channel manager</span><input name="current_system" defaultValue={v("current_system")} maxLength={120} placeholder="Excel, none…" {...mark("current_system")} /></label>
      <label className="field">
        <span>Source</span>
        <select name="source" defaultValue={v("source")} {...mark("source")}>
          <option value="">–</option>
          {sources.map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      <label className="field"><span>Next follow-up</span><input name="due_date" type="date" defaultValue={v("due_date")} {...mark("due_date")} /></label>
      <label className="field">
        <span>Owner</span>
        <select name="owner_id" defaultValue={lead ? (lead.owner_id ?? "") : meId}>
          <option value="">Nobody</option>
          {users.filter((u) => u.active || u.id === lead?.owner_id).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </label>
      {note && (
        <label className="field field--full"><span>Note</span><textarea name="note" rows={3} maxLength={5000} defaultValue={draft?.note ?? ""} placeholder="What did you talk about? What's next?" {...mark("note")} /></label>
      )}
    </div>
  );
}
