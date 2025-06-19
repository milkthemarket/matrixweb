
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
import { LayoutDashboard, Bell, ListFilter, History, Settings as SettingsIcon, GraduationCap, Lightbulb, SlidersHorizontal, Megaphone, Store, ArchiveX } from "lucide-react"; // Removed ChevronLeft, ChevronRight
import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button"; // Button is not needed if toggle is removed

const navItems = [
  { href: "/dashboard", label: "Screener", icon: LayoutDashboard },
  { href: "/milk-market", label: "Milk Market", icon: Store },
  { href: "/moo-alerts", label: "Moo Alerts", icon: Megaphone },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/rules", label: "Rules", icon: ListFilter },
  { href: "/history", label: "Trade History", icon: History },
  { href: "/options", label: "Options", icon: SlidersHorizontal },
  { href: "/academy", label: "Milk Academy", icon: GraduationCap },
  { href: "/suggestions", label: "Suggestions", icon: Lightbulb },
  { href: "/spilled-milk", label: "Spilled Milk", icon: ArchiveX },
  { href: "/settings", label: "Settings", icon: SettingsIcon }, 
];

// Phosphor cow icon (https://phosphoricons.com/) - open source
const CowIcon = ({ size = 28, color = "currentColor", ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width={size} height={size} {...props}>
      <rect width="256" height="256" fill="none"/>
      <path d="M56,24h0a48,48,0,0,0,48,48h48a48,48,0,0,0,48-48h0" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <rect x="48" y="160" width="160" height="64" rx="32" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <line x1="80" y1="192" x2="96" y2="192" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <line x1="160" y1="192" x2="176" y2="192" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <circle cx="100" cy="124" r="12" fill={color}/>
      <circle cx="156" cy="124" r="12" fill={color}/>
      <path d="M160,72h32.78a48,48,0,0,1,47.07,38.53A8,8,0,0,1,232,120H192" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <path d="M96,72H63.22a48,48,0,0,0-47.07,38.53A8,8,0,0,0,24,120H64" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <path d="M64,164.28V104A32,32,0,0,1,96,72h64a32,32,0,0,1,32,32v60.28" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
    </svg>
  );
};


export function SidebarNav() {
  const pathname = usePathname();
  const { open, state } = useSidebar(); // Removed toggleSidebar and isMobile as desktop toggle is gone

  return (
    <Sidebar collapsible="icon"> {/* collapsible="icon" ensures it can be in icon mode */}
      <SidebarHeader className="p-3">
        <div className={cn(
          "flex w-full items-center justify-center" // Always center for icon-only
        )}>
          <Link href="/dashboard" className="group flex items-center gap-2 min-w-0 justify-center hover:opacity-80 transition-opacity duration-150">
            <CowIcon size={28} className="text-white flex-shrink-0" />
            {/* Text label is removed as sidebar is always icon-only on desktop */}
          </Link>
          {/* Desktop expand/collapse button removed */}
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
                    tooltip={{ children: item.label }} // Tooltip will show on hover
                  >
                    <item.icon className={cn("h-5 w-5", isActive ? "text-sidebar-primary" : "text-muted-foreground group-hover:text-sidebar-accent-foreground")} />
                    {/* Text label below is conditional on 'open && state === "expanded"' */}
                    {/* Since 'open' will be false and 'state' will be 'collapsed' on desktop from context, this won't render */}
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

      {/* Footer is also conditional on 'open && state === "expanded"' or a similar check in SidebarFooter component */}
      {/* If SidebarFooter hides itself when collapsed, this will also not show */}
      {open && state ==='expanded' && (
        <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden flex flex-col space-y-1 items-start">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} M.I.L.K.</p>
          <p className="text-xs text-muted-foreground/70">Main logo based on Phosphor Icons (open source).</p>
          <p className="text-xs text-muted-foreground/70">Milo Avatar (cow head) icon concept by kerismaker from Flaticon.</p>
        </SidebarFooter>
      )}

    </Sidebar>
  );
}
