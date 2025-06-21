
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Stock } from '@/types';
import { cn } from '@/lib/utils';
import { DollarSign, Percent, TrendingUp, TrendingDown, BookOpen, Clock } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface FundamentalsCardProps {
  stock: Stock | null;
  className?: string;
}

const DetailItem: React.FC<{ label: string; value?: string | number | null; unit?: string; valueClass?: string; description?: string }> = ({ label, value, unit, valueClass, description }) => (
    <div className="flex justify-between items-baseline py-1 border-b border-white/5 last:border-b-0">
        <span className="text-xs text-muted-foreground" title={description}>{label}</span>
        <span className={cn("text-xs font-mono font-medium text-foreground", valueClass)}>
            {value !== undefined && value !== null ? `${value}${unit || ''}` : <span className="text-muted-foreground/60">-</span>}
        </span>
    </div>
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

    if (!stock) {
        return (
            <Card className={cn("flex flex-col justify-center items-center", className)}>
                <CardContent className="p-4 text-center">
                    <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">Select a stock to view fundamentals.</p>
                </CardContent>
            </Card>
        );
    }
    
    const netChange = stock.price && stock.prevClose ? stock.price - stock.prevClose : stock.price * (stock.changePercent / 100);
    const netChangePercent = stock.price && stock.prevClose ? (netChange / stock.prevClose) * 100 : stock.changePercent;
    const changeColor = netChange >= 0 ? 'text-[hsl(var(--confirm-green))]' : 'text-destructive';

    return (
        <Card className={cn("flex flex-col", className)}>
            <CardHeader className="py-2 px-3">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-sm font-headline text-foreground">{stock.symbol} Fundamentals</CardTitle>
                    </div>
                    <div className="text-right">
                        <p className={cn("text-lg font-semibold", changeColor)}>{formatNumber(stock.price)}</p>
                        <p className={cn("text-xs font-medium", changeColor)}>
                            {netChange >= 0 ? '+' : ''}{formatNumber(netChange)} ({netChange >= 0 ? '+' : ''}{formatNumber(netChangePercent)}%)
                        </p>
                    </div>
                </div>
                {stock.afterHoursPrice && (
                    <div className="text-right text-xs text-muted-foreground flex justify-end items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>After-Hours: {formatNumber(stock.afterHoursPrice)}</span>
                        <span className={cn(stock.afterHoursChange && stock.afterHoursChange >= 0 ? 'text-[hsl(var(--confirm-green))]' : 'text-destructive')}>
                             ({stock.afterHoursChange && stock.afterHoursChange >= 0 ? '+' : ''}{formatNumber(stock.afterHoursChange)})
                        </span>
                    </div>
                )}
            </CardHeader>
            <CardContent className="p-3 pt-1 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-x-4">
                    <div className="space-y-0">
                        <DetailItem label="Open" value={formatNumber(stock.open)} />
                        <DetailItem label="High / Low" value={`${formatNumber(stock.high)} / ${formatNumber(stock.low)}`} />
                        <DetailItem label="Volume" value={formatCompact(stock.volume ? stock.volume * 1e6 : undefined)} />
                        <DetailItem label="Avg Vol (3M)" value={formatCompact(stock.avgVolume ? stock.avgVolume * 1e6 : undefined)} />
                        <DetailItem label="Market Cap" value={formatCompact(stock.marketCap)} />
                        <DetailItem label="52Wk High / Low" value={`${formatNumber(stock.high52)} / ${formatNumber(stock.low52)}`} />
                    </div>
                    <div className="space-y-0">
                        <DetailItem label="Shares Out" value={formatCompact(stock.sharesOutstanding)} />
                        <DetailItem label="Float" value={formatCompact(stock.freeFloatShares)} />
                        <DetailItem label="Div / Yield" value={stock.dividendYield ? `${formatNumber(stock.dividendYield, 3)} / ${formatNumber(stock.dividendYield, 1)}%` : '-'} />
                        <DetailItem label="Ex-Div Date" value={stock.exDividendDate ? stock.exDividendDate : undefined} />
                        <DetailItem label="Next Earnings" value={stock.earningsDate ? new Date(stock.earningsDate).toLocaleDateString() : undefined} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
