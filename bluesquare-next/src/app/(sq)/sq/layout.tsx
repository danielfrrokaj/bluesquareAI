import { SiteShell } from "@/components/SiteShell";
import { rootMetadata, rootViewport } from "@/lib/root-metadata";

export const metadata = rootMetadata("sq");
export const viewport = rootViewport;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell lang="sq">{children}</SiteShell>;
}
