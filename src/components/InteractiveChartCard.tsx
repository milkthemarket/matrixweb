
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Stock } from '@/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart as RechartsAreaChart, Area, BarChart, Bar, Cell } from 'recharts';
import type { TooltipProps } from 'recharts';
import { AreaChart as AreaIcon, CandlestickChart, Minus, Plus, Activity, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractiveChartCardProps {
  stock: Stock | null;
  onManualTickerSubmit: (symbol: string) => void;
  className?: string;
}

const generateMockOHLCData = (basePrice: number, numPoints = 50) => {
  const data = [];
  let lastClose = basePrice;
  for (let i = 0; i < numPoints; i++) {
    const date = new Date();
    date.setDate(date.getDate() - numPoints + 1 + i);
    
    const open = lastClose;
    const change = (Math.random() - 0.49) * (open * 0.03); // More volatility
    const close = open + change;
    const high = Math.max(open, close) + (Math.random() * open * 0.015);
    const low = Math.min(open, close) - (Math.random() * open * 0.015);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: parseFloat(close.toFixed(2)),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    });
    lastClose = close;
  }
  return data;
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    // Candlestick data
    if (data.open !== undefined) { 
      const isUp = data.close >= data.open;
      const valueColor = isUp ? 'text-[hsl(var(--confirm-green))]' : 'text-destructive'; // Use theme colors
      return (
        <div className="p-2.5 text-xs bg-background/90 backdrop-blur-sm rounded-md border border-border/20 shadow-lg shadow-primary/10">
          <p className="label text-muted-foreground font-semibold mb-1">{`${label}`}</p>
          <div className="intro space-y-1">
            <div className="flex justify-between items-baseline"><span className="text-foreground">Open:</span> <span className={cn("font-bold ml-2", valueColor)}>${data.open.toFixed(2)}</span></div>
            <div className="flex justify-between items-baseline"><span className="text-foreground">High:</span> <span className={cn("font-bold ml-2", valueColor)}>${data.high.toFixed(2)}</span></div>
            <div className="flex justify-between items-baseline"><span className="text-foreground">Low:</span> <span className={cn("font-bold ml-2", valueColor)}>${data.low.toFixed(2)}</span></div>
            <div className="flex justify-between items-baseline"><span className="text-foreground">Close:</span> <span className={cn("font-bold ml-2", valueColor)}>${data.close.toFixed(2)}</span></div>
          </div>
        </div>
      );
    }
    // Default tooltip for line/area
    const valueColor = payload[0].stroke === "hsl(var(--chart-2))"
        ? 'text-[hsl(var(--confirm-green))]'
        : payload[0].stroke === "hsl(var(--chart-5))"
        ? 'text-destructive'
        : 'text-primary'; // Fallback for purple area chart
    
    return (
        <div className="p-2.5 text-xs bg-background/90 backdrop-blur-sm rounded-md border border-border/20 shadow-lg shadow-primary/10">
            <p className="label text-muted-foreground font-semibold mb-1">{`${label}`}</p>
            <div className="flex justify-between items-baseline">
                <span className="text-foreground">Price:</span>
                <span className={cn("font-bold ml-2", valueColor)}>${payload[0].value?.toFixed(2)}</span>
            </div>
        </div>
    );
  }
  return null;
};


