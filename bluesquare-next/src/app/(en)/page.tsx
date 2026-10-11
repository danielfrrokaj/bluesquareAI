import { HomePage, homeMetadata } from "@/views/Home";

export const generateMetadata = () => homeMetadata("en");

export default function Page() {
  return <HomePage lang="en" />;
}
