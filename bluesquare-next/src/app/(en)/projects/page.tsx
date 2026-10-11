import { ProjectsPage, projectsMetadata } from "@/views/Projects";

export const generateMetadata = () => projectsMetadata("en");

export default function Page() {
  return <ProjectsPage lang="en" />;
}
