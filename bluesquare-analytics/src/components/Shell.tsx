import Link from "next/link";
import { logout } from "@/app/actions";
import { currentUser, isAdmin } from "@/lib/auth";
import { ROLES } from "@/lib/users";
import { NavIcon, type NavIconName } from "./NavIcon";
import s from "./Shell.module.css";

export type Department = "overview" | "finance" | "analytics" | "marketing" | "sales" | "projects" | "users";
export type SubLink = { href: string; label: string; icon?: NavIconName; current?: boolean };

// Icons in public/icons, generated with Gemini in the website's 3D style (see bluesquare-next/tools).
const DEPARTMENTS: { key: Department; href: string; label: string; adminOnly?: boolean }[] = [
  { key: "overview", href: "/", label: "Overview" },
  { key: "finance", href: "/finance", label: "Finance" },
  { key: "analytics", href: "/analytics", label: "Analytics" },
  { key: "marketing", href: "/marketing", label: "Marketing" },
  { key: "sales", href: "/sales", label: "Sales" },
  { key: "projects", href: "/projects", label: "Projects & Tasks" },
  { key: "users", href: "/users", label: "Users", adminOnly: true },
];

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";

function Brand() {
  return (
    <Link href="/" className={s.brand}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-mark.svg" alt="" width={28} height={26} />
      Blue Square
    </Link>
  );
}

/** Dashboard frame: sidebar with departments and account, an optional section bar, and the page. */
export async function Shell({ department, subnav, children }: { department: Department; subnav?: SubLink[]; children: React.ReactNode }) {
  const user = await currentUser();
  const admin = isAdmin(user);
  return (
    <div className={s.frame}>
      {/* Drawer toggle for small screens; a checkbox keeps this a server component. */}
      {/* Keyed by page so the drawer closes after navigating. */}
      <input key={`${department}:${subnav?.find((l) => l.current)?.href ?? ""}`} type="checkbox" id="nav-toggle" className={s.toggle} aria-label="Open menu" />
      <div className={s.mobilebar}>
        <label htmlFor="nav-toggle" className={s.burger} aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </label>
        <Brand />
      </div>
      <label htmlFor="nav-toggle" className={s.scrim} aria-hidden="true" />

      <aside className={s.side}>
        <Brand />
        <div className={s.label}>Workspace</div>
        <nav className={s.nav} aria-label="Departments">
          {DEPARTMENTS.filter((d) => admin || !d.adminOnly).map((d) => (
            <Link key={d.key} href={d.href} className={s.item} aria-current={d.key === department ? "page" : undefined}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/icons/${d.key}.png`} alt="" width={34} height={34} />
              {d.label}
            </Link>
          ))}
        </nav>
        {user && (
          <div className={s.account}>
            <span className={s.avatar} aria-hidden="true">{initials(user.name)}</span>
            <span className={s.who} title={user.email}>
              <strong>{user.name}</strong>
              <small>{ROLES[user.role]}</small>
            </span>
            <form action={logout}>
              <button className={s.signout} title="Sign out" aria-label="Sign out">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
              </button>
            </form>
          </div>
        )}
        <div className={s.foot}>
          Blue Square AI · IP geolocation by{" "}
          <a href="https://db-ip.com" target="_blank" rel="noopener">
            DB-IP
          </a>
        </div>
      </aside>

      <div className={s.content}>
        {subnav && subnav.length > 0 && (
          <div className={s.subnav}>
            <nav className="wrap" aria-label="Section">
              {subnav.map((l) => (
                <Link key={l.href} href={l.href} aria-current={l.current ? "page" : undefined}>
                  {l.icon && <NavIcon name={l.icon} />}
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
        <main className="wrap main">{children}</main>
      </div>
    </div>
  );
}
