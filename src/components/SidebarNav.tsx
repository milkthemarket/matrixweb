
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { CandlestickChart, LayoutDashboard, Bell, ListFilter, History, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/rules", label: "Rules", icon: ListFilter },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <CandlestickChart className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-semibold text-primary font-headline group-data-[collapsible=icon]:hidden">TradePilot</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  variant="default"
                  className={cn(
                    "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard" && item.href !== "/")
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "font-normal"
                  )}
                  tooltip={{ children: item.label, className: "text-xs" }}
                >
                  <item.icon className={cn("h-5 w-5", (pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard" && item.href !== "/")) ? "text-primary" : "text-accent")} />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} TradePilot</p>
      </SidebarFooter>
    </Sidebar>
  );
}
