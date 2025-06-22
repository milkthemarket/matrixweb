
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Stock } from '@/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart as RechartsAreaChart, Area, BarChart, Bar, Cell } from 'recharts';
import type { TooltipProps } from 'recharts';
import { AreaChart as AreaIcon, CandlestickChart, Activity, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getChartData } from '@/ai/flows/get-chart-data-flow';
import { sub, formatISO, format } from 'date-fns';

interface InteractiveChartCardProps {
  stock: Stock | null;
  onManualTickerSubmit: (symbol: string) => void;
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    // Candlestick data
    if (data.open !== undefined) { 
      const isUp = data.close >= data.open;
      const valueColor = isUp ? 'text-[hsl(var(--confirm-green))]' : 'text-destructive';
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
        : 'text-primary';
    
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

// Map UI timeframes to Alpaca API parameters
const getTimeframeParams = (timeframe: '1D' | '5D' | '1M' | '6M' | '1Y' | 'MAX') => {
  const now = new Date();
  switch (timeframe) {
    case '1D':
      return { timeframe: '15Min', start: formatISO(sub(now, { days: 1 })) };
    case '5D':
      return { timeframe: '1Hour', start: formatISO(sub(now, { days: 5 })) };
    case '1M':
      return { timeframe: '1Day', start: formatISO(sub(now, { months: 1 })) };
    case '6M':
      return { timeframe: '1Day', start: formatISO(sub(now, { months: 6 })) };
    case '1Y':
      return { timeframe: '1Day', start: formatISO(sub(now, { years: 1 })) };
    case 'MAX':
      return { timeframe: '1Month', start: formatISO(sub(now, { years: 5 })) };
    default:
      return { timeframe: '1Day', start: formatISO(sub(now, { months: 1 })) };
  }
};


export function InteractiveChartCard({ stock, onManualTickerSubmit, className }: InteractiveChartCardProps) {
  const [chartType, setChartType] = useState<'line' | 'area' | 'candle'>('line');
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M' | '6M' | '1Y' | 'MAX'>('1M');
  const [manualTickerInput, setManualTickerInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (stock && document.activeElement !== inputRef.current) {
      setManualTickerInput(stock.symbol);
    } else if (!stock && document.activeElement !== inputRef.current) {
      setManualTickerInput('');
    }
  }, [stock]);

  // Effect to fetch data from Alpaca
  useEffect(() => {
    const fetchAndSetChartData = async () => {
      if (!stock || !stock.symbol) {
        setChartData([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = getTimeframeParams(timeframe);
        const data = await getChartData({
          symbol: stock.symbol,
          timeframe: params.timeframe,
          start: params.start,
        });

        if (data && data.length > 0) {
          const formattedData = data.map(bar => ({
            date: format(new Date(bar.t), 'MMM d, HH:mm'),
            price: bar.c,
            open: bar.o,
            high: bar.h,
            low: bar.l,
            close: bar.c,
          }));
          setChartData(formattedData);
        } else {
            setChartData([]);
            // Don't set an error if Alpaca just returns an empty array, it might be a valid non-trading period.
        }
      } catch (err: any) {
        console.error("Failed to fetch chart data:", err);
        setError(`Failed to load chart data for ${stock.symbol}.`);
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndSetChartData();
  }, [stock, timeframe]);


  const dynamicStrokeColor = stock && stock.changePercent >= 0 ? "hsl(var(--chart-2))" : "hsl(var(--chart-5))";
  const neonPurpleColor = "hsl(var(--primary))";

  const handleManualSubmit = () => {
    if (manualTickerInput.trim()) {
      onManualTickerSubmit(manualTickerInput.trim().toUpperCase());
    }
  };

  const renderChartContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <Loader2 className="h-10 w-10 mb-3 opacity-50 animate-spin text-primary" />
          <p className="text-xs text-center">Loading Chart Data...</p>
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-destructive p-4">
          <Activity className="h-10 w-10 mb-3 opacity-50" />
          <p className="text-xs text-center">{error}</p>
        </div>
      );
    }

    if (!chartData.length) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <Activity className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-xs text-center">
            {stock?.symbol ? `No chart data for ${stock.symbol} in this timeframe.` : "Enter ticker or select from Watchlist."}
          </p>
        </div>
      );
    }

    return (
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
            {/* The wick of the candle */}
            <Bar dataKey={(d) => [d.low, d.high]} barSize={1} fill="hsla(var(--muted-foreground), 0.5)" />
            {/* The body of the candle */}
            <Bar dataKey={(d) => [d.open, d.close]} barSize={8}>
              {chartData.map((entry, index) => {
                const fillColor = entry.close >= entry.open ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-5))';
                return <Cell key={`cell-${index}`} fill={fillColor} style={{ filter: `drop-shadow(0 0 1px ${fillColor})` }}/>;
              })}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    );
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
        {renderChartContent()}
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
