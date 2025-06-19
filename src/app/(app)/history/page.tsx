
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTradeHistoryContext } from "@/contexts/TradeHistoryContext";
import type { TradeHistoryEntry, HistoryTradeMode, TradeStatsData, ColumnConfig, HistoryFilterMode } from "@/types";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { History as HistoryIcon, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, DollarSign, Percent, Cpu, User, BarChartHorizontalBig, PackageOpen, Repeat, Award, Layers, Download, PieChart, CalendarDays } from "lucide-react";
import { MiloAvatarIcon } from '@/components/icons/MiloAvatarIcon';
import { cn } from '@/lib/utils';
import { exportToCSV } from '@/lib/exportCSV';
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";


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
  <div className="bg-transparent backdrop-blur-md p-1 rounded-md flex flex-col items-start"> {/* Reduced p-3 to p-1, rounded-lg to rounded-md */}
    <div className="flex items-center text-muted-foreground text-xs mb-0.5"> {/* Reduced text-sm to text-xs, mb-1 to mb-0.5 */}
      {icon && <span className="mr-1">{React.cloneElement(icon as React.ReactElement, { size: 14 })}</span>} {/* Reduced mr-1.5, icon size */}
      {label}
    </div>
    <span className={cn("text-lg font-semibold text-foreground", valueColor)}> {/* Reduced text-xl to text-lg */}
      {isCurrency && unit === '$' && unit}
      {typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: value % 1 === 0 && !isCurrency ? 0 : 2, maximumFractionDigits: 2 }) : value}
      {!isCurrency && unit && unit !== '$' && unit}
    </span>
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
  { key: 'trailAmount', label: 'Trail Amount', align: 'right', format: (val) => val ? String(val) : 'N/A' },
  { key: 'TIF', label: 'TIF' },
  { key: 'tradingHours', label: 'Trading Hours' },
  { key: 'placedTime', label: 'Placed Time', format: (val) => format(parseISO(val), "MM/dd/yy HH:mm") }, // Shortened format
  { key: 'filledTime', label: 'Filled Time', format: (val) => format(parseISO(val), "MM/dd/yy HH:mm") }, // Shortened format
  { key: 'orderStatus', label: 'Status' },
];


