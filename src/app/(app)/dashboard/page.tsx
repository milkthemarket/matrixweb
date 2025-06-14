
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Filter, RotateCcw, Search, UploadCloud, Flame, Megaphone, Dot, Columns, Info } from "lucide-react";
import type { Stock, TradeRequest, OrderActionType, OpenPosition, NewsArticle, TradeHistoryEntry, ColumnConfig } from "@/types";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const MOCK_INITIAL_TIMESTAMP = '2024-07-01T10:00:00.000Z';

const formatMarketCap = (value?: number) => {
  if (value === undefined || value === null) return 'N/A';
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  return value.toLocaleString();
};

const formatPercentage = (value?: number) => (value !== undefined && value !== null ? `${value.toFixed(1)}%` : 'N/A');
const formatDecimal = (value?: number, places = 2) => (value !== undefined && value !== null ? value.toFixed(places) : 'N/A');
const formatVolume = (value?: number) => (value !== undefined && value !== null ? `${value.toFixed(1)}M` : 'N/A');


const columnConfiguration: ColumnConfig<Stock>[] = [
  { key: 'symbol', label: 'Symbol', defaultVisible: true, isToggleable: false, align: 'left',
    format: (value, stock) => (
      <Popover>
        <PopoverTrigger asChild>
          <span className="hover:text-primary flex items-center cursor-pointer">
            {stock.symbol}
            {stock.catalystType === 'fire' && <Flame className="ml-1 h-4 w-4 text-destructive" title="Hot Catalyst" />}
            {stock.catalystType === 'news' && <Megaphone className="ml-1 h-4 w-4 text-primary" title="News Catalyst"/>}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 shadow-none" side="right" align="start">
          <ChartPreview stock={stock} />
        </PopoverContent>
      </Popover>
    )
  },
  { key: 'price', label: 'Price', defaultVisible: true, isToggleable: false, align: 'right', format: (val) => `$${formatDecimal(val)}` },
  { key: 'changePercent', label: '% Change', defaultVisible: true, isToggleable: true, align: 'right', format: (val) => {
    const numVal = typeof val === 'number' ? val : 0;
    return <span className={cn(numVal >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive")}> {numVal >= 0 ? '+' : ''}{formatDecimal(numVal, 1)}% </span>
  }},
  { key: 'float', label: 'Float (M)', defaultVisible: true, isToggleable: true, align: 'right', format: (val) => formatDecimal(val, 0) },
  { key: 'volume', label: 'Volume (M)', defaultVisible: true, isToggleable: true, align: 'right', format: formatVolume },
  { key: 'marketCap', label: 'Mkt Cap', defaultVisible: false, isToggleable: true, align: 'right', format: formatMarketCap, description: "Market Capitalization" },
  { key: 'avgVolume', label: 'Avg Vol (M)', defaultVisible: false, isToggleable: true, align: 'right', format: formatVolume, description: "Average Daily Volume" },
  { key: 'atr', label: 'ATR', defaultVisible: false, isToggleable: true, align: 'right', format: (val) => formatDecimal(val), description: "Average True Range (Volatility)" },
  { key: 'rsi', label: 'RSI', defaultVisible: false, isToggleable: true, align: 'right', format: (val) => formatDecimal(val, 1), description: "Relative Strength Index" },
  { key: 'vwap', label: 'VWAP', defaultVisible: false, isToggleable: true, align: 'right', format: (val) => `$${formatDecimal(val)}`, description: "Volume Weighted Average Price" },
  { key: 'beta', label: 'Beta', defaultVisible: false, isToggleable: true, align: 'right', format: (val) => formatDecimal(val, 2), description: "Market Risk Measure" },
  { key: 'high52', label: '52W High', defaultVisible: false, isToggleable: true, align: 'right', format: (val) => `$${formatDecimal(val)}`, description: "52-Week High Price" },
  { key: 'low52', label: '52W Low', defaultVisible: false, isToggleable: true, align: 'right', format: (val) => `$${formatDecimal(val)}`, description: "52-Week Low Price" },
  { key: 'gapPercent', label: 'Gap %', defaultVisible: false, isToggleable: true, align: 'right', format: formatPercentage, description: "Today's Price Gap Percentage" },
  { key: 'shortFloat', label: 'Short %', defaultVisible: false, isToggleable: true, align: 'right', format: formatPercentage, description: "Short Interest as % of Float" },
  { key: 'instOwn', label: 'Inst. Own %', defaultVisible: false, isToggleable: true, align: 'right', format: formatPercentage, description: "Institutional Ownership Percentage" },
  { key: 'premarketChange', label: 'Pre-Mkt %', defaultVisible: false, isToggleable: true, align: 'right', format: formatPercentage, description: "Pre-Market Change Percentage" },
];


const initialMockStocks: Stock[] = [
  { id: '1', symbol: 'AAPL', price: 170.34, changePercent: 2.5, float: 15000, volume: 90.5, newsSnippet: 'New iPhone announced.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [168, 169, 170, 171, 170.5, 172, 170.34], marketCap: 170.34 * 15000 * 1e6, avgVolume: 85.2, atr: 3.4, rsi: 60.1, vwap: 170.25, beta: 1.2, high52: 190.5, low52: 150.2, gapPercent: 0.5, shortFloat: 1.5, instOwn: 65.2, premarketChange: 0.3 },
  { id: '2', symbol: 'MSFT', price: 420.72, changePercent: -1.2, float: 7000, volume: 60.2, newsSnippet: 'AI partnership.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [425, 422, 423, 420, 421, 419, 420.72], marketCap: 420.72 * 7000 * 1e6, avgVolume: 55.0, atr: 8.1, rsi: 40.5, vwap: 420.80, beta: 1.1, high52: 450.0, low52: 300.0, gapPercent: -0.2, shortFloat: 0.8, instOwn: 70.1, premarketChange: -0.1 },
  { id: '3', symbol: 'TSLA', price: 180.01, changePercent: 5.8, float: 800, volume: 120.1, newsSnippet: 'Cybertruck deliveries ramp up.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', historicalPrices: [170, 172, 175, 173, 178, 181, 180.01], marketCap: 180.01 * 800 * 1e6, avgVolume: 110.5, atr: 5.5, rsi: 75.2, vwap: 179.90, beta: 1.8, high52: 250.0, low52: 150.0, gapPercent: 1.2, shortFloat: 15.3, instOwn: 45.0, premarketChange: 0.8 },
  { id: '4', symbol: 'NVDA', price: 900.50, changePercent: 0.5, float: 2500, volume: 75.3, newsSnippet: 'New GPU unveiled.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [890, 895, 900, 905, 902, 903, 900.50], marketCap: 900.50 * 2500 * 1e6, avgVolume: 70.1, atr: 20.0, rsi: 65.0, vwap: 900.60, beta: 1.5, high52: 950.0, low52: 400.0, gapPercent: 0.1, shortFloat: 2.1, instOwn: 60.5, premarketChange: 0.2 },
  { id: '5', symbol: 'GOOGL', price: 140.22, changePercent: 1.1, float: 6000, volume: 40.8, newsSnippet: 'Search algorithm update.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [138, 139, 140, 139.5, 141, 140.5, 140.22], marketCap: 140.22 * 6000 * 1e6, avgVolume: 38.0, atr: 2.5, rsi: 55.8, vwap: 140.15, beta: 1.0, high52: 160.0, low52: 120.0, gapPercent: 0.3, shortFloat: 1.0, instOwn: 75.3, premarketChange: 0.1 },
];


const initialMockOpenPositions: OpenPosition[] = [
  { id: 'pos1', symbol: 'TSLA', entryPrice: 175.00, shares: 10, currentPrice: 180.01 },
  { id: 'pos2', symbol: 'AAPL', entryPrice: 168.50, shares: 20, currentPrice: 170.34 },
];

const initialMockNewsArticles: NewsArticle[] = [
  { id: 'news1', symbol: 'AAPL', headline: 'Apple Unveils Vision Pro 2 Details', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), source: 'TechCrunch', preview: 'Apple today shared more details about the upcoming Vision Pro 2, promising enhanced display and lighter design...', link: '#' },
  { id: 'news2', symbol: 'TSLA', headline: 'Tesla Hits New Production Milestone for Model Y', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), source: 'Reuters', preview: 'Tesla Inc. announced it has achieved a new production milestone for its Model Y electric SUV at its Giga Texas factory...', link: '#' },
];


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
  
  const initialVisibleColumns = useMemo(() => {
    const visible: Record<string, boolean> = {};
    columnConfiguration.forEach(col => {
      if (col.isToggleable) {
        visible[col.key as string] = col.defaultVisible;
      }
    });
    return visible;
  }, []);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(initialVisibleColumns);

  const toggleColumnVisibility = (columnKey: keyof Stock | string) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey] }));
  };
  
  const displayedColumns = useMemo(() => {
    return columnConfiguration.filter(col => !col.isToggleable || visibleColumns[col.key as string]);
  }, [visibleColumns]);


  const handleRefreshData = useCallback(() => {
    setStocks(prevStocks =>
      prevStocks.map(stock => {
        const priceChangeFactor = 1 + (Math.random() - 0.5) * 0.03; // up to 3% change
        const newPrice = parseFloat((stock.price * priceChangeFactor).toFixed(2));
        const newVolume = parseFloat((stock.volume * (1 + (Math.random() - 0.2) * 0.1)).toFixed(1));
        const newAvgVolume = parseFloat(( (stock.avgVolume || stock.volume) * (1 + (Math.random() - 0.4) * 0.05)).toFixed(1));
        const newAtr = parseFloat(((stock.atr || stock.price * 0.02) * (1 + (Math.random() - 0.5) * 0.1)).toFixed(2));
        const newRsi = parseFloat(Math.min(100, Math.max(0, (stock.rsi || 50) + (Math.random() - 0.5) * 10)).toFixed(1));
        const newVwap = parseFloat((newPrice * (1 + (Math.random() - 0.5) * 0.005)).toFixed(2));
        const newBeta = parseFloat(Math.max(0.1, (stock.beta || 1) + (Math.random() - 0.5) * 0.1).toFixed(2));
        const newHigh52 = parseFloat(Math.max(newPrice, (stock.high52 || newPrice * 1.2) * (1 + (Math.random() - 0.45) * 0.01)).toFixed(2));
        const newLow52 = parseFloat(Math.min(newPrice, (stock.low52 || newPrice * 0.8) * (1 + (Math.random() - 0.55) * 0.01)).toFixed(2));

        return {
          ...stock,
          price: newPrice,
          changePercent: parseFloat(((newPrice / stock.price - 1) * 100).toFixed(1)),
          volume: newVolume,
          marketCap: newPrice * stock.float * 1e6,
          avgVolume: newAvgVolume,
          atr: newAtr,
          rsi: newRsi,
          vwap: newVwap,
          beta: newBeta,
          high52: newHigh52,
          low52: newLow52,
          gapPercent: parseFloat(((Math.random() - 0.5) * 5).toFixed(1)),
          shortFloat: parseFloat(Math.max(0, (stock.shortFloat || 5) + (Math.random() - 0.5) * 2).toFixed(1)),
          instOwn: parseFloat(Math.min(100, Math.max(0, (stock.instOwn || 60) + (Math.random() - 0.5) * 5)).toFixed(1)),
          premarketChange: parseFloat(((Math.random() - 0.5) * 3).toFixed(1)),
          lastUpdated: new Date().toISOString(),
          historicalPrices: Array.from({ length: 7 }, (_, i) => parseFloat((newPrice * (1 + (Math.random() - 0.5) * (0.01 * (7-i)))).toFixed(2)))
        };
      })
    );
    setOpenPositions(prevPositions =>
      prevPositions.map(pos => {
        const stock = stocks.find(s => s.symbol === pos.symbol);
        return {
          ...pos,
          currentPrice: stock ? stock.price : parseFloat((pos.currentPrice * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2))
        }
      })
    );
    setLastRefreshed(new Date());
  }, [stocks]); // Added stocks to dependency array for currentPrice reference in openPositions


  useEffect(() => {
    setLastRefreshed(new Date());
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefreshEnabled) {
      handleRefreshData(); // Initial refresh if enabled
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
        TIF: tradeDetails.TIF || "Day",
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
    // Pass all data for export, specific column selection for export can be a future enhancement
    exportToCSV('stock_screener_data.csv', filteredStocks, columnConfiguration);
    toast({
      title: "Export Successful",
      description: "Stock screener data has been exported to CSV.",
    });
  };

  const getRowHighlightClass = (stock: Stock): string => {
    if (stock.changePercent >= 10) return 'border-l-4 border-[hsl(var(--chart-2))] bg-[hsla(var(--chart-2),0.05)]';
    if (stock.changePercent <= -8) return 'border-l-4 border-[hsl(var(--chart-5))] bg-[hsla(var(--chart-5),0.05)]';
    if (stock.float <= 500 && stock.volume >= 50) return 'border-l-4 border-accent bg-accent/5';
    return '';
  };


  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Dashboard" />
      <div className="flex flex-1 p-4 md:p-6 space-x-0 md:space-x-6 overflow-hidden">

        <div className="flex-1 flex flex-col overflow-hidden space-y-6">
          <Card className="shadow-none flex-1 flex flex-col overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-2xl font-headline">Real-Time Stock Screener</CardTitle>
                <CardDescription>Filter and find top market movers.</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {autoRefreshEnabled && <Dot className="h-6 w-6 text-[hsl(var(--confirm-green))] animate-pulse" />}
                {lastRefreshed && <span className="text-sm text-muted-foreground">Refreshed: {new Date(lastRefreshed).toLocaleTimeString()}</span>}
                <Switch
                  id="auto-refresh-toggle"
                  checked={autoRefreshEnabled}
                  onCheckedChange={setAutoRefreshEnabled}
                  aria-label="Toggle auto refresh"
                />
                <Label htmlFor="auto-refresh-toggle" className="text-sm text-foreground">Auto</Label>
                <Select
                  value={String(refreshInterval)}
                  onValueChange={(val) => setRefreshInterval(Number(val) as RefreshInterval)}
                  disabled={!autoRefreshEnabled}
                >
                  <SelectTrigger className="w-[80px] h-9 text-xs">
                    <SelectValue placeholder="Int." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15000">15s</SelectItem>
                    <SelectItem value="30000">30s</SelectItem>
                    <SelectItem value="60000">1m</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshData}
                  className="border-primary text-foreground hover:bg-primary/10 hover:text-primary"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="border-accent text-foreground hover:bg-accent/10 hover:text-accent">
                      <Columns className="mr-2 h-4 w-4" /> Columns
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto max-w-xs md:max-w-sm p-0">
                     <div className="p-3 border-b border-border/[.1]">
                        <h4 className="font-medium text-sm text-foreground">Customize Columns</h4>
                     </div>
                     <ScrollArea className="h-[250px] md:h-[350px]">
                      <TooltipProvider>
                        <div className="p-3 space-y-1">
                          {columnConfiguration
                            .filter(col => col.isToggleable)
                            .map(col => (
                              <Tooltip key={`tooltip-${col.key}`}>
                                <TooltipTrigger asChild>
                                  <Label
                                    htmlFor={`col-${col.key}`}
                                    className={cn(
                                      "flex items-center space-x-2 p-2 rounded-md hover:bg-white/5 transition-colors w-full",
                                      !visibleColumns[col.key as string] && "opacity-75"
                                    )}
                                  >
                                    <Checkbox
                                      id={`col-${col.key}`}
                                      checked={visibleColumns[col.key as string]}
                                      onCheckedChange={() => toggleColumnVisibility(col.key as string)}
                                    />
                                    <span className="text-sm font-normal text-foreground flex-1">{col.label}</span>
                                    {col.description && <Info className="h-3.5 w-3.5 text-muted-foreground opacity-50" />}
                                  </Label>
                                </TooltipTrigger>
                                {col.description && (
                                  <TooltipContent side="right" align="center">
                                    <p className="text-xs">{col.description}</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            ))}
                        </div>
                      </TooltipProvider>
                     </ScrollArea>
                  </PopoverContent>
                </Popover>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="border-accent text-foreground hover:bg-accent/10 hover:text-accent"
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Export
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

              <div className="rounded-xl overflow-auto flex-1">
                <Table>
                  <TableHeader className="sticky top-0 bg-card/[.05] backdrop-blur-md z-10">
                    <TableRow>
                      {displayedColumns.map((col) => (
                        <TableHead key={col.key as string} className={cn(col.align === 'right' && "text-right", col.align === 'center' && "text-center")}>
                          {col.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStocks.length > 0 ? (
                      filteredStocks.map((stock) => (
                        <TableRow
                            key={stock.id}
                            className={cn(
                                getRowHighlightClass(stock),
                                "hover:bg-white/5 transition-colors duration-200 cursor-pointer",
                                selectedStockForOrderCard?.id === stock.id && "bg-primary/10"
                            )}
                            onClick={() => handleSelectStockForOrder(stock, null)}
                        >
                          {displayedColumns.map((col) => (
                            <TableCell
                              key={`${stock.id}-${col.key as string}`}
                              className={cn(
                                "text-foreground",
                                col.align === 'right' && "text-right",
                                col.align === 'center' && "text-center",
                                col.key === 'symbol' && "font-medium"
                              )}
                            >
                              {col.format ? col.format(stock[col.key as keyof Stock], stock) : String(stock[col.key as keyof Stock] ?? 'N/A')}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={displayedColumns.length} className="text-center h-24 text-muted-foreground">
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
