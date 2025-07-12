
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Stock, AlertRule } from '@/types';
import { cn } from '@/lib/utils';
import { List, Star, TrendingUp, TrendingDown, Activity, CalendarCheck2, Filter as FilterIcon, Newspaper, Rss } from 'lucide-react';
import { initialMockStocks } from '@/app/(app)/trading/dashboard/page';
import { mockRules } from '@/app/(app)/trading/rules/page';
import { Separator } from "@/components/ui/separator";
import { NewsCard } from './NewsCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Define dummyWatchlistSymbols directly in this file
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
  const [activeContent, setActiveContent] = useState<'watchlist' | 'news'>('watchlist');

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
    <Card className={cn("shadow-none flex flex-col h-full border border-white/5", className)}>
        <CardHeader className="flex flex-row items-center justify-start p-3 pb-2 gap-2">
            <Select value={selectedFilterId} onValueChange={(value) => { setSelectedFilterId(value); setActiveContent('watchlist'); }}>
              <SelectTrigger className="w-auto h-9 text-xs">
                <SelectValue placeholder="Select a view..." />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map(opt => {
                  const IconComponent = opt.icon;
                  return (
                    <SelectItem key={opt.id} value={opt.id} className="text-xs">
                      <div className="flex items-center gap-1.5">
                        <IconComponent className={cn("h-3.5 w-3.5", opt.iconColor)} />
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Select defaultValue="all-news" onValueChange={() => setActiveContent('news')}>
              <SelectTrigger className="w-auto h-9 text-xs">
                <SelectValue placeholder="News Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-news" className="text-xs">
                  <div className="flex items-center gap-1.5">
                    <Rss className="h-3.5 w-3.5 text-primary"/>
                    <span>All News</span>
                  </div>
                </SelectItem>
                <SelectItem value="reuters" className="text-xs">Reuters</SelectItem>
                <SelectItem value="tipranks" className="text-xs">TipRanks</SelectItem>
              </SelectContent>
            </Select>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
            {activeContent === 'watchlist' && (
                <ScrollArea className="h-full">
                    <Table>
                        <TableHeader className="sticky top-0 bg-[#0d0d0d] z-[1]">
                            <TableRow className="border-b-0 h-10">
                                <TableHead className="px-4 py-2 text-left font-headline uppercase text-[15px] font-bold text-neutral-100">Symbol</TableHead>
                                <TableHead className="px-4 py-2 text-right font-headline uppercase text-[15px] font-bold text-neutral-100">Price</TableHead>
                                <TableHead className="px-4 py-2 text-right font-headline uppercase text-[15px] font-bold text-neutral-100">Change</TableHead>
                                <TableHead className="px-4 py-2 text-right font-headline uppercase text-[15px] font-bold text-neutral-100">Vol</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStocks.length > 0 ? filteredStocks.map((stock) => (
                                <TableRow
                                    key={stock.id}
                                    className={cn(
                                        "cursor-pointer text-sm hover:bg-white/5 border-b border-border/5 last:border-b-0 h-10",
                                        selectedStockSymbol === stock.symbol && "bg-primary/10"
                                    )}
                                    onClick={() => onSelectStock(stock.symbol)}
                                >
                                    <TableCell className="px-4 py-2 font-bold text-foreground truncate text-left">{stock.symbol}</TableCell>
                                    <TableCell className="px-4 py-2 font-bold text-foreground text-right">${stock.price.toFixed(2)}</TableCell>
                                    <TableCell className={cn("px-4 py-2 font-bold text-right", stock.changePercent >= 0 ? "text-green-500" : "text-red-500")}>
                                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                    </TableCell>
                                    <TableCell className="px-4 py-2 font-medium text-neutral-400 text-right truncate">{formatVolumeDisplay(stock.volume)}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-xs text-muted-foreground">
                                        No stocks match the selected filter.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            )}
            {activeContent === 'news' && (
                <NewsCard
                    className="h-full border-0 shadow-none rounded-none bg-transparent"
                    selectedTickerSymbol={selectedStockSymbol}
                    onTickerSelect={onSelectStock}
                />
            )}
        </CardContent>
    </Card>
  );
}
