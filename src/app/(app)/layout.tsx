

import { SidebarNav } from "@/components/SidebarNav";
import { SidebarInset } from "@/components/ui/sidebar";
import { AlertProvider } from "@/contexts/AlertContext";
import { TradeHistoryProvider } from "@/contexts/TradeHistoryContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { OpenPositionsProvider } from "@/contexts/OpenPositionsContext";
import { ManualTradeTicker } from "@/components/ManualTradeTicker";


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AlertProvider>
      <TradeHistoryProvider>
        <SettingsProvider>
          <OpenPositionsProvider>
            <div className="flex min-h-screen w-full flex-col"> {/* Outer flex-col for ticker, REMOVED pt-7 */}
              <ManualTradeTicker /> {/* Render ticker at the top, it will stick to top of this box */}
              <div className="flex flex-1 pt-5"> {/* Inner flex for sidebar and content, CHANGED to pt-5 */}
                <SidebarNav />
                <SidebarInset className="flex flex-col flex-1 overflow-hidden">
                  {children}
                </SidebarInset>
              </div>
            </div>
          </OpenPositionsProvider>
        </SettingsProvider>
      </TradeHistoryProvider>
    </AlertProvider>
  );
}
