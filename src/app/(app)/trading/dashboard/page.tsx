
"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UploadCloud, Columns, Info, ListFilter, Bot, Cog, TrendingUp, TrendingDown, Activity, CalendarCheck2, Star, List, Filter, SlidersHorizontal, Newspaper, Search, Loader2 } from "lucide-react";
import type { Stock, AlertRule, ColumnConfig } from "@/types";
import { cn } from '@/lib/utils';
import { ChartPreview } from '@/components/ChartPreview';
import { exportToCSV } from '@/lib/exportCSV';
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { mockRules } from '@/app/(app)/trading/rules/page';
import { format } from 'date-fns';
import { ScreenerFilterModal } from '@/components/ScreenerFilterModal';
import type { ActiveScreenerFilters } from '@/components/ScreenerFilterModal';
import { Badge } from '@/components/ui/badge';
import { dummyNewsData } from '@/components/NewsCard';
import { NewsArticleModal } from '@/components/NewsArticleModal';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MOCK_INITIAL_TIMESTAMP = '2024-07-01T10:00:00.000Z';
const RULES_STORAGE_KEY = 'tradeflow-alert-rules';

const formatDecimal = (value?: number, places = 2) => (value !== undefined && value !== null ? value.toFixed(places) : 'N/A');

export const initialMockStocks: Stock[] = [
  { id: '1', symbol: 'AAPL', name: 'Apple Inc.', price: 170.34, changePercent: 2.5, float: 15000, volume: 90.5, newsSnippet: 'New iPhone announced.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', sentiment: 'Positive', newsSentimentPercent: 88, topNewsKeyword: 'iPhone Launch', historicalPrices: [168, 169, 170, 171, 170.5, 172, 170.34], marketCap: 170.34 * 15000 * 1e6, avgVolume: 85.2, atr: 3.4, rsi: 60.1, vwap: 170.25, beta: 1.2, high52: 190.5, low52: 150.2, gapPercent: 0.5, shortFloat: 1.5, instOwn: 65.2, premarketChange: 0.3, peRatio: 28.5, dividendYield: 0.54, sector: 'Technology', earningsDate: '2024-07-28T00:00:00.000Z', open: 169.50, high: 172.50, low: 168.00, prevClose: 166.18, peRatioTTM: 28.5, epsTTM: 5.97, sharesOutstanding: 15.55e9, freeFloatShares: 15.50e9, exDividendDate: '2024-05-10', lotSize: 100, afterHoursPrice: 170.50, afterHoursChange: 0.16, afterHoursChangePercent: 0.09, analystRating: 'Strong Buy' },
  { id: '2', symbol: 'MSFT', name: 'Microsoft Corp.', price: 420.72, changePercent: -1.2, float: 7000, volume: 60.2, newsSnippet: 'AI partnership.', lastUpdated: MOCK_INITIAL_TIMESTAMP, sentiment: 'Positive', newsSentimentPercent: 92, topNewsKeyword: 'AI Partnership', historicalPrices: [425, 422, 423, 420, 421, 419, 420.72], marketCap: 420.72 * 7000 * 1e6, avgVolume: 55.0, atr: 8.1, rsi: 40.5, vwap: 420.80, beta: 1.1, high52: 450.0, low52: 300.0, gapPercent: -0.2, shortFloat: 0.8, instOwn: 70.1, premarketChange: -0.1, peRatio: 35.2, dividendYield: 0.7, sector: 'Technology', earningsDate: '2024-07-22T00:00:00.000Z', analystRating: 'Buy' },
  { id: '3', symbol: 'TSLA', name: 'Tesla, Inc.', price: 180.01, changePercent: 5.8, float: 800, volume: 120.1, newsSnippet: 'Cybertruck deliveries ramp up.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', sentiment: 'Positive', newsSentimentPercent: 75, topNewsKeyword: 'Deliveries', historicalPrices: [170, 172, 175, 173, 178, 181, 180.01], marketCap: 180.01 * 800 * 1e6, avgVolume: 110.5, atr: 5.5, rsi: 75.2, vwap: 179.90, beta: 1.8, high52: 180.01, low52: 150.0, gapPercent: 1.2, shortFloat: 15.3, instOwn: 45.0, premarketChange: 0.8, peRatio: 60.1, dividendYield: 0.0, sector: 'Consumer Discretionary', earningsDate: '2024-07-19T00:00:00.000Z', analystRating: 'Hold' },
  { id: '4', symbol: 'NVDA', name: 'NVIDIA Corporation', price: 900.50, changePercent: 0.5, float: 2500, volume: 75.3, newsSnippet: 'New GPU unveiled.', lastUpdated: MOCK_INITIAL_TIMESTAMP, sentiment: 'Positive', newsSentimentPercent: 85, topNewsKeyword: 'GPU Launch', historicalPrices: [890, 895, 900, 905, 902, 903, 900.50], marketCap: 900.50 * 2500 * 1e6, avgVolume: 70.1, atr: 20.0, rsi: 65.0, vwap: 900.60, beta: 1.5, high52: 950.0, low52: 400.0, gapPercent: 0.1, shortFloat: 2.1, instOwn: 60.5, premarketChange: 0.2, peRatio: 75.0, dividendYield: 0.02, sector: 'Technology', earningsDate: '2024-08-15T00:00:00.000Z', analystRating: 'Strong Buy' },
  { id: '5', symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)', price: 140.22, changePercent: 1.1, float: 6000, volume: 40.8, newsSnippet: 'Search algorithm update.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', sentiment: 'Neutral', newsSentimentPercent: 55, topNewsKeyword: 'Algorithm', historicalPrices: [138, 139, 140, 139.5, 141, 140.5, 140.22], marketCap: 140.22 * 6000 * 1e6, avgVolume: 38.0, atr: 2.5, rsi: 55.8, vwap: 140.15, beta: 1.0, high52: 160.0, low52: 120.0, gapPercent: 0.3, shortFloat: 1.0, instOwn: 75.3, premarketChange: 0.1, peRatio: 25.8, dividendYield: 0.0, sector: 'Communication Services', earningsDate: '2024-07-25T00:00:00.000Z', analystRating: 'Buy' },
  // ... more stocks from initial list
];

