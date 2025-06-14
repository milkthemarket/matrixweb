
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

// Define an inline SVG component for the Cow icon
const CowIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14.838 3.408c.303 -.09.619 -.158 .942 -.192m3.642 .816a13.022 13.022 0 0 1 .578 4.028" />
    <path d="M12.003 21.004c-2.489 0 -4.717 -.94 -6.365 -2.504c-1.71 -1.622 -2.638 -3.87 -2.638 -6.308c0 -2.294 .867 -4.49 2.468 -6.142c1.59 -1.64 3.742 -2.55 6.053 -2.55c2.31 0 4.47 .91 6.052 2.55c1.591 1.642 2.483 3.856 2.483 6.152c0 .482 -.027 .96 -.08 1.426" />
    <path d="M12 13m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M12 11v-3" />
    <path d="M7 16.5c0 -.215 .031 -.424 .09 -.623m1.27 -1.52a2.5 2.5 0 0 1 3.647 -.884" />
    <path d="M17 16.5a2.5 2.5 0 0 0 -2.5 -2.5" />
  </svg>
);


const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/rules", label: "Rules", icon: ListFilter },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];


export function SidebarNav() {
  const pathname = usePathname();
  const { open, toggleSidebar, isMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className={cn(
          "flex w-full",
          "group-data-[state=expanded]:items-center group-data-[state=expanded]:justify-between",
          "group-data-[state=collapsed]:flex-col group-data-[state=collapsed]:items-center group-data-[state=collapsed]:gap-2"
        )}>
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0 drop-shadow-lg group-data-[state=collapsed]:justify-center">
            <CowIcon className="h-6 w-6 text-primary flex-shrink-0" />
            {open && (
              <h1 className="text-3xl font-bold tracking-wide text-foreground font-headline truncate">MILK</h1>
            )}
          </Link>
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className={cn(
                "h-7 w-7 text-muted-foreground hover:text-primary shrink-0",
                "hover:shadow-[0_0_4px_hsla(var(--primary),0.5)] focus-visible:shadow-[0_0_4px_hsla(var(--primary),0.5)] focus-visible:outline-none transition-shadow duration-150"
              )}
              aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
              tabIndex={0}
            >
              {open ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
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
                    className={cn(
                      // Active/hover styles are handled by sidebarMenuButtonVariants in conjunction with theme variables
                    )}
                    tooltip={{ children: item.label, className: "text-xs" }}
                  >
                    <item.icon className={cn("h-5 w-5", isActive ? "text-sidebar-primary" : "text-muted-foreground group-hover:text-sidebar-accent-foreground")} />
                    {open && (
                      <span className="text-base font-semibold tracking-wide">{item.label}</span>
                    )}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {open && (
        <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} MILK</p>
        </SidebarFooter>
      )}

    </Sidebar>
  );
}
