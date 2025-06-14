

import { SidebarNav } from "@/components/SidebarNav";
import { SidebarInset } from "@/components/ui/sidebar";
import { AlertProvider } from "@/contexts/AlertContext";
import { TradeHistoryProvider } from "@/contexts/TradeHistoryContext";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AlertProvider>
      <TradeHistoryProvider>
        <div className="flex min-h-screen w-full">
          <SidebarNav />
          <SidebarInset className="flex flex-col flex-1 overflow-hidden">
            {children}
          </SidebarInset>
        </div>
      </TradeHistoryProvider>
    </AlertProvider>
  );
}
