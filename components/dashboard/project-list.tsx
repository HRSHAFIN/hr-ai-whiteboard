"use client";

import { useCallback, useEffect, useState } from "react";
import { Archive, FolderHeart, Loader2 } from "lucide-react";

import { CreateWhiteboardDialog } from "@/components/dashboard/create-whiteboard-dialog";
import { ProjectCard } from "@/components/dashboard/project-card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { Whiteboard } from "@/db/schema";

function parseBoard(board: Whiteboard): Whiteboard {
  return {
    ...board,
    createdAt: new Date(board.createdAt),
    updatedAt: new Date(board.updatedAt),
    archivedAt: board.archivedAt ? new Date(board.archivedAt) : null,
  };
}

export function ProjectList({ archived = false }: { archived?: boolean }) {
  const [boards, setBoards] = useState<Whiteboard[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/whiteboards${archived ? "?archived=true" : ""}`);
      if (!res.ok) throw new Error("Failed to load whiteboards");
      const data = (await res.json()) as Whiteboard[];
      setBoards(data.map(parseBoard));
    } catch {
      setError("Couldn't load your whiteboards. Please refresh.");
    }
  }, [archived]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (!boards) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  if (boards.length === 0) {
    return (
      <Empty className="flex-1 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            {archived ? <Archive /> : <FolderHeart />}
          </EmptyMedia>
          <EmptyTitle>{archived ? "Archive is empty" : "No projects yet"}</EmptyTitle>
          <EmptyDescription>
            {archived
              ? "Files you archive will show up here."
              : "Create your first whiteboard to get started."}
          </EmptyDescription>
        </EmptyHeader>
        {!archived && (
          <EmptyContent>
            <CreateWhiteboardDialog triggerLabel="Create First Project" />
          </EmptyContent>
        )}
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {boards.map((board) => (
        <ProjectCard key={board.id} board={board} archived={archived} onChanged={load} />
      ))}
    </div>
  );
}
