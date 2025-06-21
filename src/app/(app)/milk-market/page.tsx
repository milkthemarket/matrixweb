
"use client";

import React, { useState, useMemo, Suspense, useCallback, useEffect } from 'react';
import type { Stock, TradeRequest, OrderActionType, TradeMode, OrderSystemType, Account } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useTradeHistoryContext } from '@/contexts/TradeHistoryContext';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';

import { OrderCard } from '@/components/OrderCard';
import { Card } from '@/components/ui/card';
import { InteractiveChartCard } from '@/components/InteractiveChartCard';
import { WatchlistCard } from '@/components/WatchlistCard';
import { NewsCard } from '@/components/NewsCard';
import { OpenPositionsCard } from '@/components/OpenPositionsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TradeHistoryTable } from '@/components/market/TradeHistoryTable';

import { initialMockStocks } from '@/app/(app)/dashboard/page';
import { FundamentalsCard } from '@/components/FundamentalsCard';
import { OrderBookCard } from '@/components/OrderBookCard';

function MilkMarketPageContent() {
  const { toast } = useToast();
  const { addTradeToHistory } = useTradeHistoryContext();
  const { addOpenPosition, selectedAccountId, accounts } = useOpenPositionsContext();

  const [syncedTickerSymbol, setSyncedTickerSymbol] = useState<string>('AAPL');
  const [stockForSyncedComps, setStockForSyncedComps] = useState<Stock | null>(null);

  useEffect(() => {
    const stockData = initialMockStocks.find(s => s.symbol.toUpperCase() === syncedTickerSymbol.toUpperCase());
    if (stockData) {
      setStockForSyncedComps(stockData);
    } else {
      setStockForSyncedComps({
        id: syncedTickerSymbol,
        symbol: syncedTickerSymbol,
        name: `Data for ${syncedTickerSymbol}`,
        price: 0,
        changePercent: 0,
        float: 0,
        volume: 0,
        lastUpdated: new Date().toISOString(),
        historicalPrices: []
      });
    }
  }, [syncedTickerSymbol]);

  const handleSyncedTickerChange = useCallback((symbol: string) => {
    setSyncedTickerSymbol(symbol.toUpperCase());
  }, []);

  // States for OrderCard (Trade Panel)
  const [orderCardActionType, setOrderCardActionType] = useState<OrderActionType | null>(null);
  const [orderCardInitialTradeMode, setOrderCardInitialTradeMode] = useState<TradeMode | undefined>(undefined);
  const [orderCardMiloActionContext, setOrderCardMiloActionContext] = useState<string | null>(null);
  const [orderCardInitialQuantity, setOrderCardInitialQuantity] = useState<string | undefined>(undefined);
  const [orderCardInitialOrderType, setOrderCardInitialOrderType] = useState<OrderSystemType | undefined>(undefined);
  const [orderCardInitialLimitPrice, setOrderCardInitialLimitPrice] = useState<string | undefined>(undefined);

  const handleTradeSubmit = (tradeDetails: TradeRequest) => {
    console.log("Trade Submitted via Order Card:", tradeDetails);
    toast({
      title: "Trade Processing",
      description: `${tradeDetails.action} ${tradeDetails.quantity} ${tradeDetails.symbol} (${tradeDetails.orderType}) submitted. Origin: ${tradeDetails.tradeModeOrigin || 'manual'} for account ${tradeDetails.accountId}`,
    });
    const stockInfo = stockForSyncedComps?.symbol === tradeDetails.symbol ? stockForSyncedComps : initialMockStocks.find(s => s.symbol === tradeDetails.symbol);
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
      filledTime: new Date(Date.now() + Math.random() * 2000 + 500).toISOString(),
      orderStatus: "Filled",
      averagePrice: (tradeDetails.orderType === "Limit" && tradeDetails.limitPrice) ? tradeDetails.limitPrice : (stockInfo?.price || 0),
      tradeModeOrigin: tradeDetails.tradeModeOrigin || 'manual',
      accountId: tradeDetails.accountId || selectedAccountId,
      takeProfit: tradeDetails.takeProfit,
      stopLoss: tradeDetails.stopLoss,
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
    setOrderCardActionType(null);
    setOrderCardInitialTradeMode(undefined);
    setOrderCardMiloActionContext(null);
    setOrderCardInitialQuantity(undefined);
    setOrderCardInitialOrderType(undefined);
    setOrderCardInitialLimitPrice(undefined);
  };
  
  const handleStockSymbolSubmitFromOrderCard = (symbol: string) => {
    handleSyncedTickerChange(symbol);
    setOrderCardActionType(null);
    setOrderCardInitialTradeMode(undefined);
    setOrderCardMiloActionContext(null);
    setOrderCardInitialQuantity(undefined);
    setOrderCardInitialOrderType(undefined);
    setOrderCardInitialLimitPrice(undefined);
  };

  return (
    <main className="flex flex-col h-full overflow-hidden p-1.5 md:p-2.5 gap-1.5">
        <div className="grid grid-cols-[1fr_350px_300px] gap-1.5 flex-1 overflow-hidden">
            
            {/* Main/Left Column */}
            <div className="flex flex-col flex-1 min-h-0 gap-1.5">
              <InteractiveChartCard
                stock={stockForSyncedComps}
                onManualTickerSubmit={handleSyncedTickerChange}
                className="flex-1 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
              />
              <div className="h-[284px] flex-shrink-0">
                <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)]">
                    <Tabs defaultValue="positions" className="flex flex-col h-full">
                        <TabsList className="shrink-0 px-3 pt-2">
                            <TabsTrigger value="positions">Positions</TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                            <TabsTrigger value="news">News</TabsTrigger>
                        </TabsList>
                        <TabsContent value="positions" className="flex-1 overflow-hidden mt-0 p-0">
                            <OpenPositionsCard className="h-full border-0 shadow-none rounded-none bg-transparent" />
                        </TabsContent>
                        <TabsContent value="history" className="flex-1 overflow-hidden mt-0 p-0">
                            <TradeHistoryTable className="h-full border-0 shadow-none rounded-none bg-transparent" syncedTickerSymbol={syncedTickerSymbol} />
                        </TabsContent>
                        <TabsContent value="news" className="flex-1 overflow-hidden mt-0 p-0">
                            <NewsCard
                                className="h-full border-0 shadow-none rounded-none bg-transparent"
                                selectedTickerSymbol={syncedTickerSymbol}
                                onTickerSelect={handleSyncedTickerChange}
                            />
                        </TabsContent>
                    </Tabs>
                </Card>
              </div>
            </div>

            {/* Center Column (Trade Panel + Fundamentals) */}
            <div className="flex flex-col min-h-0 gap-1.5">
              <OrderCard
                selectedStock={stockForSyncedComps}
                initialActionType={orderCardActionType}
                initialTradeMode={orderCardInitialTradeMode}
                miloActionContextText={orderCardMiloActionContext}
                onSubmit={handleTradeSubmit}
                onClear={handleClearOrderCard}
                onStockSymbolSubmit={handleStockSymbolSubmitFromOrderCard}
                initialQuantity={orderCardInitialQuantity}
                initialOrderType={orderCardInitialOrderType}
                initialLimitPrice={orderCardInitialLimitPrice}
                className="flex-1 min-h-0 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
              />
              <FundamentalsCard 
                stock={stockForSyncedComps}
                className="h-72 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
              />
            </div>

             {/* Right Column */}
             <div className="flex flex-col min-h-0 gap-1.5">
                <WatchlistCard
                    selectedStockSymbol={syncedTickerSymbol}
                    onSelectStock={(stock) => handleSyncedTickerChange(stock.symbol)}
                    className="flex-1 min-h-0 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
                />
                <OrderBookCard
                    stock={stockForSyncedComps}
                    className="h-72 flex-shrink-0 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
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
