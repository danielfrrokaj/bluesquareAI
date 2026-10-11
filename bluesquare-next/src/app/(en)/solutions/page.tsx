import { SolutionsPage, solutionsMetadata } from "@/views/Solutions";

export const generateMetadata = () => solutionsMetadata("en");

export default function Page() {
  return <SolutionsPage lang="en" />;
}
