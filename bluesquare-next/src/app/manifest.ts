import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Blue Square AI",
    short_name: "BlueSquare",
    description: "Software and AI company in Tirana, Albania.",
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#061238",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
