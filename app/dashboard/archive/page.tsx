import { redirect } from "next/navigation";

import { ProjectList } from "@/components/dashboard/project-list";
import { getDbUser } from "@/lib/get-db-user";

export default async function ArchivePage() {
  const user = await getDbUser();
  if (!user) {
    redirect("/sign-in");
  }

  return <ProjectList archived />;
}