const dummyWatchlistSymbols = ['AAPL', 'MSFT', 'TSLA', 'GOOGL', 'NVDA', 'BCTX', 'SPY', 'AMD', 'AMZN', 'META', 'NFLX', 'JPM', 'TPL', 'AN'];

function DashboardPageContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [stocks, setStocks] = useState<Stock[]>(initialMockStocks);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string>('all');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Partial<ActiveScreenerFilters>>({});
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [newsModalContent, setNewsModalContent] = useState<{ articles: NewsArticle[]; title: string } | null>(null);

  useEffect(() => {
    const loadRules = () => {
        try {
            const savedRulesJSON = localStorage.getItem(RULES_STORAGE_KEY);
            const initialRules = savedRulesJSON ? JSON.parse(savedRulesJSON) : []; 
            setRules(initialRules);
        } catch (error) {
            console.error("Failed to load rules from localStorage", error);
            setRules([]);
        }
    };
    loadRules();
    window.addEventListener('rules-updated', loadRules);
    return () => {
        window.removeEventListener('rules-updated', loadRules);
    };
  }, []);

  const activeRules = useMemo(() => rules.filter(rule => rule.isActive), [rules]);
  const activeFilterCount = Object.values(activeFilters).filter(f => f.active).length;
  
  const handleShowNewsForStock = (stock: Stock) => {
    const matchingNews = dummyNewsData.filter(news => {
      const stockName = stock.name?.toLowerCase() || '';
      const stockSymbol = stock.symbol.toLowerCase();
      const headline = news.headline.toLowerCase();
      const preview = news.preview.toLowerCase();
      return (headline.includes(stockSymbol) || headline.includes(stockName) || preview.includes(stockSymbol) || preview.includes(stockName));
    });

    setNewsModalContent({
      articles: matchingNews,
      title: `News for ${stock.symbol}`
    });
    setIsNewsModalOpen(true);
  };

  const filteredStocks = useMemo(() => {
    let processedStocks = [...stocks];
    
    if (selectedRuleId !== 'all') {
      switch (selectedRuleId) {
        case 'my-watchlist':
          processedStocks = processedStocks.filter(stock => dummyWatchlistSymbols.includes(stock.symbol));
          break;
        case 'top-gainers':
          processedStocks = processedStocks.sort((a, b) => b.changePercent - a.changePercent);
          break;
        case 'top-losers':
          processedStocks = processedStocks.sort((a, b) => a.changePercent - b.changePercent);
          break;
        case 'active':
          processedStocks = processedStocks.sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));
          break;
        case '52-week':
          processedStocks = processedStocks.filter(stock =>
            stock.price && stock.high52 && stock.low52 &&
            (stock.price >= (stock.high52 * 0.98) || stock.price <= (stock.low52 * 1.02))
          );
          break;
        default:
          const rule = activeRules.find(r => r.id === selectedRuleId);
          if (rule) {
            processedStocks = processedStocks.filter(stock => {
              return rule.criteria.every(criterion => {
                const stockValue = stock[criterion.metric as keyof Stock] as number | undefined;
                if (stockValue === undefined || stockValue === null) return false;
                const ruleValue = criterion.value;
                switch (criterion.operator) {
                  case '>': return stockValue > (ruleValue as number);
                  case '<': return stockValue < (ruleValue as number);
                  case '>=': return stockValue >= (ruleValue as number);
                  case '<=': return stockValue <= (ruleValue as number);
                  case '==': return stockValue === (ruleValue as number);
                  case '!=': return stockValue !== (ruleValue as number);
                  case 'between':
                    if (Array.isArray(ruleValue) && ruleValue.length === 2) {
                      return stockValue >= ruleValue[0] && stockValue <= ruleValue[1];
                    }
                    return false;
                  default: return true;
                }
              });
            });
          }
      }
    }
    
    const customFilterKeys = Object.entries(activeFilters)
        .filter(([, filterValue]) => filterValue.active)
        .map(([key]) => key);

    if (customFilterKeys.length > 0) {
        processedStocks = processedStocks.filter(stock => {
            return customFilterKeys.every(key => {
                const filter = activeFilters[key as keyof Stock];
                if (!filter || !filter.active) return true;

                let stockValue = stock[key as keyof Stock] as number | undefined;
                if (stockValue === undefined || stockValue === null) return false;

                let min = filter.min ? parseFloat(filter.min) : -Infinity;
                let max = filter.max ? parseFloat(filter.max) : Infinity;

                if (key === 'marketCap') {
                    stockValue = stockValue / 1e9;
                }

                if (!isNaN(min) && stockValue < min) return false;
                if (!isNaN(max) && stockValue > max) return false;

                return true;
            });
        });
    }

    return processedStocks;
  }, [stocks, selectedRuleId, activeRules, activeFilters]);

  return (
    <>
      <main className="flex flex-col flex-1 h-full overflow-hidden p-4 md:p-6 space-y-4">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="text-2xl font-bold text-foreground">Screener</CardTitle>
              <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsFilterModalOpen(true)} className="h-9 text-xs">
                      <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                  </Button>
                  <Select value={selectedRuleId} onValueChange={(value) => setSelectedRuleId(value)}>
                      <SelectTrigger id="ruleSelect" className="w-auto h-9 text-xs min-w-[200px]">
                          <SelectValue placeholder="Select a screener or rule..." />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all" className="text-xs">
                              <span className="flex items-center"><List className="mr-2 h-4 w-4" /> Show All Stocks</span>
                          </SelectItem>
                          <SelectItem value="my-watchlist" className="text-xs">
                              <span className="flex items-center"><Star className="mr-2 h-4 w-4" /> My Watchlist</span>
                          </SelectItem>
                          <SelectItem value="top-gainers" className="text-xs">
                              <span className="flex items-center text-[hsl(var(--confirm-green))]"><TrendingUp className="mr-2 h-4 w-4" /> Top Gainers</span>
                          </SelectItem>
                          <SelectItem value="top-losers" className="text-xs">
                              <span className="flex items-center text-destructive"><TrendingDown className="mr-2 h-4 w-4" /> Top Losers</span>
                          </SelectItem>
                          <SelectItem value="active" className="text-xs">
                              <span className="flex items-center text-primary"><Activity className="mr-2 h-4 w-4" /> Most Active</span>
                          </SelectItem>
                          <SelectItem value="52-week" className="text-xs">
                              <span className="flex items-center text-accent"><CalendarCheck2 className="mr-2 h-4 w-4" /> 52 Week Highs/Lows</span>
                          </SelectItem>
                          {activeRules.map(rule => (
                              <SelectItem key={rule.id} value={rule.id} className="text-xs">
                              <span className="flex items-center"><Filter className="mr-2 h-4 w-4" /> {rule.name}</span>
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>
            </div>
             <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-9 text-xs">
                    <Columns className="mr-2 h-4 w-4" /> Columns
                </Button>
                 <Button variant="outline" size="sm" onClick={() => exportToCSV('screener_export.csv', filteredStocks, [])} className="h-9 text-xs">
                    <UploadCloud className="mr-2 h-4 w-4" /> Export
                </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <div className="rounded-lg overflow-auto h-full">
              <Table>
                <TableHeader className="sticky top-0 bg-[#0d0d0d] z-10">
                  <TableRow className="h-10">
                    <TableHead className="px-4 py-2 text-left font-headline uppercase text-[15px] font-bold text-neutral-100">Symbol</TableHead>
                    <TableHead className="px-4 py-2 text-right font-headline uppercase text-[15px] font-bold text-neutral-100">Price</TableHead>
                    <TableHead className="px-4 py-2 text-right font-headline uppercase text-[15px] font-bold text-neutral-100">% Change</TableHead>
                    <TableHead className="px-4 py-2 text-left font-headline uppercase text-[15px] font-bold text-neutral-100">Float</TableHead>
                    <TableHead className="px-4 py-2 text-left font-headline uppercase text-[15px] font-bold text-neutral-100">Volume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStocks.length > 0 ? (
                    filteredStocks.map((stock) => (
                      <TableRow
                        key={stock.id}
                        className="cursor-pointer h-10 border-b border-border/5 last:border-b-0 hover:bg-white/5"
                        onClick={() => handleShowNewsForStock(stock)}
                      >
                        <TableCell className="px-4 py-2 font-bold text-foreground text-left">{stock.symbol}</TableCell>
                        <TableCell className="px-4 py-2 font-bold text-foreground text-right">${stock.price.toFixed(2)}</TableCell>
                        <TableCell className={cn("px-4 py-2 font-bold text-right", stock.changePercent >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive")}>
                            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </TableCell>
                        <TableCell className="px-4 py-2 text-left">{stock.float}M</TableCell>
                        <TableCell className="px-4 py-2 text-left">{stock.volume.toFixed(1)}M</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-xs text-muted-foreground">
                        No stocks match the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
      <ScreenerFilterModal 
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        activeFilters={activeFilters}
        onApplyFilters={setActiveFilters}
      />
      <NewsArticleModal
        isOpen={isNewsModalOpen}
        onClose={() => setIsNewsModalOpen(false)}
        articles={newsModalContent?.articles || null}
        title={newsModalContent?.title || "News"}
      />
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading Dashboard...</div>}>
      <DashboardPageContent />
    </Suspense>
  );
}

    