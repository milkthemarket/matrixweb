
"use client";

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { Stock, TradeRequest, OrderActionType, TradeMode, TradeHistoryEntry, HistoryTradeMode } from "@/types";
import { cn } from '@/lib/utils';
import { useTradeHistoryContext } from '@/contexts/TradeHistoryContext';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { useToast } from "@/hooks/use-toast";
import { OrderCard } from '@/components/OrderCard';
import { OpenPositionsCard } from '@/components/OpenPositionsCard';
import { initialMockStocks } from '@/app/(app)/dashboard/page'; // Using mock stocks from dashboard for lookup
import { format, parseISO } from 'date-fns';
import { CheckCircle, XCircle, Clock, Edit, Activity, DollarSign } from "lucide-react";
import { MiloAvatarIcon } from '@/components/icons/MiloAvatarIcon';

const getStatusIcon = (status: TradeHistoryEntry['orderStatus']) => {
  switch (status) {
    case 'Filled': return <CheckCircle className="h-3.5 w-3.5 text-[hsl(var(--confirm-green))]" />;
    case 'Canceled': return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    case 'Pending': return <Clock className="h-3.5 w-3.5 text-yellow-500" />;
    default: return <Activity className="h-3.5 w-3.5 text-muted-foreground" />;
  }
};

const getOriginIcon = (origin?: HistoryTradeMode) => {
  if (origin === 'manual') return <Edit className="h-3.5 w-3.5 text-blue-400" title="Manual" />;
  if (origin === 'aiAssist') return <MiloAvatarIcon size={14} className="text-purple-400" title="AI Assist" />;
  if (origin === 'autopilot') return <DollarSign className="h-3.5 w-3.5 text-teal-400" title="Autopilot" />; // Placeholder, using DollarSign for now
  return <Edit className="h-3.5 w-3.5 text-muted-foreground" title="Manual" />;
};


