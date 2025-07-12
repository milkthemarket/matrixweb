
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Stock } from '@/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart as RechartsAreaChart, Area, BarChart, Bar, Cell } from 'recharts';
import type { TooltipProps } from 'recharts';
import { AreaChart as AreaIcon, CandlestickChart, Activity, Search, Loader2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getChartData } from '@/ai/flows/get-chart-data-flow';
import { sub, formatISO, format } from 'date-fns';
import { ChartDatePickerModal } from './ChartDatePickerModal';
import type { DateRange } from 'react-day-picker';


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
const getTimeframeParams = (timeframe: '1D' | '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '5Y' | 'All') => {
  const now = new Date();
  switch (timeframe) {
    case '1D':
      return { timeframe: '15Min', start: formatISO(sub(now, { days: 1 })) };
    case '5D':
      return { timeframe: '1Hour', start: formatISO(sub(now, { days: 5 })) };
    case '1M':
      return { timeframe: '1Day', start: formatISO(sub(now, { months: 1 })) };
    case '3M':
      return { timeframe: '1Day', start: formatISO(sub(now, { months: 3 })) };
    case '6M':
      return { timeframe: '1Day', start: formatISO(sub(now, { months: 6 })) };
    case 'YTD':
      return { timeframe: '1Day', start: formatISO(new Date(now.getFullYear(), 0, 1)) };
    case '1Y':
      return { timeframe: '1Day', start: formatISO(sub(now, { years: 1 })) };
    case '5Y':
      return { timeframe: '1Week', start: formatISO(sub(now, { years: 5 })) };
    case 'All':
      return { timeframe: '1Month', start: '2015-01-01T00:00:00Z' }; // A reasonable 'all time' start
    default:
      return { timeframe: '1Day', start: formatISO(sub(now, { months: 1 })) };
  }
};


export function InteractiveChartCard({ stock, onManualTickerSubmit, className }: InteractiveChartCardProps) {
  const [chartType, setChartType] = useState<'line' | 'area' | 'candle'>('line');
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '5Y' | 'All'>('1M');
  const [interval, setInterval] = useState<'1m' | '5m' | '30m' | '1h' | 'D' | 'W' | 'M'>('D');
  const [manualTickerInput, setManualTickerInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);


  useEffect(() => {
    if (stock && document.activeElement !== inputRef.current) {
      setManualTickerInput(stock.symbol);
    } else if (!stock && document.activeElement !== inputRef.current) {
      setManualTickerInput('');
    }
  }, [stock]);

  // Effect to fetch data from mocked flow
  useEffect(() => {
    const fetchAndSetChartData = async () => {
      if (!stock?.symbol) {
        setChartData([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const params = getTimeframeParams(timeframe);
        const data = await getChartData({ symbol: stock.symbol, ...params });
        
        const formattedData = data.map(bar => ({
          date: format(new Date(bar.t), 'MMM dd'),
          price: bar.c,
          open: bar.o,
          high: bar.h,
          low: bar.l,
          close: bar.c
        }));
        setChartData(formattedData);
      } catch (err: any) {
        console.error("Error fetching chart data:", err);
        setError(err.message || "Failed to fetch chart data.");
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAndSetChartData();
  }, [stock, timeframe]);

  const handleDateGo = (date: Date | DateRange) => {
    console.log("Selected date/range:", date);
    // Future logic to refetch chart data will go here.
  };

  const dynamicStrokeColor = stock && stock.changePercent >= 0 ? "hsl(var(--chart-2))" : "hsl(var(--chart-5))";
  const neonPurpleColor = "#7C2CF6";

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

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip
              cursor={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1, strokeDasharray: '3 3' }}
              content={<CustomTooltip />}
            />
            <Line type="monotone" dataKey="price" stroke={dynamicStrokeColor} strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height="100%">
             <RechartsAreaChart data={chartData}>
                <defs>
                    <linearGradient id={`colorPriceAreaPurple-${stock?.id || 'default'}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C2CF6" stopOpacity={0.95}/>
                      <stop offset="95%" stopColor="#1C0736" stopOpacity={0.85}/>
                    </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip
                    cursor={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1, strokeDasharray: '3 3' }}
                    content={<CustomTooltip />}
                />
                <Area type="monotone" dataKey="price" stroke={neonPurpleColor} strokeWidth={2} fillOpacity={1} fill={`url(#colorPriceAreaPurple-${stock?.id || 'default'})`} dot={false}/>
            </RechartsAreaChart>
        </ResponsiveContainer>
      );
    }
    
    if (chartType === 'candle') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
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
        </ResponsiveContainer>
      );
    }

    return null;
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
            <Button variant="ghost" size="icon" onClick={handleManualSubmit} className="h-7 w-7 text-foreground hover:bg-white/10">
              <Search className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-1 pr-2 min-h-[250px]">
        {renderChartContent()}
      </CardContent>
      <CardFooter className="flex flex-wrap justify-start items-center gap-x-1 gap-y-2 pt-2 pb-2 px-3">
        {/* Timeframes */}
        {['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'All'].map((tf) => (
          <Button
            key={tf}
            variant="ghost"
            size="sm"
            onClick={() => setTimeframe(tf as any)}
            className={cn(
              "h-6 text-[10px] px-2 font-medium",
              timeframe === tf
                ? "text-primary-foreground bg-white/10 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            {tf}
          </Button>
        ))}
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-white/5" onClick={() => setIsDatePickerOpen(true)}>
          <Calendar className="h-3.5 w-3.5" />
        </Button>
        
        <div className="w-px bg-border/20 h-5 self-center mx-1"></div>

        {/* Intervals */}
        {['1m', '5m', '30m', '1h', 'D', 'W', 'M'].map((iv) => (
          <Button
            key={iv}
            variant="ghost"
            size="sm"
            onClick={() => setInterval(iv as any)}
            className={cn(
              "h-6 text-[10px] px-2 font-medium",
              interval === iv
                ? "text-primary-foreground bg-white/10 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            {iv}
          </Button>
        ))}

        <div className="w-px bg-border/20 h-5 self-center mx-1"></div>

        {/* Chart Types */}
        {[
          { type: 'line', label: 'Line', Icon: LineChart },
          { type: 'area', label: 'Area', Icon: AreaIcon },
          { type: 'candle', label: 'Candle', Icon: CandlestickChart },
        ].map(({ type, label, Icon }) => (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            onClick={() => setChartType(type as any)}
            className={cn(
              "h-6 text-[10px] px-2 font-medium",
              chartType === type
                ? "text-primary-foreground bg-white/10 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <Icon className="h-3 w-3 mr-0.5" />
            {label}
          </Button>
        ))}
      </CardFooter>
      <ChartDatePickerModal 
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onGo={handleDateGo}
      />
    </Card>
  );
}
