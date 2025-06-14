
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

const mockAlerts: TradeAlert[] = [
  { id: '1', symbol: 'TSLA', message: 'TSLA broke above $185.00 resistance.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), source: 'Rule Engine' },
  { id: '2', symbol: 'AAPL', message: 'Unusual volume spike in AAPL.', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), source: 'Volume Scanner' },
  { id: '3', symbol: 'NVDA', message: 'NVDA approaching 52-week high.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), source: 'Market Scanner' },
  { id: '4', symbol: 'AMD', message: 'Positive news catalyst for AMD reported.', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), source: 'News Feed' },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<TradeAlert[]>(mockAlerts);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update time every minute for relative timestamps
    return () => clearInterval(timer);
  }, []);

  // Simulate new alerts
  useEffect(() => {
    const newAlertInterval = setInterval(() => {
      const newAlert: TradeAlert = {
        id: String(Date.now()),
        symbol: ['BTC', 'ETH', 'SPY', 'QQQ'][Math.floor(Math.random() * 4)],
        message: `Random alert: Price movement detected.`,
        timestamp: new Date().toISOString(),
        source: 'System Generated'
      };
      setAlerts(prevAlerts => [newAlert, ...prevAlerts].slice(0, 20)); // Keep max 20 alerts
    }, 30000); // New alert every 30 seconds
    return () => clearInterval(newAlertInterval);
  }, []);


  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Trade Alerts" />
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <Card className="h-full flex flex-col bg-transparent shadow-none rounded-none backdrop-blur-none border-none">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center">
              <BellRing className="mr-2 h-6 w-6 text-primary" />
              Alerts Panel
            </CardTitle>
            <CardDescription>Real-time notifications based on your rules and market events.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(100vh-15rem)] pr-4"> 
              {alerts.length > 0 ? (
                <ul className="space-y-4">
                  {alerts.map((alert) => (
                    <li 
                      key={alert.id} 
                      className={cn(
                        "p-4 rounded-xl shadow-none",
                        "bg-transparent backdrop-blur-md", 
                        "hover:bg-white/5 transition-colors duration-200"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                           <Info className="h-5 w-5 text-accent" />
                           <div>
                            <p className="font-semibold text-base text-foreground">
                              {alert.symbol}: <span className="font-normal">{alert.message}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                            </p>
                           </div>
                        </div>
                        {alert.source && <Badge variant="outline" className="text-xs border-accent text-accent">{alert.source}</Badge>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <BellRing className="h-12 w-12 mb-4" />
                  <p className="text-lg">No alerts yet.</p>
                  <p>Alerts will appear here when triggered.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
