
import { SidebarTrigger } from "@/components/ui/sidebar";

type PageHeaderProps = {
  title: string;
};

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border/[.1] bg-header/[.05] backdrop-blur-md px-4 md:px-6"> {/* Quantum Black: bg-white/5, border-white/10 */}
      <div>
        <SidebarTrigger />
      </div>
      <h1 className="flex-1 text-2xl font-semibold font-headline text-foreground">{title}</h1> {/* Ensure text is white */}
      {/* Add any other header elements here, like user menu if needed */}
    </header>
  );
}
