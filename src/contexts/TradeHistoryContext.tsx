
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { TradeHistoryEntry } from '@/types';

// Mock data as provided
const initialMockTradeHistory: TradeHistoryEntry[] = [
  {
    id: 'th1',
    symbol: "RBNE",
    side: "Sell",
    totalQty: 5228,
    limitPrice: 11.05,
    stopPrice: undefined, // Or make it optional in type
    trailAmount: undefined, // Or make it optional in type
    orderType: "Limit",
    TIF: "Day",
    tradingHours: "Include Extended Hours",
    placedTime: "2025-06-13T17:53:25Z",
    filledTime: "2025-06-13T17:53:28Z",
    orderStatus: "Filled",
    averagePrice: 11.13
  },
  {
    id: 'th2',
    symbol: "RBNE",
    side: "Sell",
    totalQty: 6970,
    limitPrice: 11.05,
    stopPrice: undefined,
    trailAmount: undefined,
    orderType: "Limit",
    TIF: "Day",
    tradingHours: "Include Extended Hours",
    placedTime: "2025-06-13T17:53:10Z",
    filledTime: "2025-06-13T17:53:13Z",
    orderStatus: "Filled",
    averagePrice: 11.05
  },
  {
    id: 'th3',
    symbol: "RBNE",
    side: "Sell",
    totalQty: 5502,
    limitPrice: 11.06,
    stopPrice: undefined,
    trailAmount: undefined,
    orderType: "Limit",
    TIF: "Day",
    tradingHours: "Include Extended Hours",
    placedTime: "2025-06-13T17:52:57Z",
    filledTime: "2025-06-13T17:53:03Z",
    orderStatus: "Filled",
    averagePrice: 11.06
  }
];


interface TradeHistoryContextState {
  tradeHistory: TradeHistoryEntry[];
  addTradeToHistory: (trade: TradeHistoryEntry) => void;
}

const TradeHistoryContext = createContext<TradeHistoryContextState | undefined>(undefined);

export function TradeHistoryProvider({ children }: { children: ReactNode }) {
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryEntry[]>(initialMockTradeHistory);

  const addTradeToHistory = useCallback((trade: TradeHistoryEntry) => {
    setTradeHistory(prevHistory => [trade, ...prevHistory]); // Add new trade to the beginning
  }, []);

  return (
    <TradeHistoryContext.Provider
      value={{
        tradeHistory,
        addTradeToHistory
      }}
    >
      {children}
    </TradeHistoryContext.Provider>
  );
}

export function useTradeHistoryContext() {
  const context = useContext(TradeHistoryContext);
  if (context === undefined) {
    throw new Error('useTradeHistoryContext must be used within a TradeHistoryProvider');
  }
  return context;
}

