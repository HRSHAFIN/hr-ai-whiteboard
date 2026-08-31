"use client";

import { CircleHelp, Github, Globe, LibraryBig } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

const GITHUB_URL = "https://github.com/HRSHAFIN";
const PORTFOLIO_URL = "https://hr-mern-portfolio.vercel.app/";

const CONTACT_LINKS = [
  { label: "GitHub", description: "Check out my projects", href: GITHUB_URL, icon: Github },
  {
    label: "Portfolio",
    description: PORTFOLIO_URL ? "See more of my work" : "Add your portfolio URL in workspace-utility-bar.tsx",
    href: PORTFOLIO_URL,
    icon: Globe,
  },
];

export function WorkspaceUtilityBar({
  excalidrawAPI,
}: {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
}) {
  return (
    <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
      <Button
        variant="ghost"
        className="gap-1.5 rounded-xl border bg-popover shadow-lg"
        title="Library"
        onClick={() => excalidrawAPI?.toggleSidebar({ name: "default", tab: "library" })}
      >
        <LibraryBig className="size-4" />
        Library
      </Button>

      <Popover>
        <PopoverTrigger
          render={<Button variant="ghost" size="icon" title="Help" className="rounded-xl border bg-popover shadow-lg" />}
        >
          <CircleHelp className="size-4.5" />
          <span className="sr-only">Help</span>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" className="w-64">
          <PopoverHeader>
            <PopoverTitle>Need help?</PopoverTitle>
            <PopoverDescription>Reach out or check out more of my work.</PopoverDescription>
          </PopoverHeader>

          <div className="flex flex-col gap-1.5">
            {CONTACT_LINKS.map((link) =>
              link.href ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border p-2.5 text-left hover:bg-muted/50"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                    <link.icon className="size-4.5" />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold">{link.label}</span>
                    <span className="text-xs text-muted-foreground">{link.description}</span>
                  </span>
                </a>
              ) : (
                <div
                  key={link.label}
                  className="flex items-center gap-3 rounded-lg border border-dashed p-2.5 text-left opacity-60"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                    <link.icon className="size-4.5" />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold">{link.label}</span>
                    <span className="text-xs text-muted-foreground">{link.description}</span>
                  </span>
                </div>
              )
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
