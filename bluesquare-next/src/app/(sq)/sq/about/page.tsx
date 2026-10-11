import { AboutPage, aboutMetadata } from "@/views/About";

export const generateMetadata = () => aboutMetadata("sq");

export default function Page() {
  return <AboutPage lang="sq" />;
}
