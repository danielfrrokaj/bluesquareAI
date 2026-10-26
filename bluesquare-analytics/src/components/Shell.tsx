import Link from "next/link";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { logout } from "@/app/actions";
import { currentUser } from "@/lib/auth";
import { canAccess, departmentHref, DEPARTMENTS, homeFor, type Department } from "@/lib/departments";
import { avatarUrl, ROLES } from "@/lib/users";
import { sidebarProjects } from "@/lib/projects";
import { syncLuxFeeds, unreadCounts } from "@/lib/lux-feeds";
import { personalUnread, sendReminders } from "@/lib/notifications";
import { syncHotels } from "@/lib/lux-properties";
import { LogoMark, projectLogoUrl } from "./AccountMark";
import { NavIcon, type NavIconName } from "./NavIcon";
import { NoSubList, SubList } from "./SubList";
import s from "./Shell.module.css";

export type { Department };
/** `external` links (another app) open in a new browser tab. */
export type SubLink = { href: string; label: string; icon?: NavIconName; image?: string; current?: boolean; external?: boolean; badge?: number };

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

/** A department's tab in the sidebar, listed under it while it's open. */
function SubItem({ link: l }: { link: SubLink }) {
  const body = (
    <>
      {l.icon && <span className={s.subicon}><NavIcon name={l.icon} /></span>}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {l.image && <img className={s.subicon} src={l.image} alt="" width={16} height={16} />}
      <span className={s.subname}>{l.label}</span>
      {l.external && <span aria-hidden="true">↗</span>}
      {l.badge ? <b className={`${s.count} ${s.unreadCount}`} title={`${l.badge} unread`}>{l.badge}</b> : null}
    </>
  );
  return l.external ? (
    <a href={l.href} target="_blank" rel="noopener noreferrer" className={s.subitem} title={`Opens ${l.label} in a new tab`}>{body}</a>
  ) : (
    <Link href={l.href} className={s.subitem} aria-current={l.current ? "page" : undefined}>{body}</Link>
  );
}

/** The notification bell: what this person hasn't read yet (their own notifications, and LuxHotel's records if they open it). */
function Bell({ unread }: { unread: number }) {
  return (
    <Link href="/notifications" className={s.bell} aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"} title="Notifications">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10.3 20a1.9 1.9 0 0 0 3.4 0" />
      </svg>
      {unread > 0 && <b className={s.bellCount}>{unread > 99 ? "99+" : unread}</b>}
    </Link>
  );
}

/**
 * Dashboard frame: sidebar with departments and account, and the page. The open department lists its tabs (`subnav`)
 * under it in the sidebar; small screens, where the sidebar is a drawer, also get them as a bar above the page.
 * `current` marks the open item under a department in the sidebar (e.g. the project being viewed).
 * A user who may not open `department` is sent to the first one they may; without `department` (e.g. the
 * no-access page) nothing is highlighted or checked.
 */
