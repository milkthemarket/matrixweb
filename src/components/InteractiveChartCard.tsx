
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Stock } from '@/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart as RechartsAreaChart, Area } from 'recharts';
import { AreaChart as AreaIcon, CandlestickChart, Minus, Plus, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractiveChartCardProps {
  stock: Stock | null;
  className?: string;
}

const generateMockPriceData = (basePrice: number, numPoints = 50) => {
  const data = [];
  let currentPrice = basePrice;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - numPoints + 1);

  for (let i = 0; i < numPoints; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: parseFloat(currentPrice.toFixed(2))
    });
    currentPrice += (Math.random() - 0.48) * (basePrice * 0.015);
    currentPrice = Math.max(0.01, currentPrice);
  }
  return data;
};

export function InteractiveChartCard({ stock, className }: InteractiveChartCardProps) {
  const [chartType, setChartType] = useState<'line' | 'area' | 'candle'>('line');
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M' | '6M' | '1Y' | 'MAX'>('1M');

  const chartData = React.useMemo(() => {
    const basePrice = stock?.price || 50 + Math.random() * 200;
    let numPoints = 30; // Default for 1M
    if (timeframe === '1D') numPoints = 10; 
    if (timeframe === '5D') numPoints = 20;
    if (timeframe === '6M') numPoints = 180;
    if (timeframe === '1Y') numPoints = 252; 
    if (timeframe === 'MAX') numPoints = 500;

    if (stock?.historicalPrices && stock.historicalPrices.length >= numPoints) {
      return stock.historicalPrices.slice(-numPoints).map((price, index, arr) => ({
        date: `P${arr.length - numPoints + index + 1}`,
        price
      }));
    }
    return generateMockPriceData(basePrice, numPoints);
  }, [stock, timeframe]);

  const dynamicStrokeColor = stock && stock.changePercent >= 0 ? "hsl(var(--chart-2))" : "hsl(var(--chart-5))";
  // const dynamicFillColor = stock && stock.changePercent >= 0 ? "hsla(var(--chart-2), 0.2)" : "hsla(var(--chart-5), 0.2)"; // Not directly used anymore for area chart

  const neonPurpleColor = "hsl(var(--primary))";


  return (
    <Card className={cn("shadow-none flex flex-col", className)}>
      <CardHeader className="pb-3 pt-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-headline text-foreground">
              {stock ? `${stock.symbol} Chart` : "Trading Chart"}
            </CardTitle>
            <CardDescription>
              {stock ? `${stock.name || stock.symbol} - Current Price: $${stock.price.toFixed(2)}` : "Select a stock to view chart"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary"><Plus /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary"><Minus /></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-2 pr-4 min-h-[300px]">
        {stock ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' && (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.1)" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={{ stroke: "hsla(var(--border), 0.2)" }} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={{ stroke: "hsla(var(--border), 0.2)" }} domain={['auto', 'auto']} />
                <Tooltip
                  cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: 'hsla(var(--popover), 0.9)',
                    borderColor: 'hsla(var(--border), 0.2)',
                    borderRadius: 'var(--radius)',
                    backdropFilter: 'blur(4px)',
                    boxShadow: '0 4px 12px hsla(var(--background), 0.1)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: '500', marginBottom: '4px' }}
                  itemStyle={{ color: dynamicStrokeColor }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                />
                <Line type="monotone" dataKey="price" stroke={dynamicStrokeColor} strokeWidth={2} dot={false} />
              </LineChart>
            )}
            {chartType === 'area' && (
                 <RechartsAreaChart data={chartData}>
                    <defs>
                        <linearGradient id={`colorPriceAreaPurple-${stock.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={neonPurpleColor} stopOpacity={0.65}/>
                          <stop offset="95%" stopColor={neonPurpleColor} stopOpacity={0.05}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.1)" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={{ stroke: "hsla(var(--border), 0.2)" }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={{ stroke: "hsla(var(--border), 0.2)" }} domain={['auto', 'auto']} />
                    <Tooltip
                        cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
                        contentStyle={{
                            backgroundColor: 'hsla(var(--popover), 0.9)',
                            borderColor: 'hsla(var(--border), 0.2)',
                            borderRadius: 'var(--radius)',
                            backdropFilter: 'blur(4px)',
                            boxShadow: '0 4px 12px hsla(var(--background), 0.1)',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: '500', marginBottom: '4px' }}
                        itemStyle={{ color: neonPurpleColor }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                    />
                    <Area type="monotone" dataKey="price" stroke={neonPurpleColor} strokeWidth={2} fillOpacity={1} fill={`url(#colorPriceAreaPurple-${stock.id})`} dot={false}/>
                </RechartsAreaChart>
            )}
            {chartType === 'candle' && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Candlestick chart type coming soon for {stock.symbol}.
              </div>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Activity className="h-12 w-12 mb-4 opacity-30" />
            <p>Select a stock from the watchlist or trade panel to display its chart.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap justify-center items-center gap-1 pt-3">
        {['1D', '5D', '1M', '6M', '1Y', 'MAX'].map((tf) => (
          <Button key={tf} variant={timeframe === tf ? "default" : "outline"} size="sm" onClick={() => setTimeframe(tf as any)} className="h-7 text-xs px-2.5">
            {tf}
          </Button>
        ))}
        <div className="w-full sm:w-auto border-l border-border/[.1] h-6 sm:h-auto sm:mx-2 my-1 sm:my-0 hidden sm:block"></div>
        {[
          { type: 'line', label: 'Line', Icon: AreaIcon }, // Using AreaIcon for Line as well for visual consistency
          { type: 'area', label: 'Area', Icon: AreaIcon },
          { type: 'candle', label: 'Candle', Icon: CandlestickChart },
        ].map(({ type, label, Icon }) => (
          <Button key={type} variant={chartType === type ? "default" : "outline"} size="sm" onClick={() => setChartType(type as any)} className="h-7 text-xs px-2.5">
            <Icon className="h-3.5 w-3.5 mr-1" /> {label}
          </Button>
        ))}
      </CardFooter>
    </Card>
  );
}
