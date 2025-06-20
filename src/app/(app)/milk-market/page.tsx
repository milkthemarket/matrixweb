
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
import { initialMockStocks } from '@/app/(app)/dashboard/page';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OrderBookCard } from '@/components/OrderBookCard';
import { OpenPositionsCard } from '@/components/OpenPositionsCard'; // Added for the bottom row

function MilkMarketPageContent() {
  const { toast } = useToast();
  const { addTradeToHistory } = useTradeHistoryContext();
  const { addOpenPosition, selectedAccountId, accounts } = useOpenPositionsContext();

  // Central state for the ticker symbol to sync components
  const [syncedTickerSymbol, setSyncedTickerSymbol] = useState<string>('AAPL'); // Default to AAPL
  const [stockForSyncedComps, setStockForSyncedComps] = useState<Stock | null>(null);

  // Derive the full stock object when syncedTickerSymbol changes
  useEffect(() => {
    const stockData = initialMockStocks.find(s => s.symbol.toUpperCase() === syncedTickerSymbol.toUpperCase());
    if (stockData) {
      setStockForSyncedComps(stockData);
    } else {
      // Handle case where ticker might not be in initialMockStocks (e.g., manually entered)
      // For now, we'll create a basic stock object or show a 'not found' state in components
      setStockForSyncedComps({
        id: syncedTickerSymbol,
        symbol: syncedTickerSymbol,
        name: `Data for ${syncedTickerSymbol}`,
        price: 0, // Placeholder
        changePercent: 0, // Placeholder
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

  // --- Props for OrderCard (re-added) ---
  const [rightOrderCardActionType, setRightOrderCardActionType] = useState<OrderActionType | null>(null);
  const [rightOrderCardInitialTradeMode, setRightOrderCardInitialTradeMode] = useState<TradeMode | undefined>(undefined);
  const [rightOrderCardMiloActionContext, setRightOrderCardMiloActionContext] = useState<string | null>(null);
  const [rightOrderCardInitialQuantity, setRightOrderCardInitialQuantity] = useState<string | undefined>(undefined);
  const [rightOrderCardInitialOrderType, setRightOrderCardInitialOrderType] = useState<OrderSystemType | undefined>(undefined);
  const [rightOrderCardInitialLimitPrice, setRightOrderCardInitialLimitPrice] = useState<string | undefined>(undefined);


  const handleRightTradeSubmit = (tradeDetails: TradeRequest) => {
    console.log("Trade Submitted via Right Order Card:", tradeDetails);
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

  const handleRightClearOrderCard = () => {
    // When clearing order card, we might want to reset the synced ticker or not.
    // For now, clearing the order card specific states.
    setRightOrderCardActionType(null);
    setRightOrderCardInitialTradeMode(undefined);
    setRightOrderCardMiloActionContext(null);
    setRightOrderCardInitialQuantity(undefined);
    setRightOrderCardInitialOrderType(undefined);
    setRightOrderCardInitialLimitPrice(undefined);
    // Optionally, reset the main synced ticker:
    // handleSyncedTickerChange('AAPL'); // Or to null
  };
  
  // This function is now effectively handleSyncedTickerChange for OrderCard's symbol input
  const handleRightStockSymbolSubmitFromOrderCard = (symbol: string) => {
    handleSyncedTickerChange(symbol); // This will update stockForSyncedComps
    setRightOrderCardActionType(null);
    setRightOrderCardInitialTradeMode(undefined);
    setRightOrderCardMiloActionContext(null);
    setRightOrderCardInitialQuantity(undefined);
    setRightOrderCardInitialOrderType(undefined);
    setRightOrderCardInitialLimitPrice(undefined);
  };


  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-1 md:p-1.5 space-y-1 md:space-y-1.5">
          {/* Main Grid - (Watchlist, Chart, Trade Panel) */}
          <div className="grid grid-cols-1 md:grid-cols-[minmax(280px,20rem)_1fr_minmax(280px,26rem)] gap-x-1 md:gap-x-1.5 gap-y-1 md:gap-y-1.5">
            
            {/* === COLUMN 1: Watchlist === */}
             <div className="flex flex-col gap-1 md:gap-1.5 md:col-start-1 md:row-start-1 md:row-span-2">
                <div className="flex-1 flex flex-col min-h-[300px]">
                    <WatchlistCard
                        selectedStockSymbol={syncedTickerSymbol} // Use synced ticker to highlight
                        onSelectStock={(stock) => handleSyncedTickerChange(stock.symbol)}
                        className="flex-1"
                    />
                </div>
            </div>

            {/* === COLUMN 2: Chart === */}
            <div className="flex flex-col h-full md:col-start-2 md:row-start-1 md:row-span-2">
              <InteractiveChartCard
                stock={stockForSyncedComps} // Pass the derived stock object
                onManualTickerSubmit={handleSyncedTickerChange} // Chart input updates central ticker
                className="flex-1 min-h-[300px] md:min-h-0"
              />
            </div>

            {/* === COLUMN 3: Order Panel (Re-added) === */}
            <div className="flex flex-col md:col-start-3 md:row-start-1 md:row-span-2 min-h-[300px]">
                <OrderCard
                    selectedStock={stockForSyncedComps} // Pass the derived stock object
                    initialActionType={rightOrderCardActionType}
                    initialTradeMode={rightOrderCardInitialTradeMode}
                    miloActionContextText={rightOrderCardMiloActionContext}
                    onSubmit={handleRightTradeSubmit}
                    onClear={handleRightClearOrderCard}
                    onStockSymbolSubmit={handleRightStockSymbolSubmitFromOrderCard}
                    initialQuantity={rightOrderCardInitialQuantity}
                    initialOrderType={rightOrderCardInitialOrderType}
                    initialLimitPrice={rightOrderCardInitialLimitPrice}
                    className="flex-1"
                />
            </div>
          </div>

          {/* Row for News, OrderBook, OpenPositions */}
          <div className="flex flex-col md:flex-row gap-1 md:gap-1.5 w-full">
            {/* Item 1: NewsCard */}
            <div className="flex-1 min-w-0 md:basis-1/3 flex flex-col h-[400px]">
              <NewsCard
                selectedTickerSymbol={syncedTickerSymbol}
                onTickerSelect={handleSyncedTickerChange} // News clicks update central ticker
                className="flex-1" // Make card take full height of this div
              />
            </div>
            {/* Item 2: OrderBookCard */}
            <div className="flex-1 min-w-0 md:basis-1/3 flex flex-col h-[400px]">
                <OrderBookCard
                  stock={stockForSyncedComps} // Pass the derived stock object
                  className="flex-1" // Make card take full height of this div
                />
            </div>
            {/* Item 3: OpenPositionsCard */}
            <div className="flex-1 min-w-0 md:basis-1/3 flex flex-col h-[400px]">
                <OpenPositionsCard className="flex-1" /> {/* Make card take full height of this div */}
            </div>
          </div>

        </div>
      </ScrollArea>
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
