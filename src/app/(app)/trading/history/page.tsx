
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useTradeHistoryContext } from "@/contexts/TradeHistoryContext";
import type { TradeHistoryEntry, HistoryTradeMode, TradeStatsData, ColumnConfig, HistoryFilterMode } from "@/types";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { History as HistoryIcon, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, DollarSign, Percent, Cpu, User, BarChartHorizontalBig, PackageOpen, Repeat, Award, Layers, Download, PieChart, CalendarDays } from "lucide-react";
import { MiloAvatarIcon } from '@/components/icons/MiloAvatarIcon';
import { cn } from '@/lib/utils';
import { exportToCSV } from '@/lib/exportCSV';
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from '@/components/ui/separator';


const getStatusIcon = (status: TradeHistoryEntry['orderStatus']) => {
  switch (status) {
    case 'Filled':
      return <CheckCircle className="h-3.5 w-3.5 text-[hsl(var(--confirm-green))]" />; // Reduced size
    case 'Canceled':
      return <XCircle className="h-3.5 w-3.5 text-destructive" />; // Reduced size
    case 'Pending':
      return <Clock className="h-3.5 w-3.5 text-yellow-500" />; // Reduced size
    default:
      return null;
  }
};

const mockTradeStats: Record<HistoryTradeMode, TradeStatsData> = {
  manual: {
    totalTrades: 14,
    winRate: 71.4,
    totalPnL: 1203.55,
    avgReturn: 1.8, // Percentage
    largestWin: 312.50,
    largestLoss: -106.00,
    avgHoldTime: '2h 15m',
    mostTradedSymbol: 'TSLA',
    winStreak: 4,
  },
  aiAssist: {
    totalTrades: 9,
    winRate: 55.6,
    totalPnL: 637.80,
    avgReturn: 0.9, // Percentage
    largestWin: 180.75,
    largestLoss: -142.00,
    avgHoldTime: '4h 42m',
    mostTradedSymbol: 'NVDA',
    winStreak: 2,
  },
  autopilot: { 
    totalTrades: 4,
    winRate: 100.0,
    totalPnL: 448.12,
    avgReturn: 3.7, // Percentage
    largestWin: 152.00,
    largestLoss: 0,
    avgHoldTime: '15m',
    mostTradedSymbol: 'AAPL',
    winStreak: 4, 
  }
};

const StatDisplay: React.FC<{ label: string; value: string | number; unit?: string; valueColor?: string; icon?: React.ReactNode; isCurrency?: boolean }> = ({ label, value, unit, valueColor, icon, isCurrency = false }) => (
  <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-black/5 border border-white/5"> 
    <div className="text-muted-foreground">
      {icon && React.cloneElement(icon as React.ReactElement, { size: 20 })}
    </div>
    <span className={cn("text-2xl font-bold text-foreground", valueColor)}>
      {isCurrency && unit === '$' && unit}
      {typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: value % 1 === 0 && !isCurrency ? 0 : 2, maximumFractionDigits: 2 }) : value}
      {!isCurrency && unit && unit !== '$' && `${unit}`}
    </span>
    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
  { key: 'placedTime', label: 'Placed Time', format: (val) => format(parseISO(val), "MM/dd/yy HH:mm") }, // Shortened format
  { key: 'filledTime', label: 'Filled Time', format: (val) => format(parseISO(val), "MM/dd/yy HH:mm") }, // Shortened format
  { key: 'orderStatus', label: 'Status' },
];

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


