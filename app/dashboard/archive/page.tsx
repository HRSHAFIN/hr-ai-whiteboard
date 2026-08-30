import { and, desc, eq, isNotNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Archive } from "lucide-react";

import { ProjectCard } from "@/components/dashboard/project-card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { db, whiteboards } from "@/db";
import { getDbUser } from "@/lib/get-db-user";

export default async function ArchivePage() {
  const user = await getDbUser();
  if (!user) {
    redirect("/sign-in");
  }

  const boards = await db.query.whiteboards.findMany({
    where: and(eq(whiteboards.ownerId, user.id), isNotNull(whiteboards.archivedAt)),
    orderBy: desc(whiteboards.updatedAt),
  });

  if (boards.length === 0) {
    return (
      <Empty className="flex-1 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Archive />
          </EmptyMedia>
          <EmptyTitle>Archive is empty</EmptyTitle>
          <EmptyDescription>
            Files you archive will show up here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {boards.map((board) => (
        <ProjectCard key={board.id} board={board} archived />
      ))}
    </div>
  );
}
