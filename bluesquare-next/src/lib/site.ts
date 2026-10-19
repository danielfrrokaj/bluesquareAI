// Company facts used across the UI, metadata and structured data.
// Keep these in one place so the NUIS, address and contacts never drift apart.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://bluesquare.ai").replace(/\/$/, "");

export const COMPANY = {
  name: "Blue Square AI",
  shortName: "BlueSquare",
  nuis: "M61711043K",
  foundingYear: "2025",
  email: "info@bluesquare.ai",
  phone: "+355 69 381 5070",
  phoneHref: "tel:+355693815070",
  address: {
    street: "Pallati i Kulturës",
    locality: "Tirana",
    postalCode: "1001",
    country: "AL",
    countryName: { en: "Albania", sq: "Shqipëri" },
  },
  // Palace of Culture, Skanderbeg Square
  geo: { lat: 41.3281, lng: 19.8207 },
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Pallati+i+Kultur%C3%ABs+Tirana",
  // linkedin: the person's public profile URL (https://www.linkedin.com/in/…); null hides the icon.
  team: [
    { name: "Danjel Frrokaj", slug: "danjel-frrokaj", image: "/images/danjel-frrokaj.jpg", founder: true, linkedin: null },
    { name: "Endi Cikalleshi", slug: "endi-cikalleshi", image: null, founder: true, linkedin: null },
    { name: "Antigona Llozhi", slug: "antigona-llozhi", image: null, founder: false, linkedin: null },
    { name: "Grisilda Qosja", slug: "grisilda-qosja", image: null, founder: false, linkedin: null },
    { name: "Klevis Joanidhi", slug: "klevis-joanidhi", image: null, founder: false, linkedin: null },
  ],
} as const;
