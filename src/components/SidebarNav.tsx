
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  ListFilter,
  History,
  Settings as SettingsIcon,
  GraduationCap,
  Lightbulb,
  Megaphone,
  Store,
  ChevronLeft,
  ChevronRight,
  Activity,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/milk-market", label: "Milk Market", icon: Store },
  { href: "/dashboard", label: "Screener", icon: LayoutDashboard },
  { href: "/moo-alerts", label: "Moo Alerts", icon: Megaphone },
  { href: "/rules", label: "Rules", icon: ListFilter },
  { href: "/history", label: "Trade History", icon: History },
  { href: "/academy", label: "Milk Academy", icon: GraduationCap },
  { href: "/suggestions", label: "Suggestions", icon: Lightbulb },
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
  const { state, toggleSidebar, isMobile } = useSidebar();
  const [isTradingOpen, setIsTradingOpen] = React.useState(true);

  // The button that acts as the collapsible header, only shown when expanded
  const tradingGroupButton = (
    <SidebarMenuButton
      onClick={() => {
        if (state === 'expanded') {
          setIsTradingOpen(!isTradingOpen);
        }
      }}
      className="justify-between w-full"
    >
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5" />
        <span className="text-base font-semibold tracking-wide">Trading</span>
      </div>
      <ChevronDown className={cn("h-4 w-4 transition-transform", isTradingOpen && "rotate-180")} />
    </SidebarMenuButton>
  );


  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3">
        <div className={cn(
          "flex w-full items-center",
          state === "expanded" ? "justify-between" : "flex-col justify-center gap-2"
        )}>
          <Link href="/milk-market" className="group flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity duration-150">
            <CowIcon size={28} className="text-white flex-shrink-0" />
            {state === 'expanded' && <span className="font-bold text-lg text-white">MILK</span>}
          </Link>
          {!isMobile && (
             <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 text-foreground"
                onClick={toggleSidebar}
              >
                {state === 'expanded' ? <ChevronLeft /> : <ChevronRight />}
                <span className="sr-only">Toggle sidebar</span>
              </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Only show the group header when expanded */}
            {state === 'expanded' && tradingGroupButton}

            {/* The sub-menu which will show conditionally based on expand/collapse */}
            <SidebarMenuSub>
              {/* Render items if the group is open, OR if the sidebar is collapsed */}
              {(isTradingOpen || state === 'collapsed') &&
                navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuSubItem key={item.href}>
                      <SidebarMenuSubButton asChild isActive={isActive} tooltip={{ children: item.label }}>
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  );
                })}
            </SidebarMenuSub>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
