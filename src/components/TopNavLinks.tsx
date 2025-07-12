
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  LayoutDashboard,
  ListFilter,
  History,
  Megaphone,
  Store,
  Newspaper,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "/trading/milk-market", label: "Milk Market", icon: Store },
  { href: "/trading/news", label: "News", icon: Newspaper },
  { href: "/trading/dashboard", label: "Screener", icon: LayoutDashboard },
  { href: "/trading/moo-alerts", label: "Moo Alerts", icon: Megaphone },
  { href: "/trading/rules", label: "Rules", icon: ListFilter },
  { href: "/trading/history", label: "Trade History", icon: History },
];

export function TopNavLinks() {
  const pathname = usePathname();
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null; // Don't render anything on the server or during the initial client render
  }

  const renderNavLinks = (isMobile = false) => {
    if (isMobile) {
      return (
        <div className="flex flex-col space-y-4 pt-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={`mobile-${item.href}`}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md p-2 text-base font-medium transition-colors hover:bg-muted",
                  isActive ? "bg-muted text-foreground" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      );
    }

    return (
      <nav className="hidden md:flex items-center gap-x-8 text-sm font-semibold flex-nowrap">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-white uppercase whitespace-nowrap",
                isActive ? "text-white font-bold" : "text-foreground/60"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  };

  return (
    <>
      {/* Desktop Navigation Links */}
      {renderNavLinks(false)}

      {/* Mobile Menu */}
      <div className="flex items-center justify-end md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[240px]">
            {renderNavLinks(true)}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
