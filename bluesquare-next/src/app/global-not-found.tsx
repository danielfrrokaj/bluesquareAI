import Link from "next/link";
import type { Metadata } from "next";
import en from "@/content/en";
import sq from "@/content/sq";
import { jakarta } from "@/lib/fonts";
import { Logo } from "@/components/Logo";
import "./globals.css";

export const metadata: Metadata = {
  title: `${en.notFound.title} | Blue Square AI`,
  robots: { index: false, follow: true },
};

/** Shared 404 for both languages (there is no single root layout to hang it on). */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={jakarta.variable}>
      <head>
        {process.env.NEXT_PUBLIC_ANALYTICS_URL && process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID && (
          <script
            defer
            src={`${process.env.NEXT_PUBLIC_ANALYTICS_URL.replace(/\/$/, "")}/t.js`}
            data-site={process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID}
          />
        )}
      </head>
      <body>
        <header className="site-header">
          <div className="container site-header__inner">
            <Logo lang="en" />
          </div>
        </header>
        <main id="main">
          <section className="page-hero lines-bg">
            <div className="container page-hero__inner">
              <h1>{en.notFound.title}</h1>
              <p className="lead">{en.notFound.text}</p>
              <p className="lead" lang="sq">
                {sq.notFound.title}. {sq.notFound.text}
              </p>
              <div className="btn-row">
                <Link href="/" className="btn btn--light">
                  {en.notFound.home}
                </Link>
                <Link href="/sq" className="btn btn--outline-light" lang="sq">
                  {sq.notFound.home}
                </Link>
              </div>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
