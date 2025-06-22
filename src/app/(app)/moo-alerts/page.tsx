
"use client";

import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Megaphone, Filter, Layers } from "lucide-react";
import { MiloAvatarIcon } from '@/components/icons/MiloAvatarIcon';
import type { MooAlertItem, MooAlertSentiment, OrderActionType, OrderSystemType } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { useSettingsContext } from '@/contexts/SettingsContext';
import { Separator } from '@/components/ui/separator';

const generateTradePlan = (price: number, sentiment: MooAlertSentiment): Partial<MooAlertItem> => {
  let action: OrderActionType = 'Buy';
  if (sentiment === 'Negative') action = 'Short';
  
  const orderType: OrderSystemType = Math.random() > 0.5 ? 'Limit' : 'Market';
  const quantity = Math.floor(Math.random() * 20) + 10; // 10-29 shares

  let entryPrice: number;
  if (orderType === 'Limit') {
    entryPrice = action === 'Buy' ? parseFloat((price * 0.995).toFixed(2)) : parseFloat((price * 1.005).toFixed(2));
  } else {
    entryPrice = price;
  }

  const targetGainPercent = parseFloat((Math.random() * 4 + 2).toFixed(1)); // 2-6%
  const stopLossRiskPercent = parseFloat((Math.random() * 2 + 1).toFixed(1)); // 1-3%

  const targetPrice = action === 'Buy' 
    ? parseFloat((entryPrice * (1 + targetGainPercent / 100)).toFixed(2))
    : parseFloat((entryPrice * (1 - targetGainPercent / 100)).toFixed(2));
  
  const stopLossPrice = action === 'Buy'
    ? parseFloat((entryPrice * (1 - stopLossRiskPercent / 100)).toFixed(2))
    : parseFloat((entryPrice * (1 + stopLossRiskPercent / 100)).toFixed(2));
    
  return {
    suggestedAction: action,
    suggestedEntryPrice: entryPrice,
    suggestedTargetPrice: targetPrice,
    suggestedStopLossPrice: stopLossPrice,
    targetGainPercent,
    stopLossRiskPercent,
    suggestedOrderType: orderType,
    suggestedQuantity: quantity,
  };
};

