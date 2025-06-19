
"use client";

import React, { useState, useMemo, Suspense, useCallback } from 'react';
// import { PageHeader } from "@/components/PageHeader"; // No longer needed
import type { Stock, TradeRequest, OrderActionType, TradeMode, Account, OrderSystemType } from "@/types";
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

// Import new card components
import { RecentAlertsCard } from '@/components/RecentAlertsCard';
import { StockDetailsCard } from '@/components/StockDetailsCard';
import { AccountSummaryCard } from '@/components/AccountSummaryCard';

function MilkMarketPageContent() {
  const { toast } = useToast();
  const { addTradeToHistory } = useTradeHistoryContext();
  const { addOpenPosition, selectedAccountId, setSelectedAccountId, accounts } = useOpenPositionsContext();

  const [leftWatchlistSelectedStock, setLeftWatchlistSelectedStock] = useState<Stock | null>(initialMockStocks[0] || null);

  // State for the right-hand OrderCard
  const [rightOrderCardSelectedStock, setRightOrderCardSelectedStock] = useState<Stock | null>(null);
  const [rightOrderCardActionType, setRightOrderCardActionType] = useState<OrderActionType | null>(null);
  const [rightOrderCardInitialTradeMode, setRightOrderCardInitialTradeMode] = useState<TradeMode | undefined>(undefined);
  const [rightOrderCardMiloActionContext, setRightOrderCardMiloActionContext] = useState<string | null>(null);
  const [rightOrderCardInitialQuantity, setRightOrderCardInitialQuantity] = useState<string | undefined>(undefined);
  const [rightOrderCardInitialOrderType, setRightOrderCardInitialOrderType] = useState<OrderSystemType | undefined>(undefined);
  const [rightOrderCardInitialLimitPrice, setRightOrderCardInitialLimitPrice] = useState<string | undefined>(undefined);


  const handleWatchlistStockSelection = useCallback((stock: Stock) => {
    setLeftWatchlistSelectedStock(stock); 

    setRightOrderCardSelectedStock(stock);
    setRightOrderCardActionType(null);
    setRightOrderCardInitialTradeMode(undefined);
    setRightOrderCardMiloActionContext(null);
    setRightOrderCardInitialQuantity(undefined);
    setRightOrderCardInitialOrderType(undefined);
    setRightOrderCardInitialLimitPrice(undefined);
  }, []);

  const handleRightTradeSubmit = (tradeDetails: TradeRequest) => {
    console.log("Trade Submitted via Right Order Card:", tradeDetails);
    toast({
      title: "Trade Processing",
      description: `${tradeDetails.action} ${tradeDetails.quantity} ${tradeDetails.symbol} (${tradeDetails.orderType}) submitted. Origin: ${tradeDetails.tradeModeOrigin || 'manual'} for account ${tradeDetails.accountId}`,
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
    setRightOrderCardSelectedStock(null);
    setRightOrderCardActionType(null);
    setRightOrderCardInitialTradeMode(undefined);
    setRightOrderCardMiloActionContext(null);
    setRightOrderCardInitialQuantity(undefined);
    setRightOrderCardInitialOrderType(undefined);
    setRightOrderCardInitialLimitPrice(undefined);
  };
  
  const handleRightStockSymbolSubmitFromOrderCard = (symbol: string) => {
    const stockToSelect = initialMockStocks.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
    if (stockToSelect) {
      setLeftWatchlistSelectedStock(stockToSelect); 
      setRightOrderCardSelectedStock(stockToSelect);
      setRightOrderCardActionType(null);
      setRightOrderCardInitialTradeMode(undefined);
      setRightOrderCardMiloActionContext(null);
      setRightOrderCardInitialQuantity(undefined);
      setRightOrderCardInitialOrderType(undefined);
      setRightOrderCardInitialLimitPrice(undefined);
    } else {
       const newStock: Stock = { 
        id: symbol, symbol, name: `Info for ${symbol}`, price: 0, changePercent: 0, float:0, volume:0, lastUpdated: new Date().toISOString(), historicalPrices:[]
      };
      setLeftWatchlistSelectedStock(newStock); 
      setRightOrderCardSelectedStock(newStock);
      setRightOrderCardInitialQuantity(undefined);
      setRightOrderCardInitialOrderType(undefined);
      setRightOrderCardInitialLimitPrice(undefined);
      toast({
        variant: "default",
        title: "Ticker Loaded",
        description: `The ticker "${symbol.toUpperCase()}" was loaded. Price data may be limited.`,
      });
    }
  };

  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      {/* <PageHeader title="Milk Market" /> Removed */}
      <ScrollArea className="flex-1"> 
        <div className="p-4 md:p-6">
          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-[minmax(280px,20rem)_1fr_minmax(280px,26rem)] md:grid-rows-[auto_1fr_auto] gap-x-4 md:gap-x-6 gap-y-4 md:gap-y-6">
            
            {/* Row 1: New Cards */}
            <div className="flex flex-col md:col-start-1">
              <RecentAlertsCard className="h-full" />
            </div>
            <div className="flex flex-col md:col-start-2">
              <StockDetailsCard stock={leftWatchlistSelectedStock} className="h-full" />
            </div>
            <div className="flex flex-col md:col-start-3">
              <AccountSummaryCard className="h-full" />
            </div>

            {/* Row 2: Watchlist, Chart, OrderPanel */}
            <div className="flex flex-col h-full md:row-start-2 md:col-start-1">
              <WatchlistCard 
                selectedStockSymbol={leftWatchlistSelectedStock?.symbol || null} 
                onSelectStock={handleWatchlistStockSelection} 
                className="flex-1 min-h-0"
              />
            </div>
            <div className="flex flex-col h-full md:row-start-2 md:col-start-2">
              <InteractiveChartCard 
                stock={leftWatchlistSelectedStock} 
                className="flex-1 min-h-0" 
              />
            </div>
            <div className="flex flex-col h-full md:row-start-2 md:col-start-3">
                <OrderCard
                    selectedStock={rightOrderCardSelectedStock}
                    initialActionType={rightOrderCardActionType}
                    initialTradeMode={rightOrderCardInitialTradeMode}
                    miloActionContextText={rightOrderCardMiloActionContext}
                    onSubmit={handleRightTradeSubmit}
                    onClear={handleRightClearOrderCard}
                    onStockSymbolSubmit={handleRightStockSymbolSubmitFromOrderCard}
                    initialQuantity={rightOrderCardInitialQuantity}
                    initialOrderType={rightOrderCardInitialOrderType}
                    initialLimitPrice={rightOrderCardInitialLimitPrice}
                    className="flex-1 min-h-0" 
                />
            </div>
            
            {/* Row 3: News Card, OpenPositions */}
            <div className="flex flex-col md:row-start-3 md:col-start-1 md:col-span-2">
              <NewsCard className="h-full md:h-96" />
            </div>
            <div className="flex flex-col md:row-start-3 md:col-start-3">
                <OpenPositionsCard className="h-full md:h-96" /> 
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

    
