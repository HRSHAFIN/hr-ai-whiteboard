import { CreateWhiteboardDialog } from "@/components/dashboard/create-whiteboard-dialog";

export function DashboardBanner({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-gradient-to-r from-primary/10 to-transparent px-5 py-4">
      <div>
        <p className="font-heading text-sm font-semibold">
          Welcome back{name ? `, ${name}` : ""}! 👋
        </p>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening in your workspace.
        </p>
      </div>

      <CreateWhiteboardDialog />
    </div>
  );
}
