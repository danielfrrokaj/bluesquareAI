import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const jakarta = localFont({
  src: "../fonts/plus-jakarta-sans-latin.woff2",
  weight: "400 800",
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: { default: "Blue Square Analytics", template: "%s | Blue Square Analytics" },
  robots: { index: false, follow: false },
  icons: { icon: [{ url: "/favicon.ico" }, { url: "/logo-mark.svg", type: "image/svg+xml" }] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
