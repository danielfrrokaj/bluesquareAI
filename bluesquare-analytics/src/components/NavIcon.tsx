export type NavIconName = "overview" | "transactions" | "reports" | "invoices" | "settings";

const paths = {
  overview: <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />,
  transactions: <path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4" />,
  reports: <path d="M3 3v18h18M7 14l4-4 4 3 6-8M16 5h5v5" />,
  invoices: <path d="M6 3h9l4 4v14H5V3h1Zm8 0v5h5M9 12h6M9 16h6" />,
  settings: <>
    <path d="m9.5 3-.6 2.2-1.6.9-2.2-.6-2.5 4.3L4.2 11v2l-1.6 1.2 2.5 4.3 2.2-.6 1.6.9.6 2.2h5l.6-2.2 1.6-.9 2.2.6 2.5-4.3-1.6-1.2v-2l1.6-1.2-2.5-4.3-2.2.6-1.6-.9L14.5 3Z" />
    <circle cx="12" cy="12" r="3" />
  </>,
};

export function NavIcon({ name }: { name: NavIconName }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
}
