import { CareersPage, careersMetadata } from "@/views/Careers";

export const generateMetadata = () => careersMetadata("sq");

export default function Page() {
  return <CareersPage lang="sq" />;
}
