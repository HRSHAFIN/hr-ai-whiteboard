import { Plus } from "lucide-react";

import { createWhiteboard } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateWhiteboardDialog({
  triggerLabel = "Create New Whiteboard",
  variant = "default",
}: {
  triggerLabel?: string;
  variant?: "default" | "outline" | "secondary";
}) {
  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant={variant} />}>
        <Plus />
        {triggerLabel}
      </DialogTrigger>

      <DialogContent>
        <form action={createWhiteboard}>
          <DialogHeader>
            <DialogTitle>Create New Whiteboard</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="whiteboard-name">Whiteboard Name</Label>
            <Input
              id="whiteboard-name"
              name="name"
              placeholder="My Product Brainstorm"
              autoFocus
              required
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
