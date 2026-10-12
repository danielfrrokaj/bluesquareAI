import { requireRole } from "@/lib/auth";
import { listUsers, ROLES } from "@/lib/users";
import { addUser, saveUser } from "./actions";
import { Shell } from "@/components/Shell";
import { ActionForm } from "@/components/ActionForm";
import { Modal } from "@/components/Modal";

export const dynamic = "force-dynamic";
export const metadata = { title: "Users" };

export default async function UsersPage() {
  const me = await requireRole("admin");
  const users = await listUsers();

  return (
    <Shell department="users">
      <div className="pagehead">
        <div>
          <h1>Users</h1>
          <p className="muted">Admins manage settings and users. Members use the dashboards and record their own transactions.</p>
        </div>
        <Modal trigger="Add user" title="Add a user">
          <ActionForm action={addUser} submit="Add user" className="form">
            <label className="field"><span>Name</span><input name="name" required maxLength={80} /></label>
            <label className="field"><span>Email</span><input name="email" type="email" required /></label>
            <label className="field"><span>Password</span><input name="password" type="password" autoComplete="new-password" required minLength={10} /></label>
            <label className="field">
              <span>Role</span>
              <select name="role" defaultValue="member">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          </ActionForm>
        </Modal>
      </div>

      <section className="panel">
        <ul className="editlist">
          {users.map((u) => (
            <li key={u.id} className={u.active ? undefined : "is-archived"}>
              <details>
                <summary>
                  <strong>{u.name}</strong>
                  {u.id === me.id && <span className="tag">You</span>}
                  {!u.active && <span className="tag tag--muted">Inactive</span>}
                  <span className="muted">{u.email}</span>
                  <span className="editlist__value">{ROLES[u.role]}</span>
                </summary>
                <ActionForm action={saveUser} submit="Save" className="form form--grid">
                  <input type="hidden" name="id" value={u.id} />
                  <label className="field"><span>Name</span><input name="name" defaultValue={u.name} required maxLength={80} /></label>
                  <label className="field"><span>Email</span><input name="email" defaultValue={u.email} required /></label>
                  <label className="field">
                    <span>Role</span>
                    <select name="role" defaultValue={u.role}>
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                  <label className="field"><span>New password</span><input name="password" type="password" autoComplete="new-password" placeholder="Leave empty to keep" /></label>
                  <label className="check"><input type="checkbox" name="active" defaultChecked={u.active} /> Active (can sign in)</label>
                </ActionForm>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}
