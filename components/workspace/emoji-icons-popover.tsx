"use client";

import { useState } from "react";
import {
  Smile,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ArrowUpRight, RefreshCw,
  CircleCheck, CircleX, CircleAlert, Star, Heart, Flag,
  Briefcase, TrendingUp, TrendingDown, DollarSign, Target, PieChart,
  BarChart3, Users, Building2, Laptop, Smartphone, Server,
  Database, Cloud, Wifi, Code, Terminal, Cpu,
  Mail, MessageSquare, Phone, Bell, Send, FileText,
  Folder, Paperclip, Link, Bookmark, Settings, Search,
  Filter, Calendar, Clock, MapPin, Home, ShoppingCart,
  Gift, Lightbulb, Rocket, Zap, Shield, Lock,
  Key, Trash2, Plus, Check, X, Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ensureExcalidrawFontsLoaded } from "@/lib/excalidraw-fonts";
import { getInsertionPoint } from "@/lib/excalidraw-layout";
import { EMOJI_LIST, ICON_LIST } from "@/lib/quick-insert-data";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { FileId } from "@excalidraw/excalidraw/element/types";
import type { BinaryFileData, DataURL } from "@excalidraw/excalidraw/types";

type LucideIconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

const ICON_COMPONENTS: Record<string, LucideIconComponent> = {
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ArrowUpRight, RefreshCw,
  CircleCheck, CircleX, CircleAlert, Star, Heart, Flag,
  Briefcase, TrendingUp, TrendingDown, DollarSign, Target, PieChart,
  BarChart3, Users, Building2, Laptop, Smartphone, Server,
  Database, Cloud, Wifi, Code, Terminal, Cpu,
  Mail, MessageSquare, Phone, Bell, Send, FileText,
  Folder, Paperclip, Link, Bookmark, Settings, Search,
  Filter, Calendar, Clock, MapPin, Home, ShoppingCart,
  Gift, Lightbulb, Rocket, Zap, Shield, Lock,
  Key, Trash2, Plus, Check, X, Info,
};

export function EmojiIconsPopover({
  excalidrawAPI,
}: {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
}) {
  const [inserting, setInserting] = useState(false);

  const insertEmoji = async (emoji: string) => {
    if (!excalidrawAPI) return;
    await ensureExcalidrawFontsLoaded();

    const existing = excalidrawAPI.getSceneElements();
    const { x, y } = getInsertionPoint(existing);

    const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw");
    const newElements = convertToExcalidrawElements([
      { type: "text", x, y, text: emoji, fontSize: 48 },
    ]);

    excalidrawAPI.updateScene({
      elements: [...existing, ...newElements],
      appState: { selectedElementIds: Object.fromEntries(newElements.map((el) => [el.id, true])) },
      captureUpdate: "IMMEDIATELY",
    });
    excalidrawAPI.scrollToContent(newElements, { fitToContent: true });
  };

  const insertIcon = async (name: string) => {
    if (!excalidrawAPI || inserting) return;
    setInserting(true);
    try {
      const Icon = ICON_COMPONENTS[name];
      if (!Icon) return;

      const { renderToStaticMarkup } = await import("react-dom/server");
      const svg = renderToStaticMarkup(<Icon size={64} color="#1e1e1e" strokeWidth={1.5} />);
      const dataURL = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}` as DataURL;
      const fileId = `icon-${name}-${Date.now()}` as FileId;

      const fileData: BinaryFileData = {
        id: fileId,
        dataURL,
        mimeType: "image/svg+xml",
        created: Date.now(),
      };
      excalidrawAPI.addFiles([fileData]);

      const existing = excalidrawAPI.getSceneElements();
      const { x, y } = getInsertionPoint(existing);

      const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw");
      const newElements = convertToExcalidrawElements([
        { type: "image", x, y, width: 64, height: 64, fileId },
      ]);

      excalidrawAPI.updateScene({
        elements: [...existing, ...newElements],
        appState: { selectedElementIds: Object.fromEntries(newElements.map((el) => [el.id, true])) },
        captureUpdate: "IMMEDIATELY",
      });
      excalidrawAPI.scrollToContent(newElements, { fitToContent: true });
    } finally {
      setInserting(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="ghost" size="icon-sm" title="Emoji" />}>
        <Smile />
        <span className="sr-only">Emoji</span>
      </PopoverTrigger>
      <PopoverContent side="top" align="center" className="w-80">
        <PopoverHeader>
          <PopoverTitle>Emoji and icons</PopoverTitle>
          <PopoverDescription>Choose from the picker to add to the canvas.</PopoverDescription>
        </PopoverHeader>

        <Tabs defaultValue="emoji">
          <TabsList className="w-full">
            <TabsTrigger value="emoji" className="flex-1">
              Emoji
            </TabsTrigger>
            <TabsTrigger value="icons" className="flex-1">
              Icons
            </TabsTrigger>
          </TabsList>

          <TabsContent value="emoji" className="mt-2 grid max-h-64 grid-cols-8 gap-1 overflow-y-auto">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                onClick={() => insertEmoji(emoji)}
                className="flex size-8 items-center justify-center rounded-md text-xl hover:bg-muted"
              >
                {emoji}
              </button>
            ))}
          </TabsContent>

          <TabsContent value="icons" className="mt-2 grid max-h-64 grid-cols-6 gap-1 overflow-y-auto">
            {ICON_LIST.map((name) => {
              const Icon = ICON_COMPONENTS[name];
              if (!Icon) return null;
              return (
                <button
                  key={name}
                  title={name}
                  disabled={inserting}
                  onClick={() => insertIcon(name)}
                  className="flex size-9 items-center justify-center rounded-md hover:bg-muted disabled:opacity-50"
                >
                  <Icon size={18} />
                </button>
              );
            })}
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
