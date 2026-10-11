import { ProjectsPage, projectsMetadata } from "@/views/Projects";

export const generateMetadata = () => projectsMetadata("sq");

export default function Page() {
  return <ProjectsPage lang="sq" />;
}
