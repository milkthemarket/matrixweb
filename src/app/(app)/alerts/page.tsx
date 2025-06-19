
"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { TradeAlert } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { BellRing, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsContext } from '@/contexts/SettingsContext'; // Import settings context

const mockAlerts: TradeAlert[] = [
  { id: '1', symbol: 'TSLA', message: 'TSLA broke above $185.00 resistance.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), source: 'Rule Engine' },
  { id: '2', symbol: 'AAPL', message: 'Unusual volume spike in AAPL.', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), source: 'Volume Scanner' },
  { id: '3', symbol: 'NVDA', message: 'NVDA approaching 52-week high.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), source: 'Market Scanner' },
  { id: '4', symbol: 'AMD', message: 'Positive news catalyst for AMD reported.', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), source: 'News Feed' },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<TradeAlert[]>(mockAlerts);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  const { notificationSounds, playSound } = useSettingsContext(); // Get sound settings

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const newAlertInterval = setInterval(() => {
      const newAlert: TradeAlert = {
        id: String(Date.now()),
        symbol: ['BTC', 'ETH', 'SPY', 'QQQ'][Math.floor(Math.random() * 4)],
        message: `Random alert: Price movement detected.`,
        timestamp: new Date().toISOString(),
        source: 'System Generated'
      };
      setAlerts(prevAlerts => [newAlert, ...prevAlerts].slice(0, 20));
      
      // Play sound for new Moo Alert
      if (notificationSounds.mooAlert !== 'off') {
        playSound(notificationSounds.mooAlert);
      }

    }, 30000);
    return () => clearInterval(newAlertInterval);
  }, [notificationSounds.mooAlert, playSound]);


  return (
    <>
      <main className="flex flex-col flex-1 h-full overflow-hidden">
        <PageHeader title="Trade Alerts" />
        <div className="flex-1 p-1 md:p-1.5 overflow-y-auto space-y-1.5"> {/* Reduced padding and space */}

          <Card className="flex-1 flex flex-col min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center"> {/* Reduced from 2xl */}
                <BellRing className="mr-1.5 h-5 w-5 text-primary" /> {/* Reduced margin */}
                Alerts Panel
              </CardTitle>
              <CardDescription>Real-time notifications based on your rules and market events.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {currentTime && alerts.length > 0 ? (
                <ScrollArea className="h-[calc(100%-0rem)] pr-1"> {/* Reduced pr */}
                  <ul className="space-y-1"> {/* Reduced space */}
                    {alerts.map((alert) => (
                      <li
                        key={alert.id}
                        className={cn(
                          "p-1 rounded-lg shadow-none border border-white/5", // Reduced padding and rounded
                          "bg-black/10 backdrop-blur-md",
                          "hover:bg-white/10 transition-colors duration-200"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-1"> {/* Reduced space */}
                             <Info className="h-4 w-4 text-accent" /> {/* Reduced icon size */}
                             <div>
                              <p className="font-semibold text-sm text-foreground"> {/* Reduced text size */}
                                {alert.symbol}: <span className="font-normal">{alert.message}</span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                              </p>
                             </div>
                          </div>
                          {alert.source && <Badge variant="outline" className="text-xs border-accent text-accent py-0 px-1 h-auto">{alert.source}</Badge>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <BellRing className="h-10 w-10 mb-1" /> {/* Reduced icon size and margin */}
                  <p className="text-md">No alerts yet.</p> {/* Reduced text size */}
                  <p className="text-xs">Alerts will appear here when triggered.</p> {/* Reduced text size */}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
