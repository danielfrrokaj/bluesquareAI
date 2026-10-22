import type { Channel } from "@/lib/chatwoot";

/** What each Chatwoot channel is called in the interface. */
export const CHANNEL_NAMES: Record<Channel, string> = {
  whatsapp: "WhatsApp", instagram: "Instagram", facebook: "Messenger", web: "Website chat", email: "Email",
  telegram: "Telegram", sms: "SMS", line: "LINE", api: "API",
};
