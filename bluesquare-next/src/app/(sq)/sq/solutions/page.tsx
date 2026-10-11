import { SolutionsPage, solutionsMetadata } from "@/views/Solutions";

export const generateMetadata = () => solutionsMetadata("sq");

export default function Page() {
  return <SolutionsPage lang="sq" />;
}
