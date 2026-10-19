import { requireAuth } from "@/lib/auth";
import { avatarUrl, ROLES } from "@/lib/users";
import { saveProfile, saveSignIn } from "./actions";
import { Shell } from "@/components/Shell";
import { ActionForm } from "@/components/ActionForm";
import { LogoField } from "@/components/LogoField";
import { SignInFields } from "@/components/SignInFields";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

const dateFmt = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: process.env.REPORT_TIMEZONE || "Europe/Tirane" });

export default async function SettingsPage() {
  const me = await requireAuth();
  return (
    <Shell department="settings">
      <div className="pagehead">
        <div>
          <h1>Settings</h1>
          <p className="muted">Your profile and how you sign in.</p>
        </div>
      </div>

      <section className="panel settings">
        <header className="settings__head">
          <h2>Profile</h2>
          <p className="muted">Shown in the sidebar and next to what you record.</p>
        </header>
        <ActionForm action={saveProfile} submit="Save profile" className="form settings__form">
          <LogoField current={avatarUrl(me)} name={me.name} label="Photo" field="avatar" round />
          <label className="field"><span>Name</span><input name="name" defaultValue={me.name} required maxLength={80} autoComplete="name" /></label>
        </ActionForm>
      </section>

      <section className="panel settings">
        <header className="settings__head">
          <h2>Sign-in</h2>
          <p className="muted">You sign in with your username or phone number. Changing these or your password needs your current password.</p>
        </header>
        <ActionForm action={saveSignIn} submit="Update sign-in" className="form settings__form">
          <SignInFields user={me} own />
          <div className="settings__pair">
            <label className="field"><span>New password</span><input name="new_password" type="password" autoComplete="new-password" minLength={10} placeholder="Leave empty to keep" /></label>
            <label className="field"><span>Repeat new password</span><input name="repeat_password" type="password" autoComplete="new-password" /></label>
          </div>
          <label className="field"><span>Current password</span><input name="current_password" type="password" autoComplete="current-password" required /></label>
        </ActionForm>
      </section>

      <section className="panel settings">
        <header className="settings__head">
          <h2>Account</h2>
        </header>
        <dl className="facts">
          <div><dt>Role</dt><dd>{ROLES[me.role]}{me.role === "member" && <span className="muted"> · an admin can change it</span>}</dd></div>
          <div><dt>Member since</dt><dd>{dateFmt.format(new Date(me.created_at))}</dd></div>
          {me.last_login_at && <div><dt>Last sign-in</dt><dd>{dateFmt.format(new Date(me.last_login_at))}</dd></div>}
        </dl>
      </section>
    </Shell>
  );
}
