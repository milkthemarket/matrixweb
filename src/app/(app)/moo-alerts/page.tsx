
"use client";

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Newspaper, BarChartBig, LineChart, Megaphone, Send, AlertCircle, Info } from "lucide-react";
import { MiloAvatarIcon } from '@/components/icons/MiloAvatarIcon';
import type { MooAlertItem, MooAlertSentiment } from '@/types';
import { cn } from '@/lib/utils';

const initialDummyAlerts: MooAlertItem[] = [
  {
    id: 'ma1',
    symbol: "TSLA",
    fullText: "TSLA surges after earnings beat — 7:08am — Positive",
    headline: "TSLA surges after earnings beat",
    time: "7:08am",
    sentiment: "Positive",
    criteria: { news: true, volume: true, chart: true }
  },
  {
    id: 'ma2',
    symbol: "NVDA",
    fullText: "NVDA announces new AI chip — 6:51am — Positive",
    headline: "NVDA announces new AI chip",
    time: "6:51am",
    sentiment: "Positive",
    criteria: { news: true, volume: false, chart: true }
  },
  {
    id: 'ma3',
    symbol: "AMC",
    fullText: "AMC in focus on pre-market spike — 7:12am — Neutral",
    headline: "AMC in focus on pre-market spike",
    time: "7:12am",
    sentiment: "Neutral",
    criteria: { news: false, volume: true, chart: false }
  },
  {
    id: 'ma4',
    symbol: "GME",
    fullText: "GME showing unusual options activity — 8:02am — Negative",
    headline: "GME showing unusual options activity",
    time: "8:02am",
    sentiment: "Negative",
    criteria: { news: false, volume: true, chart: true }
  },
  {
    id: 'ma5',
    symbol: "SPY",
    fullText: "SPY testing key support level — 8:15am — Neutral",
    headline: "SPY testing key support level",
    time: "8:15am",
    sentiment: "Neutral",
    criteria: { news: false, volume: false, chart: true }
  },
  {
    id: 'ma6',
    symbol: "AAPL",
    fullText: "AAPL rumored to unveil new product next week — 8:30am — Positive",
    headline: "AAPL rumored to unveil new product next week",
    time: "8:30am",
    sentiment: "Positive",
    criteria: { news: true, volume: false, chart: false }
  }
];

const CriteriaIcon: React.FC<{ met: boolean; IconComponent: React.ElementType; label: string }> = ({ met, IconComponent, label }) => (
  <TooltipProviderWrapper content={label}>
    <IconComponent className={cn("h-5 w-5", met ? "text-green-400" : "text-muted-foreground/50")} />
  </TooltipProviderWrapper>
);

// Tooltip needs to be a client component or wrapped to avoid issues with Suspense
const TooltipProviderWrapper: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
  // This is a simplified wrapper. In a real app, you might use ShadCN's Tooltip if it's compatible
  // or a custom lightweight tooltip solution. For now, it just renders children.
  // To use ShadCN's Tooltip, you would import Tooltip, TooltipTrigger, TooltipContent, TooltipProvider
  // from '@/components/ui/tooltip' and structure it appropriately.
  // Since Tooltip often relies on client-side JS for positioning, directly using it here
  // might require this wrapper to be a client component itself or carefully managed.
  // For simplicity, I'm omitting full Tooltip implementation here to avoid potential hydration errors
  // without full setup. The "title" attribute can serve as a basic tooltip for now.
  return <div title={content}>{children}</div>;
};


const MooAlertsContent: React.FC = () => {
  const [alerts, setAlerts] = useState<MooAlertItem[]>(initialDummyAlerts);
  const [filter, setFilter] = useState<'all' | 1 | 2 | 3>('all');

  const countMetCriteria = (item: MooAlertItem) => {
    return (item.criteria.news ? 1 : 0) + (item.criteria.volume ? 1 : 0) + (item.criteria.chart ? 1 : 0);
  };

  const filteredAlerts = useMemo(() => {
    if (filter === 'all') return alerts;
    return alerts.filter(alert => countMetCriteria(alert) === filter);
  }, [alerts, filter]);

  const getSentimentBadgeClass = (sentiment: MooAlertSentiment) => {
    switch (sentiment) {
      case 'Positive': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Negative': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Neutral':
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };
  
  const filterButtons: {label: string, value: typeof filter}[] = [
    {label: "Show All", value: 'all'},
    {label: "1/3 Met", value: 1},
    {label: "2/3 Met", value: 2},
    {label: "3/3 Only", value: 3},
  ];

  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Moo Alerts" />
      <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center">
              <Megaphone className="mr-2 h-5 w-5 text-primary"/>
              Real-Time Trade Signals
            </CardTitle>
            <CardDescription>
              Get real-time news catalysts, volume spikes, and instant trade signals—curated for momentum traders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-6">
              {filterButtons.map(btn => (
                <Button
                  key={btn.value}
                  variant={filter === btn.value ? "default" : "outline"}
                  onClick={() => setFilter(btn.value)}
                  className={cn(
                    filter === btn.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/5"
                  )}
                >
                  {btn.label}
                </Button>
              ))}
            </div>

            {filteredAlerts.length > 0 ? (
              <ScrollArea className="h-[calc(100vh-20rem)]"> {/* Adjust height as needed */}
                <div className="space-y-4 pr-3">
                  {filteredAlerts.map(alert => (
                    <Card key={alert.id} className="bg-black/20 border border-white/10 shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg font-semibold text-primary">{alert.symbol}</CardTitle>
                          <Badge variant="outline" className={cn("text-xs", getSentimentBadgeClass(alert.sentiment))}>
                            {alert.sentiment}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.time}</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-base text-foreground">{alert.headline}</p>
                        <div className="flex items-center space-x-3 pt-2">
                          <CriteriaIcon met={alert.criteria.news} IconComponent={Newspaper} label="Positive News" />
                          <CriteriaIcon met={alert.criteria.volume} IconComponent={BarChartBig} label="High Pre-market Volume" />
                          <CriteriaIcon met={alert.criteria.chart} IconComponent={LineChart} label="Clean Chart Structure" />
                        </div>
                        <div className="flex items-center space-x-2 pt-3">
                           <Button asChild variant="outline" size="sm" className="border-accent text-accent hover:bg-accent/10 hover:text-accent">
                            <Link href={`/dashboard?ticker=${alert.symbol}`}>
                              <Send className="mr-2 h-4 w-4" /> Send to Trade Panel
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                            <AlertCircle className="mr-2 h-4 w-4" /> Set Alert
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 text-muted-foreground">
                <MiloAvatarIcon size={60} className="mb-4 opacity-70" />
                <p className="text-lg font-medium">No headlines worth moo-ving on yet.</p>
                <p className="text-sm">Check back soon for the latest alerts!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-md font-semibold flex items-center">
              <Info className="mr-2 h-4 w-4 text-muted-foreground"/>
              Criteria Key
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p className="flex items-center"><Newspaper className="mr-2 h-4 w-4 text-green-400"/> = Positive News Catalyst</p>
            <p className="flex items-center"><BarChartBig className="mr-2 h-4 w-4 text-green-400"/> = High Pre-market Volume</p>
            <p className="flex items-center"><LineChart className="mr-2 h-4 w-4 text-green-400"/> = Clean Chart Structure (e.g. no major overhead resistance)</p>
          </CardContent>
        </Card>

      </div>
    </main>
  );
}

// Wrap the page content with Suspense for useSearchParams
export default function MooAlertsPage() {
  return (
    <Suspense fallback={<div>Loading Moo Alerts...</div>}>
      <MooAlertsContent />
    </Suspense>
  );
}
