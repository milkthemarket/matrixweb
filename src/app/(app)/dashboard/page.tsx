
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
import { RulePills } from '@/components/RulePills';
import { ChartPreview } from '@/components/ChartPreview';
import { exportToCSV } from '@/lib/exportCSV';
import { useAlertContext, type RefreshInterval } from '@/contexts/AlertContext';
import { useToast } from "@/hooks/use-toast";
import { OrderCard } from '@/components/OrderCard'; 

// Use a truly static, hardcoded ISO string for the initial mock timestamp
const MOCK_INITIAL_TIMESTAMP = '2024-07-01T10:00:00.000Z';

const initialMockStocks: Stock[] = [
  { id: '1', symbol: 'AAPL', price: 170.34, changePercent: 2.5, float: 15000, volume: 90.5, newsSnippet: 'New iPhone announced.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [168, 169, 170, 171, 170.5, 172, 170.34] },
  { id: '2', symbol: 'MSFT', price: 420.72, changePercent: -1.2, float: 7000, volume: 60.2, newsSnippet: 'AI partnership expansion.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [425, 422, 423, 420, 421, 419, 420.72] },
  { id: '3', symbol: 'TSLA', price: 180.01, changePercent: 5.8, float: 800, volume: 120.1, newsSnippet: 'Cybertruck deliveries ramp up.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', historicalPrices: [170, 172, 175, 173, 178, 181, 180.01] },
  { id: '4', symbol: 'NVDA', price: 900.50, changePercent: 0.5, float: 2500, volume: 75.3, newsSnippet: 'New GPU architecture unveiled.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [890, 895, 900, 905, 902, 903, 900.50] },
  { id: '5', symbol: 'GOOGL', price: 140.22, changePercent: 1.1, float: 6000, volume: 40.8, newsSnippet: 'Search algorithm update.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [138, 139, 140, 139.5, 141, 140.5, 140.22] },
  { id: '6', symbol: 'AMC', price: 4.50, changePercent: -8.2, float: 50, volume: 150.0, newsSnippet: 'Short squeeze chatter online.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', historicalPrices: [5.0, 4.8, 4.6, 4.3, 4.7, 4.4, 4.50] },
  { id: '7', symbol: 'SPY', price: 510.20, changePercent: 10.5, float: 1000, volume: 80.0, newsSnippet: 'Market rally continues.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [500, 502, 505, 503, 508, 511, 510.20] },
  { id: '8', symbol: 'QQQ', price: 450.80, changePercent: -9.1, float: 800, volume: 70.0, newsSnippet: 'Tech sell-off.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [460, 458, 455, 452, 453, 450, 450.80] },
];

// Helper component to render time client-side to avoid hydration mismatch
const ClientRenderedTime: React.FC<{ isoTimestamp: string }> = ({ isoTimestamp }) => {
  const [formattedTime, setFormattedTime] = useState<string | null>(null);

  useEffect(() => {
    if (isoTimestamp) {
      setFormattedTime(format(new Date(isoTimestamp), "HH:mm:ss"));
    }
  }, [isoTimestamp]);

  return <>{formattedTime || '...'}</>; 
};


export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [minChangePercent, setMinChangePercent] = useState(0);
  const [maxFloat, setMaxFloat] = useState(20000); 
  const [minVolume, setMinVolume] = useState(0);
  const [stocks, setStocks] = useState<Stock[]>(initialMockStocks);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const [selectedStockForOrderCard, setSelectedStockForOrderCard] = useState<Stock | null>(null);
  const [orderCardActionType, setOrderCardActionType] = useState<OrderActionType | null>(null);


  const { autoRefreshEnabled, setAutoRefreshEnabled, refreshInterval, setRefreshInterval } = useAlertContext();
  const { toast } = useToast();

  const handleRefreshData = useCallback(() => {
    setStocks(prevStocks =>
      prevStocks.map(stock => {
        const currentPrice = stock.price;
        const currentVolume = stock.volume;
        const newPrice = parseFloat((currentPrice * (1 + (Math.random() - 0.5) * 0.03)).toFixed(2));
        return {
          ...stock,
          price: newPrice,
          changePercent: parseFloat(((Math.random() - 0.5) * 10).toFixed(1)),
          volume: parseFloat((currentVolume * (1 + (Math.random() - 0.2) * 0.1)).toFixed(1)),
          lastUpdated: new Date().toISOString(),
          historicalPrices: Array.from({ length: 7 }, () => parseFloat((currentPrice * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2)))
        };
      })
    );
    setLastRefreshed(new Date());
  }, []); 

  useEffect(() => {
    setLastRefreshed(new Date());
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefreshEnabled) {
      handleRefreshData();
      intervalId = setInterval(handleRefreshData, refreshInterval);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefreshEnabled, refreshInterval, handleRefreshData]);

  const filteredStocks = useMemo(() => {
    return stocks.filter(stock =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (minChangePercent === 0 ? true : stock.changePercent >= minChangePercent) &&
      (maxFloat === 20000 ? true : stock.float <= maxFloat) &&
      (minVolume === 0 ? true : stock.volume >= minVolume)
    );
  }, [stocks, searchTerm, minChangePercent, maxFloat, minVolume]);

  const handleSelectStockForOrder = (stock: Stock, action: OrderActionType | null) => {
    setSelectedStockForOrderCard(stock);
    setOrderCardActionType(action);
  };

  const handleClearOrderCard = () => {
    setSelectedStockForOrderCard(null);
    setOrderCardActionType(null);
  };

  const handleTradeSubmit = (tradeDetails: TradeRequest) => {
    console.log("Trade Submitted via Order Card:", tradeDetails);
    toast({
      title: "Trade Processing",
      description: `Trade for ${tradeDetails.symbol} (${tradeDetails.action}, ${tradeDetails.quantity} shares, ${tradeDetails.orderType}) submitted.`,
    });
  };

  const handleExport = () => {
    if (filteredStocks.length === 0) {
      toast({
        title: "Export Failed",
        description: "No data to export. Adjust your filters or refresh.",
        variant: "destructive",
      });
      return;
    }
    exportToCSV('stock_screener_data.csv', filteredStocks);
    toast({
      title: "Export Successful",
      description: "Stock screener data has been exported to CSV.",
    });
  };

  const getRowHighlightClass = (stock: Stock): string => {
    if (stock.changePercent >= 10) return 'border-l-4 border-green-400 bg-green-500/5';
    if (stock.changePercent <= -8) return 'border-l-4 border-red-400 bg-red-500/5';
    if (stock.float <= 500 && stock.volume >= 50) return 'border-l-4 border-blue-400 bg-blue-500/5';
    return '';
  };


  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Dashboard & Screener" />
      <div className="flex flex-1 p-4 md:p-6 space-x-0 md:space-x-6 overflow-hidden">
        {/* Left Column: Screener */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Card className="shadow-xl flex-1 flex flex-col overflow-hidden">
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
            <CardContent className="flex-1 flex flex-col overflow-hidden space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    defaultValue={[0]}
                    value={[minChangePercent]}
                    onValueChange={(value) => setMinChangePercent(value[0])}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-float">Max. Float ({maxFloat === 20000 ? 'Any': `${maxFloat}M`})</Label>
                  <Slider
                    id="max-float"
                    min={1}
                    max={20000}
                    step={100}
                    defaultValue={[20000]}
                    value={[maxFloat]}
                    onValueChange={(value) => setMaxFloat(value[0])}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-volume">Min. Volume ({minVolume === 0 ? 'Any': `${minVolume}M`})</Label>
                  <Slider
                    id="min-volume"
                    min={0}
                    max={200}
                    step={1}
                    defaultValue={[0]}
                    value={[minVolume]}
                    onValueChange={(value) => setMinVolume(value[0])}
                  />
                </div>
              </div>

              <RulePills minChangePercent={minChangePercent} maxFloat={maxFloat} minVolume={minVolume} />
              
              <div className="rounded-md border overflow-auto flex-1"> {/* Table container takes remaining space and scrolls */}
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10">
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
                        <TableRow key={stock.id} className={cn(getRowHighlightClass(stock), "hover:bg-muted/20", selectedStockForOrderCard?.id === stock.id && "bg-primary/10")}>
                          <TableCell className="font-medium">
                            <Popover>
                              <PopoverTrigger asChild>
                                <span 
                                  className="cursor-pointer hover:text-primary flex items-center"
                                  onClick={() => handleSelectStockForOrder(stock, null)}
                                >
                                  {stock.symbol}
                                  {stock.catalystType === 'fire' && <Flame className="ml-1 h-4 w-4 text-orange-400" title="Hot Catalyst" />}
                                  {stock.catalystType === 'news' && <Megaphone className="ml-1 h-4 w-4 text-blue-400" title="News Catalyst"/>}
                                </span>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 border-popover shadow-xl" side="right" align="start">
                                <ChartPreview stock={stock} />
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell className="text-right">${stock.price.toFixed(2)}</TableCell>
                          <TableCell className={cn("text-right", stock.changePercent >= 0 ? "text-green-400" : "text-red-400")}>
                            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right">{stock.float.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{stock.volume.toLocaleString()}</TableCell>
                          <TableCell className="max-w-xs truncate" title={stock.newsSnippet || 'N/A'}>{stock.newsSnippet || 'N/A'}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            <ClientRenderedTime isoTimestamp={stock.lastUpdated} />
                          </TableCell>
                          <TableCell className="text-center space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                              onClick={() => handleSelectStockForOrder(stock, 'Buy')}
                            >
                              <TrendingUp className="mr-1 h-4 w-4" /> Buy
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                              onClick={() => handleSelectStockForOrder(stock, 'Short')}
                            >
                              <TrendingDown className="mr-1 h-4 w-4" /> Short
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center h-24">
                          No stocks match your criteria. Try adjusting the filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Card */}
        <div className="w-full md:w-96 lg:w-[26rem] hidden md:block flex-shrink-0"> {/* Adjust width as needed, hidden on small screens */}
          <OrderCard
            selectedStock={selectedStockForOrderCard}
            initialActionType={orderCardActionType}
            onSubmit={handleTradeSubmit}
            onClear={handleClearOrderCard}
          />
        </div>
      </div>
    </main>
  );
}
