import { CareersPage, careersMetadata } from "@/views/Careers";

export const generateMetadata = () => careersMetadata("en");

export default function Page() {
  return <CareersPage lang="en" />;
}