export function InteractiveChartCard({ stock, onManualTickerSubmit, className }: InteractiveChartCardProps) {
  const [chartType, setChartType] = useState<'line' | 'area' | 'candle'>('line');
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M' | '6M' | '1Y' | 'MAX'>('1M');
  const [manualTickerInput, setManualTickerInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (stock && document.activeElement !== inputRef.current) {
      setManualTickerInput(stock.symbol);
    } else if (!stock && document.activeElement !== inputRef.current) {
      setManualTickerInput(''); // Clear if no stock is selected externally
    }
  }, [stock]);

  const chartData = React.useMemo(() => {
    const basePrice = stock?.price || 0;
    let numPoints = 30;
    if (timeframe === '1D') numPoints = 10;
    if (timeframe === '5D') numPoints = 20;
    if (timeframe === '6M') numPoints = 180;
    if (timeframe === '1Y') numPoints = 252;
    if (timeframe === 'MAX') numPoints = 500;

    if (basePrice > 0) {
        return generateMockOHLCData(basePrice, numPoints);
    }
    return [];
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
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          {stock && stock.price > 0 ? (
            <div className="flex items-baseline gap-x-2.5 gap-y-1 flex-wrap flex-1 min-w-0">
              <h3 className="text-base font-bold text-neutral-50 truncate" title={stock.name}>
                {stock.symbol}
              </h3>
              <p className="text-base font-bold text-foreground">
                ${stock.price.toFixed(2)}
              </p>
              <p className={cn("text-xs font-bold", stock.changePercent >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]')}>
                {stock.changePercent >= 0 ? '+' : ''}{(stock.price * (stock.changePercent / 100)).toFixed(2)}
                <span className="ml-1">({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
              </p>
              {stock.afterHoursPrice && stock.afterHoursChange !== undefined && (
                <p className="text-xs text-neutral-400 font-medium whitespace-nowrap">
                  After-Hours: ${stock.afterHoursPrice.toFixed(2)}
                  <span className={cn("ml-1", stock.afterHoursChange >= 0 ? 'text-[#4ADE80]' : 'text-red-400')}>
                    ({stock.afterHoursChange >= 0 ? '+' : ''}{stock.afterHoursChange.toFixed(2)})
                  </span>
                </p>
              )}
            </div>
          ) : (
              <CardTitle className="text-lg font-headline text-foreground flex-1">
                Trading Chart
              </CardTitle>
          )}
          <div className="flex items-center gap-1 w-full sm:w-auto">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Symbol"
              value={manualTickerInput}
              onChange={(e) => setManualTickerInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
              className="h-7 text-xs flex-1 sm:flex-initial sm:w-28 bg-transparent"
            />
            <Button variant="ghost" size="icon" onClick={handleManualSubmit} className="h-7 w-7 text-primary hover:bg-primary/10">
              <Search className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-1 pr-2 min-h-[250px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' && (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.1)" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={{ stroke: "hsla(var(--border), 0.1)" }} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={{ stroke: "hsla(var(--border), 0.1)" }} domain={['auto', 'auto']} />
                <Tooltip
                  cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
                  content={<CustomTooltip />}
                />
                <Line type="monotone" dataKey="price" stroke={dynamicStrokeColor} strokeWidth={1.5} dot={false} />
              </LineChart>
            )}
            {chartType === 'area' && (
                 <RechartsAreaChart data={chartData}>
                    <defs>
                        <linearGradient id={`colorPriceAreaPurple-${stock?.id || 'default'}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={neonPurpleColor} stopOpacity={0.5}/>
                          <stop offset="95%" stopColor={neonPurpleColor} stopOpacity={0.05}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.1)" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={{ stroke: "hsla(var(--border), 0.1)" }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={{ stroke: "hsla(var(--border), 0.1)" }} domain={['auto', 'auto']} />
                    <Tooltip
                        cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
                        content={<CustomTooltip />}
                    />
                    <Area type="monotone" dataKey="price" stroke={neonPurpleColor} strokeWidth={1.5} fillOpacity={1} fill={`url(#colorPriceAreaPurple-${stock?.id || 'default'})`} dot={false}/>
                </RechartsAreaChart>
            )}
            {chartType === 'candle' && (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.1)" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={{ stroke: "hsla(var(--border), 0.1)" }} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={{ stroke: "hsla(var(--border), 0.1)" }} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip
                  cursor={{ fill: 'hsla(var(--primary), 0.05)' }}
                  content={<CustomTooltip />}
                />
                <Bar dataKey={(d) => [d.open, d.close]} barSize={8}>
                  {chartData.map((entry, index) => {
                    const fillColor = entry.close >= entry.open ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-5))';
                    return <Cell key={`cell-${index}`} fill={fillColor} style={{ filter: `drop-shadow(0 0 1px ${fillColor})` }}/>;
                  })}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Activity className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-xs text-center">
              {stock?.symbol ? `No chart data for ${stock.symbol}.` : "Enter ticker or select from Watchlist."}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap justify-center items-center gap-1 pt-2 pb-2 px-1">
        {['1D', '5D', '1M', '6M', '1Y', 'MAX'].map((tf) => (
          <Button key={tf} variant={timeframe === tf ? "default" : "outline"} size="sm" onClick={() => setTimeframe(tf as any)} className="h-6 text-[10px] px-2">
            {tf}
          </Button>
        ))}
        <div className="w-px bg-border/[.1] h-5 mx-1 hidden sm:block"></div>
        {[
          { type: 'line', label: 'Line', Icon: LineChart },
          { type: 'area', label: 'Area', Icon: AreaIcon },
          { type: 'candle', label: 'Candle', Icon: CandlestickChart },
        ].map(({ type, label, Icon }) => (
          <Button key={type} variant={chartType === type ? "default" : "outline"} size="sm" onClick={() => setChartType(type as any)} className="h-6 text-[10px] px-2">
            <Icon className="h-3 w-3 mr-0.5" /> {label}
          </Button>
        ))}
      </CardFooter>
    </Card>
  );
}

    
