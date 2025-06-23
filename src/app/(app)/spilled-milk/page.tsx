
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InteractiveChartCard } from '@/components/InteractiveChartCard';
import type { Stock, Trade } from '@/types';
import { initialMockStocks } from '@/app/(app)/dashboard/page';
import { useToast } from "@/hooks/use-toast";

export default function SpilledMilkPage() {
  const { toast } = useToast();

  // State management for the chart, same as in Milk Market
  const [syncedTickerSymbol, setSyncedTickerSymbol] = useState<string>('AAPL');
  const [stockForChart, setStockForChart] = useState<Stock | null>(null);

  useEffect(() => {
    const stockData = initialMockStocks.find(s => s.symbol.toUpperCase() === syncedTickerSymbol.toUpperCase());
    if (stockData) {
      setStockForChart(stockData);
    } else {
      // Create a dummy object to pass to the chart if stock not found
      setStockForChart({
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
  }, []);

  // Added a flex container around the main content to control layout
  const mockTradeHistory: Trade[] = [
    {
      date: '2023-10-26',
      ticker: 'AAPL',
      action: 'Buy',
      quantity: 10,
      price: 168.00,
      profitLoss: -5.00,
    },
    {
      date: '2023-10-25',
      ticker: 'GOOGL',
      action: 'Sell',
      quantity: 5,
      price: 135.50,
      profitLoss: 10.25,
    },
    // Add more mock trades as needed
  ];
  // Chart takes 3/4 of the width (flex-3) and the original content takes 1/4 (flex-1)
  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Spilled Milk" />
      <div className="flex-1 p-2 md:p-4 overflow-hidden flex">

        {/* Chart from Milk Market, with a consistent height */}
        <div className="h-full min-h-[400px] flex-3 p-2 overflow-y-auto">
          <InteractiveChartCard
            stock={stockForChart}
            onManualTickerSubmit={handleSyncedTickerChange}
            className="h-full"
          />
        </div>
        
        {/* New blank card */}
        <div className="flex-1 p-2 overflow-y-auto">
          <Card className="w-full bg-black/20 border border-white/10 shadow-xl mb-4">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary">
                Trade History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Trade Date
                    </th>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Ticker
                    </th>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      P/L
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {/* Placeholder rows */}
                  <tr><td colSpan={6} className="px-2 py-4 text-center text-sm text-muted-foreground">Trade history content coming soon...</td></tr>
                </tbody>
              </table>
              {/* Content will go here */}
            </CardContent>
          </Card>
          {/* Original content card, now taking 1/4 of the width */}
          <Card className="w-full mt-4 bg-black/20 border border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary">Analysis for {stockForChart?.symbol || '...'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground">
              Review your trades, spot what went wrong, and turn mistakes into momentum.
            </p>
            <p className="mt-6 text-sm text-muted-foreground/70">
              (Content and analysis tools coming soon!)
            </p>
          </CardContent>
        </Card>
        </div> {/* Closing the flex-1 container for the right side */}
      </div> {/* Closing the main flex container */}
    </main>
  );
}
