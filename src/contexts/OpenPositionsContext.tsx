
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { OpenPosition, Stock } from '@/types'; // Assuming Stock type might be needed for currentPrice updates
import { useToast } from "@/hooks/use-toast"; // For notifications

// Helper to generate initial mock data for open positions
const MOCK_INITIAL_TIMESTAMP = '2024-07-01T10:00:00.000Z'; // from dashboard
const initialMockOpenPositions: OpenPosition[] = [
  { id: 'pos1', symbol: 'TSLA', entryPrice: 175.00, shares: 10, currentPrice: 180.01, origin: 'manual' },
  { id: 'pos2', symbol: 'AAPL', entryPrice: 168.50, shares: 20, currentPrice: 170.34, origin: 'aiAssist' },
  { id: 'pos3', symbol: 'NVDA', entryPrice: 890.00, shares: 5, currentPrice: 900.50, origin: 'fullyAI' },
  { id: 'pos4', symbol: 'MSFT', entryPrice: 425.00, shares: 15, currentPrice: 420.72, origin: 'manual' },
  { id: 'pos5', symbol: 'GOOGL', entryPrice: 138.00, shares: 25, currentPrice: 140.22, origin: 'aiAssist'},
  { id: 'pos6', symbol: 'AMD', entryPrice: 155.50, shares: 30, currentPrice: 160.75, origin: 'manual'},
];


interface OpenPositionsContextState {
  openPositions: OpenPosition[];
  addOpenPosition: (position: OpenPosition) => void;
  removeOpenPosition: (positionId: string) => void;
  updateOpenPositionPrice: (symbol: string, newPrice: number) => void;
  updateAllPositionsPrices: (stocks: Stock[]) => void;
}

const OpenPositionsContext = createContext<OpenPositionsContextState | undefined>(undefined);

export function OpenPositionsProvider({ children }: { children: ReactNode }) {
  const [openPositions, setOpenPositions] = useState<OpenPosition[]>(initialMockOpenPositions);
  const { toast } = useToast();

  const addOpenPosition = useCallback((position: OpenPosition) => {
    setOpenPositions(prevPositions => [position, ...prevPositions]);
    toast({
      title: "Position Opened",
      description: `${position.shares} shares of ${position.symbol} added to open positions. Origin: ${position.origin || 'manual'}`,
    });
  }, [toast]);

  const removeOpenPosition = useCallback((positionId: string) => {
    const positionToRemove = openPositions.find(p => p.id === positionId);
    setOpenPositions(prevPositions => prevPositions.filter(p => p.id !== positionId));
    if (positionToRemove) {
      toast({
        title: "Position Closed",
        description: `Position ${positionToRemove.symbol} (${positionToRemove.shares} shares) has been closed.`,
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
            : parseFloat((pos.currentPrice * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2)) // fallback if stock not in dashboard list
        };
      })
    );
  }, []);


  // Simulate price updates for open positions for the ticker bar if not driven by dashboard refresh
  // This is a simplified simulation. In a real app, this would come from a real-time data feed.
  useEffect(() => {
    const interval = setInterval(() => {
      setOpenPositions(prevPositions =>
        prevPositions.map(pos => ({
          ...pos,
          currentPrice: parseFloat((pos.currentPrice * (1 + (Math.random() - 0.5) * 0.005)).toFixed(2)) // Tiny random fluctuation
        }))
      );
    }, 5000); // Update every 5 seconds for ticker demonstration
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
