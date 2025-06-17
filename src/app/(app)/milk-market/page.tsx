
"use client";

import React, { useState, useMemo, Suspense, useCallback } from 'react';
import { PageHeader } from "@/components/PageHeader";
import type { Stock, TradeRequest, OrderActionType, TradeMode, Account } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useTradeHistoryContext } from '@/contexts/TradeHistoryContext';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { OrderCard } from '@/components/OrderCard';
import { OpenPositionsCard } from '@/components/OpenPositionsCard';
import { WatchlistCard } from '@/components/WatchlistCard';
import { InteractiveChartCard } from '@/components/InteractiveChartCard';
import { initialMockStocks } from '@/app/(app)/dashboard/page'; 
import { ScrollArea } from '@/components/ui/scroll-area';

function MilkMarketPageContent() {
  const { toast } = useToast();
  const { addTradeToHistory } = useTradeHistoryContext();
  const { openPositions, addOpenPosition, selectedAccountId, setSelectedAccountId, accounts } = useOpenPositionsContext();

  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [orderCardActionType, setOrderCardActionType] = useState<OrderActionType | null>(null);
  const [orderCardInitialTradeMode, setOrderCardInitialTradeMode] = useState<TradeMode | undefined>(undefined);
  const [orderCardMiloActionContext, setOrderCardMiloActionContext] = useState<string | null>(null);

  const handleStockSelection = useCallback((stock: Stock) => {
    setSelectedStock(stock);
    setOrderCardActionType(null); 
    setOrderCardInitialTradeMode(undefined); 
    setOrderCardMiloActionContext(null);
  }, []);

  const handleTradeSubmit = (tradeDetails: TradeRequest) => {
    console.log("Trade Submitted via Milk Market Order Card:", tradeDetails);
    toast({
      title: "Trade Processing",
      description: `${tradeDetails.action} ${tradeDetails.quantity} ${tradeDetails.symbol} (${tradeDetails.orderType}) submitted. Origin: ${tradeDetails.tradeModeOrigin || 'manual'}`,
    });

    const stockInfo = selectedStock || initialMockStocks.find(s => s.symbol === tradeDetails.symbol);

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
    setSelectedStock(null);
    setOrderCardActionType(null);
    setOrderCardInitialTradeMode(undefined);
    setOrderCardMiloActionContext(null);
  };
  
  const handleStockSymbolSubmitFromOrderCard = (symbol: string) => {
    const stockToSelect = initialMockStocks.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
    if (stockToSelect) {
      handleStockSelection(stockToSelect);
    } else {
       const newStock: Stock = { 
        id: symbol, symbol, name: `Info for ${symbol}`, price: 0, changePercent: 0, float:0, volume:0, lastUpdated: new Date().toISOString(), historicalPrices:[]
      };
      handleStockSelection(newStock);
      toast({
        variant: "default",
        title: "Ticker Loaded",
        description: `The ticker "${symbol.toUpperCase()}" was loaded. Price data may be limited.`,
      });
    }
  };

  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Milk Market" />
      <ScrollArea className="flex-1"> {/* Main scroll area for page content */}
        <div className="p-4 md:p-6 h-full"> {/* Padding for all content, ensure it fills ScrollArea */}
          <div className="grid grid-cols-1 md:grid-cols-[minmax(280px,20rem)_1fr_minmax(280px,26rem)] gap-4 md:gap-6 h-full">
            
            {/* Left Column: Watchlist */}
            <div className="hidden md:flex flex-col min-h-0 h-full">
              <WatchlistCard
                selectedStockSymbol={selectedStock?.symbol || null}
                onSelectStock={handleStockSelection}
                className="flex-1 min-h-0 h-full" 
              />
            </div>

            {/* Center Column: Interactive Chart */}
            <div className="flex flex-col min-h-0 h-full">
              <InteractiveChartCard
                stock={selectedStock}
                className="flex-1 min-h-0 h-full"
              />
            </div>

            {/* Right Column: Trade Panel + Open Positions */}
            <div className="flex flex-col space-y-6 min-h-0 h-full pr-0 md:pr-1">
              <OrderCard
                selectedStock={selectedStock}
                initialActionType={orderCardActionType}
                initialTradeMode={orderCardInitialTradeMode}
                miloActionContextText={orderCardMiloActionContext}
                onSubmit={handleTradeSubmit}
                onClear={handleClearOrderCard}
                onStockSymbolSubmit={handleStockSymbolSubmitFromOrderCard}
              />
              <OpenPositionsCard />
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

