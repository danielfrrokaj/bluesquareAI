/**
 * Username (signs in), phone (optional, also signs in) and email (optional). `own` when it's the signed-in person's form,
 * so the browser can offer to save the username; an admin's form for someone else gets no autofill.
 */
export function SignInFields({ user, own }: { user?: { username: string; phone: string | null; email: string | null }; own?: boolean }) {
  const fill = (kind: string) => (own ? kind : "off");
  return (
    <>
      <label className="field">
        <span>Username</span>
        <input name="username" defaultValue={user?.username} required minLength={3} maxLength={32} placeholder="e.g. arta"
          autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete={fill("username")} />
      </label>
      <label className="field">
        <span>Phone</span>
        <input name="phone" type="tel" defaultValue={user?.phone ?? ""} placeholder="Optional, e.g. 069 123 4567" maxLength={40} autoComplete={fill("tel")} />
      </label>
      <label className="field">
        <span>Email</span>
        {/* An email that was only ever a sign-in name (the first admin's "admin") isn't shown; saving clears it. */}
        <input name="email" type="email" defaultValue={user?.email?.includes("@") ? user.email : ""} placeholder="Optional" maxLength={200} autoComplete={fill("email")} />
      </label>
    </>
  );
}
