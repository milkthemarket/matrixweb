
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

// New MilkDropIcon component rendering an SVG
const MilkDropIcon = ({ size = 28, className }: { size?: number; className?: string; }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor" // Uses fill for a solid drop shape
      className={className} // Takes color from className (e.g., text-white)
    >
      {/* Water drop / Milk drop shape */}
      <path d="M12 2C7.58 2 4 5.58 4 10c0 2.85 1.65 5.35 4 6.64V20a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3.36c2.35-1.29 4-3.79 4-6.64C20 5.58 16.42 2 12 2zM12 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
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
          <p className="text-xs text-muted-foreground/70">Milk drop icon concept by monik from Flaticon.</p>
          <p className="text-xs text-muted-foreground/70">Cow head icon concept by kerismaker from Flaticon.</p>
        </SidebarFooter>
      )}

    </Sidebar>
  );
}