const initialDummyAlertsData: Omit<MooAlertItem, 'suggestedAction' | 'suggestedEntryPrice' | 'suggestedTargetPrice' | 'suggestedStopLossPrice' | 'targetGainPercent' | 'stopLossRiskPercent' | 'suggestedOrderType' | 'suggestedQuantity'>[] = [
  {
    id: 'ma1',
    symbol: "TSLA",
    fullText: "TSLA surges after earnings beat — 7:08am — Positive",
    headline: "TSLA surges after earnings beat",
    time: "7:08am",
    sentiment: "Positive",
    currentPrice: 182.50,
    premarketChangePercent: 1.5,
    criteria: { news: true, volume: true, chart: true, shortable: true },
    sourceType: 'Rule',
    source: 'Rule: Earnings Catalyst'
  },
  {
    id: 'ma2',
    symbol: "NVDA",
    fullText: "NVDA announces new AI chip — 6:51am — Positive",
    headline: "NVDA announces new AI chip",
    time: "6:51am",
    sentiment: "Positive",
    currentPrice: 905.75,
    premarketChangePercent: 0.8,
    criteria: { news: true, volume: false, chart: true, shortable: false },
    sourceType: 'Rule',
    source: 'Rule: News Catalyst'
  },
  {
    id: 'ma3',
    symbol: "AMC",
    fullText: "AMC in focus on pre-market spike",
    headline: "AMC in focus on pre-market spike",
    time: "7:12am",
    sentiment: "Neutral",
    currentPrice: 5.12,
    premarketChangePercent: 3.2,
    criteria: { news: false, volume: true, chart: false, shortable: true },
    sourceType: 'Manual Screener',
    source: 'Screener: High Volume'
  },
  {
    id: 'ma4',
    symbol: "GME",
    fullText: "GME showing unusual options activity — 8:02am — Negative",
    headline: "GME showing unusual options activity",
    time: "8:02am",
    sentiment: "Negative",
    currentPrice: 24.80,
    premarketChangePercent: -1.1,
    criteria: { news: true, volume: true, chart: true, shortable: true },
    sourceType: 'Rule',
    source: 'Rule: Unusual Activity'
  },
  {
    id: 'ma5',
    symbol: "SPY",
    fullText: "SPY testing key support level — 8:15am — Neutral",
    headline: "SPY testing key support level",
    time: "8:15am",
    sentiment: "Neutral",
    currentPrice: 549.30,
    premarketChangePercent: -0.2,
    criteria: { news: false, volume: false, chart: true, shortable: false },
    sourceType: 'Manual Screener',
    source: 'Screener: Index Movers'
  },
  {
    id: 'ma6',
    symbol: "AAPL",
    fullText: "AAPL rumored to unveil new product next week — 8:30am — Positive",
    headline: "AAPL rumored to unveil new product next week",
    time: "8:30am",
    sentiment: "Positive",
    currentPrice: 171.05,
    premarketChangePercent: 0.5,
    criteria: { news: true, volume: false, chart: false, shortable: true },
    sourceType: 'News Feed',
    source: 'News Feed'
  },
  {
    id: 'ma7',
    symbol: "NFLX",
    fullText: "Netflix tops subscriber estimates after new series launch — 8:15am — Positive",
    headline: "Netflix tops subscriber estimates after new series launch",
    time: "8:15am",
    sentiment: "Positive",
    currentPrice: 670.20,
    premarketChangePercent: 2.10,
    criteria: { news: true, volume: true, chart: true, shortable: true },
    sourceType: 'Rule',
    source: 'Rule: Earnings Catalyst'
  },
  {
    id: 'ma8',
    symbol: "BA",
    fullText: "Boeing faces new delivery delays — 7:52am — Negative",
    headline: "Boeing faces new delivery delays",
    time: "7:52am",
    sentiment: "Negative",
    currentPrice: 214.80,
    premarketChangePercent: -0.50,
    criteria: { news: true, volume: true, chart: true, shortable: true },
    sourceType: 'News Feed',
    source: 'News Feed'
  },
  {
    id: 'ma9',
    symbol: "COIN",
    fullText: "Coinbase surges on crypto ETF approval rumors — 6:48am — Positive",
    headline: "Coinbase surges on crypto ETF approval rumors",
    time: "6:48am",
    sentiment: "Positive",
    currentPrice: 245.15,
    premarketChangePercent: 3.70,
    criteria: { news: true, volume: true, chart: true, shortable: true },
    sourceType: 'Rule',
    source: 'Rule: High Volume Movers'
  },
  {
    id: 'ma10',
    symbol: "META",
    fullText: "Meta announces new privacy features — 7:40am — Neutral",
    headline: "Meta announces new privacy features",
    time: "7:40am",
    sentiment: "Neutral",
    currentPrice: 332.25,
    premarketChangePercent: 1.00,
    criteria: { news: true, volume: true, chart: true, shortable: true },
    sourceType: 'News Feed',
    source: 'News Feed'
  },
  {
    id: 'ma11',
    symbol: "SQ",
    fullText: "Block, Inc. drops after earnings miss — 7:10am — Negative",
    headline: "Block, Inc. drops after earnings miss",
    time: "7:10am",
    sentiment: "Negative",
    currentPrice: 71.05,
    premarketChangePercent: -1.90,
    criteria: { news: true, volume: true, chart: true, shortable: true },
    sourceType: 'Rule',
    source: 'Rule: Earnings Catalyst'
  },
  {
    id: 'ma12',
    symbol: "AMD",
    fullText: "AMD rallies on strong chip sales guidance — 6:33am — Positive",
    headline: "AMD rallies on strong chip sales guidance",
    time: "6:33am",
    sentiment: "Positive",
    currentPrice: 164.70,
    premarketChangePercent: 2.80,
    criteria: { news: true, volume: true, chart: true, shortable: true },
    sourceType: 'Rule',
    source: 'Rule: High Volume Movers'
  }
];

