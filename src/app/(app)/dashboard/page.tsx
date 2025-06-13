
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, RotateCcw, Search, UploadCloud, Flame, Megaphone, TrendingUp, TrendingDown, Dot } from "lucide-react";
import type { Stock, TradeRequest, OrderActionType } from "@/types";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TradeModal } from '@/components/TradeModal';
import { RulePills } from '@/components/RulePills';
import { ChartPreview } from '@/components/ChartPreview';
import { exportToCSV } from '@/lib/exportCSV';
import { useAlertContext, type RefreshInterval } from '@/contexts/AlertContext';

const initialMockStocks: Stock[] = [
  { id: '1', symbol: 'AAPL', price: 170.34, changePercent: 2.5, float: 15000, volume: 90.5, newsSnippet: 'New iPhone announced.', lastUpdated: new Date().toISOString(), catalystType: 'news', historicalPrices: [168, 169, 170, 171, 170.5, 172, 170.34] },
  { id: '2', symbol: 'MSFT', price: 420.72, changePercent: -1.2, float: 7000, volume: 60.2, newsSnippet: 'AI partnership expansion.', lastUpdated: new Date().toISOString(), historicalPrices: [425, 422, 423, 420, 421, 419, 420.72] },
  { id: '3', symbol: 'TSLA', price: 180.01, changePercent: 5.8, float: 800, volume: 120.1, newsSnippet: 'Cybertruck deliveries ramp up.', lastUpdated: new Date().toISOString(), catalystType: 'fire', historicalPrices: [170, 172, 175, 173, 178, 181, 180.01] },
  { id: '4', symbol: 'NVDA', price: 900.50, changePercent: 0.5, float: 2500, volume: 75.3, newsSnippet: 'New GPU architecture unveiled.', lastUpdated: new Date().toISOString(), historicalPrices: [890, 895, 900, 905, 902, 903, 900.50] },
  { id: '5', symbol: 'GOOGL', price: 140.22, changePercent: 1.1, float: 6000, volume: 40.8, newsSnippet: 'Search algorithm update.', lastUpdated: new Date().toISOString(), catalystType: 'news', historicalPrices: [138, 139, 140, 139.5, 141, 140.5, 140.22] },
  { id: '6', symbol: 'AMC', price: 4.50, changePercent: -8.2, float: 50, volume: 150.0, newsSnippet: 'Short squeeze chatter online.', lastUpdated: new Date().toISOString(), catalystType: 'fire', historicalPrices: [5.0, 4.8, 4.6, 4.3, 4.7, 4.4, 4.50] },
];

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [minChangePercent, setMinChangePercent] = useState(0);
  const [maxFloat, setMaxFloat] = useState(20000);
  const [minVolume, setMinVolume] = useState(0);
  const [stocks, setStocks] = useState<Stock[]>(initialMockStocks);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [selectedStockSymbolForModal, setSelectedStockSymbolForModal] = useState<string | null>(null);
  const [currentActionType, setCurrentActionType] = useState<OrderActionType | null>(null);

  const { autoRefreshEnabled, setAutoRefreshEnabled, refreshInterval, setRefreshInterval } = useAlertContext();

  const handleRefreshData = useCallback(() => {
    const refreshedStocks = stocks.map(stock => ({
      ...stock,
      price: parseFloat((stock.price * (1 + (Math.random() - 0.5) * 0.03)).toFixed(2)),
      changePercent: parseFloat(((Math.random() - 0.5) * 10).toFixed(1)),
      volume: parseFloat((stock.volume * (1 + (Math.random() - 0.2) * 0.1)).toFixed(1)),
      lastUpdated: new Date().toISOString(),
      historicalPrices: Array.from({length: 7}, () => parseFloat((stock.price * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2)))
    }));
    setStocks(refreshedStocks);
    setLastRefreshed(new Date());
  }, [stocks]);

  useEffect(() => {
    setLastRefreshed(new Date());
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefreshEnabled) {
      handleRefreshData(); // Refresh immediately when enabled
      intervalId = setInterval(handleRefreshData, refreshInterval);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefreshEnabled, refreshInterval, handleRefreshData]);
  
  const filteredStocks = useMemo(() => {
    return stocks.filter(stock =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) &&
      stock.changePercent >= minChangePercent &&
      stock.float <= maxFloat &&
      stock.volume >= minVolume
    );
  }, [stocks, searchTerm, minChangePercent, maxFloat, minVolume]);

  const handleTradeAction = (symbol: string, action: OrderActionType) => {
    setSelectedStockSymbolForModal(symbol);
    setCurrentActionType(action);
    setIsTradeModalOpen(true);
  };

  const handleTradeSubmit = (tradeDetails: TradeRequest) => {
    console.log("Trade Submitted:", tradeDetails);
    // Here you would typically call an API or Firestore service
    // For example: await addDoc(collection(db, "tradeRequests"), tradeDetails);
    alert(`Trade for ${tradeDetails.symbol} (${tradeDetails.action}, ${tradeDetails.quantity} shares, ${tradeDetails.orderType}) submitted for processing.`);
  };

  const handleExport = () => {
    exportToCSV('stock_screener_data.csv', filteredStocks);
  };
  
  const getRowHighlightClass = (stock: Stock): string => {
    if (stock.changePercent > 10) return 'border-l-4 border-green-400'; // Strong gainer
    if (stock.changePercent < -8) return 'border-l-4 border-red-400'; // Strong loser
    if (stock.float < 500 && stock.volume > 50) return 'border-l-4 border-blue-400'; // Low float, high volume relative
    return '';
  };


  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Dashboard & Screener" />
      <div className="flex-1 p-4 md:p-6 space-y-6 overflow-auto">
        <Card className="shadow-xl">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-2xl font-headline">Real-Time Stock Screener</CardTitle>
              <CardDescription>Filter and find top market movers.</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {autoRefreshEnabled && <Dot className="h-6 w-6 text-green-500 animate-pulse" />}
              {lastRefreshed && <span className="text-sm text-muted-foreground">Last refreshed: {format(lastRefreshed, "HH:mm:ss")}</span>}
              <Switch
                id="auto-refresh-toggle"
                checked={autoRefreshEnabled}
                onCheckedChange={setAutoRefreshEnabled}
                aria-label="Toggle auto refresh"
              />
              <Label htmlFor="auto-refresh-toggle" className="text-sm">Auto-Refresh</Label>
              <Select 
                value={String(refreshInterval)} 
                onValueChange={(val) => setRefreshInterval(Number(val) as RefreshInterval)}
                disabled={!autoRefreshEnabled}
              >
                <SelectTrigger className="w-[100px] h-9 text-xs">
                  <SelectValue placeholder="Interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15000">15s</SelectItem>
                  <SelectItem value="30000">30s</SelectItem>
                  <SelectItem value="60000">1m</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleRefreshData} className="text-accent hover:text-accent-foreground border-accent">
                <RotateCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport} className="text-accent hover:text-accent-foreground border-accent">
                <UploadCloud className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="search-symbol">Symbol Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-symbol"
                    type="text"
                    placeholder="Search by symbol (e.g. AAPL)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-change">Min. % Change ({minChangePercent}%)</Label>
                <Slider
                  id="min-change"
                  min={-10}
                  max={20}
                  step={0.5}
                  value={[minChangePercent]}
                  onValueChange={(value) => setMinChangePercent(value[0])}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-float">Max. Float ({maxFloat}M)</Label>
                <Slider
                  id="max-float"
                  min={1}
                  max={20000}
                  step={100}
                  value={[maxFloat]}
                  onValueChange={(value) => setMaxFloat(value[0])}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-volume">Min. Volume ({minVolume}M)</Label>
                <Slider
                  id="min-volume"
                  min={0}
                  max={200}
                  step={1}
                  value={[minVolume]}
                  onValueChange={(value) => setMinVolume(value[0])}
                />
              </div>
            </div>

            <RulePills minChangePercent={minChangePercent} maxFloat={maxFloat} minVolume={minVolume} />
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">% Change</TableHead>
                    <TableHead className="text-right">Float (M)</TableHead>
                    <TableHead className="text-right">Volume (M)</TableHead>
                    <TableHead>Catalyst News</TableHead>
                    <TableHead className="text-right">Last Updated</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStocks.length > 0 ? (
                    filteredStocks.map((stock) => (
                      <TableRow key={stock.id} className={cn(getRowHighlightClass(stock))}>
                        <TableCell className="font-medium">
                          <Popover>
                            <PopoverTrigger asChild>
                              <span className="cursor-pointer hover:text-primary flex items-center">
                                {stock.symbol}
                                {stock.catalystType === 'fire' && <Flame className="ml-1 h-4 w-4 text-orange-400" />}
                                {stock.catalystType === 'news' && <Megaphone className="ml-1 h-4 w-4 text-blue-400" />}
                              </span>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 border-none shadow-none" side="right" align="start">
                              <ChartPreview stock={stock} />
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                        <TableCell className="text-right">${stock.price.toFixed(2)}</TableCell>
                        <TableCell className={cn("text-right", stock.changePercent >= 0 ? "text-green-400" : "text-red-400")}>
                          {stock.changePercent.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right">{stock.float.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{stock.volume.toLocaleString()}</TableCell>
                        <TableCell className="max-w-xs truncate">{stock.newsSnippet || 'N/A'}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">{format(new Date(stock.lastUpdated), "HH:mm:ss")}</TableCell>
                        <TableCell className="text-center space-x-1">
                          <Button variant="outline" size="sm" className="h-8 px-2 border-green-500 text-green-500 hover:bg-green-500/10 hover:text-green-400" onClick={() => handleTradeAction(stock.symbol, 'Buy')}>
                            <TrendingUp className="mr-1 h-4 w-4" /> Buy
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 px-2 border-red-500 text-red-500 hover:bg-red-500/10 hover:text-red-400" onClick={() => handleTradeAction(stock.symbol, 'Short')}>
                            <TrendingDown className="mr-1 h-4 w-4" /> Short
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        No stocks match your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        stockSymbol={selectedStockSymbolForModal}
        actionType={currentActionType}
        onSubmit={handleTradeSubmit}
      />
    </main>
  );
}
