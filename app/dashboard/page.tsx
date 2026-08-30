import { redirect } from "next/navigation";

import { DashboardBanner } from "@/components/dashboard/dashboard-banner";
import { ProjectList } from "@/components/dashboard/project-list";
import { getDbUser } from "@/lib/get-db-user";

export default async function DashboardPage() {
  const user = await getDbUser();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <DashboardBanner name={user.name ?? ""} />
      <ProjectList />
    </div>
  );
}
