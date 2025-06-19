
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import type { Stock } from '@/types';
import { DollarSign, TrendingUp, TrendingDown, BarChart3, Layers, Maximize2, Minimize2, MoveVertical, Percent as PercentIcon, CalendarDays, Newspaper, Flame, Clock, Zap, AlertTriangle } from "lucide-react";
import { cn } from '@/lib/utils';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';

interface DayTradingFundamentalsCardProps {
  stock: Stock | null;
  className?: string;
}

const MetricItem: React.FC<{ label: string; value?: string | number; icon?: React.ReactNode; valueClass?: string; unit?: string; description?: string }> = ({ label, value, icon, valueClass, unit, description }) => (
  <div className="flex flex-col items-start" title={description || label}>
    <div className="text-[0.6rem] font-medium text-muted-foreground/80 flex items-center mb-0.5 whitespace-nowrap">
      {icon && React.cloneElement(icon as React.ReactElement, { className: "h-3 w-3 mr-1" })}
      {label}
    </div>
    <div className={cn("text-xs font-semibold text-foreground truncate", valueClass)}>
      {value !== undefined && value !== null && value !== '' ? `${value}${unit || ''}` : <span className="text-xs text-muted-foreground/60">-</span>}
    </div>
  </div>
);

export function DayTradingFundamentalsCard({ stock, className }: DayTradingFundamentalsCardProps) {
  const [clientFormattedEarningsDate, setClientFormattedEarningsDate] = useState<string | undefined>(undefined);
  const [isEarningsDateSoon, setIsEarningsDateSoon] = useState(false);

  useEffect(() => {
    if (stock?.earningsDate) {
      try {
        const parsedDate = parseISO(stock.earningsDate);
        setClientFormattedEarningsDate(format(parsedDate, 'MMM dd'));
        setIsEarningsDateSoon(isToday(parsedDate) || isTomorrow(parsedDate));
      } catch (error) {
        console.error("Error formatting earnings date:", error);
        setClientFormattedEarningsDate("Invalid");
        setIsEarningsDateSoon(false);
      }
    } else {
      setClientFormattedEarningsDate(undefined);
      setIsEarningsDateSoon(false);
    }
  }, [stock?.earningsDate]);

  const formatFloat = (value?: number) => (value !== undefined ? `${value}M` : undefined);
  const formatPercent = (value?: number) => (value !== undefined ? `${value.toFixed(1)}` : undefined);
  const formatDollar = (value?: number,_dp=2) => (value !== undefined ? `$${value.toFixed(_dp)}` : undefined);

  const rvol = stock?.volume && stock?.avgVolume && stock.avgVolume > 0 ? (stock.volume / stock.avgVolume).toFixed(2) : undefined;

  const priceChangeDollar = stock ? (stock.price * (stock.changePercent / 100)) : 0;
  const priceChangeColor = stock && stock.changePercent >= 0 ? 'text-[hsl(var(--confirm-green))]' : 'text-destructive';

  if (!stock) {
    return (
      <Card className={cn("shadow-none flex flex-col justify-center", className)}> {/* Added flex flex-col justify-center */}
        <CardContent className="p-3 text-center"> {/* Ensure content is centered */}
          <p className="text-xs text-muted-foreground">Select a stock to view day trading fundamentals.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-none flex flex-col", className)}> {/* Added flex flex-col */}
      <CardContent className="p-2 flex-1 overflow-y-auto"> {/* Added flex-1 and overflow-y-auto to content */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-9 gap-x-2 gap-y-1.5 items-start">
          <MetricItem
            label="Price"
            icon={<DollarSign />}
            value={formatDollar(stock.price)}
            valueClass={priceChangeColor}
            description={`${stock.symbol} Current Price`}
          />
          <MetricItem
            label="Change"
            icon={stock.changePercent >= 0 ? <TrendingUp /> : <TrendingDown />}
            value={`${stock.changePercent >= 0 ? '+' : ''}${priceChangeDollar.toFixed(2)} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)`}
            valueClass={priceChangeColor}
            description="Today's Price Change"
          />
          <MetricItem
            label="Volume"
            icon={<BarChart3 />}
            value={stock.volume ? `${stock.volume.toFixed(1)}M` : undefined}
            description="Today's Volume"
          />
          <MetricItem
            label="RVOL"
            value={rvol}
            description="Relative Volume (Current/Average)"
          />
           <MetricItem
            label="Float"
            icon={<Layers />}
            value={formatFloat(stock.float)}
            description="Float (shares in millions)"
          />
          <MetricItem
            label="52W H/L"
            icon={<Maximize2 />}
            value={stock.high52 && stock.low52 ? `${formatDollar(stock.low52)} - ${formatDollar(stock.high52)}` : undefined}
            description="52-Week High and Low"
          />
          <MetricItem
            label="ATR"
            icon={<MoveVertical />}
            value={formatDollar(stock.atr)}
            description="Average True Range (14-day)"
          />
          <MetricItem
            label="Short Int."
            icon={<PercentIcon />}
            value={formatPercent(stock.shortFloat)}
            unit="%"
            description="Short Interest as % of Float"
          />
          <MetricItem
            label="Earnings"
            icon={<CalendarDays />}
            value={clientFormattedEarningsDate}
            valueClass={isEarningsDateSoon ? "text-yellow-400 font-bold" : ""}
            description="Next Earnings Date"
          />
           <MetricItem
            label="VWAP"
            icon={<Zap />}
            value={formatDollar(stock.vwap)}
            description="Volume Weighted Average Price"
          />
           <MetricItem
            label="Premarket"
            icon={<Clock />}
            value={stock.premarketChange ? `${stock.premarketChange >= 0 ? '+' : ''}${stock.premarketChange.toFixed(2)}%` : undefined}
            valueClass={stock.premarketChange && stock.premarketChange >=0 ? 'text-[hsl(var(--confirm-green))]' : stock.premarketChange && stock.premarketChange < 0 ? 'text-destructive': ''}
            description="Premarket Change"
          />
          <div className="lg:col-span-2 xl:col-span-3">
            <MetricItem
                label="Headline"
                icon={stock.catalystType === 'fire' ? <Flame className="text-destructive"/> : stock.catalystType === 'news' ? <Newspaper className="text-primary"/> : <AlertTriangle className="text-muted-foreground"/>}
                value={stock.newsSnippet || (stock.catalystType ? `${stock.catalystType.charAt(0).toUpperCase() + stock.catalystType.slice(1)} Catalyst` : "No News")}
                description="Latest Headline or Catalyst"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
