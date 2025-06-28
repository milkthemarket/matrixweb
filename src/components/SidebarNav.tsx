
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
  Users,
  Home,
  Mail,
  CheckSquare,
  Workflow,
  Calendar,
  DollarSign,
  Briefcase,
  File,
  BarChart,
  PieChart,
  Package,
  Repeat,
  ShieldCheck,
  GitMerge,
  Grid3x3,
  TrendingUp,
  LifeBuoy,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const tradingNavItems = [
  { href: "/trading/milk-market", label: "Milk Market", icon: Store },
  { href: "/trading/dashboard", label: "Screener", icon: LayoutDashboard },
  { href: "/trading/moo-alerts", label: "Moo Alerts", icon: Megaphone },
  { href: "/trading/rules", label: "Rules", icon: ListFilter },
  { href: "/trading/history", label: "Trade History", icon: History },
];

const crmNavItems = [
  { href: "/crm/home", label: "Home", icon: Home },
  { href: "/crm/email", label: "Email", icon: Mail },
  { href: "/crm/contacts", label: "Contacts", icon: Users },
  { href: "/crm/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/crm/workflows", label: "Workflows", icon: Workflow },
  { href: "/crm/calendar", label: "Calendar", icon: Calendar },
  { href: "/crm/opportunities", label: "Opportunities", icon: DollarSign },
  { href: "/crm/projects", label: "Projects", icon: Briefcase },
  { href: "/crm/files", label: "Files", icon: File },
  { href: "/crm/reports", label: "Reports", icon: BarChart },
];

const analyticsNavItems = [
    { href: "/analytics/asset", label: "Asset Analytics", icon: Package },
    { href: "/analytics/client", label: "Client Analytics", icon: Users },
    { href: "/analytics/financial", label: "Financial Analytics", icon: TrendingUp },
    { href: "/analytics/conversion", label: "Conversion Analytics", icon: Repeat },
    { href: "/analytics/compliance", label: "Compliance Matrix", icon: ShieldCheck },
    { href: "/analytics/contribution", label: "Contribution Matrix", icon: GitMerge },
];

const helpDeskNavItems = [
  { href: "/trading/academy", label: "Milk Academy", icon: GraduationCap },
  { href: "/trading/suggestions", label: "Suggestions", icon: Lightbulb },
  { href: "/analytics/resource", label: "Resource Matrix", icon: Grid3x3 },
  { href: "/help-desk/documentation", label: "Documentation", icon: FileText },
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
  const [isCrmOpen, setIsCrmOpen] = React.useState(true);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = React.useState(true);
  const [isHelpDeskOpen, setIsHelpDeskOpen] = React.useState(true);

  const tradingSubMenuItems = tradingNavItems.map((item) => {
    const isActive = pathname === item.href;
    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuSubButton asChild isActive={isActive} tooltip={{ children: item.label }}>
          <Link href={item.href}>
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuItem>
    );
  });
  
  const crmSubMenuItems = crmNavItems.map((item) => {
    const isActive = pathname === item.href;
    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuSubButton asChild isActive={isActive} tooltip={{ children: item.label }}>
          <Link href={item.href}>
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuItem>
    );
  });

  const analyticsSubMenuItems = analyticsNavItems.map((item) => {
    const isActive = pathname === item.href;
    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuSubButton asChild isActive={isActive} tooltip={{ children: item.label }}>
          <Link href={item.href}>
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuItem>
    );
  });

  const helpDeskSubMenuItems = helpDeskNavItems.map((item) => {
    const isActive = pathname === item.href;
    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuSubButton asChild isActive={isActive} tooltip={{ children: item.label }}>
          <Link href={item.href}>
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuItem>
    );
  });


  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={cn(state === 'expanded' ? "p-3" : "p-0 flex flex-col items-center pt-3 pb-2")}>
        <div className={cn(
          "flex w-full items-center",
          state === "expanded" ? "justify-between" : "flex-col justify-center gap-2"
        )}>
          <Link href="/dashboard" className="group flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity duration-150">
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
          {/* Expanded View */}
          {state === "expanded" && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsTradingOpen(!isTradingOpen)}
                  className="justify-between w-full"
                  isActive={tradingNavItems.some((item) => item.href === pathname)}
                >
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    <span className="text-base font-semibold tracking-wide">Trading</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isTradingOpen && "rotate-180"
                    )}
                  />
                </SidebarMenuButton>
                <SidebarMenuSub open={isTradingOpen}>
                  {tradingSubMenuItems}
                </SidebarMenuSub>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsCrmOpen(!isCrmOpen)}
                  className="justify-between w-full"
                  isActive={crmNavItems.some((item) => item.href === pathname)} 
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span className="text-base font-semibold tracking-wide">CRM</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isCrmOpen && "rotate-180"
                    )}
                  />
                </SidebarMenuButton>
                <SidebarMenuSub open={isCrmOpen}>
                  {crmSubMenuItems}
                </SidebarMenuSub>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
                  className="justify-between w-full"
                  isActive={analyticsNavItems.some((item) => item.href === pathname)}
                >
                  <div className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    <span className="text-base font-semibold tracking-wide">Analytics</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isAnalyticsOpen && "rotate-180"
                    )}
                  />
                </SidebarMenuButton>
                <SidebarMenuSub open={isAnalyticsOpen}>
                  {analyticsSubMenuItems}
                </SidebarMenuSub>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsHelpDeskOpen(!isHelpDeskOpen)}
                  className="justify-between w-full"
                  isActive={helpDeskNavItems.some((item) => item.href === pathname)}
                >
                  <div className="flex items-center gap-2">
                    <LifeBuoy className="h-5 w-5" />
                    <span className="text-base font-semibold tracking-wide">Help Desk</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isHelpDeskOpen && "rotate-180"
                    )}
                  />
                </SidebarMenuButton>
                <SidebarMenuSub open={isHelpDeskOpen}>
                  {helpDeskSubMenuItems}
                </SidebarMenuSub>
              </SidebarMenuItem>
            </>
          )}

          {/* Collapsed View */}
          {state === "collapsed" && (
            <>
              {tradingSubMenuItems}
              {crmSubMenuItems}
              {analyticsSubMenuItems}
              {helpDeskSubMenuItems}
            </>
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
