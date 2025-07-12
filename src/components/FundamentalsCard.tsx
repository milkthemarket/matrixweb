
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

const DetailItem: React.FC<{ label: string; value?: string | number | null; unit?: string; valueClass?: string; description?: string }> = ({ label, value, unit, valueClass, description }) => (
    <TooltipProvider delayDuration={200}>
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex justify-between items-baseline py-0.5">
                    <span className="text-[11px] uppercase tracking-wider text-neutral-400 whitespace-nowrap pr-2">
                        {label}
                    </span>
                    <span className={cn("text-xs font-bold text-neutral-50 text-right", valueClass)}>
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

const getAnalystRatingColor = (rating?: Stock['analystRating']) => {
    switch (rating) {
        case 'Strong Buy': return 'text-green-400 font-bold';
        case 'Buy': return 'text-green-500';
        case 'Hold': return 'text-yellow-400';
        case 'Sell': return 'text-orange-400';
        case 'Strong Sell': return 'text-red-500 font-bold';
        default: return 'text-neutral-50';
    }
};

export function FundamentalsCard({ stock, className }: FundamentalsCardProps) {
    const technicalData = useMemo(() => {
        if (!stock) {
            return {
                rsi: undefined,
                trend: 'Neutral',
                ma50: undefined,
                ma200: undefined,
                macd: 'Neutral',
                signalLine: undefined,
                support: undefined,
                resistance: undefined,
            };
        }
        return {
            rsi: stock.rsi?.toFixed(1),
            trend: stock.changePercent > 2 ? 'Uptrend' : stock.changePercent < -2 ? 'Downtrend' : 'Neutral',
            ma50: (stock.price * 0.98).toFixed(2), // Mock value
            ma200: (stock.price * 0.95).toFixed(2), // Mock value
            macd: stock.changePercent > 1 ? 'Bullish Crossover' : stock.changePercent < -1 ? 'Bearish Crossover' : 'Neutral',
            signalLine: (stock.price * 0.0015).toFixed(2), // Mock value
            support: (stock.low52 || stock.price * 0.9).toFixed(2), // Mock value
            resistance: (stock.high52 || stock.price * 1.1).toFixed(2), // Mock value
        };
    }, [stock]);

    const macdColor = technicalData.macd.includes('Bullish') ? 'text-green-500' : technicalData.macd.includes('Bearish') ? 'text-red-500' : 'text-neutral-50';
    const trendColor = technicalData.trend.includes('Up') ? 'text-green-500' : technicalData.trend.includes('Down') ? 'text-red-500' : 'text-neutral-50';

    if (!stock) {
        return (
            <Card className={cn("flex flex-col justify-center items-center border border-white/5", className)}>
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
        <Card className={cn("flex flex-col border border-white/5", className)}>
            <CardHeader className="py-2.5 px-3.5">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-neutral-50">{stock.symbol}</h3>
                        <p className="text-xs text-neutral-400 truncate max-w-[180px]">{stock.name}</p>
                    </div>
                    <div className="text-right">
                        <p className={cn("text-xl font-bold", changeColor)}>{formatNumber(stock.price)}</p>
                        <p className={cn("text-xs font-medium", changeColor)}>
                            {netChange >= 0 ? '+' : ''}{formatNumber(netChange)} ({netChange >= 0 ? '+' : ''}{formatNumber(netChangePercent)}%)
                        </p>
                    </div>
                </div>
                {stock.afterHoursPrice && (
                    <div className="text-right text-[11px] text-neutral-400 flex justify-end items-center gap-1.5 mt-1">
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
                    </div>
                    <div className="space-y-0">
                        <DetailItem label="Market Cap" value={formatCompact(stock.marketCap)} description="Market Capitalization" />
                        <DetailItem label="52WK HIGH" value={formatNumber(stock.high52)} description="52-week high price" />
                        <DetailItem label="52WK LOW" value={formatNumber(stock.low52)} description="52-week low price" />
                        <Separator className="my-1 bg-white/10" />
                        <DetailItem label="Shares Out" value={formatCompact(stock.sharesOutstanding)} description="Total shares outstanding" />
                        <DetailItem label="Float" value={formatCompact(stock.freeFloatShares)} description="Shares available for public trading" />
                        <Separator className="my-1 bg-white/10" />
                        <DetailItem label="Ex-Div Date" value={stock.exDividendDate ? stock.exDividendDate : undefined} description="Ex-dividend date" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 mt-1">
                    <div className="space-y-0">
                         <DetailItem label="Next Earnings" value={stock.earningsDate ? new Date(stock.earningsDate).toLocaleDateString() : undefined} valueClass="text-[#8B5CF6]" description="Next earnings report date" />
                    </div>
                     <div className="space-y-0">
                        <DetailItem
                            label="Analyst Rating"
                            value={stock.analystRating}
                            valueClass={getAnalystRatingColor(stock.analystRating)}
                            description="Consensus analyst rating"
                        />
                    </div>
                </div>

                <Separator className="my-2 bg-white/10" />
                
                <h4 className="text-sm font-semibold text-neutral-300 mb-1.5">Technical Indicators</h4>
                <div className="grid grid-cols-2 gap-x-4">
                    <div className="space-y-0">
                        <DetailItem label="RSI" value={technicalData.rsi} description="Relative Strength Index (14)" />
                        <DetailItem label="50-Day MA" value={`$${technicalData.ma50}`} description="50-Day Moving Average" />
                        <DetailItem label="MACD" value={technicalData.macd} valueClass={macdColor} description="Moving Average Convergence Divergence" />
                        <DetailItem label="Support" value={`$${technicalData.support}`} description="Key Support Level" />
                    </div>
                    <div className="space-y-0">
                        <DetailItem label="Trend" value={technicalData.trend} valueClass={trendColor} description="Overall Trend" />
                        <DetailItem label="200-Day MA" value={`$${technicalData.ma200}`} description="200-Day Moving Average" />
                        <DetailItem label="Signal Line" value={technicalData.signalLine} description="MACD Signal Line" />
                        <DetailItem label="Resistance" value={`$${technicalData.resistance}`} description="Key Resistance Level" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
