import { and, desc, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { FolderHeart } from "lucide-react";

import { CreateWhiteboardDialog } from "@/components/dashboard/create-whiteboard-dialog";
import { DashboardBanner } from "@/components/dashboard/dashboard-banner";
import { ProjectCard } from "@/components/dashboard/project-card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { db, whiteboards } from "@/db";
import { getDbUser } from "@/lib/get-db-user";

export default async function DashboardPage() {
  const user = await getDbUser();
  if (!user) {
    redirect("/sign-in");
  }

  const boards = await db.query.whiteboards.findMany({
    where: and(eq(whiteboards.ownerId, user.id), isNull(whiteboards.archivedAt)),
    orderBy: desc(whiteboards.updatedAt),
  });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <DashboardBanner name={user.name ?? ""} />

      {boards.length === 0 ? (
        <Empty className="flex-1 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderHeart />
            </EmptyMedia>
            <EmptyTitle>No projects yet</EmptyTitle>
            <EmptyDescription>
              Create your first whiteboard to get started.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateWhiteboardDialog triggerLabel="Create First Project" />
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {boards.map((board) => (
            <ProjectCard key={board.id} board={board} />
          ))}
        </div>
      )}
    </div>
  );
}
