export type NavIconName = "overview" | "transactions" | "reports" | "invoices" | "settings" | "ideas" | "calendar" | "leads" | "customers" | "archive" | "import" | "board" | "folder" | "ads" | "phone" | "files" | "vault" | "wallet" | "register" | "hotel" | "chat" | "inbox" | "issue";

const paths = {
  register: <path d="M3 13h18v7H3zM5 13l1.5-5h11l1.5 5M9 8V4h6v4M7 16.5h2M11 16.5h2M15 16.5h2" />,
  hotel: <path d="M4 21V4h11v17M15 9h5v12M2 21h20M8 8h3M8 12h3M8 16h3" />,
  chat: <path d="M4 5h16v11H9l-5 4V5ZM8 9h8M8 12h5" />,
  inbox: <path d="M3 13 6 5h12l3 8v6H3v-6Zm0 0h5l1 3h6l1-3h5" />,
  issue: <path d="M12 3 2 20h20L12 3ZM12 10v4M12 17h.01" />,
  wallet: <path d="M19 7V5.5A1.5 1.5 0 0 0 17.5 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3M21 9h-5a3 3 0 0 0 0 6h5ZM16 12h.01" />,
  leads: <path d="M3 5h18l-7 8v6l-4 2v-8z" />,
  customers: <path d="M16 11a4 4 0 1 0-8 0M4 21a8 8 0 0 1 16 0M17 3l1.5 1.5L21 2" />,
  archive: <path d="M3 4h18v4H3zM5 8v12h14V8M10 12h4" />,
  import: <path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4" />,
  ads: <path d="M3 10v4a1 1 0 0 0 1 1h3l6 4V5L7 9H4a1 1 0 0 0-1 1ZM17 9a4 4 0 0 1 0 6M7 15l1 5h3l-1-5" />,
  overview: <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />,
  transactions: <path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4" />,
  reports: <path d="M3 3v18h18M7 14l4-4 4 3 6-8M16 5h5v5" />,
  invoices: <path d="M6 3h9l4 4v14H5V3h1Zm8 0v5h5M9 12h6M9 16h6" />,
  ideas: <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z" />,
  calendar: <path d="M4 5h16v16H4zM4 10h16M8 3v4M16 3v4M8 14h3v3H8z" />,
  board: <path d="M4 4h4v16H4zM10 4h4v10h-4zM16 4h4v6h-4z" />,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  files: <path d="M7 3h7l5 5v13H7zM14 3v5h5M4 7v14h11" />,
  vault: <path d="M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4M12 15v2" />,
  folder: <path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6Z" />,
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