type SourceTypeFilter = 'all' | 'Rule' | 'Manual Screener' | 'News Feed';

const MooAlertsContent: React.FC = () => {
  const [alerts, setAlerts] = useState<MooAlertItem[]>([]); 
  const [selectedSourceType, setSelectedSourceType] = useState<SourceTypeFilter>('all');
  const router = useRouter();
  const { toast } = useToast();
  const { notificationSounds, playSound } = useSettingsContext();

  const filterButtons: { id: SourceTypeFilter; label: string; }[] = [
    { id: 'all', label: 'All Alerts' },
    { id: 'Rule', label: 'Rule-Based' },
    { id: 'Manual Screener', label: 'From Screener' },
    { id: 'News Feed', label: 'From News' },
  ];

  useEffect(() => {
    const processedInitialAlerts = initialDummyAlertsData.map(alert => ({
      ...alert,
      ...generateTradePlan(alert.currentPrice, alert.sentiment),
    }));
    setAlerts(processedInitialAlerts);
  }, []); 

  useEffect(() => {
    const newAlertInterval = setInterval(() => {
      const randomBaseAlert = initialDummyAlertsData[Math.floor(Math.random() * initialDummyAlertsData.length)];
      const newPrice = parseFloat((randomBaseAlert.currentPrice * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2));
      const newSentiment = ['Positive', 'Negative', 'Neutral'][Math.floor(Math.random() * 3)] as MooAlertSentiment;
      
      const newAlert: MooAlertItem = {
        ...randomBaseAlert,
        id: String(Date.now()),
        currentPrice: newPrice,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        sentiment: newSentiment,
        premarketChangePercent: parseFloat(((Math.random() - 0.5) * 5).toFixed(2)), 
        ...generateTradePlan(newPrice, newSentiment), 
      };

      setAlerts(prevAlerts => [newAlert, ...prevAlerts].slice(0, 20)); 
      
      if (notificationSounds.mooAlert !== 'off' && newAlert.sourceType !== 'News Feed') { // Don't play for news
        playSound(notificationSounds.mooAlert);
      }

    }, 30000); 
    return () => clearInterval(newAlertInterval);
  }, [notificationSounds.mooAlert, playSound]);


  const handleAlertClick = (alertItem: MooAlertItem) => {
    if (!alertItem.suggestedAction || !alertItem.suggestedQuantity || !alertItem.suggestedEntryPrice || !alertItem.suggestedOrderType) {
        router.push(`/milk-market?ticker=${alertItem.symbol}`);
        return;
    }
    
    const params = new URLSearchParams({
        ticker: alertItem.symbol,
        action: alertItem.suggestedAction,
        quantity: String(alertItem.suggestedQuantity),
        entryPrice: String(alertItem.suggestedEntryPrice),
        orderType: alertItem.suggestedOrderType
    });

    router.push(`/milk-market?${params.toString()}`);
  };

  const filteredAlerts = useMemo(() => {
    if (selectedSourceType === 'all') {
      return alerts;
    }
    return alerts.filter(alert => alert.sourceType === selectedSourceType);
  }, [alerts, selectedSourceType]);

  const getSentimentBadgeClass = (sentiment: MooAlertSentiment) => {
    switch (sentiment) {
      case 'Positive': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Negative': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Neutral':
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };
  
  const getActionTextColorClass = (action?: OrderActionType) => {
    if (action === 'Buy') return 'text-[hsl(var(--confirm-green))]';
    if (action === 'Sell') return 'text-destructive';
    if (action === 'Short') return 'text-yellow-400';
    return 'text-foreground';
  };

  return (
    <main className="flex flex-col flex-1 h-full overflow-auto">
      <PageHeader title="Moo Alerts" />
      <div className="flex-1 p-4 overflow-auto">
        <div className="flex-1 flex flex-col gap-4 overflow-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Megaphone className="mr-2 h-5 w-5 text-primary"/>
                Real-Time Trade Signals
              </CardTitle>
              <CardDescription>
                Actionable signals from your rules and screeners. Click an alert to load it into the Milk Market trade panel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <p className="text-sm text-muted-foreground mr-2 flex items-center">
                  <Filter className="h-4 w-4 mr-1.5" />
                  Filter by source:
                </p>
                {filterButtons.map(({ id, label }) => (
                  <Button
                    key={id}
                    variant={selectedSourceType === id ? "default" : "outline"}
                    onClick={() => setSelectedSourceType(id)}
                    size="sm"
                    className={cn(
                      "flex items-center gap-2",
                      selectedSourceType === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {alerts.length === 0 && ( 
                 <div className="flex flex-col items-center justify-center text-center py-10 text-muted-foreground">
                  <MiloAvatarIcon size={40} className="mb-2 opacity-70 animate-pulse" />
                  <p className="text-sm font-medium">Moo-ving data into place...</p>
                  <p className="text-xs">Loading initial alerts.</p>
                </div>
              )}

              {alerts.length > 0 && filteredAlerts.length === 0 && ( 
                 <div className="flex flex-col items-center justify-center text-center py-10 text-muted-foreground">
                  <MiloAvatarIcon size={40} className="mb-2 opacity-70" />
                  <p className="text-sm font-medium">No alerts match your current filter.</p>
                  <p className="text-xs">Try adjusting the criteria or "Show All".</p>
                </div>
              )}

              {filteredAlerts.length > 0 && (
                 <ScrollArea className="h-[calc(100vh-22rem)]"> 
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
                    {filteredAlerts.map(alert => (
                      <Card 
                        key={alert.id} 
                        onClick={() => handleAlertClick(alert)} 
                        className="flex flex-col hover:border-primary/50 transition-all duration-150 ease-in-out cursor-pointer"
                      >
                        <CardContent className="p-3 space-y-2 text-sm">
                           <div className="flex justify-between items-start">
                               <div className="flex flex-col items-start gap-1">
                                   <div className="flex items-baseline gap-2">
                                       <h4 className="text-lg font-bold text-primary">{alert.symbol}</h4>
                                       <span className="font-mono text-base">${alert.currentPrice.toFixed(2)}</span>
                                   </div>
                                   {alert.premarketChangePercent !== undefined && (
                                       <span className={cn("text-xs font-semibold", alert.premarketChangePercent >= 0 ? "text-green-400" : "text-red-400")}>
                                          ({alert.premarketChangePercent >= 0 ? '+' : ''}{alert.premarketChangePercent.toFixed(2)}%)
                                       </span>
                                   )}
                               </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge variant="outline" className={cn("text-xs", getSentimentBadgeClass(alert.sentiment))}>
                                        {alert.sentiment}
                                    </Badge>
                                    <span className="text-xs font-light text-muted-foreground">{alert.time}</span>
                                </div>
                           </div>
                           
                           <p className="text-sm text-foreground pt-1">{alert.headline}</p>
                           
                           {alert.source && (
                             <p className="text-xs text-muted-foreground pt-1"><span className="font-semibold text-primary">Source:</span> {alert.source}</p>
                           )}

                           {alert.suggestedAction && (
                            <>
                              <Separator className="my-2 bg-border/20"/>
                              <div className="space-y-1 text-xs">
                                  <h5 className="font-semibold text-foreground mb-1">Trade Plan</h5>
                                  <div className="p-2 rounded-md bg-black/10 border border-white/5 space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Action:</span> 
                                      <span className={cn("font-bold", getActionTextColorClass(alert.suggestedAction))}>
                                        {alert.suggestedAction} @ {alert.suggestedQuantity}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Entry:</span> 
                                      <span className="font-mono">${alert.suggestedEntryPrice?.toFixed(2)} ({alert.suggestedOrderType})</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Target:</span> 
                                      <span className="font-mono text-green-400">${alert.suggestedTargetPrice?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Stop:</span> 
                                      <span className="font-mono text-red-400">${alert.suggestedStopLossPrice?.toFixed(2)}</span>
                                    </div>
                                  </div>
                              </div>
                            </>
                           )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

export default function MooAlertsPage() {
  return (
    <Suspense fallback={<div>Loading Moo Alerts...</div>}>
      <MooAlertsContent />
    </Suspense>
  );
}
