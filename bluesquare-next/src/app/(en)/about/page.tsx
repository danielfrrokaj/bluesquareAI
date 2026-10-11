import { AboutPage, aboutMetadata } from "@/views/About";

export const generateMetadata = () => aboutMetadata("en");

export default function Page() {
  return <AboutPage lang="en" />;
}
