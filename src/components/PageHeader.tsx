
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

type PageHeaderProps = {
  title: string;
};

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 h-12 bg-transparent flex items-center relative"> {/* Reduced h-16 to h-12 */}
      <div className="absolute left-1 top-1/2 transform -translate-y-1/2 md:hidden"> {/* Reduced left-4 to left-1 */}
        <SidebarTrigger />
      </div>
      <h1 className="flex-1 text-xl font-semibold font-headline text-foreground px-1 md:px-1.5 ml-2 md:ml-0"> {/* Reduced text-2xl to text-xl, px-4/6 to px-1/1.5, ml-8 to ml-2 */}
        {title}
      </h1>
    </header>
  );
}
