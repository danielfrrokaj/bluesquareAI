/** A logo image, or initials on a color picked from the name when there's no logo. */
export function LogoMark({ src, name, size = 26, round }: { src: string | null; name: string; size?: number; round?: boolean }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={`accmark accmark--img${round ? " accmark--round" : ""}`} src={src} alt="" width={size} height={size} />;
  }
  const hue = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
  const letters = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";
  return (
    <span
      className={`accmark${round ? " accmark--round" : ""}`}
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(135deg, hsl(${hue} 55% 38%), hsl(${(hue + 30) % 360} 60% 52%))` }}
    >
      {letters}
    </span>
  );
}

export const accountLogoUrl = (id: string, version: number | null) => (version === null ? null : `/api/finance/accounts/${id}/logo?v=${version}`);
export const projectLogoUrl = (id: string, version: number | null) => (version === null ? null : `/api/projects/${id}/logo?v=${version}`);
export const siteLogoUrl = (id: string, version: number | null) => (version === null ? null : `/api/sites/${id}/logo?v=${version}`);

/** A virtual account's logo or initials. */
export function AccountMark({ id, name, logo, size }: { id: string; name: string; logo: number | null; size?: number }) {
  return <LogoMark src={accountLogoUrl(id, logo)} name={name} size={size} />;
}
