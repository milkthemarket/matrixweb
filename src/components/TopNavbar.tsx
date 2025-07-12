
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
  Search,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MiloAvatarIcon } from "./icons/MiloAvatarIcon";

const navItems = [
  { href: "/trading/milk-market", label: "Milk Market", icon: Store },
  { href: "/trading/news", label: "News", icon: Newspaper },
  { href: "/trading/dashboard", label: "Screener", icon: LayoutDashboard },
  { href: "/trading/moo-alerts", label: "Moo Alerts", icon: Megaphone },
  { href: "/trading/rules", label: "Rules", icon: ListFilter },
  { href: "/trading/history", label: "Trade History", icon: History },
];

export function TopNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Cow Icon */}
        <div className="mr-4 flex items-center">
            <MiloAvatarIcon size={32} />
        </div>

        {/* Search Bar */}
        <div className="flex flex-1 items-center gap-x-6">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full rounded-full pl-9 h-9"
                />
            </div>
        
            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-x-6 text-lg font-semibold">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                        "transition-colors hover:text-white",
                        isActive ? "text-white font-bold" : "text-foreground/60"
                        )}
                    >
                        {item.label}
                    </Link>
                    );
                })}
            </nav>
        </div>
        
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
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
