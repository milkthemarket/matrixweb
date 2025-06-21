
"use client";

import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Stock } from '@/types';
import { cn } from '@/lib/utils';
import { DollarSign, Percent, TrendingUp, TrendingDown, Layers, CalendarDays, BarChart3, Maximize2, Wallet, Banknote } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface FundamentalsCardProps {
  stock: Stock | null;
  className?: string;
}

const DetailItem: React.FC<{ label: string; value?: string | number | null; unit?: string; valueClass?: string; description?: string; icon?: React.ReactNode }> = ({ label, value, unit, valueClass, description, icon }) => (
    <TooltipProvider delayDuration={200}>
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex justify-between items-center py-1.5">
                    <span className="text-xs uppercase tracking-wider text-neutral-400 flex items-center">
                        {icon && React.cloneElement(icon as React.ReactElement, { className: "h-3.5 w-3.5 mr-2 text-neutral-500"})}
                        {label}
                    </span>
                    <span className={cn("text-sm font-bold text-neutral-50", valueClass)}>
                        {value !== undefined && value !== null ? `${value}${unit || ''}` : <span className="text-neutral-500">-</span>}
                    </span>
                </div>
            </TooltipTrigger>
            {description && (
                <TooltipContent>
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
    const changeColor = netChange >= 0 ? 'text-[#22C55E]' : 'text-destructive';
    const afterHoursChangeColor = stock.afterHoursChange && stock.afterHoursChange >= 0 ? 'text-[#4ADE80]' : 'text-destructive';

    return (
        <Card className={cn("flex flex-col", className)}>
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
                    <div className="text-right text-xs text-neutral-400 flex justify-end items-center gap-1.5 mt-1">
                        <span>After-Hours: {formatNumber(stock.afterHoursPrice)}</span>
                        <span className={afterHoursChangeColor}>
                             ({stock.afterHoursChange && stock.afterHoursChange >= 0 ? '+' : ''}{formatNumber(stock.afterHoursChange)})
                        </span>
                    </div>
                )}
            </CardHeader>
            <CardContent className="p-3 pt-1 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-x-6">
                    <div className="space-y-0">
                        <DetailItem label="Open" value={formatNumber(stock.open)} description="Today's opening price" />
                        <DetailItem label="High / Low" value={`${formatNumber(stock.high)} / ${formatNumber(stock.low)}`} description="Today's highest and lowest price" />
                        <DetailItem label="52Wk H/L" value={`${formatNumber(stock.high52)} / ${formatNumber(stock.low52)}`} icon={<TrendingUp />} description="52-week high and low price" />
                        <Separator className="my-2 bg-white/10" />
                        <DetailItem label="Volume" value={formatCompact(stock.volume ? stock.volume * 1e6 : undefined)} icon={<BarChart3 />} description="Today's trading volume" />
                        <DetailItem label="Avg Vol (3M)" value={formatCompact(stock.avgVolume ? stock.avgVolume * 1e6 : undefined)} description="Average 3-month trading volume" />
                    </div>
                    <div className="space-y-0">
                        <DetailItem label="Market Cap" value={formatCompact(stock.marketCap)} icon={<Wallet />} description="Market Capitalization" />
                        <DetailItem label="Shares Out" value={formatCompact(stock.sharesOutstanding)} icon={<Layers />} description="Total shares outstanding" />
                        <DetailItem label="Float" value={formatCompact(stock.freeFloatShares)} description="Shares available for public trading" />
                        <Separator className="my-2 bg-white/10" />
                        <DetailItem label="Div / Yield" value={stock.dividendYield ? `${formatNumber(stock.dividendYield, 3)} / ${formatNumber(stock.dividendYield, 1)}%` : '-'} icon={<Banknote />} valueClass="text-[#FACC15]" description="Dividend per share and yield percentage" />
                        <DetailItem label="Ex-Div Date" value={stock.exDividendDate ? stock.exDividendDate : undefined} icon={<CalendarDays />} description="Ex-dividend date" />
                        <DetailItem label="Next Earnings" value={stock.earningsDate ? new Date(stock.earningsDate).toLocaleDateString() : undefined} icon={<CalendarDays />} valueClass="text-[#8B5CF6]" description="Next earnings report date" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
