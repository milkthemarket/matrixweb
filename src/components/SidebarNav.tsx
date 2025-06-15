
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
  useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Bell, ListFilter, History, Settings as SettingsIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Screener", icon: LayoutDashboard },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/rules", label: "Rules", icon: ListFilter },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

// Inline SVG for the Cow/MILK logo
const MilkLogoIcon = ({ className, size = 20 }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("lucide lucide-cow", className)}
    width={size}
    height={size}
  >
    <path d="M18.5 6C19.5 8.5 21 10.5 21 14.5C21 18.5 19.5 20.5 17 21.5" />
    <path d="M15.5 4.5C14.5 7 13 9 13 13C13 17 14.5 19 17 20" />
    <path d="M9 13.5c0-2 2-4 2-4" />
    <path d="M5.5 20.5C5.5 17.5 8.5 15 11.5 15c0-2-2-3-2-3" />
    <path d="M3 19c0-2 2.5-4 2.5-4" />
    <path d="M7 14.1C7 12.5 4.5 12 4.5 9.5 4.5 7.5 6 6 6 6" />
    <path d="M11.5 15c0 .5-.5 1.5-.5 1.5" />
    <path d="M11 6.5c-1.5 0-1.5.5-1.5.5" />
    <path d="M13 9c.1-.1.2-.3.2-.4" />
    <path d="M4.5 9.5C4.5 9.5 3 8.5 3 7.5s.5-2 2.5-2" />
  </svg>
);


export function SidebarNav() {
  const pathname = usePathname();
  const { open, toggleSidebar, isMobile, state } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className={cn(
          "flex w-full",
          "group-data-[state=expanded]:flex-row group-data-[state=expanded]:items-center group-data-[state=expanded]:justify-between",
          "group-data-[state=collapsed]:flex-col group-data-[state=collapsed]:items-center group-data-[state=collapsed]:gap-2"
        )}>
          <Link href="/dashboard" className="group flex items-center gap-2 min-w-0 group-data-[state=collapsed]:justify-center hover:opacity-80 transition-opacity duration-150">
            <MilkLogoIcon size={20} className="text-purple-500 flex-shrink-0" />
            {open && state === 'expanded' && (
              <span className="text-lg font-bold tracking-wide text-white font-headline truncate">M.I.L.K.</span>
            )}
          </Link>
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className={cn(
                "h-7 w-7 text-muted-foreground hover:text-primary shrink-0",
                "hover:shadow-[0_0_4px_hsla(var(--primary),0.5)] focus-visible:shadow-[0_0_4px_hsla(var(--primary),0.5)] focus-visible:outline-none transition-shadow duration-150",
                state === 'collapsed' && "group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none" 
              )}
              aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
              tabIndex={0}
            >
              {open && state === 'expanded' ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard" && item.href !== "/");
            return (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    variant="default"
                    isActive={isActive}
                    tooltip={{ children: item.label }}
                  >
                    <item.icon className={cn("h-5 w-5", isActive ? "text-sidebar-primary" : "text-muted-foreground group-hover:text-sidebar-accent-foreground")} />
                    {open && state === 'expanded' && (
                      <span className="text-base font-semibold tracking-wide">{item.label}</span>
                    )}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {open && state ==='expanded' && (
        <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} M.I.L.K.</p>
        </SidebarFooter>
      )}

    </Sidebar>
  );
}