export default function HistoryPage() {
  const { tradeHistory } = useTradeHistoryContext();
  const [selectedHistoryFilterMode, setSelectedHistoryFilterMode] = useState<HistoryFilterMode>('all');
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
  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      return format(parseISO(isoString), "MM/dd HH:mm"); // Shortened format
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const overallStats = useMemo((): TradeStatsData => {
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


  const currentStats = useMemo(() => {
    if (selectedHistoryFilterMode === 'all') {
      return overallStats;
    }
    return mockTradeStats[selectedHistoryFilterMode];
  }, [selectedHistoryFilterMode, overallStats]);

  const displayedTradeHistory = useMemo(() => {
    if (selectedHistoryFilterMode === 'all') {
      return tradeHistory;
    }
    return tradeHistory.filter(trade => (trade.tradeModeOrigin || 'manual') === selectedHistoryFilterMode);
  }, [tradeHistory, selectedHistoryFilterMode]);

  const handleExport = () => {
    if (displayedTradeHistory.length === 0) {
      toast({
        title: "Export Failed",
        description: "No trade data to export for the current filter.",
        variant: "destructive",
      });
      return;
    }
    const filename = `trade_history_${selectedHistoryFilterMode}.csv`;
    exportToCSV(filename, displayedTradeHistory, tradeHistoryColumnConfig);
    toast({
      title: "Export Successful",
      description: `Trade history for "${selectedHistoryFilterMode}" exported to ${filename}.`,
    });
  };
  
  const comparisonTableMetrics: Array<{key: keyof TradeStatsData, label: string, unit?: string, isCurrency?: boolean, isPercentage?: boolean}> = [
    { key: 'totalTrades', label: 'Total Trades' },
    { key: 'winRate', label: 'Win Rate', unit: '%', isPercentage: true },
    { key: 'totalPnL', label: 'Total P&L', unit: '$', isCurrency: true },
    { key: 'avgReturn', label: selectedHistoryFilterMode === 'all' ? 'Avg P&L/Trade' : 'Avg Return', unit: selectedHistoryFilterMode === 'all' ? '$' : '%', isCurrency: selectedHistoryFilterMode === 'all', isPercentage: selectedHistoryFilterMode !== 'all'},
    { key: 'largestWin', label: 'Largest Win', unit: '$', isCurrency: true },
    { key: 'largestLoss', label: 'Largest Loss', unit: '$', isCurrency: true },
    { key: 'avgHoldTime', label: 'Avg. Hold Time' },
    { key: 'mostTradedSymbol', label: 'Most Traded' },
    { key: 'winStreak', label: 'Win Streak' },
  ];


  const buttonBaseClass = "flex-1 flex items-center justify-center h-8 py-1 px-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-background disabled:opacity-50"; // Reduced h-9, py-2, px-3, text-sm, ring-2
  const activeModeClass = "bg-primary text-primary-foreground shadow-sm";
  const inactiveModeClass = "bg-transparent text-muted-foreground hover:bg-panel/[.05] hover:text-foreground";


  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Trade History" />
      <div className="flex-1 p-1 md:p-1.5 space-y-1.5 overflow-y-auto"> {/* Reduced p-4/p-6, space-y-6 */}

        <div className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-lg rounded-md overflow-hidden border border-border/[.1] bg-panel/[.05] mx-auto"> {/* Reduced max-w-xl */}
          <button
            onClick={() => setSelectedHistoryFilterMode('all')}
            className={cn(buttonBaseClass, selectedHistoryFilterMode === 'all' ? activeModeClass : inactiveModeClass)}
          >
            <Layers className="mr-1 h-3.5 w-3.5" /> All {/* Reduced mr-2, icon size */}
          </button>
          <button
            onClick={() => setSelectedHistoryFilterMode('manual')}
            className={cn(buttonBaseClass, selectedHistoryFilterMode === 'manual' ? activeModeClass : inactiveModeClass)}
          >
            <User className="mr-1 h-3.5 w-3.5" /> Manual {/* Reduced mr-2, icon size */}
          </button>
          <button
            onClick={() => setSelectedHistoryFilterMode('aiAssist')}
            className={cn(buttonBaseClass, selectedHistoryFilterMode === 'aiAssist' ? activeModeClass : inactiveModeClass)}
          >
            <MiloAvatarIcon size={14} className="mr-1" /> AI Assist {/* Reduced size, mr-2 */}
          </button>
          <button
            onClick={() => setSelectedHistoryFilterMode('autopilot')}
            className={cn(buttonBaseClass, selectedHistoryFilterMode === 'autopilot' ? activeModeClass : inactiveModeClass)}
          >
            <Cpu className="mr-1 h-3.5 w-3.5" /> Autopilot {/* Reduced mr-2, icon size */}
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-headline flex items-center"> {/* Reduced text-xl, h-5 */}
              <BarChartHorizontalBig className="mr-1.5 h-4 w-4 text-primary"/> {/* Reduced icon size */}
              {selectedHistoryFilterMode === 'all' ? 'Overall Performance Summary' : 
               selectedHistoryFilterMode === 'manual' ? 'Manual Trade Performance' : 
               selectedHistoryFilterMode === 'aiAssist' ? 'AI Assisted Performance' : 'Autopilot Performance'}
            </CardTitle>
            <CardDescription>Summary of trades for the selected mode.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1"> {/* Reduced gap-4 */}
            <StatDisplay label="Total Trades" value={currentStats.totalTrades} icon={<PackageOpen size={14}/>} /> {/* Reduced icon size */}
            <StatDisplay label="Win Rate" value={currentStats.winRate} unit="%" icon={<TrendingUp size={14}/>} valueColor={currentStats.winRate >= 50 ? "text-[hsl(var(--confirm-green))]" : "text-destructive"} />
            <StatDisplay label="Total P&L" value={currentStats.totalPnL} unit="$" icon={<DollarSign size={14}/>} valueColor={currentStats.totalPnL >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive"} isCurrency/>
            <StatDisplay 
                label={selectedHistoryFilterMode === 'all' && currentStats.avgReturn !== undefined ? "Avg P&L / Trade" : "Avg Return / Trade"}
                value={currentStats.avgReturn} 
                unit={selectedHistoryFilterMode === 'all' && currentStats.avgReturn !== undefined ? "$" : "%"} 
                icon={<Percent size={14}/>} 
                valueColor={currentStats.avgReturn >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive"}
                isCurrency={selectedHistoryFilterMode === 'all' && currentStats.avgReturn !== undefined}
            />
            <StatDisplay label="Largest Win" value={currentStats.largestWin} unit="$" icon={<TrendingUp size={14}/>} valueColor="text-[hsl(var(--confirm-green))]" isCurrency/>
            <StatDisplay label="Largest Loss" value={currentStats.largestLoss !== 0 ? currentStats.largestLoss : 0} unit="$" icon={<TrendingDown size={14}/>} valueColor={currentStats.largestLoss < 0 ? "text-destructive" : "text-foreground"} isCurrency/>
            <StatDisplay label="Avg. Hold Time" value={currentStats.avgHoldTime} icon={<Clock size={14}/>} />
            <StatDisplay label="Most Traded" value={currentStats.mostTradedSymbol} icon={<Repeat size={14}/>} />
            <StatDisplay label="Win Streak" value={currentStats.winStreak} icon={<Award size={14}/>} valueColor={currentStats.winStreak > 2 ? "text-[hsl(var(--confirm-green))]" : "text-foreground"}/>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-headline flex items-center"> {/* Reduced text-xl, h-5 */}
              <CalendarDays className="mr-1.5 h-4 w-4 text-primary"/> {/* Reduced icon size */}
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
              classNames={{ // Adjusted some calendar internal classes if they imply significant padding/margin by default
                months: "flex flex-col sm:flex-row space-y-1 sm:space-x-1 sm:space-y-0", // Reduced space
                month: "space-y-1", // Reduced space
                caption_label: "text-xs font-medium", // Reduced text size
                nav_button: cn(buttonVariants({ variant: "outline" }), "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100"), // Reduced size
                table: "w-full border-collapse space-y-0.5", // Reduced space
                head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.7rem]", // Reduced size
                row: "flex w-full mt-0.5", // Reduced margin
                cell: "h-8 w-8 text-center text-xs p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-sm [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-sm last:[&:has([aria-selected])]:rounded-r-sm focus-within:relative focus-within:z-20", // Reduced size & padding
                day: cn(buttonVariants({ variant: "ghost" }), "h-8 w-8 p-0 font-normal aria-selected:opacity-100"), // Reduced size
                day_today: "bg-accent text-accent-foreground font-bold ring-1 ring-accent",
                day_outside: "text-muted-foreground/40",
              }}
            />
          </CardContent>
          <CardFooter className="flex items-center justify-center space-x-1.5 pt-1 text-[10px] text-muted-foreground"> {/* Reduced space, padding, text size */}
            <span>Legend:</span>
            <div className="flex items-center">
                <span className="font-semibold text-[hsl(var(--confirm-green))] mr-0.5">+100</span> Profit
            </div>
            <div className="flex items-center">
                <span className="font-semibold text-destructive mr-0.5">-50</span> Loss
            </div>
          </CardFooter>
        </Card>

        {selectedHistoryFilterMode === 'all' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-headline flex items-center"> {/* Reduced text-xl, h-5 */}
                <PieChart className="mr-1.5 h-4 w-4 text-primary"/> {/* Reduced icon size */}
                Performance Comparison by Mode
              </CardTitle>
              <CardDescription>Side-by-side comparison of key metrics across trading modes.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-w-full">
                <Table className="min-w-[600px]"> {/* Reduced min-w */}
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Metric</TableHead> {/* Reduced width */}
                      <TableHead className="text-center w-[120px]"> {/* Reduced width */}
                        <div className="flex items-center justify-center"><User className="mr-1 h-3.5 w-3.5" /> Manual</div> {/* Reduced icon size */}
                      </TableHead>
                      <TableHead className="text-center w-[120px]"> {/* Reduced width */}
                        <div className="flex items-center justify-center"><MiloAvatarIcon size={14} className="mr-1" /> AI Assist</div> {/* Reduced icon size */}
                      </TableHead>
                      <TableHead className="text-center w-[120px]"> {/* Reduced width */}
                        <div className="flex items-center justify-center"><Cpu className="mr-1 h-3.5 w-3.5" /> Autopilot</div> {/* Reduced icon size */}
                      </TableHead>
                       <TableHead className="text-center w-[120px] font-semibold"> {/* Reduced width */}
                        <div className="flex items-center justify-center"><Layers className="mr-1 h-3.5 w-3.5" /> Overall</div> {/* Reduced icon size */}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonTableMetrics.map(metric => (
                      <TableRow key={metric.key}>
                        <TableCell className="font-medium text-muted-foreground">{metric.label}</TableCell>
                        {(['manual', 'aiAssist', 'autopilot'] as HistoryTradeMode[]).map(mode => {
                          const value = mockTradeStats[mode][metric.key];
                          let displayValue = typeof value === 'number' 
                            ? value.toLocaleString(undefined, {minimumFractionDigits: (metric.isCurrency || metric.isPercentage) ? 2:0, maximumFractionDigits: 2}) 
                            : value;
                          if (metric.isCurrency) displayValue = `$${displayValue}`;
                          if (metric.isPercentage && typeof value === 'number') displayValue = `${displayValue}%`;
                          return <TableCell key={`${mode}-${metric.key}`} className="text-center text-foreground">{displayValue}</TableCell>;
                        })}
                        {(() => {
                            const overallValue = overallStats[metric.key];
                            let displayOverallValue = typeof overallValue === 'number'
                                ? overallValue.toLocaleString(undefined, { minimumFractionDigits: (metric.key === 'avgReturn' || metric.isCurrency || metric.isPercentage) ? 2 : 0, maximumFractionDigits: 2 })
                                : overallValue;
                            if ((metric.key === 'avgReturn' || metric.isCurrency)) displayOverallValue = `$${displayOverallValue}`;
                            if (metric.isPercentage && typeof overallValue === 'number') displayOverallValue = `${displayOverallValue}%`;
                             if (metric.key === 'avgReturn' && !metric.isCurrency && !metric.isPercentage) displayOverallValue = `$${Number(overallValue).toFixed(2)}`;
                            return <TableCell className="text-center text-foreground font-semibold">{displayOverallValue}</TableCell>;
                        })()}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        <Card className="flex-1 flex flex-col min-h-[300px]"> {/* Reduced min-h */}
          <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-1"> {/* Reduced gap */}
            <div>
              <CardTitle className="text-lg font-headline flex items-center"> {/* Reduced text-xl, h-6 */}
                <HistoryIcon className="mr-1.5 h-5 w-5 text-primary"/> {/* Reduced icon size */}
                Executed Trades
              </CardTitle>
              <CardDescription>
                Review your past trade executions for "{selectedHistoryFilterMode}" mode.
              </CardDescription>
            </div>
            <Button onClick={handleExport} variant="outline" size="sm" className="h-7 px-2 text-xs"> {/* Made button smaller */}
              <Download className="mr-1 h-3.5 w-3.5" /> {/* Reduced icon size */}
              Export CSV
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {displayedTradeHistory.length > 0 ? (
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
                      <TableHead className="text-right">Trail Amount</TableHead>
                      <TableHead>TIF</TableHead>
                      <TableHead>Trading Hours</TableHead>
                      <TableHead>Placed Time</TableHead>
                      <TableHead>Filled Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedTradeHistory.map((trade) => (
                      <TableRow key={trade.id} className="hover:bg-white/5 transition-colors duration-200">
                        <TableCell className="font-medium text-foreground">{trade.symbol}</TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "border-transparent text-[10px] px-1.5 py-px h-auto", // Reduced font size, padding
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
                        <TableCell className="text-right text-foreground">{formatOptionalNumber(trade.trailAmount)}</TableCell>
                        <TableCell className="text-foreground">{trade.TIF}</TableCell>
                        <TableCell className="text-foreground">{trade.tradingHours}</TableCell>
                        <TableCell className="text-foreground">{formatDateTime(trade.placedTime)}</TableCell>
                        <TableCell className="text-foreground">{formatDateTime(trade.filledTime)}</TableCell>
                        <TableCell className="flex items-center space-x-0.5 text-foreground"> {/* Reduced space */}
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
                <HistoryIcon className="h-10 w-10 mb-1" /> {/* Reduced icon size and margin */}
                { selectedHistoryFilterMode === 'aiAssist' || selectedHistoryFilterMode === 'autopilot' ? (
                  <p className="text-primary text-center text-sm">  {/* Reduced text size */}
                    Milo’s looking for greener pastures—no trades just yet!
                  </p>
                ) : (
                  <>
                    <p className="text-md">No trade history for "{selectedHistoryFilterMode}" mode.</p> {/* Reduced text size */}
                    <p className="text-xs">Executed trades will appear here.</p> {/* Reduced text size */}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