export default function HistoryPage() {
  const { tradeHistory } = useTradeHistoryContext();
  const { toast } = useToast();

  const [dailyPnlData, setDailyPnlData] = useState<Record<string, number>>({});
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(new Date());

  useEffect(() => {
    const generatePnlForMonth = (date: Date) => {
        const pnlMap: Record<string, number> = {};
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonthValue = new Date(year, month + 1, 0).getDate();

        for (let i = 1; i <= daysInMonthValue; i++) {
            const currentDate = new Date(year, month, i);
            if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) { // Skip Sunday and Saturday
                if (Math.random() > 0.3) { 
                    const pnl = (Math.random() - 0.45) * 300; 
                    pnlMap[format(currentDate, 'yyyy-MM-dd')] = parseFloat(pnl.toFixed(2));
                }
            }
        }
        return pnlMap;
    };
    setDailyPnlData(generatePnlForMonth(currentCalendarMonth));
  }, [currentCalendarMonth]);

  const pnlDayFormatter = (day: Date): React.ReactNode => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const pnl = dailyPnlData[dateKey];
      const dayOfMonth = format(day, 'd');
  
      if (pnl !== undefined && day.getMonth() === currentCalendarMonth.getMonth()) {
          return (
              <div className="flex flex-col items-center justify-center text-center leading-tight h-full w-full">
                  <span>{dayOfMonth}</span>
                  <span className={cn(
                      "text-[9px] font-bold leading-none mt-px", // Reduced text size
                      pnl > 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive"
                  )}>
                      {pnl > 0 ? '+' : ''}{pnl.toFixed(0)}
                  </span>
              </div>
          );
      }
      return dayOfMonth;
  };

  const formatOptionalPrice = (price?: number) => price?.toFixed(2) ?? 'N/A';
  const formatOptionalNumber = (num?: number) => num?.toString() ?? 'N/A';
  
  const currentStats = useMemo((): TradeStatsData => {
    const modes: HistoryTradeMode[] = ['manual', 'aiAssist', 'autopilot'];
    let totalTrades = 0;
    let totalPnL = 0;
    let totalWeightedWins = 0;
    let largestWin = -Infinity;
    let largestLoss = Infinity;
    let maxWinStreak = 0;
    
    const tradeCountsBySymbol: Record<string, number> = {};

    modes.forEach(mode => {
      const stats = mockTradeStats[mode];
      totalTrades += stats.totalTrades;
      totalPnL += stats.totalPnL;
      totalWeightedWins += (stats.winRate / 100) * stats.totalTrades;
      if (stats.largestWin > largestWin) largestWin = stats.largestWin;
      if (stats.largestLoss < largestLoss) largestLoss = stats.largestLoss;
      if (stats.winStreak > maxWinStreak) maxWinStreak = stats.winStreak;
      
      tradeCountsBySymbol[stats.mostTradedSymbol] = (tradeCountsBySymbol[stats.mostTradedSymbol] || 0) + stats.totalTrades;
    });

    const overallWinRate = totalTrades > 0 ? (totalWeightedWins / totalTrades) * 100 : 0;
    const overallAvgPnlPerTrade = totalTrades > 0 ? totalPnL / totalTrades : 0;

    let overallMostTradedSymbol = 'N/A';
    if (Object.keys(tradeCountsBySymbol).length > 0) {
        overallMostTradedSymbol = Object.entries(tradeCountsBySymbol).sort((a,b) => b[1] - a[1])[0][0];
    }

    return {
      totalTrades,
      winRate: overallWinRate,
      totalPnL,
      avgReturn: overallAvgPnlPerTrade,
      largestWin: largestWin === -Infinity ? 0 : largestWin,
      largestLoss: largestLoss === Infinity ? 0 : largestLoss,
      avgHoldTime: "Multiple", 
      mostTradedSymbol: overallMostTradedSymbol,
      winStreak: maxWinStreak,
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
  
  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Trade History" />
      <div className="flex-1 p-1 md:p-1.5 space-y-1.5 overflow-y-auto">

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-headline flex items-center">
              <BarChartHorizontalBig className="mr-1.5 h-4 w-4 text-primary"/>
              Overall Performance Summary
            </CardTitle>
            <CardDescription>Summary of all trades across all modes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {/* Column 1 */}
                <div className="space-y-2">
                  <StatDisplay label="Total Trades" value={currentStats.totalTrades} icon={<PackageOpen />} />
                  <StatDisplay label={"Avg P&L / Trade"} value={currentStats.avgReturn} unit={"$"} icon={<Percent />} valueColor={currentStats.avgReturn >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive"} isCurrency={true} />
                  <StatDisplay label="Avg. Hold Time" value={currentStats.avgHoldTime} icon={<Clock />} />
                </div>
                {/* Column 2 */}
                <div className="space-y-2">
                  <StatDisplay label="Total P&L" value={currentStats.totalPnL} unit="$" icon={<DollarSign />} valueColor={currentStats.totalPnL >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive"} isCurrency/>
                  <StatDisplay label="Largest Loss" value={currentStats.largestLoss !== 0 ? currentStats.largestLoss : 0} unit="$" icon={<TrendingDown />} valueColor={currentStats.largestLoss < 0 ? "text-destructive" : "text-foreground"} isCurrency/>
                  <StatDisplay label="Win Streak" value={currentStats.winStreak} icon={<Award />} valueColor={currentStats.winStreak > 2 ? "text-[hsl(var(--confirm-green))]" : "text-foreground"}/>
                </div>
                {/* Column 3 */}
                <div className="space-y-2">
                    <StatDisplay label="Win Rate" value={currentStats.winRate} unit="%" icon={<TrendingUp />} valueColor={currentStats.winRate >= 50 ? "text-[hsl(var(--confirm-green))]" : "text-destructive"} />
                    <StatDisplay label="Largest Win" value={currentStats.largestWin} unit="$" icon={<TrendingUp />} valueColor="text-[hsl(var(--confirm-green))]" isCurrency/>
                    <StatDisplay label="Most Traded" value={currentStats.mostTradedSymbol} icon={<Repeat />} />
                </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-headline flex items-center">
              <CalendarDays className="mr-1.5 h-4 w-4 text-primary"/>
              Daily P&L Calendar
            </CardTitle>
            <CardDescription>Visual overview of your daily trading performance. Navigable by month.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Calendar
              mode="single"
              month={currentCalendarMonth}
              onMonthChange={setCurrentCalendarMonth}
              formatters={{ formatDay: pnlDayFormatter }}
              className="w-full"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-1 sm:space-x-1 sm:space-y-0",
                month: "space-y-1",
                caption_label: "text-xs font-medium",
                nav_button: cn(buttonVariants({ variant: "outline" }), "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100"),
                table: "w-full border-collapse space-y-0.5",
                head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.7rem]",
                row: "flex w-full mt-0.5",
                cell: "h-8 w-8 text-center text-xs p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-sm [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-sm last:[&:has([aria-selected])]:rounded-r-sm focus-within:relative focus-within:z-20",
                day: cn(buttonVariants({ variant: "ghost" }), "h-8 w-8 p-0 font-normal aria-selected:opacity-100"),
                day_today: "bg-accent text-accent-foreground font-bold ring-1 ring-accent",
                day_outside: "text-muted-foreground/40",
              }}
            />
          </CardContent>
          <CardFooter className="flex items-center justify-center space-x-1.5 pt-1 text-[10px] text-muted-foreground">
            <span>Legend:</span>
            <div className="flex items-center">
                <span className="font-semibold text-[hsl(var(--confirm-green))] mr-0.5">+100</span> Profit
            </div>
            <div className="flex items-center">
                <span className="font-semibold text-destructive mr-0.5">-50</span> Loss
            </div>
          </CardFooter>
        </Card>

        <Card className="flex-1 flex flex-col min-h-[300px]">
          <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-1">
            <div>
              <CardTitle className="text-lg font-headline flex items-center">
                <HistoryIcon className="mr-1.5 h-5 w-5 text-primary"/>
                Executed Trades
              </CardTitle>
              <CardDescription>
                Review your past trade executions.
              </CardDescription>
            </div>
            <Button onClick={handleExport} variant="outline" size="sm" className="h-7 px-2 text-xs">
              <Download className="mr-1 h-3.5 w-3.5" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {tradeHistory.length > 0 ? (
              <ScrollArea className="h-[calc(100%-0rem)]"> 
                <Table><TableHeader className="sticky top-0 bg-card/[.05] backdrop-blur-md z-10">
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
                  </TableHeader><TableBody>
                    {tradeHistory.map((trade) => (
                      <TableRow key={trade.id} className="hover:bg-white/5 transition-colors duration-200">
                        <TableCell className="font-medium text-foreground">{trade.symbol}</TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "border-transparent text-[10px] px-1.5 py-px h-auto",
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
                  </TableBody></Table>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <HistoryIcon className="h-10 w-10 mb-1" />
                <p className="text-md">No trade history yet.</p>
                <p className="text-xs">Executed trades will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
