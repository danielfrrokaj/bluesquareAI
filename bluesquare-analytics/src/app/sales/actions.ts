"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdmin, requireAuth, requireRole } from "@/lib/auth";
import {
  addNote, createLead, deleteLead, deleteNote, getLead, leadTitle, markLost, markWon, reopen, setFollowUp, setStep, updateLead, type LeadInput,
} from "@/lib/sales";
import { LOST_REASONS, NOTE_KINDS, PRODUCTS, STEPS, isStep, isLeadField, type NoteKind } from "@/lib/sales-fields";
import { analyze, runImport, type Analysis, type ImportResult, type Mapping } from "@/lib/sales-import";
import { listUsers } from "@/lib/users";
import { isDate } from "@/lib/period";
import type { FormState } from "@/components/ActionForm";

const str = (form: FormData, key: string, max = 200) => String(form.get(key) ?? "").trim().slice(0, max);
const opt = (form: FormData, key: string, max = 200) => str(form, key, max) || null;
const refresh = () => revalidatePath("/sales", "layout");

async function readLead(form: FormData): Promise<LeadInput | string> {
  const input: LeadInput = {
    hotel: opt(form, "hotel", 120), contact: opt(form, "contact", 120), phone: opt(form, "phone", 40), email: opt(form, "email", 160),
    city: opt(form, "city", 80), property_type: opt(form, "property_type", 40), rooms: null, current_system: opt(form, "current_system", 120),
    source: opt(form, "source", 60), due_date: opt(form, "due_date", 10), owner_id: opt(form, "owner_id", 60),
  };
  if (!input.hotel && !input.contact && !input.phone) return "Enter at least a property, a contact or a phone number.";
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) return "That email doesn't look right.";
  if (input.due_date && !isDate(input.due_date)) return "Enter a valid follow-up date.";
  const rooms = str(form, "rooms", 10);
  if (rooms) {
    const n = Number(rooms);
    if (!Number.isInteger(n) || n < 0 || n > 100000) return "Rooms must be a whole number.";
    input.rooms = n;
  }
  if (input.owner_id && !(await listUsers()).some((u) => u.id === input.owner_id)) return "That owner no longer exists.";
  return input;
}

export async function addLead(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireAuth();
  const input = await readLead(form);
  if (typeof input === "string") return { error: input };
  const id = await createLead(input, me.id);
  const note = str(form, "note", 5000);
  if (note) await addNote(id, me.id, "note", note);
  await addNote(id, me.id, "event", "Lead created");
  refresh();
  return { ok: `Lead “${leadTitle(input)}” added.` };
}

async function lead(form: FormData) {
  const me = await requireAuth();
  const l = await getLead(str(form, "id", 60));
  if (!l) redirect("/sales");
  return { me, l };
}

export async function saveLead(_: FormState, form: FormData): Promise<FormState> {
  const { l } = await lead(form);
  const input = await readLead(form);
  if (typeof input === "string") return { error: input };
  await updateLead(l.id, { ...input, ref: l.ref });
  refresh();
  return { ok: "Lead saved." };
}

/** Checklist chip: flips one step. */
export async function toggleStep(form: FormData) {
  const { me, l } = await lead(form);
  const step = str(form, "step");
  if (!isStep(step)) return;
  await setStep(l.id, step, !l[step]);
  await addNote(l.id, me.id, "event", `${STEPS[step]}: ${l[step] ? "no" : "yes"}`);
  refresh();
}

export async function addLeadNote(_: FormState, form: FormData): Promise<FormState> {
  const { me, l } = await lead(form);
  const body = str(form, "body", 5000);
  const kind = str(form, "kind") as NoteKind;
  const due = str(form, "due_date", 10);
  if (!body) return { error: "Write a note first." };
  if (!(kind in NOTE_KINDS)) return { error: "Choose note, call or meeting." };
  if (due && !isDate(due)) return { error: "Enter a valid follow-up date." };
  await addNote(l.id, me.id, kind, body);
  if (kind === "call" && !l.called) await setStep(l.id, "called", true);
  if (due) await setFollowUp(l.id, due);
  refresh();
  return { ok: due ? `Saved. Next follow-up ${due}.` : "Note saved." };
}

export async function removeNote(form: FormData) {
  const { me, l } = await lead(form);
  if (!isAdmin(me)) return;
  await deleteNote(str(form, "note_id", 60), l.id);
  refresh();
}

