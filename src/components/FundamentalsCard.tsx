
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Stock } from '@/types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from "@/components/ui/skeleton";


interface FundamentalsCardProps {
  stock: Stock | null;
  className?: string;
}

interface OrderBookLevel {
  price: number;
  size: number;
}

const generateMockOrderBook = (basePrice: number, count: number = 8): { bids: OrderBookLevel[], asks: OrderBookLevel[] } => {
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


const DetailItem: React.FC<{ label: string; value?: string | number | null; unit?: string; valueClass?: string; description?: string }> = ({ label, value, unit, valueClass, description }) => (
    <TooltipProvider delayDuration={200}>
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex justify-between items-baseline py-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 whitespace-nowrap pr-2">
                        {label}
                    </span>
                    <span className={cn("text-[11px] font-bold text-neutral-50 text-right", valueClass)}>
                        {value !== undefined && value !== null ? `${value}${unit || ''}` : <span className="text-neutral-500">-</span>}
                    </span>
                </div>
            </TooltipTrigger>
            {description && (
                <TooltipContent side="right">
                    <p>{description}</p>
                </TooltipContent>
            )}
        </Tooltip>
    </TooltipProvider>
);


const formatNumber = (value?: number, decimals = 2) => value?.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
const formatCompact = (value?: number) => {
    if (value === undefined || value === null) return '-';
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
};

export function FundamentalsCard({ stock, className }: FundamentalsCardProps) {
    const [orderBookData, setOrderBookData] = useState<{ bids: OrderBookLevel[], asks: OrderBookLevel[] } | null>(null);

    useEffect(() => {
        if (stock && stock.price > 0) {
            setOrderBookData(generateMockOrderBook(stock.price, 8));
        } else {
            setOrderBookData(null);
        }
    }, [stock]);

    const bestBid = orderBookData?.bids[0]?.price;
    const bestAsk = orderBookData?.asks[0]?.price;
    const spread = bestBid && bestAsk && bestAsk > bestBid ? parseFloat((bestAsk - bestBid).toFixed(2)) : undefined;

    if (!stock) {
        return (
            <Card className={cn("flex flex-col justify-center items-center", className)}>
                <CardContent className="p-4 text-center">
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                        <Separator className="bg-white/5" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    const netChange = stock.price && stock.prevClose ? stock.price - stock.prevClose : stock.price * (stock.changePercent / 100);
    const netChangePercent = stock.price && stock.prevClose ? (netChange / stock.prevClose) * 100 : stock.changePercent;
    const changeColor = netChange >= 0 ? 'text-green-500' : 'text-red-500';
    const afterHoursChangeColor = stock.afterHoursChange && stock.afterHoursChange >= 0 ? 'text-green-400' : 'text-red-500';

    return (
        <Card className={cn("flex flex-col", className)}>
            <CardHeader className="py-2.5 px-3.5">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-base font-bold text-neutral-50">{stock.symbol}</h3>
                        <p className="text-[11px] text-neutral-400 truncate max-w-[180px]">{stock.name}</p>
                    </div>
                    <div className="text-right">
                        <p className={cn("text-lg font-bold", changeColor)}>{formatNumber(stock.price)}</p>
                        <p className={cn("text-[11px] font-medium", changeColor)}>
                            {netChange >= 0 ? '+' : ''}{formatNumber(netChange)} ({netChange >= 0 ? '+' : ''}{formatNumber(netChangePercent)}%)
                        </p>
                    </div>
                </div>
                {stock.afterHoursPrice && (
                    <div className="text-right text-[10px] text-neutral-400 flex justify-end items-center gap-1.5 mt-1">
                        <span>After-Hours: {formatNumber(stock.afterHoursPrice)}</span>
                        <span className={afterHoursChangeColor}>
                             ({stock.afterHoursChange && stock.afterHoursChange >= 0 ? '+' : ''}{formatNumber(stock.afterHoursChange)})
                        </span>
                    </div>
                )}
            </CardHeader>
            <CardContent className="p-3 pt-1 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-x-4">
                    <div className="space-y-0">
                        <DetailItem label="Open" value={formatNumber(stock.open)} description="Today's opening price" />
                        <DetailItem label="High" value={formatNumber(stock.high)} description="Today's highest price" />
                        <DetailItem label="Low" value={formatNumber(stock.low)} description="Today's lowest price" />
                        <Separator className="my-1 bg-white/10" />
                        <DetailItem label="Volume" value={formatCompact(stock.volume ? stock.volume * 1e6 : undefined)} description="Today's trading volume" />
                        <DetailItem label="Avg Vol (3M)" value={formatCompact(stock.avgVolume ? stock.avgVolume * 1e6 : undefined)} description="Average 3-month trading volume" />
                        <Separator className="my-1 bg-white/10" />
                        <DetailItem label="Div / Yield" value={stock.dividendYield ? `${formatNumber(stock.dividendYield, 3)} / ${formatNumber(stock.dividendYield, 1)}%` : '-'} valueClass="text-[#FACC15]" description="Dividend per share and yield percentage" />
                        <DetailItem label="Ex-Div Date" value={stock.exDividendDate ? stock.exDividendDate : undefined} description="Ex-dividend date" />
                    </div>
                    <div className="space-y-0">
                        <DetailItem label="Market Cap" value={formatCompact(stock.marketCap)} description="Market Capitalization" />
                        <DetailItem label="52WK HIGH" value={formatNumber(stock.high52)} description="52-week high price" />
                        <DetailItem label="52WK LOW" value={formatNumber(stock.low52)} description="52-week low price" />
                        <Separator className="my-1 bg-white/10" />
                        <DetailItem label="Shares Out" value={formatCompact(stock.sharesOutstanding)} description="Total shares outstanding" />
                        <DetailItem label="Float" value={formatCompact(stock.freeFloatShares)} description="Shares available for public trading" />
                        <Separator className="my-1 bg-white/10" />
                        <DetailItem label="Next Earnings" value={stock.earningsDate ? new Date(stock.earningsDate).toLocaleDateString() : undefined} valueClass="text-[#8B5CF6]" description="Next earnings report date" />
                    </div>
                </div>

                {orderBookData && (
                    <>
                        <Separator className="my-1.5 bg-white/10" />
                        {bestBid && bestAsk && spread !== undefined && (
                            <div className="text-[10px] text-center text-muted-foreground mb-1">
                                Bid: <span className="text-green-500 font-medium">${bestBid.toFixed(2)}</span> |
                                Ask: <span className="text-red-500 font-medium">${bestAsk.toFixed(2)}</span> |
                                Spread: <span className="text-primary font-medium">${spread.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-x-4">
                            <div>
                                <div className="flex justify-between text-muted-foreground font-medium border-b border-white/10 pb-0.5 mb-0.5 text-[10px]">
                                    <span>Bids</span>
                                    <span>Size</span>
                                </div>
                                {orderBookData.bids.map((bid, index) => (
                                    <div key={`bid-${index}`} className="flex justify-between items-center hover:bg-green-500/10 rounded-sm px-0.5 text-[11px]">
                                        <span className="font-bold text-green-500">{bid.price.toFixed(2)}</span>
                                        <span className="font-bold text-foreground">{bid.size}</span>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className="flex justify-between text-muted-foreground font-medium border-b border-white/10 pb-0.5 mb-0.5 text-[10px]">
                                    <span>Asks</span>
                                    <span>Size</span>
                                </div>
                                {orderBookData.asks.map((ask, index) => (
                                    <div key={`ask-${index}`} className="flex justify-between items-center hover:bg-red-500/10 rounded-sm px-0.5 text-[11px]">
                                        <span className="font-bold text-red-500">{ask.price.toFixed(2)}</span>
                                        <span className="font-bold text-foreground">{ask.size}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
