// A status chip in the shared .status colours. Pure, so both the page and the invoice detail can render it on the server.

const TONE_CLASS = { ok: "status--ok", warn: "status--warn", bad: "status--bad", muted: "status--cancelled" } as const;

export function Status({ label, tone }: { label: string; tone: keyof typeof TONE_CLASS }) {
  return <span className={`status ${TONE_CLASS[tone]}`}>{label}</span>;
}
