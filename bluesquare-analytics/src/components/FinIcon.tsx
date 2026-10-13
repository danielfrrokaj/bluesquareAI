const paths = {
  check: <><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  down: <><circle cx="12" cy="12" r="9" /><path d="M12 7.5v9m-4-4 4 4 4-4" /></>,
  up: <><circle cx="12" cy="12" r="9" /><path d="M12 16.5v-9m-4 4 4-4 4 4" /></>,
  alert: <><path d="M10.3 4.3 2.6 17.6A2 2 0 0 0 4.3 20.6h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" /><path d="M12 9.5v4M12 17h.01" /></>,
  wallet: <><path d="M19 7V5.5A1.5 1.5 0 0 0 17.5 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" /><path d="M21 9h-5a3 3 0 0 0 0 6h5Z" /><path d="M16 12h.01" /></>,
  money: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M14.5 8.5h-3.25a1.75 1.75 0 0 0 0 3.5h1.5a1.75 1.75 0 0 1 0 3.5H9.5M12 7v1.5M12 15.5V17" /></>,
  tag: <><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9Z" /><circle cx="7.5" cy="7.5" r="1.2" /></>,
  card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5Z" /><path d="m3 13 9 5 9-5" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  calendar: <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M4 10h16M8 3v4M16 3v4" /></>,
  trend: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  next: <path d="m9 6 6 6-6 6" />,
  prev: <path d="m15 6-6 6 6 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
};

export type FinIconName = keyof typeof paths;

/** Line icons for the finance pages (24px grid, currentColor). */
export function FinIcon({ name, size = 20 }: { name: FinIconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
}

/** A round "i" with an explanation, readable on hover and focus. */
export function InfoTip({ text }: { text: string }) {
  return (
    <span className="infotip" tabIndex={0} role="img" aria-label={text} title={text}>
      <FinIcon name="info" size={16} />
    </span>
  );
}
