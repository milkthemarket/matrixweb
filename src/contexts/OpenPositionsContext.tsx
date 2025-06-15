
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { OpenPosition, Stock, Account } from '@/types';
import { useToast } from "@/hooks/use-toast";

// Define dummy accounts here to be accessible by both context and OrderCard
export const dummyAccounts: Account[] = [
  {
    id: 'acc-001',
    label: 'Taxable Margin',
    type: 'margin',
    number: '•••8740',
    balance: 9500.20,
    buyingPower: 12000.00,
  },
  {
    id: 'acc-002',
    label: 'Roth IRA',
    type: 'ira',
    number: '•••1234',
    balance: 15220.55,
    buyingPower: 15220.55,
  },
  {
    id: 'acc-003',
    label: 'Paper Account',
    type: 'paper',
    number: 'Demo',
    balance: 100000.00,
    buyingPower: 100000.00,
  },
];

const initialMockOpenPositions: OpenPosition[] = [
  { id: 'pos1', symbol: 'TSLA', entryPrice: 175.00, shares: 10, currentPrice: 180.01, origin: 'manual', accountId: 'acc-001' },
  { id: 'pos2', symbol: 'AAPL', entryPrice: 168.50, shares: 20, currentPrice: 170.34, origin: 'aiAssist', accountId: 'acc-001' },
  { id: 'pos3', symbol: 'NVDA', entryPrice: 890.00, shares: 5, currentPrice: 900.50, origin: 'autopilot', accountId: 'acc-002' }, // Changed from fullyAI to autopilot
  { id: 'pos4', symbol: 'MSFT', entryPrice: 425.00, shares: 15, currentPrice: 420.72, origin: 'manual', accountId: 'acc-002' },
  { id: 'pos5', symbol: 'GOOGL', entryPrice: 138.00, shares: 25, currentPrice: 140.22, origin: 'aiAssist', accountId: 'acc-003'},
  { id: 'pos6', symbol: 'AMD', entryPrice: 155.50, shares: 30, currentPrice: 160.75, origin: 'manual', accountId: 'acc-003'},
  { id: 'pos7', symbol: 'SPY', entryPrice: 540.00, shares: 10, currentPrice: 547.80, origin: 'autopilot', accountId: 'acc-001'},
];


interface OpenPositionsContextState {
  openPositions: OpenPosition[];
  addOpenPosition: (position: OpenPosition) => void;
  removeOpenPosition: (positionId: string) => void;
  updateOpenPositionPrice: (symbol: string, newPrice: number) => void;
  updateAllPositionsPrices: (stocks: Stock[]) => void;
  selectedAccountId: string;
  setSelectedAccountId: (id: string) => void;
  accounts: Account[];
}

const OpenPositionsContext = createContext<OpenPositionsContextState | undefined>(undefined);

export function OpenPositionsProvider({ children }: { children: ReactNode }) {
  const [openPositions, setOpenPositions] = useState<OpenPosition[]>(initialMockOpenPositions);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(dummyAccounts[0].id);
  const { toast } = useToast();

  const addOpenPosition = useCallback((position: OpenPosition) => {
    // Ensure new positions are associated with the currently selected account
    const positionWithAccount = { ...position, accountId: selectedAccountId };
    setOpenPositions(prevPositions => [positionWithAccount, ...prevPositions]);
    toast({
      title: "Position Opened",
      description: `${positionWithAccount.shares} shares of ${positionWithAccount.symbol} added to account ${dummyAccounts.find(acc => acc.id === selectedAccountId)?.label}. Origin: ${positionWithAccount.origin || 'manual'}`,
    });
  }, [toast, selectedAccountId]);

  const removeOpenPosition = useCallback((positionId: string) => {
    const positionToRemove = openPositions.find(p => p.id === positionId);
    setOpenPositions(prevPositions => prevPositions.filter(p => p.id !== positionId));
    if (positionToRemove) {
      toast({
        title: "Position Closed",
        description: `Position ${positionToRemove.symbol} (${positionToRemove.shares} shares) from account ${dummyAccounts.find(acc => acc.id === positionToRemove.accountId)?.label} has been closed.`,
        variant: "destructive"
      });
    }
  }, [openPositions, toast]);

  const updateOpenPositionPrice = useCallback((symbol: string, newPrice: number) => {
    setOpenPositions(prevPositions =>
      prevPositions.map(pos =>
        pos.symbol === symbol ? { ...pos, currentPrice: newPrice } : pos
      )
    );
  }, []);

  const updateAllPositionsPrices = useCallback((stocks: Stock[]) => {
     setOpenPositions(prevPositions =>
      prevPositions.map(pos => {
        const stockForPosition = stocks.find(s => s.symbol === pos.symbol);
        return {
          ...pos,
          currentPrice: stockForPosition
            ? stockForPosition.price
            : parseFloat((pos.currentPrice * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2)) // fallback
        };
      })
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOpenPositions(prevPositions =>
        prevPositions.map(pos => ({
          ...pos,
          currentPrice: parseFloat((pos.currentPrice * (1 + (Math.random() - 0.5) * 0.0005)).toFixed(2)) // even smaller fluctuation
        }))
      );
    }, 7500); 
    return () => clearInterval(interval);
  }, []);


  return (
    <OpenPositionsContext.Provider
      value={{
        openPositions,
        addOpenPosition,
        removeOpenPosition,
        updateOpenPositionPrice,
        updateAllPositionsPrices,
        selectedAccountId,
        setSelectedAccountId,
        accounts: dummyAccounts, // Provide accounts through context
      }}
    >
      {children}
    </OpenPositionsContext.Provider>
  );
}

export function useOpenPositionsContext() {
  const context = useContext(OpenPositionsContext);
  if (context === undefined) {
    throw new Error('useOpenPositionsContext must be used within an OpenPositionsProvider');
  }
  return context;
}
