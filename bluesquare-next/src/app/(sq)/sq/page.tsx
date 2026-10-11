import { HomePage, homeMetadata } from "@/views/Home";

export const generateMetadata = () => homeMetadata("sq");

export default function Page() {
  return <HomePage lang="sq" />;
}
