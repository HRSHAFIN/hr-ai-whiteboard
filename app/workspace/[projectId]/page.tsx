import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

import { WorkspaceEditor } from "@/components/workspace/workspace-editor";
import { db, whiteboards } from "@/db";
import { getDbUser } from "@/lib/get-db-user";
import { DEFAULT_WHITEBOARD_DATA } from "@/lib/whiteboard-types";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const user = await getDbUser();
  if (!user) {
    redirect("/sign-in");
  }

  const board = await db.query.whiteboards.findFirst({
    where: and(eq(whiteboards.id, Number(projectId)), eq(whiteboards.ownerId, user.id)),
  });

  if (!board) {
    notFound();
  }

  return (
    <WorkspaceEditor
      boardId={board.id}
      initialTitle={board.title}
      initialData={{ ...DEFAULT_WHITEBOARD_DATA, ...board.data }}
    />
  );
}
