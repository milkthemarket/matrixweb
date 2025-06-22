
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InteractiveChartCard } from '@/components/InteractiveChartCard';
import type { Stock } from '@/types';
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

  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Spilled Milk" />
      <div className="flex-1 p-2 md:p-4 space-y-4 overflow-y-auto">
        
        {/* Chart from Milk Market, with a consistent height */}
        <div className="h-[50vh] min-h-[400px]">
          <InteractiveChartCard
            stock={stockForChart}
            onManualTickerSubmit={handleSyncedTickerChange}
            className="h-full"
          />
        </div>
        
        {/* Original content card, now referencing the selected stock */}
        <Card className="w-full max-w-4xl mx-auto bg-black/20 border border-white/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">
              Analysis for {stockForChart?.symbol || '...'}
            </CardTitle>
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

      </div>
    </main>
  );
}
