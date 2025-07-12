
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { useTradeHistoryContext } from "@/contexts/TradeHistoryContext";
import type { TradeHistoryEntry, TradeStatsData } from "@/types";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameMonth, getDate, subMonths, addMonths } from 'date-fns';
import { History as HistoryIcon, TrendingUp, TrendingDown, DollarSign, Percent, Clock, Repeat, Award, PackageOpen, Download, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { exportToCSV } from '@/lib/exportCSV';
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const ClientSideDateTime = ({ isoString }: { isoString?: string }) => {
  const [formattedDate, setFormattedDate] = useState<string>('...');

  useEffect(() => {
    if (isoString) {
      try {
        setFormattedDate(format(parseISO(isoString), "MM/dd HH:mm"));
      } catch (e) {
        setFormattedDate('Invalid Date');
      }
    } else {
      setFormattedDate('N/A');
    }
  }, [isoString]);

  return <>{formattedDate}</>;
};

const getStatusIcon = (status: TradeHistoryEntry['orderStatus']) => {
  switch (status) {
    case 'Filled':
      return <CheckCircle className="h-3.5 w-3.5 text-[hsl(var(--confirm-green))]" />;
    case 'Canceled':
      return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    case 'Pending':
      return <Clock className="h-3.5 w-3.5 text-yellow-500" />;
    default:
      return null;
  }
};

const StatDisplay: React.FC<{ label: string; value: string | number; unit?: string; valueClass?: string; icon?: React.ReactNode; isCurrency?: boolean }> = ({ label, value, unit, valueClass, icon, isCurrency = false }) => (
    <div className="flex flex-col items-center justify-center p-3 text-center">
        <div className="text-muted-foreground mb-1.5">
            {icon && React.cloneElement(icon as React.ReactElement, { size: 24, className: "text-muted-foreground/80" })}
        </div>
        <span className={cn("text-2xl font-bold text-foreground", valueClass)}>
            {isCurrency && unit === '$' && unit}
            {typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: value % 1 === 0 && !isCurrency ? 0 : 2, maximumFractionDigits: 2 }) : value}
            {!isCurrency && unit && unit !== '$' && `${unit}`}
        </span>
        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">
            {label}
        </div>
    </div>
);


const tradeHistoryColumnConfig: ColumnConfig<TradeHistoryEntry>[] = [
  { key: 'symbol', label: 'Symbol' },
  { key: 'side', label: 'Side' },
  { key: 'totalQty', label: 'Total Qty', align: 'right' },
  { key: 'averagePrice', label: 'Avg Price', align: 'right', format: (val) => `$${val.toFixed(2)}` },
  { key: 'orderType', label: 'Order Type' },
  { key: 'limitPrice', label: 'Limit Price', align: 'right', format: (val) => val ? `$${val.toFixed(2)}` : 'N/A' },
  { key: 'stopPrice', label: 'Stop Price', align: 'right', format: (val) => val ? `$${val.toFixed(2)}` : 'N/A' },
  { key: 'TIF', label: 'TIF' },
  { key: 'tradingHours', label: 'Trading Hours' },
  { key: 'placedTime', label: 'Placed Time', format: (val) => format(parseISO(val), "MM/dd/yy HH:mm") },
  { key: 'filledTime', label: 'Filled Time', format: (val) => format(parseISO(val), "MM/dd/yy HH:mm") },
  { key: 'orderStatus', label: 'Status' },
];

const formatOptionalPrice = (price?: number) => {
    if (price === undefined || price === null) {
      return 'N/A';
    }
    return `$${price.toFixed(2)}`;
};

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getMonthDays = (year: number, month: number) => {
    const firstDayOfMonth = startOfMonth(new Date(year, month));
    const lastDayOfMonth = endOfMonth(new Date(year, month));
    
    const daysInCurrentMonth = eachDayOfInterval({
        start: firstDayOfMonth,
        end: lastDayOfMonth,
    });

    const startDayOfWeek = getDay(firstDayOfMonth);

    const daysFromPrevMonth = Array.from({ length: startDayOfWeek }).map((_, i) => {
        const day = new Date(year, month, i - startDayOfWeek + 1);
        return { day: getDate(day), isCurrentMonth: false, fullDate: day };
    });

    const currentMonthDays = daysInCurrentMonth.map(day => ({
        day: getDate(day),
        isCurrentMonth: true,
        fullDate: day,
    }));

    const daysArray = [...daysFromPrevMonth, ...currentMonthDays];
    
    const remainingCells = 42 - daysArray.length; // 6 weeks * 7 days
    const daysFromNextMonth = Array.from({ length: remainingCells }).map((_, i) => {
        const day = new Date(year, month + 1, i + 1);
        return { day: getDate(day), isCurrentMonth: false, fullDate: day };
    });

    return [...daysArray, ...daysFromNextMonth];
};


