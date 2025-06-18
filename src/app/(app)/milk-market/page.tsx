
"use client";

import React, { useState, useMemo, Suspense, useCallback } from 'react';
import { PageHeader } from "@/components/PageHeader";
import type { Stock, TradeRequest, OrderActionType, TradeMode, Account } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useTradeHistoryContext } from '@/contexts/TradeHistoryContext';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { OrderCard } from '@/components/OrderCard';
import { OpenPositionsCard } from '@/components/OpenPositionsCard';
import { InteractiveChartCard } from '@/components/InteractiveChartCard';
import { WatchlistCard } from '@/components/WatchlistCard';
import { NewsCard } from '@/components/NewsCard'; 
import { initialMockStocks } from '@/app/(app)/dashboard/page'; 
import { ScrollArea } from '@/components/ui/scroll-area';

function MilkMarketPageContent() {
  const { toast } = useToast();
  const { addTradeToHistory } = useTradeHistoryContext();
  const { addOpenPosition, selectedAccountId, setSelectedAccountId, accounts } = useOpenPositionsContext();

  // State for Watchlist selection (passed to Chart and potentially center OrderCard)
  const [leftWatchlistSelectedStock, setLeftWatchlistSelectedStock] = useState<Stock | null>(initialMockStocks[0] || null);


  // State for the right-hand OrderCard
  const [rightOrderCardSelectedStock, setRightOrderCardSelectedStock] = useState<Stock | null>(null);
  const [rightOrderCardActionType, setRightOrderCardActionType] = useState<OrderActionType | null>(null);
  const [rightOrderCardInitialTradeMode, setRightOrderCardInitialTradeMode] = useState<TradeMode | undefined>(undefined);
  const [rightOrderCardMiloActionContext, setRightOrderCardMiloActionContext] = useState<string | null>(null);

  const handleWatchlistStockSelection = useCallback((stock: Stock) => {
    setLeftWatchlistSelectedStock(stock); 
  }, []);

  const handleRightTradeSubmit = (tradeDetails: TradeRequest) => {
    console.log("Trade Submitted via Right Order Card:", tradeDetails);
    toast({
      title: "Trade Processing",
      description: `${tradeDetails.action} ${tradeDetails.quantity} ${tradeDetails.symbol} (${tradeDetails.orderType}) submitted. Origin: ${tradeDetails.tradeModeOrigin || 'manual'}`,
    });

    const stockInfo = rightOrderCardSelectedStock || initialMockStocks.find(s => s.symbol === tradeDetails.symbol);

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

  const handleRightClearOrderCard = () => {
    setRightOrderCardSelectedStock(null);
    setRightOrderCardActionType(null);
    setRightOrderCardInitialTradeMode(undefined);
    setRightOrderCardMiloActionContext(null);
  };
  
  const handleRightStockSymbolSubmitFromOrderCard = (symbol: string) => {
    const stockToSelect = initialMockStocks.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
    if (stockToSelect) {
      setRightOrderCardSelectedStock(stockToSelect); 
      setRightOrderCardActionType(null);
      setRightOrderCardInitialTradeMode(undefined);
      setRightOrderCardMiloActionContext(null);
      // setLeftWatchlistSelectedStock(stockToSelect); // Optionally update chart too
    } else {
       const newStock: Stock = { 
        id: symbol, symbol, name: `Info for ${symbol}`, price: 0, changePercent: 0, float:0, volume:0, lastUpdated: new Date().toISOString(), historicalPrices:[]
      };
      setRightOrderCardSelectedStock(newStock); 
      // setLeftWatchlistSelectedStock(newStock); // Optionally update chart too
      toast({
        variant: "default",
        title: "Ticker Loaded",
        description: `The ticker "${symbol.toUpperCase()}" was loaded into the trade panel. Price data may be limited.`,
      });
    }
  };

  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Milk Market" />
      <ScrollArea className="flex-1"> 
        <div className="p-4 md:p-6 h-full"> 
          <div className="grid grid-cols-1 md:grid-cols-[minmax(280px,20rem)_1fr_minmax(280px,26rem)] gap-4 md:gap-6 h-full">
            
            <div className="hidden md:flex flex-col h-full min-h-0 space-y-4 md:space-y-6">
              <WatchlistCard 
                selectedStockSymbol={leftWatchlistSelectedStock?.symbol || null} 
                onSelectStock={handleWatchlistStockSelection} 
                className="flex-1 min-h-0" 
              />
              <NewsCard className="flex-1 min-h-0" />
            </div>

            <div className="flex flex-col h-full min-h-0">
              <InteractiveChartCard 
                stock={leftWatchlistSelectedStock} 
                className="flex-1 min-h-0 h-full" 
              />
            </div>

            <div className="flex flex-col h-full min-h-0 space-y-6 pr-0 md:pr-1">
              <OrderCard
                selectedStock={rightOrderCardSelectedStock}
                initialActionType={rightOrderCardActionType}
                initialTradeMode={rightOrderCardInitialTradeMode}
                miloActionContextText={rightOrderCardMiloActionContext}
                onSubmit={handleRightTradeSubmit}
                onClear={handleRightClearOrderCard}
                onStockSymbolSubmit={handleRightStockSymbolSubmitFromOrderCard}
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
