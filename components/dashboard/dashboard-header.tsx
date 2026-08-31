"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CreateWhiteboardDialog } from "@/components/dashboard/create-whiteboard-dialog";

const pageTitles: Record<string, string> = {
  "/dashboard": "All Files",
  "/dashboard/archive": "Archive",
  "/dashboard/shared": "Shared Files",
  "/dashboard/settings": "Settings",
};

const SEARCHABLE_PATHS = ["/dashboard", "/dashboard/archive"];

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const title = pageTitles[pathname] ?? "Dashboard";
  const searchable = SEARCHABLE_PATHS.includes(pathname);

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-2 h-5" />
      <h1 className="font-heading text-sm font-semibold">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        {searchable && (
          <div className="relative hidden sm:block">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              className="w-56 pl-8"
              defaultValue={searchParams.get("q") ?? ""}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        )}
        <CreateWhiteboardDialog triggerLabel="New" variant="default" />
        <UserButton />
      </div>
    </header>
  );
}