export default function HistoryPage() {
  const { tradeHistory } = useTradeHistoryContext();
  const { toast } = useToast();

  const [currentDate, setCurrentDate] = useState(new Date());

  const currentStats = useMemo((): TradeStatsData => {
    const totalTrades = 27;
    const totalPnL = 2289.47;
    return {
      totalTrades,
      winRate: 70.37,
      totalPnL,
      avgReturn: totalTrades > 0 ? totalPnL / totalTrades : 0,
      largestWin: 312.50,
      largestLoss: -142.00,
      avgHoldTime: "Multiple",
      mostTradedSymbol: "TSLA",
      winStreak: 4,
    };
  }, []);

  const handleExport = () => {
    if (tradeHistory.length === 0) {
      toast({
        title: "Export Failed",
        description: "No trade data to export.",
        variant: "destructive",
      });
      return;
    }
    const filename = `trade_history_all.csv`;
    exportToCSV(filename, tradeHistory, tradeHistoryColumnConfig);
    toast({
      title: "Export Successful",
      description: `All trade history exported to ${filename}.`,
    });
  };

  const handlePreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const monthDays = getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
  
  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-semibold font-headline text-foreground">Trade History</h1>

      <div className="flex-1 space-y-1.5 overflow-y-auto">

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center">
              Overall Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full lg:w-3/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-1">
                    <StatDisplay label="Total Trades" value={currentStats.totalTrades} icon={<PackageOpen />} />
                    <StatDisplay label="Total P&L" value={currentStats.totalPnL} unit="$" icon={<DollarSign />} valueClass={currentStats.totalPnL >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive"} isCurrency/>
                    <StatDisplay label="Win Rate" value={currentStats.winRate} unit="%" icon={<TrendingUp />} valueClass={currentStats.winRate >= 50 ? "text-[hsl(var(--confirm-green))]" : "text-destructive"} />
                    <StatDisplay label={"Avg P&L / Trade"} value={currentStats.avgReturn} unit={"$"} icon={<Percent />} valueClass={currentStats.avgReturn >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive"} isCurrency={true} />
                    <StatDisplay label="Largest Loss" value={currentStats.largestLoss !== 0 ? currentStats.largestLoss : 0} unit="$" icon={<TrendingDown />} valueClass={currentStats.largestLoss < 0 ? "text-destructive" : "text-foreground"} isCurrency/>
                    <StatDisplay label="Largest Win" value={currentStats.largestWin} unit="$" icon={<TrendingUp />} valueClass="text-[hsl(var(--confirm-green))]" isCurrency/>
                    <StatDisplay label="Avg. Hold Time" value={currentStats.avgHoldTime} icon={<Clock />} />
                    <StatDisplay label="Win Streak" value={currentStats.winStreak} icon={<Award />} valueClass={currentStats.winStreak > 2 ? "text-[hsl(var(--confirm-green))]" : "text-foreground"}/>
                    <StatDisplay label="Most Traded" value={currentStats.mostTradedSymbol} icon={<Repeat />} />
                </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
            <CardHeader>
                <CardTitle className="text-xl font-headline flex items-center">
                Calendar
                </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
                <div className="relative flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" aria-label="Previous month" onClick={handlePreviousMonth}><ChevronLeft className="h-4 w-4" /></Button>
                        <Button variant="outline" onClick={handleToday}>Today</Button>
                        <Button variant="outline" size="icon" aria-label="Next month" onClick={handleNextMonth}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                    
                    <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
                        <h2 className="text-2xl font-bold font-headline uppercase text-foreground">
                            {format(currentDate, "MMMM yyyy")}
                        </h2>
                    </div>

                    <div />
                </div>

                <div className="grid grid-cols-7">
                    {daysOfWeek.map((day) => (
                        <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground">{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-px border-l border-t border-border/10">
                    {monthDays.map((dayObj, index) => (
                        <div key={index}
                            className={cn("h-24 sm:h-28 md:h-32 p-1.5 text-xs bg-transparent border-r border-b border-white/10 overflow-hidden relative cursor-pointer hover:bg-white/5",
                                dayObj.isCurrentMonth ? "text-foreground" : "text-muted-foreground/50",
                                dayObj.fullDate && isToday(dayObj.fullDate) && dayObj.isCurrentMonth && "bg-primary/10 ring-1 ring-inset ring-primary/50"
                            )}
                        >
                            <span className={cn("absolute top-1.5 right-1.5 flex items-center justify-center w-5 h-5 rounded-full text-xs",
                                dayObj.fullDate && isToday(dayObj.fullDate) && dayObj.isCurrentMonth ? "bg-primary text-primary-foreground font-semibold" : "")}>
                                {dayObj.day}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
        
        <Card className="flex-1 flex flex-col min-h-[300px]">
          <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-1">
            <CardTitle className="text-xl font-headline flex items-center">
              Executed Trades
            </CardTitle>
            <Button onClick={handleExport} variant="outline" size="sm" className="h-7 px-2 text-sm">
              <Download className="mr-1 h-3.5 w-3.5" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {tradeHistory.length > 0 ? (
              <ScrollArea className="h-[calc(100%-0rem)]"> 
                <Table>
                  <TableHeader className="sticky top-0 bg-card/[.05] backdrop-blur-md z-10">
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Side</TableHead>
                      <TableHead className="text-right">Total Qty</TableHead>
                      <TableHead className="text-right">Avg Price</TableHead>
                      <TableHead>Order Type</TableHead>
                      <TableHead className="text-right">Limit Price</TableHead>
                      <TableHead className="text-right">Stop Price</TableHead>
                      <TableHead>TIF</TableHead>
                      <TableHead>Trading Hours</TableHead>
                      <TableHead>Placed Time</TableHead>
                      <TableHead>Filled Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tradeHistory.map((trade) => (
                      <TableRow key={trade.id} className="hover:bg-white/5 transition-colors duration-200">
                        <TableCell className="font-medium text-foreground">{trade.symbol}</TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "border-transparent text-xs px-1.5 py-px h-auto",
                              trade.side === 'Buy' && 'bg-[hsl(var(--confirm-green))] text-[hsl(var(--confirm-green-foreground))] hover:bg-[hsl(var(--confirm-green))]/90',
                              trade.side === 'Sell' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                              trade.side === 'Short' && 'bg-yellow-500 text-yellow-950 hover:bg-yellow-500/90'
                            )}
                          >
                            {trade.side}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-foreground">{trade.totalQty}</TableCell>
                        <TableCell className="text-right text-foreground">${trade.averagePrice.toFixed(2)}</TableCell>
                        <TableCell className="text-foreground">{trade.orderType}</TableCell>
                        <TableCell className="text-right text-foreground">{formatOptionalPrice(trade.limitPrice)}</TableCell>
                        <TableCell className="text-right text-foreground">{formatOptionalPrice(trade.stopPrice)}</TableCell>
                        <TableCell className="text-foreground">{trade.TIF}</TableCell>
                        <TableCell className="text-foreground">{trade.tradingHours}</TableCell>
                        <TableCell className="text-foreground"><ClientSideDateTime isoString={trade.placedTime} /></TableCell>
                        <TableCell className="text-foreground"><ClientSideDateTime isoString={trade.filledTime} /></TableCell>
                        <TableCell className="flex items-center space-x-0.5 text-foreground">
                          {getStatusIcon(trade.orderStatus)}
                          <span>{trade.orderStatus}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <HistoryIcon className="h-10 w-10 mb-1" />
                <p className="text-lg">No trade history yet.</p>
                <p className="text-sm">Executed trades will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