export async function Shell({ department, subnav, current, full, children }: {
  department?: Department; subnav?: SubLink[]; current?: string; children: React.ReactNode;
  full?: boolean; // the page fills the window edge to edge (an app view, like Inbox)
}) {
  const user = await currentUser();
  if (user && department && !canAccess(user, department)) redirect(homeFor(user));
  // Inside Projects & Tasks, its projects are listed under it with their open task counts.
  const projects = department === "projects" ? await sidebarProjects() : [];
  // LuxHotel records notify those who may open LuxHotel. After this page is sent, new records are fetched (at most once a
  // minute) and the saved properties refreshed (at most every ten minutes).
  const notified = !!user && canAccess(user, "luxhotel");
  // Today's reminders (follow-ups, media to publish) are written before counting, at most every ten minutes.
  if (user) await sendReminders().catch(() => console.error("Reminders failed"));
  const [unread, personal] = await Promise.all([
    notified ? unreadCounts(user.id).then((c) => c.total, () => 0) : 0,
    user ? personalUnread(user.id).catch(() => 0) : 0,
  ]);
  // With one of its tabs (or projects) marked, the department itself is shown as open rather than as the page.
  const childCurrent = !!current || !!subnav?.some((l) => l.current);
  const hasList = !!department && (!!subnav?.length || projects.length > 0);
  if (notified) {
    after(() => syncLuxFeeds().catch(() => console.error("LuxHotel feed sync failed")));
    after(() => syncHotels().catch(() => console.error("LuxHotel properties sync failed")));
  }
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
        {user && <Bell unread={unread + personal} />}
      </div>
      <label htmlFor="nav-toggle" className={s.scrim} aria-hidden="true" />

      <aside className={s.side}>
        <div className={s.top}>
          <Brand />
          {user && <Bell unread={unread + personal} />}
        </div>
        <div className={s.label}>Workspace</div>
        <nav className={s.nav} aria-label="Departments">
          {!hasList && <NoSubList />}
          {DEPARTMENTS.filter((d) => canAccess(user, d.key)).map((d) => {
            const open = d.key === department;
            const tabs = open ? subnav ?? [] : [];
            const listed = d.key === "projects" ? projects : [];
            return (
              <div key={d.key} className={s.group}>
                <Link href={departmentHref(user!, d)} className={`${s.item}${open && childCurrent ? ` ${s.open}` : ""}`}
                  aria-current={open && !childCurrent ? "page" : undefined}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/icons/${d.key}.png`} alt="" width={34} height={34} />
                  {d.label}
                  {/* The tabs show their own counts while LuxHotel is open. */}
                  {d.key === "luxhotel" && unread > 0 && !tabs.length && <b className={`${s.count} ${s.itemCount}`} title={`${unread} unread`}>{unread}</b>}
                </Link>
                {(tabs.length > 0 || listed.length > 0) && (
                  <SubList department={d.key} label={d.label}>
                    {tabs.map((l, i) => (
                      <li key={l.href} style={{ "--i": i } as React.CSSProperties}>
                        <SubItem link={l} />
                      </li>
                    ))}
                    {tabs.length > 0 && listed.length > 0 && <li className={s.subsep} aria-hidden="true" />}
                    {listed.map((p, i) => (
                      <li key={p.id} style={{ "--i": tabs.length + i } as React.CSSProperties}>
                        <Link href={`/projects/${p.id}`} className={s.subitem} aria-current={current === p.id ? "page" : undefined}
                          title={`${p.name} · ${p.open} open ${p.open === 1 ? "task" : "tasks"}`}>
                          <LogoMark src={projectLogoUrl(p.id, p.logo_version)} name={p.name} size={22} />
                          <span className={s.subname}>{p.name}</span>
                          {p.open > 0 && <b className={s.count}>{p.open}</b>}
                        </Link>
                      </li>
                    ))}
                  </SubList>
                )}
              </div>
            );
          })}
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
            <Link href="/settings" className={s.me} title={`@${user.username} · Profile settings`}>
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

      <div className={full ? `${s.content} ${s.contentFull}` : s.content}>
        {subnav && subnav.length > 0 && (
          <div className={s.subnav}>
            <nav className="wrap" aria-label="Section">
              {subnav.map((l) =>
                l.external ? (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" title={`Opens ${l.label} in a new tab`}>
                    {l.icon && <NavIcon name={l.icon} />}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {l.image && <img src={l.image} alt="" width={16} height={16} />}
                    {l.label} <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <Link key={l.href} href={l.href} aria-current={l.current ? "page" : undefined}>
                    {l.icon && <NavIcon name={l.icon} />}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {l.image && <img src={l.image} alt="" width={16} height={16} />}
                    {l.label}
                    {l.badge ? <b className={s.tabCount}>{l.badge}</b> : null}
                  </Link>
                ),
              )}
            </nav>
          </div>
        )}
        <main className={full ? s.full : "wrap main"}>{children}</main>
      </div>
    </div>
  );
}
