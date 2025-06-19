
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { TradeAlert } from "@/types";
import { BellRing, DollarSign, BarChartBig, Newspaper, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Using a simplified watchlist for this standalone component for now
const dummyWatchlistSymbols = ['AAPL', 'MSFT', 'TSLA', 'NVDA', 'GOOGL', 'BCTX', 'SPY'];

const mockAlertsBase: Omit<TradeAlert, 'id' | 'timestamp'>[] = [
  { symbol: 'TSLA', message: 'Broke above $185.00 resistance.', source: 'Rule Engine', alertType: 'Price' },
  { symbol: 'AAPL', message: 'Unusual volume spike.', source: 'Volume Scanner', alertType: 'Volume' },
  { symbol: 'NVDA', message: 'Approaching 52-week high.', source: 'Market Scanner', alertType: 'Technical' },
  { symbol: 'AMD', message: 'Positive news catalyst reported.', source: 'News Feed', alertType: 'News' },
  { symbol: 'SPY', message: 'Crossed below 50-day MA.', source: 'Rule Engine', alertType: 'Technical' },
  { symbol: 'MSFT', message: 'New AI partnership announced.', source: 'News Feed', alertType: 'News' },
  { symbol: 'GOOGL', message: 'Large block trade detected.', source: 'Volume Scanner', alertType: 'Volume' },
  { symbol: 'BCTX', message: 'Hit new intraday high on volume surge.', source: 'System', alertType: 'Price' },
];

interface RecentAlertsCardProps {
  className?: string;
}

export function RecentAlertsCard({ className }: RecentAlertsCardProps) {
  const [recentAlerts, setRecentAlerts] = useState<TradeAlert[]>([]);

  useEffect(() => {
    const generateInitialAlerts = () => {
      const alerts: TradeAlert[] = [];
      for (let i = 0; i < 5; i++) {
        const baseAlert = mockAlertsBase[Math.floor(Math.random() * mockAlertsBase.length)];
        if (dummyWatchlistSymbols.includes(baseAlert.symbol)) {
          alerts.push({
            ...baseAlert,
            id: `alert-${Date.now()}-${i}`,
            timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 60).toISOString(), // Random time in last hour
          });
        }
      }
      setRecentAlerts(alerts.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0,5));
    };
    generateInitialAlerts();
  }, []);

  const getAlertIcon = (alertType?: TradeAlert['alertType']) => {
    switch (alertType) {
      case 'Price': return <DollarSign className="h-3.5 w-3.5 text-green-400" />;
      case 'Volume': return <BarChartBig className="h-3.5 w-3.5 text-blue-400" />;
      case 'News': return <Newspaper className="h-3.5 w-3.5 text-orange-400" />;
      case 'Technical': return <AlertCircle className="h-3.5 w-3.5 text-purple-400" />;
      default: return <BellRing className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  return (
    <Card className={cn("shadow-none", className)}>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base font-headline flex items-center text-foreground">
          <BellRing className="mr-2 h-4 w-4 text-primary" />
          Recent Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {recentAlerts.length > 0 ? (
          <ScrollArea className="h-[160px]"> {/* Fixed height for ~5 items */}
            <ul className="space-y-0">
              {recentAlerts.map((alert) => (
                <li
                  key={alert.id}
                  className="px-4 py-2.5 border-b border-border/[.08] last:border-b-0 hover:bg-white/5 transition-colors"
                >
                  <Link href={`/dashboard?ticker=${alert.symbol}`} passHref>
                    <a className="block cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          {getAlertIcon(alert.alertType)}
                          <p className="text-sm text-foreground">
                            <span className="font-semibold text-primary">{alert.symbol}:</span> {alert.message}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1 pl-[calc(0.875rem+0.5rem)]"> {/* Align with text above icon */}
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                        </p>
                        {alert.source && <Badge variant="outline" className="text-xs py-0 px-1.5 h-auto border-accent/50 text-accent">{alert.source}</Badge>}
                      </div>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <div className="h-[160px] flex items-center justify-center text-sm text-muted-foreground p-4 text-center">
            No recent alerts for your watchlist.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

