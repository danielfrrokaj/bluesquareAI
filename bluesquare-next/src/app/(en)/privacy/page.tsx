import { PrivacyPage, privacyMetadata } from "@/views/Privacy";

export const generateMetadata = () => privacyMetadata("en");

export default function Page() {
  return <PrivacyPage lang="en" />;
}
