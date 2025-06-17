
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Stock, AlertRule } from '@/types';
import { cn } from '@/lib/utils';
import { Eye, List, Star, TrendingUp, TrendingDown, Activity, CalendarCheck2, Filter as FilterIcon } from 'lucide-react'; // Added FilterIcon
import { initialMockStocks } from '@/app/(app)/dashboard/page'; // Import all stocks
import { mockRules } from '@/app/(app)/rules/page'; // Import rules

interface WatchlistCardProps {
  // stocks prop is removed as the component will filter initialMockStocks internally
  selectedStockSymbol: string | null;
  onSelectStock: (stock: Stock) => void;
  className?: string;
}

const dummyWatchlistSymbols = ['AAPL', 'MSFT', 'TSLA', 'GOOGL', 'NVDA', 'BCTX']; // Local or imported

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
    let processedStocks = [...initialMockStocks]; // Use all stocks for filtering

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
          return processedStocks.filter(stock => dummyWatchlistSymbols.includes(stock.symbol)); // Default to watchlist if rule not found
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
      <CardHeader className="pb-3 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-headline text-foreground flex items-center">
            <Eye className="mr-2 h-5 w-5 text-primary" />
            Watchlist
          </CardTitle>
          {/* Add settings/edit button if needed later */}
        </div>
        <Select value={selectedFilterId} onValueChange={setSelectedFilterId}>
          <SelectTrigger className="w-full h-9 text-xs">
            <SelectValue placeholder="Select a view..." />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map(opt => {
              const IconComponent = opt.icon;
              return (
                <SelectItem key={opt.id} value={opt.id} className="text-xs">
                  <div className="flex items-center gap-2">
                    <IconComponent className={cn("h-4 w-4", opt.iconColor)} />
                    <span>{opt.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-3">
            {filteredStocks.length > 0 ? filteredStocks.map((stock) => (
              <Button
                key={stock.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-auto py-2.5 px-3 text-left",
                  selectedStockSymbol === stock.symbol ? "bg-primary/10 text-primary" : "hover:bg-white/5"
                )}
                onClick={() => onSelectStock(stock)}
              >
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-foreground">{stock.symbol}</span>
                    <span className={cn("text-sm font-semibold", stock.price >= 0 ? "text-foreground" : "text-destructive")}>
                      ${stock.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground truncate max-w-[70%]">{stock.name}</span>
                    <span className={cn(stock.changePercent >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive")}>
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </Button>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-4">No stocks match the selected filter.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
