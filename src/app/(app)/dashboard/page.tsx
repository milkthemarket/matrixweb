
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
import { Filter, RotateCcw, Search, UploadCloud, Flame, Megaphone, TrendingUp, TrendingDown, Dot, CircleSlash } from "lucide-react";
import type { Stock, TradeRequest, OrderActionType, OpenPosition, NewsArticle, TradeHistoryEntry } from "@/types";
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { RulePills } from '@/components/RulePills';
import { ChartPreview } from '@/components/ChartPreview';
import { exportToCSV } from '@/lib/exportCSV';
import { useAlertContext, type RefreshInterval } from '@/contexts/AlertContext';
import { useTradeHistoryContext } from '@/contexts/TradeHistoryContext';
import { useToast } from "@/hooks/use-toast";
import { OrderCard } from '@/components/OrderCard';
import { NewsPanel } from '@/components/NewsPanel';
import { OpenPositionsCard } from '@/components/OpenPositionsCard';

const MOCK_INITIAL_TIMESTAMP = '2024-07-01T10:00:00.000Z';

const initialMockStocks: Stock[] = [
  { id: '1', symbol: 'AAPL', price: 170.34, changePercent: 2.5, float: 15000, volume: 90.5, newsSnippet: 'New iPhone announced, driving shares up.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [168, 169, 170, 171, 170.5, 172, 170.34] },
  { id: '2', symbol: 'MSFT', price: 420.72, changePercent: -1.2, float: 7000, volume: 60.2, newsSnippet: 'AI partnership expansion details emerge.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [425, 422, 423, 420, 421, 419, 420.72] },
  { id: '3', symbol: 'TSLA', price: 180.01, changePercent: 5.8, float: 800, volume: 120.1, newsSnippet: 'Cybertruck deliveries ramp up significantly.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', historicalPrices: [170, 172, 175, 173, 178, 181, 180.01] },
  { id: '4', symbol: 'NVDA', price: 900.50, changePercent: 0.5, float: 2500, volume: 75.3, newsSnippet: 'New GPU architecture "Blackwell" unveiled.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [890, 895, 900, 905, 902, 903, 900.50] },
  { id: '5', symbol: 'GOOGL', price: 140.22, changePercent: 1.1, float: 6000, volume: 40.8, newsSnippet: 'Search algorithm update to combat spam.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [138, 139, 140, 139.5, 141, 140.5, 140.22] },
];

const initialMockOpenPositions: OpenPosition[] = [
  { id: 'pos1', symbol: 'TSLA', entryPrice: 175.00, shares: 10, currentPrice: 180.01 },
  { id: 'pos2', symbol: 'AAPL', entryPrice: 168.50, shares: 20, currentPrice: 170.34 },
];

const initialMockNewsArticles: NewsArticle[] = [
  { id: 'news1', symbol: 'AAPL', headline: 'Apple Unveils Vision Pro 2 Details', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), source: 'TechCrunch', preview: 'Apple today shared more details about the upcoming Vision Pro 2, promising enhanced display and lighter design...', link: '#' },
  { id: 'news2', symbol: 'AAPL', headline: 'AAPL Analysts Raise Price Target on Strong iPhone Sales', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), source: 'Bloomberg', preview: 'Several Wall Street analysts have raised their price targets for Apple Inc. (AAPL) following reports of robust iPhone sales...', link: '#' },
  { id: 'news3', symbol: 'TSLA', headline: 'Tesla Hits New Production Milestone for Model Y', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), source: 'Reuters', preview: 'Tesla Inc. announced it has achieved a new production milestone for its Model Y electric SUV at its Giga Texas factory...', link: '#' },
  { id: 'news4', symbol: 'NVDA', headline: 'Nvidia Faces New Competition in AI Chip Market', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), source: 'WSJ', preview: 'Nvidia Corp. is facing increasing competition in the lucrative AI chip market as tech giants and startups alike develop their own processors...', link: '#' },
];