export async function winLead(_: FormState, form: FormData): Promise<FormState> {
  const { me, l } = await lead(form);
  const products = form.getAll("products").map(String).filter((p) => PRODUCTS.includes(p));
  const raw = str(form, "monthly_value", 20).replace(",", ".");
  const value = raw ? Number(raw) : null;
  if (!products.length) return { error: "Pick what they bought." };
  if (value !== null && (!Number.isFinite(value) || value < 0 || value > 1e7)) return { error: "Enter the monthly value in euros, e.g. 49." };
  await markWon(l.id, products, value);
  await addNote(l.id, me.id, "event", `Won: ${products.join(", ")}${value !== null ? ` · €${value}/month` : ""}`);
  const note = str(form, "note", 2000);
  if (note) await addNote(l.id, me.id, "note", note);
  refresh();
  return { ok: `${leadTitle(l)} is now a customer.` };
}

export async function loseLead(_: FormState, form: FormData): Promise<FormState> {
  const { me, l } = await lead(form);
  const reason = str(form, "reason", 80);
  if (!LOST_REASONS.includes(reason)) return { error: "Pick a reason." };
  await markLost(l.id, reason);
  await addNote(l.id, me.id, "event", `Lost: ${reason}`);
  const note = str(form, "note", 2000);
  if (note) await addNote(l.id, me.id, "note", note);
  refresh();
  return { ok: `${leadTitle(l)} moved to the archive.` };
}

export async function reopenLead(_: FormState, form: FormData): Promise<FormState> {
  const { me, l } = await lead(form);
  await reopen(l.id);
  await addNote(l.id, me.id, "event", `Reopened (was ${l.status})`);
  refresh();
  return { ok: `${leadTitle(l)} is back in Leads.` };
}

export async function removeLead(_: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  const { l } = await lead(form);
  await deleteLead(l.id);
  refresh();
  redirect(l.status === "won" ? "/sales/customers" : l.status === "lost" ? "/sales/archive" : "/sales");
}

// ---------- Import ----------

export type AnalyzeState = { error?: string; analysis?: Analysis } | null;

export async function analyzeImport(_: AnalyzeState, form: FormData): Promise<AnalyzeState> {
  const me = await requireAuth();
  const file = form.get("file");
  let text = str(form, "text", 2_100_000);
  if (file instanceof File && file.size > 0) {
    if (file.size > 2_000_000) return { error: "The file is too large: up to 2 MB." };
    if (/\.(xlsx?|numbers|ods)$/i.test(file.name)) return { error: "Save the sheet as CSV first (File → Download → CSV), or copy the rows and paste them." };
    text = (await file.text()).replace(/^﻿/, "");
  }
  const result = await analyze(text, me.id);
  return typeof result === "string" ? { error: result } : { analysis: result };
}

export type ImportState = { error?: string; result?: ImportResult } | null;

export async function confirmImport(_: ImportState, form: FormData): Promise<ImportState> {
  const me = await requireAuth();
  let mapping: Mapping;
  try {
    const raw = JSON.parse(str(form, "mapping", 100_000)) as Record<string, string>;
    mapping = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, isLeadField(v) ? v : ""]));
  } catch {
    return { error: "The column mapping couldn't be read. Start again." };
  }
  const fields = Object.values(mapping).filter(Boolean);
  if (new Set(fields).size !== fields.length) return { error: "Two columns are mapped to the same field. Each field can be used once." };
  if (!fields.some((f) => f === "hotel" || f === "contact" || f === "phone")) return { error: "Map at least one column to Property, Contact or Phone." };
  const owner = str(form, "owner_id", 60) || null;
  const result = await runImport(str(form, "id", 60), me.id, mapping, owner);
  if (typeof result === "string") return { error: result };
  refresh();
  return { result };
}

/** Follow-ups tab: push a lead's next follow-up by some days from today. */
export async function snoozeFollowUp(form: FormData) {
  await requireAuth();
  const days = Number(form.get("days"));
  const l = await getLead(str(form, "id"));
  if (!l || l.status !== "open" || ![1, 3, 7].includes(days)) return;
  const tz = process.env.REPORT_TIMEZONE || "Europe/Tirane";
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
  const next = new Date(Date.parse(`${today}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
  await setFollowUp(l.id, next);
  refresh();
}
