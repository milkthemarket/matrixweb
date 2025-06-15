
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
import { LayoutDashboard, Bell, ListFilter, History, Settings as SettingsIcon, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Screener", icon: LayoutDashboard },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/rules", label: "Rules", icon: ListFilter },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
  { href: "/academy", label: "Milk Academy", icon: GraduationCap },
];

// New MilkDropIcon component structure, ready for Flaticon SVG path data
const MilkDropIcon = ({ size = 28, className }: { size?: number; className?: string; }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 512 512" // Use Flaticon's viewBox
      fill="currentColor" // Ensures single color and theme compatibility
      className={className}
      aria-labelledby="milkLogoTitle"
    >
      <title id="milkLogoTitle">MILK Logo</title>
      {/*
        IMPORTANT: Replace the path below with the actual <path> data
        from the "milking_1421714" SVG file you downloaded from Flaticon.
        Example: <path d="Mactual path data from Flaticon...Z" />
        The current path is just a placeholder.
      */}
      <path d="M100,100 h312 v312 h-312 z" /> {/* Placeholder path */}
    </svg>
  );
};


export function SidebarNav() {
  const pathname = usePathname();
  const { open, toggleSidebar, isMobile, state } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3">
        <div className={cn(
          "flex w-full",
          "group-data-[state=expanded]:flex-row group-data-[state=expanded]:items-center group-data-[state=expanded]:justify-between",
          "group-data-[state=collapsed]:flex-col group-data-[state=collapsed]:items-center group-data-[state=collapsed]:gap-2"
        )}>
          <Link href="/dashboard" className="group flex items-center gap-2 min-w-0 group-data-[state=collapsed]:justify-center hover:opacity-80 transition-opacity duration-150">
            <MilkDropIcon size={28} className="text-white flex-shrink-0" />
            {open && state === 'expanded' && (
              <span className="text-2xl font-bold text-[#E5E5E5] tracking-widest font-headline truncate">M.I.L.K.</span>
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
        <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden flex flex-col space-y-1 items-start">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} M.I.L.K.</p>
          <p className="text-xs text-muted-foreground/70">Milking icon concept by monik from Flaticon.</p>
          <p className="text-xs text-muted-foreground/70">Cow head icon concept by kerismaker from Flaticon.</p>
        </SidebarFooter>
      )}

    </Sidebar>
  );
}
