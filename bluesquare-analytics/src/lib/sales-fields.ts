// Lead fields and choices, shared by the server and the import screen.

export const LEAD_FIELDS = {
  hotel: "Property / hotel",
  contact: "Contact person",
  phone: "Phone",
  email: "Email",
  city: "City",
  property_type: "Property type",
  rooms: "Rooms",
  current_system: "Current PMS / channel manager",
  source: "Source",
  due_date: "Next follow-up",
  notes: "Notes",
  called: "Called",
  interested: "Interested",
  demo_sent: "Demo sent",
  lr_sent: "LR sent",
  status: "Status",
  ref: "ID in old system",
} as const;
export type LeadField = keyof typeof LEAD_FIELDS;
export const isLeadField = (v: unknown): v is LeadField => typeof v === "string" && v in LEAD_FIELDS;

/** The sales checklist, in order: how far a lead has come. */
export const STEPS = { called: "Called", interested: "Interested", demo_sent: "Demo sent", lr_sent: "LR sent" } as const;
export type Step = keyof typeof STEPS;
export const isStep = (v: unknown): v is Step => typeof v === "string" && v in STEPS;

export const SOURCES = ["Phone", "Website", "Referral", "Facebook", "Instagram", "Google", "Booking.com", "Event", "Walk-in", "Other"];
export const PROPERTY_TYPES = ["Hotel", "Apartments", "Guesthouse", "Hostel", "Villa", "Resort", "Other"];
export const PRODUCTS = ["PMS", "Channel Manager", "Booking Engine", "Fiscalization", "Website"];
export const LOST_REASONS = ["Price", "Chose a competitor", "Not interested", "No response", "Not the decision maker", "Property closed or sold", "Other"];
export const NOTE_KINDS = { note: "Note", call: "Call", meeting: "Meeting" } as const;
export type NoteKind = keyof typeof NOTE_KINDS;
