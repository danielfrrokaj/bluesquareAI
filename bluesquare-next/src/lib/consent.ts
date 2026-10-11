// Cookie consent state. The site sets no tracking cookies today; any analytics
// added later must check hasAnalyticsConsent() before loading.

export const CONSENT_COOKIE = "bs_consent";
export const CONSENT_EVENT = "bs:consentchange";
const ONE_YEAR = 60 * 60 * 24 * 365;

export type Consent = "accepted" | "declined";

export function readConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=(accepted|declined)`));
  return (match?.[1] as Consent) ?? null;
}

export function saveConsent(value: Consent) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent<Consent>(CONSENT_EVENT, { detail: value }));
}

export const hasAnalyticsConsent = () => readConsent() === "accepted";
