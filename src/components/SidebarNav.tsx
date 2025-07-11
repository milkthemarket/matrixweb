
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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  ListFilter,
  History,
  Megaphone,
  Store,
  ChevronLeft,
  ChevronRight,
  Newspaper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const tradingNavItems = [
  { href: "/trading/milk-market", label: "Milk Market", icon: Store },
  { href: "/trading/news", label: "News", icon: Newspaper },
  { href: "/trading/dashboard", label: "Screener", icon: LayoutDashboard },
  { href: "/trading/moo-alerts", label: "Moo Alerts", icon: Megaphone },
  { href: "/trading/rules", label: "Rules", icon: ListFilter },
  { href: "/trading/history", label: "Trade History", icon: History },
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

  const tradingNavItemsList = tradingNavItems.map((item) => {
    const isActive = pathname === item.href;
    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton asChild isActive={isActive} tooltip={{ children: item.label }}>
          <Link href={item.href}>
            <item.icon className="h-4 w-4" />
            <span className={cn(isActive ? "font-bold text-white" : "")}>{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  });
  
  return (
    <Sidebar collapsible="icon" className="bg-black">
      <SidebarHeader className={cn("p-4 pb-2 items-center", state === 'collapsed' && "p-2")}>
        <Link href="/trading/milk-market" className="group flex items-center justify-center min-w-0 hover:opacity-80 transition-opacity duration-150">
          <CowIcon size={28} className="text-white flex-shrink-0" />
        </Link>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-foreground rounded-full hover:bg-white/10 hover:text-white"
            onClick={toggleSidebar}
          >
            {state === 'expanded' ? <ChevronLeft /> : <ChevronRight />}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        )}
      </SidebarHeader>

      <SidebarContent className="items-center">
        <SidebarMenu>
          {tradingNavItemsList}
        </SidebarMenu>
      </SidebarContent>

    </Sidebar>
  );
}
