import { ContactPage, contactMetadata } from "@/views/Contact";

export const generateMetadata = () => contactMetadata("sq");

export default function Page() {
  return <ContactPage lang="sq" />;
}
