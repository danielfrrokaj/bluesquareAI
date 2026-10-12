const cell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  // Quote fields and neutralise spreadsheet formulas (CSV injection).
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

export const csv = (header: string[], rows: unknown[][]) => [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
