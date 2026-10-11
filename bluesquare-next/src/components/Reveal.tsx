"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Elements that fade in when scrolled into view.
 * Keep in sync with the "Scroll reveal" selector list in globals.css.
 */
const SELECTOR = [
  ".section-head",
  ".card",
  ".step",
  ".stats",
  ".cta-band",
  ".media-icon",
  ".notice",
  ".facts",
  ".split > div:not([class])",
  ".contact-grid > div",
  ".prose > section",
].join(",");

const STAGGER_MS = 90;
const MAX_STAGGER = 4;

/** Reveals scroll-in elements; re-runs on every client-side navigation. */
export function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    (window as unknown as { __reveal?: boolean }).__reveal = true;
    const root = document.documentElement;
    if (!root.classList.contains("js")) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const counts = new Map<Element | null, number>();
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          // Stagger siblings that come into view together (e.g. a row of cards).
          const n = counts.get(el.parentElement) ?? 0;
          counts.set(el.parentElement, n + 1);
          el.style.transitionDelay = `${Math.min(n, MAX_STAGGER) * STAGGER_MS}ms`;
          el.classList.add("is-visible");
          el.addEventListener("transitionend", () => el.style.removeProperty("transition-delay"), { once: true });
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    document.querySelectorAll(SELECTOR).forEach((el) => {
      if (!el.classList.contains("is-visible")) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
