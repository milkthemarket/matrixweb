
"use client";

import React, { useState, useMemo } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTradeHistoryContext } from "@/contexts/TradeHistoryContext";
import type { TradeHistoryEntry, HistoryTradeMode, TradeStatsData } from "@/types";
import { format, parseISO } from 'date-fns';
import { History as HistoryIcon, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, DollarSign, Percent, Cpu, Bot, User, BarChartHorizontalBig, PackageOpen } from "lucide-react";
import { cn } from '@/lib/utils';

const getStatusIcon = (status: TradeHistoryEntry['orderStatus']) => {
  switch (status) {
    case 'Filled':
      return <CheckCircle className="h-4 w-4 text-[hsl(var(--confirm-green))]" />;
    case 'Canceled':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'Pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return null;
  }
};

const mockTradeStats: Record<HistoryTradeMode, TradeStatsData> = {
  manual: {
    totalTrades: 14,
    winRate: 71.4,
    totalPnL: 1203.55,
    avgReturn: 1.8,
    largestWin: 312.50,
    largestLoss: -106.00,
    avgHoldTime: '2h 15m'
  },
  aiAssist: {
    totalTrades: 9,
    winRate: 55.6,
    totalPnL: 637.80,
    avgReturn: 0.9,
    largestWin: 180.75,
    largestLoss: -142.00,
    avgHoldTime: '4h 42m'
  },
  autopilot: { // Was 'fullyAI'
    totalTrades: 4,
    winRate: 100.0,
    totalPnL: 448.12,
    avgReturn: 3.7,
    largestWin: 152.00,
    largestLoss: 0,
    avgHoldTime: '15m'
  }
};

const StatDisplay: React.FC<{ label: string; value: string | number; unit?: string; valueColor?: string; icon?: React.ReactNode }> = ({ label, value, unit, valueColor, icon }) => (
  <div className="bg-transparent backdrop-blur-md p-3 rounded-lg flex flex-col items-start">
    <div className="flex items-center text-muted-foreground text-sm mb-1">
      {icon && <span className="mr-1.5">{icon}</span>}
      {label}
    </div>
    <span className={cn("text-xl font-semibold text-foreground", valueColor)}>
      {typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: value % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 }) : value}
      {unit}
    </span>
  </div>
);


export default function HistoryPage() {
  const { tradeHistory } = useTradeHistoryContext();
  const [selectedHistoryTradeMode, setSelectedHistoryTradeMode] = useState<HistoryTradeMode>('manual');

  const formatOptionalPrice = (price?: number) => price?.toFixed(2) ?? 'N/A';
  const formatOptionalNumber = (num?: number) => num?.toString() ?? 'N/A';
  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      return format(parseISO(isoString), "MM/dd/yy HH:mm:ss");
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const currentStats = useMemo(() => {
    return mockTradeStats[selectedHistoryTradeMode];
  }, [selectedHistoryTradeMode]);

  const displayedTradeHistory = useMemo(() => {
    return tradeHistory.filter(trade => (trade.tradeModeOrigin || 'manual') === selectedHistoryTradeMode);
  }, [tradeHistory, selectedHistoryTradeMode]);

  const buttonBaseClass = "flex-1 flex items-center justify-center h-9 py-2 px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-background disabled:opacity-50";
  const activeModeClass = "bg-primary text-primary-foreground shadow-sm";
  const inactiveModeClass = "bg-transparent text-muted-foreground hover:bg-panel/[.05] hover:text-foreground";


  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Trade History & Performance" />
      <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">

        <div className="grid grid-cols-3 w-full max-w-md rounded-md overflow-hidden border border-border/[.1] bg-panel/[.05] mx-auto">
          <button
            onClick={() => setSelectedHistoryTradeMode('manual')}
            className={cn(
              buttonBaseClass,
              selectedHistoryTradeMode === 'manual' ? activeModeClass : inactiveModeClass
            )}
          >
            <User className="mr-2 h-4 w-4" /> Manual
          </button>
          <button
            onClick={() => setSelectedHistoryTradeMode('aiAssist')}
            className={cn(
              buttonBaseClass,
              selectedHistoryTradeMode === 'aiAssist' ? activeModeClass : inactiveModeClass
            )}
          >
            <Bot className="mr-2 h-4 w-4" /> AI Assist
          </button>
          <button
            onClick={() => setSelectedHistoryTradeMode('autopilot')}
            className={cn(
              buttonBaseClass,
              selectedHistoryTradeMode === 'autopilot' ? activeModeClass : inactiveModeClass
            )}
          >
            <Cpu className="mr-2 h-4 w-4" /> Autopilot
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center">
              <BarChartHorizontalBig className="mr-2 h-5 w-5 text-primary"/>
              {selectedHistoryTradeMode === 'manual' ? 'Manual Trade Performance' : selectedHistoryTradeMode === 'aiAssist' ? 'AI Assisted Performance' : 'Autopilot Performance'}
            </CardTitle>
            <CardDescription>Summary of trades executed in this mode.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatDisplay label="Total Trades" value={currentStats.totalTrades} icon={<PackageOpen size={16}/>} />
            <StatDisplay label="Win Rate" value={currentStats.winRate} unit="%" icon={<TrendingUp size={16}/>} valueColor={currentStats.winRate >= 50 ? "text-[hsl(var(--confirm-green))]" : "text-destructive"} />
            <StatDisplay label="Total P&L" value={currentStats.totalPnL} unit="$" icon={<DollarSign size={16}/>} valueColor={currentStats.totalPnL >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive"} />
            <StatDisplay label="Avg Return / Trade" value={currentStats.avgReturn} unit="%" icon={<Percent size={16}/>} valueColor={currentStats.avgReturn >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive"} />
            <StatDisplay label="Largest Win" value={currentStats.largestWin} unit="$" icon={<TrendingUp size={16}/>} valueColor="text-[hsl(var(--confirm-green))]" />
            <StatDisplay label="Largest Loss" value={currentStats.largestLoss !== 0 ? currentStats.largestLoss : 0} unit="$" icon={<TrendingDown size={16}/>} valueColor={currentStats.largestLoss < 0 ? "text-destructive" : "text-foreground"} />
            <StatDisplay label="Avg. Hold Time" value={currentStats.avgHoldTime} icon={<Clock size={16}/>} />
          </CardContent>
        </Card>

        <Card className="flex-1 flex flex-col min-h-[400px]"> 
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center">
              <HistoryIcon className="mr-2 h-6 w-6 text-primary"/>
              Executed Trades
            </CardTitle>
            <CardDescription>
              Review your past trade executions for "{selectedHistoryTradeMode}" mode.
            </CardDescription>
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
                              "border-transparent",
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
                        <TableCell className="flex items-center space-x-1 text-foreground">
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
                <HistoryIcon className="h-12 w-12 mb-4" />
                <p className="text-lg">No trade history for "{selectedHistoryTradeMode}" mode.</p>
                <p>Executed trades will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

