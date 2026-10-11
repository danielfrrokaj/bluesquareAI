import { PrivacyPage, privacyMetadata } from "@/views/Privacy";

export const generateMetadata = () => privacyMetadata("sq");

export default function Page() {
  return <PrivacyPage lang="sq" />;
}
