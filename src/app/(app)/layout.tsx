
"use client"; // This layout uses client-side context providers

import { TopNavbar } from "@/components/TopNavbar";
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
              <div className="flex flex-col min-h-screen w-full bg-background">
                <TopNavbar />
                <main className="flex-1 overflow-auto">
                  {children}
                </main>
              </div>
            </OpenPositionsProvider>
          </SettingsProvider>
        </TradeHistoryProvider>
      </AlertProvider>
    </AuthProvider>
  );
}
