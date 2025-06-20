
"use client";

import React, { useState, useMemo, Suspense, useCallback, useEffect } from 'react';
import type { Stock, TradeRequest, OrderActionType, TradeMode, OrderSystemType, Account } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useTradeHistoryContext } from '@/contexts/TradeHistoryContext';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';

import { OrderCard } from '@/components/OrderCard';
import { InteractiveChartCard } from '@/components/InteractiveChartCard';
import { WatchlistCard } from '@/components/WatchlistCard';
import { NewsCard } from '@/components/NewsCard';
import { OrderBookCard } from '@/components/OrderBookCard';
import { OpenPositionsCard } from '@/components/OpenPositionsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrdersTable } from '@/components/market/OrdersTable';
import { TradeHistoryTable } from '@/components/market/TradeHistoryTable';

import { initialMockStocks } from '@/app/(app)/dashboard/page';

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
    // Optionally reset syncedTickerSymbol if desired:
    // handleSyncedTickerChange('AAPL');
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
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <div className="flex flex-col h-full p-1.5 gap-1.5">
        {/* Top section: Chart on left, TradePanel+Watchlist on right */}
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(280px,350px)] gap-1.5 flex-1 overflow-hidden">
          {/* Left Column for Chart */}
          <div className="overflow-hidden h-full">
            <InteractiveChartCard
              stock={stockForSyncedComps}
              onManualTickerSubmit={handleSyncedTickerChange}
              className="h-full"
            />
          </div>

          {/* Right Column for Trade Panel & Watchlist */}
          <div className="flex flex-col gap-1.5 overflow-hidden h-full">
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
              className="flex-1 min-h-0" // Takes up available space, min-h-0 allows shrinking
            />
            <WatchlistCard
              selectedStockSymbol={syncedTickerSymbol}
              onSelectStock={(stock) => handleSyncedTickerChange(stock.symbol)}
              className="h-[250px] flex-shrink-0" // Fixed height for watchlist
            />
          </div>
        </div>

        {/* Bottom Tab Panel (spans full width under the grid above) */}
        <div className="h-[280px] flex-shrink-0">
          <Tabs defaultValue="positions" className="h-full flex flex-col">
            <TabsList className="shrink-0">
              <TabsTrigger value="positions" className="text-xs px-3 py-1.5 h-auto">Positions</TabsTrigger>
              <TabsTrigger value="orders" className="text-xs px-3 py-1.5 h-auto">Orders</TabsTrigger>
              <TabsTrigger value="history" className="text-xs px-3 py-1.5 h-auto">History</TabsTrigger>
              <TabsTrigger value="news" className="text-xs px-3 py-1.5 h-auto">News</TabsTrigger>
              <TabsTrigger value="level2" className="text-xs px-3 py-1.5 h-auto">Level 2</TabsTrigger>
            </TabsList>
            <TabsContent value="positions" className="flex-1 overflow-hidden mt-1.5">
              <OpenPositionsCard className="h-full" />
            </TabsContent>
            <TabsContent value="orders" className="flex-1 overflow-hidden mt-1.5">
              <OrdersTable className="h-full" />
            </TabsContent>
            <TabsContent value="history" className="flex-1 overflow-hidden mt-1.5">
              <TradeHistoryTable className="h-full" syncedTickerSymbol={syncedTickerSymbol} />
            </TabsContent>
            <TabsContent value="news" className="flex-1 overflow-hidden mt-1.5">
              <NewsCard
                className="h-full"
                selectedTickerSymbol={syncedTickerSymbol}
                onTickerSelect={handleSyncedTickerChange}
              />
            </TabsContent>
            <TabsContent value="level2" className="flex-1 overflow-hidden mt-1.5">
              <OrderBookCard
                stock={stockForSyncedComps}
                className="h-full"
              />
            </TabsContent>
          </Tabs>
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
