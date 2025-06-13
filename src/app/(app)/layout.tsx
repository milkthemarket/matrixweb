
import { SidebarNav } from "@/components/SidebarNav";
import { SidebarInset } from "@/components/ui/sidebar";
import { AlertProvider } from "@/contexts/AlertContext";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AlertProvider>
      <div className="flex min-h-screen w-full">
        <SidebarNav />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          {children}
        </SidebarInset>
      </div>
    </AlertProvider>
  );
}
