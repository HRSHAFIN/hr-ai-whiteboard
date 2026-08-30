"use client";

import Link from "next/link";
import { useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Archive,
  ArchiveRestore,
  ExternalLink,
  MoreVertical,
  PenSquare,
  Share2,
  Trash2,
} from "lucide-react";

import { archiveWhiteboard, deleteWhiteboard, restoreWhiteboard } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import type { Whiteboard } from "@/db/schema";

export function ProjectCard({
  board,
  archived = false,
}: {
  board: Whiteboard;
  archived?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleShare = async () => {
    const url = `${window.location.origin}/workspace/${board.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.add({ title: "Link copied", description: url });
    } catch {
      toast.add({ title: "Couldn't copy link", type: "error" });
    }
  };

  return (
    <Card className="gap-0 py-0">
      <Link href={`/workspace/${board.id}`}>
        <div className="flex h-28 items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5">
          <PenSquare className="size-8 text-primary/60" />
        </div>
      </Link>

      <CardHeader className="pt-4">
        <CardTitle className="truncate">
          <Link href={`/workspace/${board.id}`}>{board.title}</Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-4 text-xs text-muted-foreground">
        Updated {formatDistanceToNow(board.updatedAt, { addSuffix: true })} · By You
      </CardContent>

      <CardFooter className="justify-between gap-1">
        <Button variant="ghost" size="icon-sm" render={<Link href={`/workspace/${board.id}`} />}>
          <ExternalLink />
          <span className="sr-only">Open</span>
        </Button>

        <Button variant="ghost" size="icon-sm" onClick={handleShare}>
          <Share2 />
          <span className="sr-only">Share</span>
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isPending}
          onClick={() =>
            startTransition(() => {
              if (archived) {
                restoreWhiteboard(board.id);
              } else {
                archiveWhiteboard(board.id);
              }
            })
          }
        >
          {archived ? <ArchiveRestore /> : <Archive />}
          <span className="sr-only">{archived ? "Restore" : "Archive"}</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
            <MoreVertical />
            <span className="sr-only">More options</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              onClick={() => startTransition(() => deleteWhiteboard(board.id))}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