function MilkMarketPageContent() {
  const { toast } = useToast();
  const { addTradeToHistory, tradeHistory } = useTradeHistoryContext();
  const { addOpenPosition, selectedAccountId } = useOpenPositionsContext();

  const [selectedStockForOrderCard, setSelectedStockForOrderCard] = useState<Stock | null>(null);
  const [orderCardActionType, setOrderCardActionType] = useState<OrderActionType | null>(null);
  const [orderCardInitialTradeMode, setOrderCardInitialTradeMode] = useState<TradeMode | undefined>(undefined);
  const [orderCardMiloActionContext, setOrderCardMiloActionContext] = useState<string | null>(null);

  const handleTradeSubmit = (tradeDetails: TradeRequest) => {
    console.log("Trade Submitted via Milk Market Order Card:", tradeDetails);
    toast({
      title: "Trade Processing",
      description: `${tradeDetails.action} ${tradeDetails.quantity} ${tradeDetails.symbol} (${tradeDetails.orderType}) submitted. Origin: ${tradeDetails.tradeModeOrigin || 'manual'}`,
    });

    const stockInfo = selectedStockForOrderCard || initialMockStocks.find(s => s.symbol === tradeDetails.symbol);

    addTradeToHistory({
      id: String(Date.now()),
      symbol: tradeDetails.symbol,
      side: tradeDetails.action,
      totalQty: tradeDetails.quantity,
      orderType: tradeDetails.orderType,
      limitPrice: tradeDetails.limitPrice,
      stopPrice: tradeDetails.stopPrice,
      trailAmount: tradeDetails.trailingOffset,
      TIF: tradeDetails.TIF || "Day",
      tradingHours: tradeDetails.allowExtendedHours ? "Include Extended Hours" : "Regular Market Hours Only",
      placedTime: new Date().toISOString(),
      filledTime: new Date(Date.now() + Math.random() * 2000 + 500).toISOString(), // Simulate fill delay
      orderStatus: "Filled",
      averagePrice: (tradeDetails.orderType === "Limit" && tradeDetails.limitPrice) ? tradeDetails.limitPrice : (stockInfo?.price || 0),
      tradeModeOrigin: tradeDetails.tradeModeOrigin || 'manual',
      accountId: tradeDetails.accountId || selectedAccountId,
    });
    
    if (tradeDetails.action === 'Buy' || tradeDetails.action === 'Short') {
        addOpenPosition({
            id: `pos${Date.now()}`,
            symbol: tradeDetails.symbol,
            entryPrice: stockInfo?.price || 0,
            shares: tradeDetails.quantity,
            currentPrice: stockInfo?.price || 0,
            origin: tradeDetails.tradeModeOrigin || 'manual',
            accountId: tradeDetails.accountId || selectedAccountId,
        });
    }
  };

  const handleClearOrderCard = () => {
    setSelectedStockForOrderCard(null);
    setOrderCardActionType(null);
    setOrderCardInitialTradeMode(undefined);
    setOrderCardMiloActionContext(null);
  };
  
  const handleStockSymbolSubmitFromOrderCard = (symbol: string) => {
    const stockToSelect = initialMockStocks.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
    if (stockToSelect) {
      setSelectedStockForOrderCard(stockToSelect);
      setOrderCardActionType(null);
      setOrderCardInitialTradeMode(undefined);
      setOrderCardMiloActionContext(null);
    } else {
      // Allow trading unknown ticker, OrderCard can handle it by not showing full stock info
      setSelectedStockForOrderCard({ 
        id: symbol, symbol, name: symbol, price: 0, changePercent: 0, float: 0, volume: 0, lastUpdated: new Date().toISOString() 
      });
      setOrderCardActionType(null);
      setOrderCardInitialTradeMode(undefined);
      setOrderCardMiloActionContext(null);
      toast({
        variant: "default",
        title: "Ticker Loaded",
        description: `The ticker "${symbol.toUpperCase()}" was loaded. Price data may not be available.`,
      });
    }
  };

  const recentTrades = useMemo(() => {
    return tradeHistory.slice(0, 7); // Show last 7 trades
  }, [tradeHistory]);


  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Milk Market" />
      <div className="flex flex-1 p-4 md:p-6 space-x-0 md:space-x-6 overflow-hidden">

        {/* Left Column */}
        <div className="flex-1 flex flex-col overflow-y-auto space-y-6 pr-1">
          <OpenPositionsCard />

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-headline text-foreground">Recent Trade Activity</CardTitle>
              <CardDescription>Your last 7 executed trades.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {recentTrades.length > 0 ? (
                <ScrollArea className="h-[300px] md:h-[350px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card/[.05] backdrop-blur-md z-10">
                      <TableRow>
                        <TableHead className="w-[20px] p-1 md:p-2"></TableHead>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Side</TableHead>
                        <TableHead className="text-right hidden md:table-cell">Qty</TableHead>
                        <TableHead className="text-right">Avg Price</TableHead>
                        <TableHead className="text-center hidden md:table-cell">Status</TableHead>
                        <TableHead className="text-right hidden lg:table-cell">Filled</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTrades.map((trade) => (
                        <TableRow key={trade.id} className="hover:bg-white/5">
                          <TableCell className="p-1 md:p-2">{getOriginIcon(trade.tradeModeOrigin)}</TableCell>
                          <TableCell className="font-medium text-foreground">{trade.symbol}</TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                "text-xs border-transparent",
                                trade.side === 'Buy' && 'bg-[hsl(var(--confirm-green))] text-[hsl(var(--confirm-green-foreground))] hover:bg-[hsl(var(--confirm-green))]/90',
                                trade.side === 'Sell' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                                trade.side === 'Short' && 'bg-yellow-500 text-yellow-950 hover:bg-yellow-500/90'
                              )}
                            >
                              {trade.side}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-foreground hidden md:table-cell">{trade.totalQty}</TableCell>
                          <TableCell className="text-right text-foreground">${trade.averagePrice.toFixed(2)}</TableCell>
                          <TableCell className="text-center hidden md:table-cell">
                            {getStatusIcon(trade.orderStatus)}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground hidden lg:table-cell">
                            {format(parseISO(trade.filledTime), "HH:mm:ss")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <div className="text-center text-sm text-muted-foreground py-10 px-6">
                  No recent trades to display.
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-3">
              <Link href="/history" className="w-full">
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 hover:text-primary-foreground">
                  View Full Trade History
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column */}
        <div className="w-full md:w-96 lg:w-[26rem] hidden md:flex flex-col flex-shrink-0 space-y-6 pr-1 overflow-y-auto">
          <OrderCard
            selectedStock={selectedStockForOrderCard}
            initialActionType={orderCardActionType}
            initialTradeMode={orderCardInitialTradeMode}
            miloActionContextText={orderCardMiloActionContext}
            onSubmit={handleTradeSubmit}
            onClear={handleClearOrderCard}
            onStockSymbolSubmit={handleStockSymbolSubmitFromOrderCard}
          />
        </div>
      </div>
    </main>
  );
}


export default function MilkMarketPage() {
  return (
    <Suspense fallback={<div>Loading Milk Market...</div>}>
      <MilkMarketPageContent />
    </Suspense>
  );
}

