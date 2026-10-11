// Language-independent facts about services and products.
// Localized copy lives in en.ts / sq.ts, keyed by the same ids.

export type IconName =
  | "ai" | "build" | "cloud" | "crm" | "dashboard" | "design" | "discover" | "hotel" | "mobile"
  | "security" | "support" | "web" | "shqipfol" | "multisystem" | "bluebar" | "bluebill"
  | "retail" | "clinic" | "team" | "location";

export const serviceIds = ["hotel", "mobile", "dashboards", "crm", "ai", "web"] as const;
export type ServiceId = (typeof serviceIds)[number];

export const serviceIcons: Record<ServiceId, IconName> = {
  hotel: "hotel",
  mobile: "mobile",
  dashboards: "dashboard",
  crm: "crm",
  ai: "ai",
  web: "web",
};

/** Product that showcases each service, if any. */
export const serviceProduct: Partial<Record<ServiceId, ProductSlug>> = {
  hotel: "luxhotel",
  mobile: "shqipfol",
  crm: "multisystem",
};

export const productSlugs = ["luxhotel", "shqipfol", "multisystem", "bluebar", "bluebill"] as const;
export type ProductSlug = (typeof productSlugs)[number];

type ProductFacts = {
  icon: IconName;
  url?: string;
  schemaType: "WebApplication" | "MobileApplication";
  applicationCategory: string;
  operatingSystem: string;
  offer?: { price: string; currency: string; unitText: string };
};

export const products: Record<ProductSlug, ProductFacts> = {
  luxhotel: {
    icon: "hotel",
    url: "https://luxhotelsystem.com",
    schemaType: "WebApplication",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    offer: { price: "2", currency: "EUR", unitText: "room per month" },
  },
  shqipfol: {
    icon: "shqipfol",
    schemaType: "MobileApplication",
    applicationCategory: "TravelApplication",
    operatingSystem: "iOS, Android",
  },
  multisystem: {
    icon: "multisystem",
    schemaType: "WebApplication",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
  },
  bluebar: {
    icon: "bluebar",
    schemaType: "WebApplication",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
  },
  bluebill: {
    icon: "bluebill",
    schemaType: "WebApplication",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
  },
};
