
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // For manual ticker input
import type { Stock } from '@/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart as RechartsAreaChart, Area, BarChart, Bar, Cell } from 'recharts';
import { AreaChart as AreaIcon, CandlestickChart, Minus, Plus, Activity, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractiveChartCardProps {
  stock: Stock | null; // Changed from selectedTickerSymbol to full stock object
  onManualTickerSubmit: (symbol: string) => void;
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

export function InteractiveChartCard({ stock, onManualTickerSubmit, className }: InteractiveChartCardProps) {
  const [chartType, setChartType] = useState<'line' | 'area' | 'candle'>('line');
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M' | '6M' | '1Y' | 'MAX'>('1M');
  const [manualTickerInput, setManualTickerInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // If a stock is passed (likely from synced state), update the input field
    // but don't clear it if the user is typing.
    if (stock && document.activeElement !== inputRef.current) {
      setManualTickerInput(stock.symbol);
    }
  }, [stock]);

  const chartData = React.useMemo(() => {
    const basePrice = stock?.price || 0; // Use 0 if no stock.price, or handle more gracefully
    let numPoints = 30;
    if (timeframe === '1D') numPoints = 10;
    if (timeframe === '5D') numPoints = 20;
    if (timeframe === '6M') numPoints = 180;
    if (timeframe === '1Y') numPoints = 252;
    if (timeframe === 'MAX') numPoints = 500;

    // Use historicalPrices if available and sufficient, otherwise generate mock data
    if (stock?.historicalPrices && stock.historicalPrices.length >= numPoints && stock.price > 0) {
      return stock.historicalPrices.slice(-numPoints).map((price, index, arr) => ({
        date: `P${arr.length - numPoints + index + 1}`,
        price
      }));
    }
    if (basePrice > 0) { // Only generate mock if we have a base price
        return generateMockPriceData(basePrice, numPoints);
    }
    return []; // Return empty if no data can be shown
  }, [stock, timeframe]);

  const dynamicStrokeColor = stock && stock.changePercent >= 0 ? "hsl(var(--chart-2))" : "hsl(var(--chart-5))";
  const neonPurpleColor = "hsl(var(--primary))";

  const handleManualSubmit = () => {
    if (manualTickerInput.trim()) {
      onManualTickerSubmit(manualTickerInput.trim().toUpperCase());
    }
  };

  return (
    <Card className={cn("shadow-none flex flex-col", className)}>
      <CardHeader className="pb-3 pt-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex-1">
            <CardTitle className="text-xl font-headline text-foreground">
              {stock?.symbol ? `${stock.symbol} Chart` : "Trading Chart"}
            </CardTitle>
            <CardDescription className="text-xs">
              {stock?.name ? `${stock.name} - Current: $${stock.price > 0 ? stock.price.toFixed(2) : 'N/A'}` : "Enter a ticker or select from Watchlist/News."}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 w-full sm:w-auto">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Symbol (e.g. AAPL)"
              value={manualTickerInput}
              onChange={(e) => setManualTickerInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
              className="h-8 text-xs flex-1 sm:flex-initial sm:w-32 bg-transparent"
            />
            <Button variant="ghost" size="icon" onClick={handleManualSubmit} className="h-8 w-8 text-primary hover:bg-primary/10">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-2 pr-4 min-h-[300px]">
        {chartData.length > 0 ? (
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
                        <linearGradient id={`colorPriceAreaPurple-${stock?.id || 'default'}`} x1="0" y1="0" x2="0" y2="1">
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
                    <Area type="monotone" dataKey="price" stroke={neonPurpleColor} strokeWidth={2} fillOpacity={1} fill={`url(#colorPriceAreaPurple-${stock?.id || 'default'})`} dot={false}/>
                </RechartsAreaChart>
            )}
            {chartType === 'candle' && (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.1)" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={{ stroke: "hsla(var(--border), 0.2)" }} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={{ stroke: "hsla(var(--border), 0.2)" }} domain={['auto', 'auto']} />
                <Tooltip
                  cursor={{ fill: 'hsla(var(--primary), 0.1)' }}
                  contentStyle={{
                    backgroundColor: 'hsla(var(--popover), 0.9)',
                    borderColor: 'hsla(var(--border), 0.2)',
                    borderRadius: 'var(--radius)',
                    backdropFilter: 'blur(4px)',
                    boxShadow: '0 4px 12px hsla(var(--background), 0.1)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: '500', marginBottom: '4px' }}
                  formatter={(value: number, name: string, props: any) => {
                    const itemColor = props.payload.fill;
                    return [<span style={{ color: itemColor }}>${value.toFixed(2)}</span>, 'Price'];
                  }}
                />
                <Bar dataKey="price" barSize={10}>
                  {chartData.map((entry, index) => {
                    const previousPrice = index > 0 ? chartData[index - 1].price : entry.price - 0.01;
                    let fillColor = 'hsl(var(--muted-foreground))';
                    if (entry.price > previousPrice) {
                      fillColor = 'hsl(var(--chart-2))';
                    } else if (entry.price < previousPrice) {
                      fillColor = 'hsl(var(--chart-5))';
                    }
                    return <Cell key={`cell-${index}`} fill={fillColor} />;
                  })}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Activity className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-sm text-center">
              {stock?.symbol ? `No chart data available for ${stock.symbol}.` : "Enter a ticker or select from Watchlist/News."}
            </p>
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
          { type: 'line', label: 'Line', Icon: AreaIcon },
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
