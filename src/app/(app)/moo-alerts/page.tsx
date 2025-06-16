
"use client";

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Newspaper, BarChartBig, LineChart, Megaphone, Send, AlertCircle, Info, TrendingDown } from "lucide-react";
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
    criteria: { news: true, volume: true, chart: true, shortable: true }
  },
  {
    id: 'ma2',
    symbol: "NVDA",
    fullText: "NVDA announces new AI chip — 6:51am — Positive",
    headline: "NVDA announces new AI chip",
    time: "6:51am",
    sentiment: "Positive",
    criteria: { news: true, volume: false, chart: true, shortable: false }
  },
  {
    id: 'ma3',
    symbol: "AMC",
    fullText: "AMC in focus on pre-market spike — 7:12am — Neutral",
    headline: "AMC in focus on pre-market spike",
    time: "7:12am",
    sentiment: "Neutral",
    criteria: { news: false, volume: true, chart: false, shortable: true }
  },
  {
    id: 'ma4',
    symbol: "GME",
    fullText: "GME showing unusual options activity — 8:02am — Negative",
    headline: "GME showing unusual options activity",
    time: "8:02am",
    sentiment: "Negative",
    criteria: { news: false, volume: true, chart: true, shortable: true }
  },
  {
    id: 'ma5',
    symbol: "SPY",
    fullText: "SPY testing key support level — 8:15am — Neutral",
    headline: "SPY testing key support level",
    time: "8:15am",
    sentiment: "Neutral",
    criteria: { news: false, volume: false, chart: true, shortable: false }
  },
  {
    id: 'ma6',
    symbol: "AAPL",
    fullText: "AAPL rumored to unveil new product next week — 8:30am — Positive",
    headline: "AAPL rumored to unveil new product next week",
    time: "8:30am",
    sentiment: "Positive",
    criteria: { news: true, volume: false, chart: false, shortable: true }
  }
];

const CriteriaIcon: React.FC<{ met: boolean; IconComponent: React.ElementType; label: string; activeColorClass?: string }> = ({ met, IconComponent, label, activeColorClass = "text-green-400" }) => (
  <TooltipProviderWrapper content={label}>
    <IconComponent className={cn("h-5 w-5", met ? activeColorClass : "text-muted-foreground/50")} />
  </TooltipProviderWrapper>
);

const TooltipProviderWrapper: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
  return <div title={content}>{children}</div>;
};

interface SelectedCriteriaState {
  news: boolean;
  volume: boolean;
  chart: boolean;
  shortable: boolean;
}

const initialCriteriaFilterState: SelectedCriteriaState = {
  news: false,
  volume: false,
  chart: false,
  shortable: false,
};

const criteriaFilterConfig: Array<{ key: keyof SelectedCriteriaState; label: string; Icon?: React.ElementType }> = [
  { key: 'news', label: 'News', Icon: Newspaper },
  { key: 'volume', label: 'Volume', Icon: BarChartBig },
  { key: 'chart', label: 'Chart', Icon: LineChart },
  { key: 'shortable', label: 'Shortable', Icon: TrendingDown },
];


const MooAlertsContent: React.FC = () => {
  const [alerts, setAlerts] = useState<MooAlertItem[]>(initialDummyAlerts);
  const [selectedCriteria, setSelectedCriteria] = useState<SelectedCriteriaState>(initialCriteriaFilterState);

  const filteredAlerts = useMemo(() => {
    const activeFilterKeys = (Object.keys(selectedCriteria) as Array<keyof SelectedCriteriaState>)
      .filter(key => selectedCriteria[key]);

    if (activeFilterKeys.length === 0) {
      return alerts; // Show all if no filters are active
    }

    return alerts.filter(alert => {
      return activeFilterKeys.every(key => alert.criteria[key]);
    });
  }, [alerts, selectedCriteria]);

  const getSentimentBadgeClass = (sentiment: MooAlertSentiment) => {
    switch (sentiment) {
      case 'Positive': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Negative': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Neutral':
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };
  
  const handleCriteriaToggle = (criterionKey: keyof SelectedCriteriaState) => {
    setSelectedCriteria(prev => ({
      ...prev,
      [criterionKey]: !prev[criterionKey],
    }));
  };

  const handleShowAll = () => {
    setSelectedCriteria(initialCriteriaFilterState);
  };

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
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <Button
                variant={Object.values(selectedCriteria).every(v => !v) ? "default" : "outline"}
                onClick={handleShowAll}
                className={cn(
                  Object.values(selectedCriteria).every(v => !v) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/5"
                )}
              >
                Show All
              </Button>
              {criteriaFilterConfig.map(({ key, label, Icon }) => (
                <Button
                  key={key}
                  variant={selectedCriteria[key] ? "default" : "outline"}
                  onClick={() => handleCriteriaToggle(key)}
                  className={cn(
                    "flex items-center gap-1.5",
                    selectedCriteria[key] ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/5"
                  )}
                >
                  {Icon && <Icon className={cn("h-4 w-4", selectedCriteria[key] ? "text-primary-foreground" : "text-muted-foreground/80")} />}
                  {label}
                </Button>
              ))}
            </div>

            {filteredAlerts.length > 0 ? (
              <ScrollArea className="h-[calc(100vh-22rem)]"> {/* Adjust height as needed */}
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
                          <CriteriaIcon met={alert.criteria.shortable} IconComponent={TrendingDown} label="Shortable" activeColorClass="text-yellow-400" />
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
            <p className="flex items-center"><TrendingDown className="mr-2 h-4 w-4 text-yellow-400"/> = Shortable (Shares available to short)</p>
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
    