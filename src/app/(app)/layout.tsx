
"use client"; // This layout uses client-side context providers

import { SidebarNav } from "@/components/SidebarNav";
import { SidebarInset } from "@/components/ui/sidebar";
import { AlertProvider } from "@/contexts/AlertContext";
import { TradeHistoryProvider } from "@/contexts/TradeHistoryContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { OpenPositionsProvider } from "@/contexts/OpenPositionsContext";
import { AuthProvider } from "@/contexts/auth-context";


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AlertProvider>
        <TradeHistoryProvider>
          <SettingsProvider>
            <OpenPositionsProvider>
              <div className="flex min-h-screen w-full">
                <SidebarNav />
                <SidebarInset className="flex flex-col flex-1 overflow-auto">
                  {children}
                </SidebarInset>
              </div>
            </OpenPositionsProvider>
          </SettingsProvider>
        </TradeHistoryProvider>
      </AlertProvider>
    </AuthProvider>
  );
}
