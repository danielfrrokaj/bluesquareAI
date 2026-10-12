// Social networks a marketing post can be planned for (shared by server and client code).
export const PLATFORMS = {
  instagram: { label: "Instagram", short: "IG", color: "#d62976" },
  facebook: { label: "Facebook", short: "FB", color: "#1877f2" },
  tiktok: { label: "TikTok", short: "TT", color: "#111111" },
  linkedin: { label: "LinkedIn", short: "IN", color: "#0a66c2" },
  youtube: { label: "YouTube", short: "YT", color: "#e62117" },
  x: { label: "X", short: "X", color: "#1f2937" },
} as const;
export type Platform = keyof typeof PLATFORMS;
export const isPlatform = (v: unknown): v is Platform => typeof v === "string" && v in PLATFORMS;
