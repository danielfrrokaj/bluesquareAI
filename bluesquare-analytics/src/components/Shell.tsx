import Link from "next/link";
import { logout } from "@/app/actions";
import { currentUser, isAdmin } from "@/lib/auth";
import { avatarUrl, ROLES } from "@/lib/users";
import { sidebarProjects } from "@/lib/projects";
import { LogoMark, projectLogoUrl } from "./AccountMark";
import { NavIcon, type NavIconName } from "./NavIcon";
import s from "./Shell.module.css";

export type Department = "overview" | "finance" | "analytics" | "marketing" | "archive" | "sales" | "projects" | "users" | "settings";
/** `external` links (another app) open in a new browser tab. */
export type SubLink = { href: string; label: string; icon?: NavIconName; current?: boolean; external?: boolean };

// Icons in public/icons, generated with Gemini in the website's 3D style (see bluesquare-next/tools).
const DEPARTMENTS: { key: Department; href: string; label: string; adminOnly?: boolean }[] = [
  { key: "overview", href: "/", label: "Overview" },
  { key: "finance", href: "/finance", label: "Finance" },
  { key: "analytics", href: "/analytics", label: "Analytics" },
  { key: "marketing", href: "/marketing", label: "Marketing & Ads" },
  { key: "archive", href: "/archive", label: "Archive" },
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
/** `current` marks the open item under a department in the sidebar (e.g. the project being viewed). */
export async function Shell({ department, subnav, current, children }: {
  department: Department; subnav?: SubLink[]; current?: string; children: React.ReactNode;
}) {
  const user = await currentUser();
  const admin = isAdmin(user);
  // Inside Projects & Tasks, its projects are listed under it with their open task counts.
  const projects = department === "projects" ? await sidebarProjects() : [];
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
            <div key={d.key} className={s.group}>
              <Link href={d.href} className={s.item} aria-current={d.key === department && !(d.key === "projects" && current) ? "page" : undefined}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/icons/${d.key}.png`} alt="" width={34} height={34} />
                {d.label}
              </Link>
              {d.key === "projects" && projects.length > 0 && (
                <ul className={s.subitems} aria-label="Projects">
                  {projects.map((p) => (
                    <li key={p.id}>
                      <Link href={`/projects/${p.id}`} className={s.subitem} aria-current={current === p.id ? "page" : undefined}
                        title={`${p.name} · ${p.open} open ${p.open === 1 ? "task" : "tasks"}`}>
                        <LogoMark src={projectLogoUrl(p.id, p.logo_version)} name={p.name} size={22} />
                        <span className={s.subname}>{p.name}</span>
                        {p.open > 0 && <b className={s.count}>{p.open}</b>}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>
        <Link href="/settings" className={`${s.item} ${s.settingsLink}`} aria-current={department === "settings" ? "page" : undefined}>
          <span className={s.gear} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </span>
          Settings
        </Link>
        {user && (
          <div className={s.account}>
            <Link href="/settings" className={s.me} title={`${user.email} · Profile settings`}>
              {avatarUrl(user) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className={s.avatar} src={avatarUrl(user)!} alt="" width={36} height={36} />
              ) : (
                <span className={s.avatar} aria-hidden="true">{initials(user.name)}</span>
              )}
              <span className={s.who}>
                <strong>{user.name}</strong>
                <small>{ROLES[user.role]}</small>
              </span>
            </Link>
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
              {subnav.map((l) =>
                l.external ? (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" title={`Opens ${l.label} in a new tab`}>
                    {l.icon && <NavIcon name={l.icon} />}
                    {l.label} <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <Link key={l.href} href={l.href} aria-current={l.current ? "page" : undefined}>
                    {l.icon && <NavIcon name={l.icon} />}
                    {l.label}
                  </Link>
                ),
              )}
            </nav>
          </div>
        )}
        <main className="wrap main">{children}</main>
      </div>
    </div>
  );
}
