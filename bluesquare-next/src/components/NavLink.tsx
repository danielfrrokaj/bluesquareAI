"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Nav link that marks itself as the current page (also for nested routes). */
export function NavLink({ href, children, exact = false }: { href: string; children: React.ReactNode; exact?: boolean }) {
  const pathname = usePathname() ?? "/";
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link href={href} className="nav__link" aria-current={active ? "page" : undefined}>
      {children}
    </Link>
  );
}
