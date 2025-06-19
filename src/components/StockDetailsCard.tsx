
"use client";

import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Stock } from '@/types';
import { Info, TrendingUp, TrendingDown, CalendarDays, Briefcase, Percent, DollarSign, Maximize2, Minimize2, BarChartHorizontal } from "lucide-react";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface StockDetailsCardProps {
  stock: Stock | null;
  className?: string;
}

const DetailItem: React.FC<{ label: string; value?: string | number; icon?: React.ReactNode; valueClass?: string; unit?: string }> = ({ label, value, icon, valueClass, unit }) => (
  <div>
    <div className="text-xs text-muted-foreground flex items-center mb-0.5">
      {icon && React.cloneElement(icon as React.ReactElement, { className: "h-3.5 w-3.5 mr-1.5" })}
      {label}
    </div>
    <div className={cn("text-sm font-medium text-foreground truncate", valueClass)}>
      {value !== undefined && value !== null ? `${value}${unit || ''}` : <span className="text-muted-foreground/70">N/A</span>}
    </div>
  </div>
);

export function StockDetailsCard({ stock, className }: StockDetailsCardProps) {
  const [clientFormattedEarningsDate, setClientFormattedEarningsDate] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (stock?.earningsDate) {
      try {
        // Perform date formatting only on the client side
        setClientFormattedEarningsDate(format(new Date(stock.earningsDate), 'MMM dd, yyyy'));
      } catch (error) {
        console.error("Error formatting earnings date:", error);
        setClientFormattedEarningsDate("Invalid Date");
      }
    } else {
      setClientFormattedEarningsDate(undefined);
    }
  }, [stock?.earningsDate]);

  const formatMarketCap = (value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    return value.toLocaleString();
  };

  const priceChangeColor = stock && stock.changePercent >= 0 ? 'text-[hsl(var(--confirm-green))]' : 'text-destructive';

  return (
    <Card className={cn("shadow-none", className)}>
      <CardHeader className="py-3 px-4">
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-base font-headline text-foreground">
                {stock ? `${stock.symbol} - ${stock.name || 'Details'}` : "Stock Details"}
                </CardTitle>
                {stock && <CardDescription className={cn("text-xs", priceChangeColor)}>{stock.sector || 'No sector data'}</CardDescription>}
            </div>
            {stock && (
                <div className="text-right">
                    <p className={cn("text-lg font-semibold", priceChangeColor)}>${stock.price.toFixed(2)}</p>
                    <p className={cn("text-xs font-medium", priceChangeColor)}>
                        {stock.changePercent >= 0 ? '+' : ''}{(stock.price * (stock.changePercent / 100)).toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                    </p>
                </div>
            )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-1">
        {!stock ? (
          <div className="h-[128px] flex items-center justify-center text-sm text-muted-foreground text-center">
            Select a stock from the watchlist to view its detailed information.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
            <DetailItem label="Market Cap" value={formatMarketCap(stock.marketCap)} icon={<Briefcase />} />
            <DetailItem label="P/E Ratio" value={stock.peRatio?.toFixed(1)} icon={<BarChartHorizontal />} />
            <DetailItem label="Div Yield" value={stock.dividendYield?.toFixed(2)} icon={<Percent />} unit="%" />
            <DetailItem label="52W High" value={stock.high52?.toFixed(2)} icon={<Maximize2 />} unit="$" />
            <DetailItem label="52W Low" value={stock.low52?.toFixed(2)} icon={<Minimize2 />} unit="$" />
            <DetailItem
              label="Earnings"
              value={clientFormattedEarningsDate} // Use the state variable here
              icon={<CalendarDays />}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
