
"use client";

import React, { useState, useMemo, Suspense, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { OrdersTable } from '@/components/market/OrdersTable';

import { initialMockStocks } from '@/app/(app)/trading/dashboard/page';
import { FundamentalsCard } from '@/components/FundamentalsCard';

function MilkMarketPageContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { addTradeToHistory } = useTradeHistoryContext();
  const { addOpenPosition, selectedAccountId, accounts } = useOpenPositionsContext();

  const [syncedTickerSymbol, setSyncedTickerSymbol] = useState<string>('AAPL');
  const [stockForSyncedComps, setStockForSyncedComps] = useState<Stock | null>(null);
  
  // States for OrderCard (Trade Panel)
  const [orderCardActionType, setOrderCardActionType] = useState<OrderActionType | null>(null);
  const [orderCardInitialTradeMode, setOrderCardInitialTradeMode] = useState<TradeMode | undefined>(undefined);
  const [orderCardMiloActionContext, setOrderCardMiloActionContext] = useState<string | null>(null);
  const [orderCardInitialQuantity, setOrderCardInitialQuantity] = useState<string | undefined>(undefined);
  const [orderCardInitialOrderType, setOrderCardInitialOrderType] = useState<OrderSystemType | undefined>(undefined);
  const [orderCardInitialLimitPrice, setOrderCardInitialLimitPrice] = useState<string | undefined>(undefined);

  // This effect will run whenever the search params change.
  useEffect(() => {
    const ticker = searchParams.get('ticker');
    const action = searchParams.get('action') as OrderActionType | null;
    const quantity = searchParams.get('quantity');
    const entryPrice = searchParams.get('entryPrice');
    const orderType = searchParams.get('orderType') as OrderSystemType | null;

    if (ticker) {
      handleSyncedTickerChange(ticker);

      if (action && quantity && entryPrice && orderType) {
        setOrderCardActionType(action);
        setOrderCardInitialQuantity(quantity);
        setOrderCardInitialOrderType(orderType);
        if (orderType === 'Limit') {
            setOrderCardInitialLimitPrice(entryPrice);
        } else {
            setOrderCardInitialLimitPrice(undefined);
        }
        setOrderCardInitialTradeMode('manual');
        setOrderCardMiloActionContext(`Trade plan loaded from Moo Alerts for ${ticker}.`);
        toast({
            title: "Trade Plan Loaded",
            description: `${action} ${quantity} shares of ${ticker} at ~$${entryPrice} loaded into trade panel.`
        });
      }
    }
  }, [searchParams]);

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
      toast({
          variant: "destructive",
          title: "Ticker Not Found",
          description: `Could not find data for "${syncedTickerSymbol}". Please check the symbol.`
      })
    }
  }, [syncedTickerSymbol, toast]);

  const handleSyncedTickerChange = useCallback((symbol: string) => {
    setSyncedTickerSymbol(symbol.toUpperCase());
    // Clear any previous trade-specific context when the ticker changes manually
    handleClearOrderCard();
  }, []);

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
  
  return (
    <main className="flex flex-col h-full overflow-hidden p-1.5 md:p-2.5 gap-1.5">
        <div className="grid grid-cols-[1fr_350px] gap-1.5 flex-1 overflow-hidden">
            
            {/* Main/Left Column */}
            <div className="flex flex-col flex-1 min-h-0 gap-1.5">
              <InteractiveChartCard
                stock={stockForSyncedComps}
                onManualTickerSubmit={handleSyncedTickerChange}
                className="flex-1 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
              />
              <div className="h-80 flex-shrink-0">
                <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)]">
                    <Tabs defaultValue="positions" className="flex flex-col h-full">
                        <TabsList className="shrink-0 px-3 pt-2">
                            <TabsTrigger value="positions">Positions</TabsTrigger>
                            <TabsTrigger value="orders">Open Orders</TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
                            <TabsTrigger value="news">News</TabsTrigger>
                        </TabsList>
                        <TabsContent value="positions" className="flex-1 overflow-hidden mt-0 p-0">
                            <OpenPositionsCard className="h-full border-0 shadow-none rounded-none bg-transparent" />
                        </TabsContent>
                         <TabsContent value="orders" className="flex-1 overflow-hidden mt-0 p-0">
                            <OrdersTable className="h-full border-0 shadow-none rounded-none bg-transparent" />
                        </TabsContent>
                        <TabsContent value="history" className="flex-1 overflow-hidden mt-0 p-0">
                            <TradeHistoryTable className="h-full border-0 shadow-none rounded-none bg-transparent" syncedTickerSymbol={syncedTickerSymbol} />
                        </TabsContent>
                        <TabsContent value="watchlist" className="flex-1 overflow-hidden mt-0 p-0">
                           <WatchlistCard
                                className="h-full border-0 shadow-none rounded-none bg-transparent"
                                selectedStockSymbol={syncedTickerSymbol}
                                onSelectStock={handleSyncedTickerChange}
                            />
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

            {/* Right Column (Trade Panel + Fundamentals) */}
            <div className="flex flex-col min-h-0 gap-1.5">
              <OrderCard
                selectedStock={stockForSyncedComps}
                initialActionType={orderCardActionType}
                initialTradeMode={orderCardInitialTradeMode}
                miloActionContextText={orderCardMiloActionContext}
                onSubmit={handleTradeSubmit}
                onClear={handleClearOrderCard}
                initialQuantity={orderCardInitialQuantity}
                initialOrderType={orderCardInitialOrderType}
                initialLimitPrice={orderCardInitialLimitPrice}
                className="flex-1 min-h-0 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
              />
              <FundamentalsCard 
                stock={stockForSyncedComps}
                className="h-80 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
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
