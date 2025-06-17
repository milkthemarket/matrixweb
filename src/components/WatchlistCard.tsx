
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import type { Stock } from '@/types';
import { cn } from '@/lib/utils';
import { Eye } from 'lucide-react';

interface WatchlistCardProps {
  stocks: Stock[];
  selectedStockSymbol: string | null;
  onSelectStock: (stock: Stock) => void;
  className?: string;
}

// Using passed stocks prop primarily, this is a fallback if needed or for examples
const dummyWatchlistStocksData: Stock[] = [
  { id: '1', symbol: 'AAPL', name: 'Apple Inc.', price: 170.34, changePercent: 2.5, float:0, volume:0, lastUpdated:"" },
  { id: '2', symbol: 'MSFT', name: 'Microsoft Corp.', price: 420.72, changePercent: -1.2, float:0, volume:0, lastUpdated:"" },
  { id: '3', symbol: 'TSLA', name: 'Tesla, Inc.', price: 180.01, changePercent: 5.8, float:0, volume:0, lastUpdated:"" },
  { id: '4', symbol: 'NVDA', name: 'NVIDIA Corporation', price: 900.50, changePercent: 0.5, float:0, volume:0, lastUpdated:"" },
  { id: '5', symbol: 'GOOGL', name: 'Alphabet Inc.', price: 140.22, changePercent: 1.1, float:0, volume:0, lastUpdated:"" },
  { id: '6', symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 185.50, changePercent: 1.8, float:0, volume:0, lastUpdated:"" },
  { id: '7', symbol: 'SNOW', name: 'Snowflake Inc.', price: 128.75, changePercent: -2.1, float:0, volume:0, lastUpdated:"" },
];


export function WatchlistCard({ stocks = dummyWatchlistStocksData, selectedStockSymbol, onSelectStock, className }: WatchlistCardProps) {
  return (
    <Card className={cn("shadow-none flex flex-col", className)}>
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-xl font-headline text-foreground flex items-center">
          <Eye className="mr-2 h-5 w-5 text-primary" />
          Watchlist
        </CardTitle>
        <CardDescription>Your curated list of stocks.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-3">
            {stocks.length > 0 ? stocks.map((stock) => (
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
                    <span className={cn("text-sm font-semibold", stock.price >= 0 ? "text-foreground" : "text-destructive")}> {/* Price itself is not colored based on gain/loss here */}
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
              <p className="text-sm text-muted-foreground text-center py-4">No stocks in watchlist.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
