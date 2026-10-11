import { ContactPage, contactMetadata } from "@/views/Contact";

export const generateMetadata = () => contactMetadata("en");

export default function Page() {
  return <ContactPage lang="en" />;
}
