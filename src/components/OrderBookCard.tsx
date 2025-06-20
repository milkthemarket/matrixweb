
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Stock } from '@/types';
import { AlignVerticalSpaceAround, ArrowDown, ArrowUp, BookOpen } from "lucide-react";
import { cn } from '@/lib/utils';

interface OrderBookCardProps {
  stock: Stock | null; // Changed from selectedTickerSymbol to full stock object
  className?: string;
}

interface OrderBookLevel {
  price: number;
  size: number;
}

const generateMockOrderBook = (basePrice: number, count: number = 10): { bids: OrderBookLevel[], asks: OrderBookLevel[] } => {
  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];
  const priceIncrement = basePrice > 100 ? 0.05 : 0.01;

  for (let i = 0; i < count; i++) {
    bids.push({
      price: parseFloat((basePrice - (i + 1) * priceIncrement - Math.random() * priceIncrement * 0.5).toFixed(2)),
      size: Math.floor(Math.random() * 500) + 50,
    });
    asks.push({
      price: parseFloat((basePrice + (i + 1) * priceIncrement + Math.random() * priceIncrement * 0.5).toFixed(2)),
      size: Math.floor(Math.random() * 500) + 50,
    });
  }
  bids.sort((a, b) => b.price - a.price);
  asks.sort((a, b) => a.price - b.price);
  return { bids, asks };
};

export function OrderBookCard({ stock, className }: OrderBookCardProps) {
  const [orderBookData, setOrderBookData] = useState<{ bids: OrderBookLevel[], asks: OrderBookLevel[] } | null>(null);

  useEffect(() => {
    if (stock && stock.price > 0) {
      const mockData = generateMockOrderBook(stock.price);
      setOrderBookData(mockData);
    } else {
      setOrderBookData(null);
    }
  }, [stock]);

  const bestBid = orderBookData?.bids[0]?.price;
  const bestAsk = orderBookData?.asks[0]?.price;
  const spread = bestBid && bestAsk && bestAsk > bestBid ? parseFloat((bestAsk - bestBid).toFixed(2)) : undefined;

  return (
    <Card className={cn("shadow-none flex flex-col", className)}>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base font-headline flex items-center text-foreground">
          <BookOpen className="mr-2 h-4 w-4 text-primary" />
          Order Book (L2) {stock?.symbol ? `- ${stock.symbol}` : ''}
        </CardTitle>
        {stock && stock.price > 0 && bestBid && bestAsk && spread !== undefined ? (
            <CardDescription className="text-xs">
                Bid: <span className="text-[hsl(var(--confirm-green))] font-medium">${bestBid.toFixed(2)}</span> |
                Ask: <span className="text-destructive font-medium">${bestAsk.toFixed(2)}</span> |
                Spread: <span className="text-primary font-medium">${spread.toFixed(2)}</span>
            </CardDescription>
        ) : stock && stock.price <= 0 ? (
            <CardDescription className="text-xs text-muted-foreground">Order book unavailable (invalid price).</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        {!stock || stock.price <= 0 || !orderBookData ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground p-4 text-center">
            {stock && stock.price <=0 ? `Order book unavailable for ${stock.symbol}.` : "Select a stock to view its order book."}
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="grid grid-cols-2 gap-px text-xs">
              <div>
                <div className="grid grid-cols-[1fr_auto] p-2 border-b border-border/[.1] sticky top-0 bg-card/[.05] backdrop-blur-sm z-10">
                  <span className="font-semibold text-[hsl(var(--confirm-green))] flex items-center"><ArrowDown className="mr-1 h-3 w-3"/>Bids</span>
                  <span className="font-semibold text-right text-muted-foreground">Size</span>
                </div>
                {orderBookData.bids.map((bid, index) => (
                  <div
                    key={`bid-${index}`}
                    className={cn(
                      "grid grid-cols-[1fr_auto] p-1.5 items-center border-t border-border/[.05]",
                      index === 0 ? "bg-[hsl(var(--confirm-green))]/10" : "hover:bg-[hsl(var(--confirm-green))]/5"
                    )}
                  >
                    <span className="text-[hsl(var(--confirm-green))] font-mono font-semibold">
                      ${bid.price.toFixed(2)}
                    </span>
                    <span className="text-right font-mono text-muted-foreground">
                      {bid.size}
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <div className="grid grid-cols-[1fr_auto] p-2 border-b border-border/[.1] sticky top-0 bg-card/[.05] backdrop-blur-sm z-10">
                  <span className="font-semibold text-destructive flex items-center"><ArrowUp className="mr-1 h-3 w-3"/>Asks</span>
                  <span className="font-semibold text-right text-muted-foreground">Size</span>
                </div>
                {orderBookData.asks.map((ask, index) => (
                  <div
                    key={`ask-${index}`}
                    className={cn(
                      "grid grid-cols-[1fr_auto] p-1.5 items-center border-t border-border/[.05]",
                      index === 0 ? "bg-destructive/10" : "hover:bg-destructive/5"
                    )}
                  >
                    <span className="text-destructive font-mono font-semibold">
                      ${ask.price.toFixed(2)}
                    </span>
                    <span className="text-right font-mono text-muted-foreground">
                      {ask.size}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
