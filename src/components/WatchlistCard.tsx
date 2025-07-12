
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Stock, AlertRule } from '@/types';
import { cn } from '@/lib/utils';
import { List, Star, TrendingUp, TrendingDown, Activity, CalendarCheck2, Filter as FilterIcon } from 'lucide-react';
import { initialMockStocks } from '@/app/(app)/trading/dashboard/page';
import { mockRules } from '@/app/(app)/trading/rules/page';
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Define dummyWatchlistSymbols directly in this file
// Added 5 new tickers as requested
const dummyWatchlistSymbols = ['AAPL', 'MSFT', 'TSLA', 'GOOGL', 'NVDA', 'BCTX', 'SPY', 'AMD', 'AMZN', 'META', 'NFLX', 'JPM', 'TPL'];

interface WatchlistCardProps {
  selectedStockSymbol: string | null;
  onSelectStock: (symbol: string) => void;
  className?: string;
}

const formatVolumeDisplay = (volumeInMillions?: number): string => {
  if (volumeInMillions === undefined || volumeInMillions === null) {
    return '-';
  }
  if (volumeInMillions >= 1) {
    return `${volumeInMillions.toFixed(1)}M`;
  }
  return `${(volumeInMillions * 1000).toFixed(0)}K`;
};

export function WatchlistCard({ selectedStockSymbol, onSelectStock, className }: WatchlistCardProps) {
  const [selectedFilterId, setSelectedFilterId] = useState<string>('my-watchlist');

  const activeRules = useMemo(() => mockRules.filter(rule => rule.isActive), []);

  const filterOptions = useMemo(() => [
    { id: 'my-watchlist', label: 'My Watchlist', icon: Star, iconColor: "text-yellow-400" },
    { id: 'all', label: 'Show All Stocks', icon: List, iconColor: "text-muted-foreground" },
    { id: 'top-gainers', label: 'Top Gainers', icon: TrendingUp, iconColor: "text-[hsl(var(--confirm-green))]" },
    { id: 'top-losers', label: 'Top Losers', icon: TrendingDown, iconColor: "text-destructive" },
    { id: 'active', label: 'Most Active', icon: Activity, iconColor: "text-primary" },
    { id: '52-week', label: '52 Week Highs/Lows', icon: CalendarCheck2, iconColor: "text-accent" },
    ...activeRules.map(rule => ({ id: rule.id, label: rule.name, icon: FilterIcon, iconColor: "text-foreground/80" }))
  ], [activeRules]);

  const filteredStocks = useMemo(() => {
    let processedStocks = [...initialMockStocks];

    switch (selectedFilterId) {
      case 'all':
        return processedStocks;
      case 'my-watchlist':
        return processedStocks.filter(stock => dummyWatchlistSymbols.includes(stock.symbol));
      case 'top-gainers':
        return processedStocks.sort((a, b) => b.changePercent - a.changePercent);
      case 'top-losers':
        return processedStocks.sort((a, b) => a.changePercent - b.changePercent);
      case 'active':
        return processedStocks.sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));
      case '52-week':
        return processedStocks.filter(stock =>
          stock.price && stock.high52 && stock.low52 &&
          (stock.price >= (stock.high52 * 0.98) || stock.price <= (stock.low52 * 1.02))
        );
      default:
        const rule = activeRules.find(r => r.id === selectedFilterId);
        if (!rule) {
          return processedStocks.filter(stock => dummyWatchlistSymbols.includes(stock.symbol));
        }
        return processedStocks.filter(stock => {
          return rule.criteria.every(criterion => {
            const stockValue = stock[criterion.metric as keyof Stock] as number | undefined;
            if (stockValue === undefined || stockValue === null) return false;
            const ruleValue = criterion.value;
            switch (criterion.operator) {
              case '>': return stockValue > (ruleValue as number);
              case '<': return stockValue < (ruleValue as number);
              case '>=': return stockValue >= (ruleValue as number);
              case '<=': return stockValue <= (ruleValue as number);
              case '==': return stockValue === (ruleValue as number);
              case '!=': return stockValue !== (ruleValue as number);
              case 'between':
                if (Array.isArray(ruleValue) && ruleValue.length === 2) {
                  return stockValue >= ruleValue[0] && stockValue <= ruleValue[1];
                }
                return false;
              default: return true;
            }
          });
        });
    }
  }, [selectedFilterId, activeRules]);

  return (
    <Card className={cn("shadow-none flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between p-3 pb-2">
         {/* The Tabs and Select are now siblings in a flex container */}
        <div className="flex justify-between items-center w-full">
            <Tabs defaultValue="watchlist" className="w-auto">
                <TabsList className="p-0 bg-transparent border-none">
                    <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
                    <TabsTrigger value="news">News</TabsTrigger>
                </TabsList>
            </Tabs>
            <Select value={selectedFilterId} onValueChange={setSelectedFilterId}>
                <SelectTrigger className="w-auto h-8 text-xs">
                    <SelectValue placeholder="Select a view..." />
                </SelectTrigger>
                <SelectContent>
                    {filterOptions.map(opt => {
                        const IconComponent = opt.icon;
                        return (
                            <SelectItem key={opt.id} value={opt.id} className="text-xs">
                                <div className="flex items-center gap-1">
                                    <IconComponent className={cn("h-3 w-3", opt.iconColor)} />
                                    <span>{opt.label}</span>
                                </div>
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
        <div className="grid grid-cols-4 w-full items-baseline text-[10px] gap-2 px-3 py-1 text-muted-foreground border-b border-border/10">
          <span className="text-left">Symbol</span>
          <span className="text-right">Price</span>
          <span className="text-right">Change</span>
          <span className="text-right">Vol</span>
        </div>
        <ScrollArea className="h-full">
          <div className="space-y-px p-1">
            {filteredStocks.length > 0 ? filteredStocks.map((stock) => (
              <Button
                key={stock.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-auto py-1 px-2 text-left rounded-sm",
                  selectedStockSymbol === stock.symbol ? "bg-primary/10" : "hover:bg-white/5"
                )}
                onClick={() => onSelectStock(stock.symbol)}
              >
                <div className="grid grid-cols-4 w-full items-baseline text-[11px] gap-2">
                  <span className="font-bold text-foreground truncate text-left">{stock.symbol}</span>
                  
                  <span className="font-bold text-foreground text-right">
                    ${stock.price.toFixed(2)}
                  </span>

                  <span className={cn(
                      "font-bold text-right",
                      stock.changePercent >= 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </span>

                  <span className="font-medium text-neutral-400 text-right truncate">
                    {formatVolumeDisplay(stock.volume)}
                  </span>
                </div>
              </Button>
            )) : (
              <p className="text-[10px] text-muted-foreground text-center py-1.5">No stocks match filter.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
