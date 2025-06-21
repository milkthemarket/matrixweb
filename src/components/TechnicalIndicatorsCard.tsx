
"use client";

import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Stock } from '@/types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SlidersHorizontal } from 'lucide-react';

interface TechnicalIndicatorsCardProps {
  stock: Stock | null;
  className?: string;
}

const DetailItem: React.FC<{ label: string; value?: string | number | null; valueClass?: string; description?: string }> = ({ label, value, valueClass, description }) => (
    <TooltipProvider delayDuration={200}>
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex justify-between items-baseline py-1">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 whitespace-nowrap pr-2">
                        {label}
                    </span>
                    <span className={cn("text-[11px] font-bold text-neutral-50 text-right", valueClass)}>
                        {value !== undefined && value !== null ? `${value}` : <span className="text-neutral-500">-</span>}
                    </span>
                </div>
            </TooltipTrigger>
            {description && (
                <TooltipContent side="left">
                    <p>{description}</p>
                </TooltipContent>
            )}
        </Tooltip>
    </TooltipProvider>
);

// Static data for AAPL as per prompt
const technicalData = {
  rsi: 62.1,
  trend: 'Neutral',
  ma50: 169.02,
  ma200: 165.33,
  macd: 'Bullish Crossover',
  signalLine: 1.23,
  support: 168.00,
  resistance: 172.50
};


export function TechnicalIndicatorsCard({ stock, className }: TechnicalIndicatorsCardProps) {
    const macdColor = technicalData.macd.includes('Bullish') ? 'text-green-500' : technicalData.macd.includes('Bearish') ? 'text-red-500' : 'text-neutral-50';

    return (
        <Card className={cn("flex flex-col", className)}>
            <CardHeader className="py-2.5 px-3.5">
                <h3 className="text-base font-bold text-neutral-50 flex items-center">
                   <SlidersHorizontal className="h-4 w-4 mr-2" /> Technical Indicators
                </h3>
            </CardHeader>
            <CardContent className="p-3 pt-1 flex-1 overflow-y-auto">
                {!stock ? (
                     <div className="flex items-center justify-center h-full">
                        <p className="text-xs text-muted-foreground text-center">Select a stock to view technicals.</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <div className="grid grid-cols-2 gap-x-4">
                            <DetailItem label="RSI" value={technicalData.rsi.toFixed(1)} description="Relative Strength Index (14)" />
                            <DetailItem label="Trend" value={technicalData.trend} description="Overall Trend" />
                        </div>
                        <Separator className="bg-white/10" />
                        <div className="grid grid-cols-2 gap-x-4">
                            <DetailItem label="50-Day MA" value={`$${technicalData.ma50.toFixed(2)}`} description="50-Day Moving Average" />
                            <DetailItem label="200-Day MA" value={`$${technicalData.ma200.toFixed(2)}`} description="200-Day Moving Average" />
                        </div>
                        <Separator className="bg-white/10" />
                        <div className="grid grid-cols-2 gap-x-4">
                            <DetailItem label="MACD" value={technicalData.macd} valueClass={macdColor} description="Moving Average Convergence Divergence" />
                            <DetailItem label="Signal Line" value={technicalData.signalLine.toFixed(2)} description="MACD Signal Line" />
                        </div>
                         <Separator className="bg-white/10" />
                        <div className="grid grid-cols-2 gap-x-4">
                            <DetailItem label="Support" value={`$${technicalData.support.toFixed(2)}`} description="Key Support Level" />
                            <DetailItem label="Resistance" value={`$${technicalData.resistance.toFixed(2)}`} description="Key Resistance Level" />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
