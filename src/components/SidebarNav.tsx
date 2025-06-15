
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

// New MilkDropIcon component rendering an SVG for "milking" icon
const MilkDropIcon = ({ size = 28, className }: { size?: number; className?: string; }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24" // Adjusted viewBox for a more square-like icon if needed
      fill="currentColor"
      className={className}
    >
      {/* Simplified representation of hand milking udder with a drop */}
      {/* Udder part */}
      <path d="M8 10C8 8.34315 9.34315 7 11 7C12.6569 7 14 8.34315 14 10V13C14 14.1046 13.1046 15 12 15H10C8.89543 15 8 14.1046 8 13V10Z" />
      {/* Teat part of udder */}
      <path d="M11 15V17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Hand (very simplified) */}
      <path d="M15 9C15.5523 9 16 9.44772 16 10V12C16 12.5523 15.5523 13 15 13C14.4477 13 14 12.5523 14 12V10C14 9.44772 14.4477 9 15 9Z" />
      <path d="M17 11H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
       {/* Milk Drop */}
      <path d="M11 18C11 18.5523 10.5523 19 10 19C9.44772 19 9 18.5523 9 18C9 17.4477 9.44772 17 10 17C10.2412 17 10.4691 17.0863 10.6465 17.2345L11 17.5L11.3535 17.2345C11.5309 17.0863 11.7588 17 12 17C12.5523 17 13 17.4477 13 18C13 19.1046 12.1046 20 11 20C9.89543 20 9 19.1046 9 18" transform="translate(0.5, 0.5) scale(0.9)"/>
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
