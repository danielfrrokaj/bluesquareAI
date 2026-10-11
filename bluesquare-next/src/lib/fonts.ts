import localFont from "next/font/local";

// Self-hosted Plus Jakarta Sans (variable 400–800, Latin incl. ë and ç).
export const jakarta = localFont({
  src: "../fonts/plus-jakarta-sans-latin.woff2",
  weight: "400 800",
  display: "swap",
  variable: "--font-sans",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});
