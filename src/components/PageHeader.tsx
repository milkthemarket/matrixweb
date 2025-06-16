
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

type PageHeaderProps = {
  title: string;
};

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 h-16 bg-transparent flex items-center relative">
      {/* SidebarTrigger for mobile, positioned absolutely to not affect H1 flow for alignment */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 md:hidden">
        <SidebarTrigger />
      </div>
      {/* H1 gets its own padding to align with content container edge, and margin on mobile to clear absolute trigger */}
      <h1 className="flex-1 text-2xl font-semibold font-headline text-foreground px-4 md:px-6 ml-8 md:ml-0">
        {title}
      </h1>
    </header>
  );
}
