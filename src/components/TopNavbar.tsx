
"use client";

import Link from "next/link";
import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MiloAvatarIcon } from "./icons/MiloAvatarIcon";
import { TopNavLinks } from "./TopNavLinks";

export function TopNavbar() {
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Left Section */}
        <div className="flex-1 justify-start">
            <Link href="/trading/milk-market" className="flex items-center space-x-2">
                <MiloAvatarIcon size={32} />
                <span className="sr-only">MILK</span>
            </Link>
        </div>

        {/* Center Section */}
        <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full rounded-full pl-9 h-9"
                />
            </div>
        </div>

        {/* Right Section */}
        <div className="flex-1 flex justify-end">
          {hasMounted && <TopNavLinks />}
        </div>
      </div>
    </header>
  );
}
