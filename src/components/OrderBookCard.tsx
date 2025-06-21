
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Stock } from '@/types';
import { cn } from '@/lib/utils';

interface OrderBookCardProps {
  stock: Stock | null;
  className?: string;
}

interface OrderBookLevel {
  price: number;
  size: number;
}

const generateMockOrderBook = (basePrice: number, count: number = 20): { bids: OrderBookLevel[], asks: OrderBookLevel[] } => {
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
      // Generate more rows to ensure scrollability in a tall card
      const mockData = generateMockOrderBook(stock.price, 30);
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
      <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
        <div className="py-2 px-3.5 border-b border-t border-border/[.1]">
            {stock && stock.price > 0 && bestBid && bestAsk && spread !== undefined ? (
                <div className="text-[11px] text-center flex justify-around font-medium">
                    <span>Bid: <span className="text-green-500">${bestBid.toFixed(2)}</span></span>
                    <span>Ask: <span className="text-red-500">${bestAsk.toFixed(2)}</span></span>
                    <span>Spread: <span className="text-primary">${spread.toFixed(2)}</span></span>
                </div>
            ) : (
                <div className="text-xs text-muted-foreground text-center">Spread data unavailable.</div>
            )}
        </div>
        <div className="flex-1 overflow-hidden">
            {!stock || stock.price <= 0 || !orderBookData ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground p-2 text-center">
                {stock && stock.price <=0 ? `L2 unavailable for ${stock.symbol}.` : "Select a stock to view L2 data."}
            </div>
            ) : (
            <ScrollArea className="h-full">
                <div className="grid grid-cols-2 gap-px text-[11px]">
                <div>
                    <div className="grid grid-cols-2 p-1.5 border-b border-border/[.08] sticky top-0 bg-card/[.05] backdrop-blur-sm z-[1] text-[10px] uppercase tracking-wider text-neutral-400">
                    <span className="font-semibold">Bids</span>
                    <span className="font-semibold text-right">Size</span>
                    </div>
                    {orderBookData.bids.map((bid, index) => (
                    <div key={`bid-${index}`} className="grid grid-cols-2 p-1 items-center hover:bg-green-500/5">
                        <span className="font-bold text-green-500">${bid.price.toFixed(2)}</span>
                        <span className="text-right font-medium text-foreground">{bid.size}</span>
                    </div>
                    ))}
                </div>
                <div>
                    <div className="grid grid-cols-2 p-1.5 border-b border-border/[.08] sticky top-0 bg-card/[.05] backdrop-blur-sm z-[1] text-[10px] uppercase tracking-wider text-neutral-400">
                    <span className="font-semibold">Asks</span>
                    <span className="font-semibold text-right">Size</span>
                    </div>
                    {orderBookData.asks.map((ask, index) => (
                    <div key={`ask-${index}`} className="grid grid-cols-2 p-1 items-center hover:bg-red-500/5">
                        <span className="font-bold text-red-500">${ask.price.toFixed(2)}</span>
                        <span className="text-right font-medium text-foreground">{ask.size}</span>
                    </div>
                    ))}
                </div>
                </div>
            </ScrollArea>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
