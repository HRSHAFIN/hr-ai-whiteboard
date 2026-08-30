import { Share2 } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function SharedFilesPage() {
  return (
    <Empty className="flex-1 border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Share2 />
        </EmptyMedia>
        <EmptyTitle>No shared files</EmptyTitle>
        <EmptyDescription>
          Files shared with you will show up here.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
