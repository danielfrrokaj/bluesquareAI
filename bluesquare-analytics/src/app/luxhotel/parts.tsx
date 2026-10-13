import { subscriptionLabel, type Hotel } from "@/lib/luxhotel-data";
import s from "./luxhotel.module.css";

type IconName = "refresh" | "arrow" | "search" | "hotel" | "rooms" | "check" | "warning" | "link";
export function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    refresh: <path d="M20 7v5h-5M4 17v-5h5M6.1 7a7 7 0 0 1 11.6-2L20 8M4 16l2.3 3A7 7 0 0 0 18 17" />,
    arrow: <path d="M7 17 17 7M7 7h10v10" />,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    hotel: <path d="M6 21V3h12v18M3 21h18M10 21v-4h4v4M9 7h1m4 0h1M9 11h1m4 0h1" />,
    rooms: <path d="M3 18V8m18 10V8M3 14h18v5M5 14V6h14v8M7 10h3v4m4 0v-4h3" />,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
    warning: <path d="m12 3 10 18H2ZM12 9v5m0 3v.1" />,
    link: <path d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 12a4 4 0 0 0 6 0l5-5a4 4 0 0 0-6-6l-1 1" />,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function Status({ hotel }: { hotel: Hotel }) {
  const status = hotel.subscription.suspended ? "suspended" : hotel.subscription.status;
  return <span className={`${s.status} ${status === "active" ? s.good : status === "trial" ? s.blue : status === "expired" || status === "suspended" ? s.bad : s.neutral}`}><i />{subscriptionLabel(hotel)}</span>;
}
