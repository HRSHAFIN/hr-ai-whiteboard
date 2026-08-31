"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  FilePlus2,
  Files,
  Settings,
  Share2,
  Sparkles,
  UserCog,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "All Files", href: "/dashboard", icon: Files },
  { title: "Archive", href: "/dashboard/archive", icon: Archive },
  { title: "Shared Files", href: "/dashboard/shared", icon: Share2 },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <FilePlus2 />
              <span className="font-heading font-semibold">
                HR AI Whiteboard
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={pathname === item.href}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="pointer-events-none">
              <Sparkles />
              <span>Credits Remaining: 42</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Profile Settings"
              isActive={pathname === "/dashboard/settings"}
              render={<Link href="/dashboard/settings" />}
            >
              <UserCog />
              <span>Profile Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
