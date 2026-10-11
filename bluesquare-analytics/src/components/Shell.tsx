import Link from "next/link";
import { logout } from "@/app/actions";
import type { Site } from "@/lib/sites";

/** Dashboard frame: top bar with logo, site switcher and sign-out. */
export function Shell({ sites, currentId, children }: { sites: Site[]; currentId?: string; children: React.ReactNode }) {
  return (
    <>
      <header className="topnav">
        <div className="wrap topnav__inner">
          <Link href="/" className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.svg" alt="" width={28} height={26} />
            Blue Square <span>Analytics</span>
          </Link>
          <nav className="sitenav" aria-label="Websites">
            <Link href="/" aria-current={!currentId ? "page" : undefined}>
              All websites
            </Link>
            {sites.map((s) => (
              <Link key={s.id} href={`/sites/${s.id}`} aria-current={s.id === currentId ? "page" : undefined}>
                {s.name}
              </Link>
            ))}
          </nav>
          <form action={logout}>
            <button className="btn btn--ghost btn--small">Sign out</button>
          </form>
        </div>
      </header>
      <main className="wrap main">{children}</main>
      <footer className="wrap foot">
        Cookieless analytics by Blue Square AI · IP geolocation by{" "}
        <a href="https://db-ip.com" target="_blank" rel="noopener">
          DB-IP
        </a>
      </footer>
    </>
  );
}