const ClientRenderedTime: React.FC<{ isoTimestamp: string }> = ({ isoTimestamp }) => {
  const [formattedTime, setFormattedTime] = useState<string | null>(null);
  useEffect(() => {
    if (isoTimestamp) {
      try {
        setFormattedTime(format(parseISO(isoTimestamp), "HH:mm:ss"));
      } catch (e) {
        setFormattedTime("Invalid Date");
      }
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

  const [selectedStockForNews, setSelectedStockForNews] = useState<Stock | null>(null);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>(initialMockNewsArticles);
  const [openPositions, setOpenPositions] = useState<OpenPosition[]>(initialMockOpenPositions);


  const { autoRefreshEnabled, setAutoRefreshEnabled, refreshInterval, setRefreshInterval } = useAlertContext();
  const { addTradeToHistory } = useTradeHistoryContext();
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
    setOpenPositions(prevPositions =>
      prevPositions.map(pos => ({
        ...pos,
        currentPrice: parseFloat((pos.currentPrice * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2))
      }))
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
    setSelectedStockForNews(stock);
  };

  const handleClearOrderCard = () => {
    setSelectedStockForOrderCard(null);
    setOrderCardActionType(null);
  };

  const handleTradeSubmit = (tradeDetails: TradeRequest) => {
    console.log("Trade Submitted via Order Card:", tradeDetails);
    toast({
      title: "Trade Processing",
      description: `${tradeDetails.action} ${tradeDetails.quantity} ${tradeDetails.symbol} (${tradeDetails.orderType}) submitted.`,
    });

    if (selectedStockForOrderCard) {
      const newHistoryEntry: TradeHistoryEntry = {
        id: String(Date.now()),
        symbol: tradeDetails.symbol,
        side: tradeDetails.action,
        totalQty: tradeDetails.quantity,
        orderType: tradeDetails.orderType,
        limitPrice: tradeDetails.limitPrice,
        stopPrice: tradeDetails.stopPrice,
        trailAmount: tradeDetails.trailingOffset,
        TIF: "Day", 
        tradingHours: "Include Extended Hours", 
        placedTime: new Date().toISOString(),
        filledTime: new Date(Date.now() + Math.random() * 5000 + 1000).toISOString(), 
        orderStatus: "Filled", 
        averagePrice: (tradeDetails.orderType === "Limit" && tradeDetails.limitPrice) ? tradeDetails.limitPrice : selectedStockForOrderCard.price, 
      };
      addTradeToHistory(newHistoryEntry);
    }

    if (tradeDetails.action === 'Buy' || tradeDetails.action === 'Short') {
        const newPosition: OpenPosition = {
            id: `pos${Date.now()}`,
            symbol: tradeDetails.symbol,
            entryPrice: selectedStockForOrderCard?.price || 0,
            shares: tradeDetails.quantity,
            currentPrice: selectedStockForOrderCard?.price || 0,
        };
        setOpenPositions(prev => [newPosition, ...prev]);
    }
  };

  const handleClosePosition = (positionId: string) => {
    setOpenPositions(prev => prev.filter(p => p.id !== positionId));
    toast({
      title: "Position Closed",
      description: `Position ${positionId} has been removed.`,
      variant: "destructive"
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
    if (stock.changePercent >= 10) return 'border-l-4 border-[hsl(var(--chart-2))] bg-[hsla(var(--chart-2),0.05)]'; // Cyber Cyan
    if (stock.changePercent <= -8) return 'border-l-4 border-[hsl(var(--chart-5))] bg-[hsla(var(--chart-5),0.05)]'; // Error Red
    if (stock.float <= 500 && stock.volume >= 50) return 'border-l-4 border-accent bg-accent/5'; // Electric Violet
    return '';
  };


  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Dashboard & Screener" />
      <div className="flex flex-1 p-4 md:p-6 space-x-0 md:space-x-6 overflow-hidden">

        <div className="flex-1 flex flex-col overflow-hidden space-y-6">
          <Card className="shadow-md flex-1 flex flex-col overflow-hidden"> 
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-2xl font-headline">Real-Time Stock Screener</CardTitle>
                <CardDescription>Filter and find top market movers.</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {autoRefreshEnabled && <Dot className="h-6 w-6 text-[#00FF9C] animate-pulse" />} {/* Confirm Green */}
                {lastRefreshed && <span className="text-sm text-muted-foreground">Last refreshed: {format(lastRefreshed, "HH:mm:ss")}</span>}
                <Switch
                  id="auto-refresh-toggle"
                  checked={autoRefreshEnabled}
                  onCheckedChange={setAutoRefreshEnabled}
                  aria-label="Toggle auto refresh"
                />
                <Label htmlFor="auto-refresh-toggle" className="text-sm text-foreground">Auto-Refresh</Label>
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
                <Button variant="outline" size="sm" onClick={handleRefreshData} className="text-primary hover:text-primary-foreground border-primary hover:bg-primary"> {/* Primary is Cyber Cyan */}
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport} className="text-accent hover:text-accent-foreground border-accent hover:bg-accent"> {/* Accent is Electric Violet */}
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search-symbol" className="text-sm font-medium text-foreground">Symbol Search</Label>
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
                  <Label htmlFor="min-change" className="text-sm font-medium text-foreground">Min. % Change ({minChangePercent}%)</Label>
                  <Slider id="min-change" min={-10} max={20} step={0.5} defaultValue={[0]} value={[minChangePercent]} onValueChange={(value) => setMinChangePercent(value[0])} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-float" className="text-sm font-medium text-foreground">Max. Float ({maxFloat === 20000 ? 'Any': `${maxFloat}M`})</Label>
                  <Slider id="max-float" min={1} max={20000} step={100} defaultValue={[20000]} value={[maxFloat]} onValueChange={(value) => setMaxFloat(value[0])} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-volume" className="text-sm font-medium text-foreground">Min. Volume ({minVolume === 0 ? 'Any': `${minVolume}M`})</Label>
                  <Slider id="min-volume" min={0} max={200} step={1} defaultValue={[0]} value={[minVolume]} onValueChange={(value) => setMinVolume(value[0])} />
                </div>
              </div>

              <RulePills minChangePercent={minChangePercent} maxFloat={maxFloat} minVolume={minVolume} />

              <div className="rounded-xl border border-white/10 overflow-auto flex-1"> {/* Adjusted for Quantum Black card style */}
                <Table>
                  <TableHeader className="sticky top-0 bg-black/80 backdrop-blur-md z-10"> {/* Adjusted for pure black background with blur for header */}
                    {/* Frosted header */}
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
                        <TableRow
                            key={stock.id}
                            className={cn(
                                getRowHighlightClass(stock),
                                "hover:bg-white/5", // Quantum Black subtle hover
                                selectedStockForOrderCard?.id === stock.id && "bg-primary/10" // Cyber Cyan tint
                            )}
                        >
                          <TableCell className="font-medium text-foreground">
                            <Popover>
                              <PopoverTrigger asChild>
                                <span
                                  className="cursor-pointer hover:text-primary flex items-center" // Primary is Cyber Cyan
                                  onClick={() => handleSelectStockForOrder(stock, null)}
                                >
                                  {stock.symbol}
                                  {stock.catalystType === 'fire' && <Flame className="ml-1 h-4 w-4 text-destructive" title="Hot Catalyst" />} {/* Destructive is Neon Orange */}
                                  {stock.catalystType === 'news' && <Megaphone className="ml-1 h-4 w-4 text-primary" title="News Catalyst"/>} {/* Primary is Cyber Cyan */}
                                </span>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 border-white/10 shadow-md" side="right" align="start"> {/* Quantum Black Popover */}
                                <ChartPreview stock={stock} />
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell className="text-right text-foreground">${stock.price.toFixed(2)}</TableCell>
                          <TableCell className={cn("text-right", stock.changePercent >= 0 ? "text-[#00FF9C]" : "text-destructive")}> {/* Confirm Green or Error Red */}
                            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right text-foreground">{stock.float.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-foreground">{stock.volume.toLocaleString()}</TableCell>
                          <TableCell className="max-w-xs truncate text-foreground" title={stock.newsSnippet || 'N/A'}>{stock.newsSnippet || 'N/A'}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            <ClientRenderedTime isoTimestamp={stock.lastUpdated} />
                          </TableCell>
                          <TableCell className="text-center space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 border-[#00FF9C] text-[#00FF9C] hover:bg-[#00FF9C] hover:text-black" // Confirm Green
                              onClick={() => handleSelectStockForOrder(stock, 'Buy')}
                            >
                              <TrendingUp className="mr-1 h-4 w-4" /> Buy
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground" // Accent is Electric Violet
                              onClick={() => handleSelectStockForOrder(stock, 'Short')}
                            >
                              <TrendingDown className="mr-1 h-4 w-4" /> Short
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                          No stocks match your criteria. Try adjusting the filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <NewsPanel selectedStock={selectedStockForNews} newsArticles={newsArticles} />
        </div>

        <div className="w-full md:w-96 lg:w-[26rem] hidden md:flex flex-col flex-shrink-0 space-y-6 pr-1 overflow-y-auto">
          <OrderCard
            selectedStock={selectedStockForOrderCard}
            initialActionType={orderCardActionType}
            onSubmit={handleTradeSubmit}
            onClear={handleClearOrderCard}
          />
          {openPositions.length > 0 && (
            <OpenPositionsCard positions={openPositions} onClosePosition={handleClosePosition} />
          )}
        </div>
      </div>
    </main>
  );
}

    