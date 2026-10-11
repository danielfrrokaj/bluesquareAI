import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n";

export function Logo({ lang, inverted = false }: { lang: Locale; inverted?: boolean }) {
  return (
    <Link href={localePath(lang, "/")} className={`logo${inverted ? " logo--inverted" : ""}`} aria-label="Blue Square AI home">
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny SVG, no optimisation needed */}
      <img src={inverted ? "/logo-mark-white.svg" : "/logo-mark.svg"} alt="" width={34} height={32} />
      <span className="logo__text">
        Blue Square <span className="logo__ai">AI</span>
      </span>
    </Link>
  );
}
