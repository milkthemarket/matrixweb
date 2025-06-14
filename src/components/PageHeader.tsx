
import { SidebarTrigger } from "@/components/ui/sidebar";

type PageHeaderProps = {
  title: string;
};

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border/20 bg-background/20 backdrop-blur-lg px-4 md:px-6">
      <div>
        <SidebarTrigger />
      </div>
      <h1 className="flex-1 text-2xl font-semibold font-headline">{title}</h1>
      {/* Add any other header elements here, like user menu if needed */}
    </header>
  );
}
