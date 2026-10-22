import { requireRole } from "@/lib/auth";
import { allowedInboxIds, ARCHIVE_TABS, canAccess, canOpenArchiveTab, canOpenFinanceTab, FINANCE_TABS, GRANTABLE } from "@/lib/departments";
import { avatarUrl, listUsers, ROLES } from "@/lib/users";
import { listInboxes } from "@/lib/chatwoot";
import { API_SCOPES, listApiKeys } from "@/lib/api-keys";
import { publicUrl } from "@/lib/public-url";
import { LogoMark } from "@/components/AccountMark";
import { addUser, removeApiKey, saveUser } from "./actions";
import { NewApiKey } from "./NewApiKey";
import { Shell } from "@/components/Shell";
import { ActionForm } from "@/components/ActionForm";
import { Modal } from "@/components/Modal";
import { SignInFields } from "@/components/SignInFields";
import { PermissionPicker } from "./PermissionPicker";
import s from "./users.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Users" };

const when = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Tirane" });

export default async function UsersPage() {
  const me = await requireRole("admin");
  // Inbox access is granted per Chatwoot inbox account; without a connection there's nothing to pick from.
  const [users, keys, base, inboxes] = await Promise.all([
    listUsers(), listApiKeys(), publicUrl(),
    listInboxes().then((all) => all.map((i) => ({ id: i.id, name: i.name, channel: i.channel as string }))).catch(() => []),
  ]);

  return (
    <Shell department="users">
      <div className="pagehead">
        <div>
          <h1>Users</h1>
          <p className="muted">Admins manage settings and users and open every section. Members open the sections picked for them and record their own transactions.</p>
        </div>
        <Modal trigger="Add user" title="Add a user">
          <ActionForm action={addUser} submit="Add user" className="form">
            <label className="field"><span>Name</span><input name="name" required maxLength={80} /></label>
            <SignInFields />
            <label className="field"><span>Password</span><input name="password" type="password" autoComplete="new-password" required minLength={10} /></label>
            <PermissionPicker role="member" departments={[]} inboxes={inboxes} />
          </ActionForm>
        </Modal>
      </div>

      <section className="panel">
        <ul className="editlist">
          {users.map((u) => (
            <li key={u.id} className={u.active ? undefined : "is-archived"}>
              <details>
                <summary>
                  <LogoMark src={avatarUrl(u)} name={u.name} size={30} round />
                  <strong>{u.name}</strong>
                  {u.id === me.id && <span className="tag">You</span>}
                  {!u.active && <span className="tag tag--muted">Inactive</span>}
                  <span className="muted">@{u.username}{u.phone && ` · ${u.phone}`}</span>
                  <span className="editlist__value">
                    {u.role !== "admin" && (
                      <span className={s.access} title={`Opens ${GRANTABLE.filter((d) => canAccess(u, d.key)).map((d) => d.key === "finance"
                        ? `Finance (${FINANCE_TABS.filter((tab) => canOpenFinanceTab(u, tab.key)).map((tab) => tab.label).join(", ")})`
                        : d.key === "archive" ? `Archive (${ARCHIVE_TABS.filter((tab) => canOpenArchiveTab(u, tab.key)).map((tab) => tab.label).join(", ")})`
                        : d.key === "inbox" && allowedInboxIds(u) ? `Inbox (${inboxes.filter((i) => allowedInboxIds(u)!.includes(i.id)).map((i) => i.name).join(", ") || "accounts no longer connected"})`
                        : d.label).join(", ")}`}>
                        {GRANTABLE.filter((d) => canAccess(u, d.key)).map((d) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={d.key} src={`/icons/${d.key}.png`} alt="" width={18} height={18} />
                        ))}
                      </span>
                    )}
                    {ROLES[u.role]}
                  </span>
                </summary>
                <ActionForm action={saveUser} submit="Save" className="form form--grid">
                  <input type="hidden" name="id" value={u.id} />
                  <label className="field"><span>Name</span><input name="name" defaultValue={u.name} required maxLength={80} /></label>
                  <SignInFields user={u} />
                  <label className="field"><span>New password</span><input name="password" type="password" autoComplete="new-password" placeholder="Leave empty to keep" /></label>
                  <label className="check"><input type="checkbox" name="active" defaultChecked={u.active} /> Active (can sign in)</label>
                  <PermissionPicker role={u.role} departments={u.departments} inboxes={inboxes} />
                </ActionForm>
              </details>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel" id="api-keys">
        <header className="panel__head">
          <div>
            <h2>API keys</h2>
            <p className="muted panel__sub">For programs, such as a Claude automation, to add sales leads without signing in.</p>
          </div>
          <Modal trigger="New API key" title="New API key" triggerClassName="btn btn--primary btn--small">
            <NewApiKey endpoint={`${base}/api/sales/leads`} />
          </Modal>
        </header>
        {keys.length === 0 ? (
          <p className="empty">No keys yet.</p>
        ) : (
          <ul className="acclist">
            {keys.map((k) => (
              <li key={k.id} className={k.revoked ? "is-archived" : undefined}>
                <div className="acclist__main">
                  <strong>
                    {k.name}
                    {k.revoked && <span className="tag tag--muted">Revoked</span>}
                  </strong>
                  <small className="muted">
                    {k.prefix}… · {API_SCOPES[k.scope]} · created {when.format(new Date(k.created_at))}{k.created_by_name && ` by ${k.created_by_name}`} ·{" "}
                    {k.last_used_at ? `last used ${when.format(new Date(k.last_used_at))}` : "never used"}
                  </small>
                </div>
                {!k.revoked && (
                  <Modal trigger="Revoke" title={`Revoke “${k.name}”?`} triggerClassName="btn btn--small">
                    <p className="muted">Programs using it get “invalid API key” from now on. This can&apos;t be undone: create a new key to give access again.</p>
                    <ActionForm action={removeApiKey} submit="Revoke key" pending="Revoking…" danger className="form form--row">
                      <input type="hidden" name="id" value={k.id} />
                    </ActionForm>
                  </Modal>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </Shell>
  );
}
