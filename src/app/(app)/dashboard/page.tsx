
"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw, UploadCloud, Flame, Megaphone, Dot, Columns, Info, ListFilter, Bot, Cog, TrendingUp, TrendingDown, Activity, CalendarCheck2, GripHorizontal, Lock, Star, List, Filter } from "lucide-react";
import type { Stock, TradeRequest, OrderActionType, OpenPosition, TradeHistoryEntry, ColumnConfig, AlertRule, MiloTradeIdea, HistoryTradeMode, TradeMode } from "@/types";
import { cn } from '@/lib/utils';
import { ChartPreview } from '@/components/ChartPreview';
import { exportToCSV } from '@/lib/exportCSV';
import type { RefreshInterval } from '@/contexts/AlertContext';
import { useTradeHistoryContext } from '@/contexts/TradeHistoryContext';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { useToast } from "@/hooks/use-toast";
import { OrderCard } from '@/components/OrderCard';
import { OpenPositionsCard } from '@/components/OpenPositionsCard';
import { MilosTradeIdeasCard } from '@/components/MilosTradeIdeasCard';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { mockRules } from '@/app/(app)/rules/page';
import { format } from 'date-fns';

const MOCK_INITIAL_TIMESTAMP = '2024-07-01T10:00:00.000Z';
const DASHBOARD_REFRESH_INTERVAL: RefreshInterval = 15000;
const LOCAL_STORAGE_COLUMN_ORDER_KEY = 'tradeflow-dashboard-column-order';
const LOCAL_STORAGE_COLUMN_WIDTHS_KEY = 'tradeflow-dashboard-column-widths';
const MIN_COLUMN_WIDTH = 50; // Minimum width for a column in pixels

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


const initialColumnConfiguration: ColumnConfig<Stock>[] = [
  { key: 'symbol', label: 'Symbol', defaultVisible: true, isToggleable: false, isDraggable: false, align: 'left', defaultWidth: 100,
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
  {
    key: 'name',
    label: 'Name',
    defaultVisible: true,
    isToggleable: true,
    isDraggable: true,
    align: 'left',
    defaultWidth: 180,
    description: "Company Name",
    format: (nameValue: string | undefined, stock) => {
      const name = nameValue || stock.name || 'N/A'; // Use stock.name as fallback
      return (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate w-full">
                {name}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
  },
  { key: 'price', label: 'Price', defaultVisible: true, isToggleable: false, isDraggable: true, align: 'right', defaultWidth: 90, format: (val) => `$${formatDecimal(val)}` },
  { key: 'changePercent', label: '% Change', defaultVisible: true, isToggleable: true, isDraggable: true, align: 'right', defaultWidth: 100, format: (val) => {
    const numVal = typeof val === 'number' ? val : 0;
    return <span className={cn(numVal >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive")}> {numVal >= 0 ? '+' : ''}{formatDecimal(numVal, 1)}% </span>
  }},
  { key: 'float', label: 'Float (M)', defaultVisible: true, isToggleable: true, isDraggable: true, align: 'right', defaultWidth: 80, format: (val) => formatDecimal(val, 0) },
  { key: 'volume', label: 'Volume (M)', defaultVisible: true, isToggleable: true, isDraggable: true, align: 'right', defaultWidth: 90, format: formatVolume },
  { key: 'marketCap', label: 'Mkt Cap', defaultVisible: false, isToggleable: true, isDraggable: true, align: 'right', defaultWidth: 110, format: formatMarketCap, description: "Market Capitalization" },
  { key: 'avgVolume', label: 'Avg Vol (M)', defaultVisible: false, isToggleable: true, isDraggable: true, align: 'right', defaultWidth: 90, format: formatVolume, description: "Average Daily Volume" },
  { key: 'atr', label: 'ATR', defaultVisible: false, isToggleable: true, isDraggable: true, align: 'right', defaultWidth: 70, format: (val) => formatDecimal(val), description: "Average True Range (Volatility)" },
  { key: 'rsi', label: 'RSI', defaultVisible: false, isToggleable: true, isDraggable: true, align: 'right', defaultWidth: 70, format: (val) => formatDecimal(val, 1), description: "Relative Strength Index" },
  { key: 'vwap', label: 'VWAP', defaultVisible: false, isToggleable: true, isDraggable: true, align: 'right', defaultWidth: 90, format: (val) => `$${formatDecimal(val)}`, description: "Volume Weighted Average Price" },
  { key: 'beta', label: 'Beta', defaultVisible: false, isToggleable: true, isDraggable: true, align: 'right', defaultWidth: 70, format: (val) => formatDecimal(val, 2), description: "Market Risk Measure" },
  { key: 'high52', label: '52W High', defaultVisible: false, isToggleable: true, isDraggable: true, align: 'right', defaultWidth: 90, format: (val) => `$${formatDecimal(val)}`, description: "52-Week High Price" },
  { key: 'low52', label: '52W Low', defaultVisible: false, isToggleable: true, isDraggable: true, align: 'right', defaultWidth: 90, format: (val) => `$${formatDecimal(val)}`, description: "52-Week Low Price" },
  { key: 'gapPercent', label: 'Gap %', defaultVisible: false, isToggleable: true, isDraggable: true, align: 'right', defaultWidth: 80, format: formatPercentage, description: "Today's Price Gap Percentage" },
  { key: 'shortFloat', label: 'Short %', defaultVisible: false, isToggleable: true, isDraggable: true, align: 'right', defaultWidth: 80, format: formatPercentage, description: "Short Interest as % of Float" },
  { key: 'instOwn', label: 'Inst. Own %', defaultVisible: false, isToggleable: true, isDraggable: true, align: 'right', defaultWidth: 100, format: formatPercentage, description: "Institutional Ownership Percentage" },
  { key: 'premarketChange', label: 'Pre-Mkt %', defaultVisible: false, isToggleable: true, isDraggable: true, align: 'right', defaultWidth: 100, format: formatPercentage, description: "Pre-Market Change Percentage" },
  { key: 'peRatio', label: 'P/E Ratio', defaultVisible: false, isToggleable: true, isDraggable: true, align: 'right', defaultWidth: 80, format: (val) => val ? val.toFixed(1) : 'N/A', description: "Price-to-Earnings Ratio" },
  { key: 'dividendYield', label: 'Div Yield', defaultVisible: false, isToggleable: true, isDraggable: true, align: 'right', defaultWidth: 90, format: (val) => val ? `${val.toFixed(2)}%` : 'N/A', description: "Dividend Yield Percentage" },
  { key: 'sector', label: 'Sector', defaultVisible: false, isToggleable: true, isDraggable: true, align: 'left', defaultWidth: 150, description: "Industry Sector" },
  { key: 'earningsDate', label: 'Earnings', defaultVisible: false, isToggleable: true, isDraggable: true, align: 'left', defaultWidth: 120, format: (val) => val ? format(new Date(val), 'MMM dd, yyyy') : 'N/A', description: "Next Earnings Date" },
];


export const initialMockStocks: Stock[] = [
  { id: '1', symbol: 'AAPL', name: 'Apple Inc.', price: 170.34, changePercent: 2.5, float: 15000, volume: 90.5, newsSnippet: 'New iPhone announced.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [168, 169, 170, 171, 170.5, 172, 170.34], marketCap: 170.34 * 15000 * 1e6, avgVolume: 85.2, atr: 3.4, rsi: 60.1, vwap: 170.25, beta: 1.2, high52: 190.5, low52: 150.2, gapPercent: 0.5, shortFloat: 1.5, instOwn: 65.2, premarketChange: 0.3, peRatio: 28.5, dividendYield: 0.5, sector: 'Technology', earningsDate: '2024-07-28T00:00:00.000Z' },
  { id: '2', symbol: 'MSFT', name: 'Microsoft Corp.', price: 420.72, changePercent: -1.2, float: 7000, volume: 60.2, newsSnippet: 'AI partnership.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [425, 422, 423, 420, 421, 419, 420.72], marketCap: 420.72 * 7000 * 1e6, avgVolume: 55.0, atr: 8.1, rsi: 40.5, vwap: 420.80, beta: 1.1, high52: 450.0, low52: 300.0, gapPercent: -0.2, shortFloat: 0.8, instOwn: 70.1, premarketChange: -0.1, peRatio: 35.2, dividendYield: 0.7, sector: 'Technology', earningsDate: '2024-07-22T00:00:00.000Z' },
  { id: '3', symbol: 'TSLA', name: 'Tesla, Inc.', price: 180.01, changePercent: 5.8, float: 800, volume: 120.1, newsSnippet: 'Cybertruck deliveries ramp up.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', historicalPrices: [170, 172, 175, 173, 178, 181, 180.01], marketCap: 180.01 * 800 * 1e6, avgVolume: 110.5, atr: 5.5, rsi: 75.2, vwap: 179.90, beta: 1.8, high52: 180.01, low52: 150.0, gapPercent: 1.2, shortFloat: 15.3, instOwn: 45.0, premarketChange: 0.8, peRatio: 60.1, dividendYield: 0.0, sector: 'Consumer Discretionary', earningsDate: '2024-07-19T00:00:00.000Z' },
  { id: '4', symbol: 'NVDA', name: 'NVIDIA Corporation', price: 900.50, changePercent: 0.5, float: 2500, volume: 75.3, newsSnippet: 'New GPU unveiled.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [890, 895, 900, 905, 902, 903, 900.50], marketCap: 900.50 * 2500 * 1e6, avgVolume: 70.1, atr: 20.0, rsi: 65.0, vwap: 900.60, beta: 1.5, high52: 950.0, low52: 400.0, gapPercent: 0.1, shortFloat: 2.1, instOwn: 60.5, premarketChange: 0.2, peRatio: 75.0, dividendYield: 0.02, sector: 'Technology', earningsDate: '2024-08-15T00:00:00.000Z' },
  { id: '5', symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)', price: 140.22, changePercent: 1.1, float: 6000, volume: 40.8, newsSnippet: 'Search algorithm update.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [138, 139, 140, 139.5, 141, 140.5, 140.22], marketCap: 140.22 * 6000 * 1e6, avgVolume: 38.0, atr: 2.5, rsi: 55.8, vwap: 140.15, beta: 1.0, high52: 160.0, low52: 120.0, gapPercent: 0.3, shortFloat: 1.0, instOwn: 75.3, premarketChange: 0.1, peRatio: 25.8, dividendYield: 0.0, sector: 'Communication Services', earningsDate: '2024-07-25T00:00:00.000Z' },
  { id: '6', symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 185.50, changePercent: 1.8, float: 10000, volume: 52.3, newsSnippet: 'Prime Day sales exceed expectations.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [182.1, 183.5, 184.0, 185.8, 185.1, 186.2, 185.5], marketCap: 185.50 * 10000 * 1e6, avgVolume: 50.1, atr: 3.5, rsi: 62.0, vwap: 185.40, beta: 1.15, high52: 190.00, low52: 125.00, gapPercent: 0.4, shortFloat: 1.2, instOwn: 60.0, premarketChange: 0.25, peRatio: 55.0, dividendYield: 0.0, sector: 'Consumer Discretionary', earningsDate: '2024-08-01T00:00:00.000Z' },
  { id: '7', symbol: 'SNOW', name: 'Snowflake Inc.', price: 120.00, changePercent: -2.1, float: 300, volume: 5.5, newsSnippet: 'Lowered guidance for next quarter.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [132.0, 131.5, 130.0, 129.5, 128.0, 127.5, 128.75], marketCap: 128.75 * 300 * 1e6, avgVolume: 6.2, atr: 4.1, rsi: 38.5, vwap: 129.00, beta: 1.4, high52: 210.00, low52: 120.00, gapPercent: -0.8, shortFloat: 5.5, instOwn: 70.5, premarketChange: -0.5, peRatio: -150.0, dividendYield: 0.0, sector: 'Technology', earningsDate: '2024-08-22T00:00:00.000Z' },
  { id: '8', symbol: 'XOM', name: 'Exxon Mobil Corporation', price: 112.30, changePercent: 0.45, float: 4000, volume: 15.2, newsSnippet: 'Oil prices show slight increase.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [111.8, 112.0, 112.5, 112.1, 112.6, 112.4, 112.3], marketCap: 112.30 * 4000 * 1e6, avgVolume: 16.0, atr: 1.8, rsi: 53.0, vwap: 112.25, beta: 0.9, high52: 125.00, low52: 95.00, gapPercent: 0.1, shortFloat: 1.0, instOwn: 55.8, premarketChange: 0.05, peRatio: 12.3, dividendYield: 3.2, sector: 'Energy', earningsDate: '2024-07-26T00:00:00.000Z' },
  { id: '9', symbol: 'LULU', name: 'Lululemon Athletica Inc.', price: 305.60, changePercent: 3.5, float: 120, volume: 2.1, newsSnippet: 'Strong international sales growth reported.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', historicalPrices: [295.0, 298.5, 300.0, 303.2, 301.8, 306.5, 305.6], marketCap: 305.60 * 120 * 1e6, avgVolume: 1.9, atr: 8.5, rsi: 68.3, vwap: 304.90, beta: 1.3, high52: 420.00, low52: 280.00, gapPercent: 1.1, shortFloat: 4.1, instOwn: 80.2, premarketChange: 0.7, peRatio: 30.5, dividendYield: 0.0, sector: 'Consumer Discretionary', earningsDate: '2024-09-05T00:00:00.000Z' },
  { id: '10', symbol: 'BCTX', name: 'BriaCell Therapeutics Corp.', price: 5.15, changePercent: 15.2, float: 50, volume: 22.5, newsSnippet: 'Positive phase 2 trial results announced.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', historicalPrices: [4.5, 4.6, 4.8, 5.0, 4.9, 5.2, 5.15], marketCap: 5.15 * 50 * 1e6, avgVolume: 5.0, atr: 0.75, rsi: 80.5, vwap: 5.05, beta: 2.1, high52: 10.50, low52: 2.00, gapPercent: 3.2, shortFloat: 18.0, instOwn: 30.1, premarketChange: 1.5, peRatio: -5.2, dividendYield: 0.0, sector: 'Healthcare', earningsDate: '2024-09-12T00:00:00.000Z' },
  { id: '11', symbol: 'CAT', name: 'Caterpillar Inc.', price: 328.40, changePercent: -0.25, float: 500, volume: 1.1, newsSnippet: 'Infrastructure spending bill faces delays.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [329.0, 328.5, 328.8, 328.0, 328.6, 328.2, 328.4], marketCap: 328.40 * 500 * 1e6, avgVolume: 1.5, atr: 5.2, rsi: 48.0, vwap: 328.50, beta: 1.05, high52: 360.00, low52: 280.00, gapPercent: -0.1, shortFloat: 0.9, instOwn: 72.3, premarketChange: 0.0, peRatio: 15.7, dividendYield: 1.6, sector: 'Industrials', earningsDate: '2024-08-02T00:00:00.000Z' },
  { id: '12', symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 198.88, changePercent: 0.05, float: 2800, volume: 8.3, newsSnippet: 'Federal Reserve maintains current interest rates.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [198.5, 199.0, 198.7, 198.9, 198.6, 199.1, 198.88], marketCap: 198.88 * 2800 * 1e6, avgVolume: 9.0, atr: 2.5, rsi: 51.2, vwap: 198.85, beta: 0.95, high52: 210.00, low52: 150.00, gapPercent: 0.0, shortFloat: 0.7, instOwn: 78.0, premarketChange: -0.02, peRatio: 11.5, dividendYield: 2.2, sector: 'Financials', earningsDate: '2024-07-12T00:00:00.000Z' },
  { id: '13', symbol: 'AVGO', name: 'Broadcom Inc.', price: 1605.70, changePercent: 2.2, float: 400, volume: 2.3, newsSnippet: 'Demand for AI chips continues to surge.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [1570.0, 1585.5, 1590.0, 1610.2, 1600.8, 1615.5, 1605.7], marketCap: 1605.70 * 400 * 1e6, avgVolume: 2.0, atr: 35.0, rsi: 66.7, vwap: 1603.00, beta: 1.25, high52: 1700.00, low52: 800.00, gapPercent: 0.6, shortFloat: 1.8, instOwn: 85.0, premarketChange: 0.4, peRatio: 45.3, dividendYield: 1.2, sector: 'Technology', earningsDate: '2024-09-04T00:00:00.000Z' },
  { id: '14', symbol: 'KSS', name: "Kohl's Corporation", price: 23.50, changePercent: -1.5, float: 110, volume: 3.1, newsSnippet: 'Retail sales disappoint for the month.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [24.0, 23.8, 23.6, 23.4, 23.7, 23.3, 23.5], marketCap: 23.50 * 110 * 1e6, avgVolume: 3.5, atr: 0.9, rsi: 35.0, vwap: 23.55, beta: 1.6, high52: 35.00, low52: 20.00, gapPercent: -0.5, shortFloat: 12.5, instOwn: 63.4, premarketChange: -0.2, peRatio: 10.1, dividendYield: 8.5, sector: 'Consumer Discretionary', earningsDate: '2024-08-20T00:00:00.000Z' },
  { id: '15', symbol: 'RIVN', name: 'Rivian Automotive, Inc.', price: 10.80, changePercent: -4.2, float: 850, volume: 33.8, newsSnippet: 'Production targets missed, stock downgraded.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', historicalPrices: [11.5, 11.2, 11.0, 10.7, 10.9, 10.6, 10.8], marketCap: 10.80 * 850 * 1e6, avgVolume: 30.0, atr: 0.8, rsi: 30.1, vwap: 10.85, beta: 2.3, high52: 25.00, low52: 8.50, gapPercent: -1.8, shortFloat: 25.2, instOwn: 40.7, premarketChange: -0.9, peRatio: -1.5, dividendYield: 0.0, sector: 'Consumer Discretionary', earningsDate: '2024-08-07T00:00:00.000Z' },
  { id: '16', symbol: 'CRM', name: 'Salesforce, Inc.', price: 232.10, changePercent: 1.15, float: 920, volume: 4.2, newsSnippet: 'Acquires smaller AI startup.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [229.0, 230.5, 231.0, 232.5, 231.7, 233.0, 232.1], marketCap: 232.10 * 920 * 1e6, avgVolume: 4.0, atr: 5.5, rsi: 58.0, vwap: 232.00, beta: 1.1, high52: 280.00, low52: 180.00, gapPercent: 0.3, shortFloat: 2.0, instOwn: 88.1, premarketChange: 0.15, peRatio: 70.2, dividendYield: 0.0, sector: 'Technology', earningsDate: '2024-08-28T00:00:00.000Z' },
  { id: '17', symbol: 'NEE', name: 'NextEra Energy, Inc.', price: 72.50, changePercent: 0.75, float: 2000, volume: 10.5, newsSnippet: 'Invests heavily in new solar projects.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [71.8, 72.0, 72.3, 72.8, 72.4, 72.9, 72.5], marketCap: 72.50 * 2000 * 1e6, avgVolume: 11.2, atr: 1.2, rsi: 54.5, vwap: 72.45, beta: 0.7, high52: 85.00, low52: 60.00, gapPercent: 0.2, shortFloat: 0.5, instOwn: 79.8, premarketChange: 0.1, peRatio: 18.9, dividendYield: 2.8, sector: 'Utilities', earningsDate: '2024-07-23T00:00:00.000Z' },
  { id: '18', symbol: 'GTHX', name: 'G1 Therapeutics, Inc.', price: 14.90, changePercent: -0.8, float: 80, volume: 0.45, newsSnippet: 'Awaiting FDA decision, quiet period.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [15.2, 15.1, 15.0, 14.8, 14.95, 14.7, 14.9], marketCap: 14.90 * 80 * 1e6, avgVolume: 0.6, atr: 1.1, rsi: 28.0, vwap: 14.92, beta: 1.7, high52: 30.00, low52: 10.00, gapPercent: -0.1, shortFloat: 8.2, instOwn: 50.3, premarketChange: 0.05, peRatio: -8.1, dividendYield: 0.0, sector: 'Healthcare', earningsDate: '2024-08-06T00:00:00.000Z' },
  { id: '19', symbol: 'UAL', name: 'United Airlines Holdings, Inc.', price: 51.20, changePercent: 2.9, float: 320, volume: 7.2, newsSnippet: 'Travel demand remains strong for summer.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [49.8, 50.1, 50.5, 51.5, 51.0, 51.8, 51.2], marketCap: 51.20 * 320 * 1e6, avgVolume: 6.5, atr: 1.5, rsi: 60.7, vwap: 51.10, beta: 1.5, high52: 60.00, low52: 35.00, gapPercent: 0.7, shortFloat: 3.3, instOwn: 68.9, premarketChange: 0.3, peRatio: 5.8, dividendYield: 0.0, sector: 'Industrials', earningsDate: '2024-07-16T00:00:00.000Z' },
  { id: '20', symbol: 'RBLX', name: 'Roblox Corporation', price: 35.75, changePercent: 0.1, float: 550, volume: 10.1, newsSnippet: 'User engagement metrics stable.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [35.5, 35.6, 35.8, 35.7, 35.9, 35.65, 35.75], marketCap: 35.75 * 550 * 1e6, avgVolume: 12.0, atr: 1.3, rsi: 50.2, vwap: 35.70, beta: 1.9, high52: 50.00, low52: 25.00, gapPercent: 0.0, shortFloat: 7.8, instOwn: 73.5, premarketChange: -0.05, peRatio: -20.3, dividendYield: 0.0, sector: 'Communication Services', earningsDate: '2024-08-08T00:00:00.000Z' },
  { id: '21', symbol: 'PYPL', name: 'PayPal Holdings, Inc.', price: 60.10, changePercent: -0.5, float: 1100, volume: 12.5, newsSnippet: 'New CEO outlines turnaround plan.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [60.5, 60.2, 59.8, 60.3, 60.0, 60.15, 60.10], marketCap: 60.10 * 1100 * 1e6, avgVolume: 15.0, atr: 1.8, rsi: 45.0, vwap: 60.05, beta: 1.3, high52: 80.00, low52: 50.00, gapPercent: -0.2, shortFloat: 2.5, instOwn: 70.0, premarketChange: -0.1, peRatio: 15.1, dividendYield: 0.0, sector: 'Financials', earningsDate: '2024-08-01T00:00:00.000Z' },
  { id: '22', symbol: 'INTC', name: 'Intel Corporation', price: 30.50, changePercent: 1.2, float: 4200, volume: 45.0, newsSnippet: 'Foundry services gain new customer.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [30.0, 30.2, 30.6, 30.4, 30.8, 30.3, 30.50], marketCap: 30.50 * 4200 * 1e6, avgVolume: 50.0, atr: 0.9, rsi: 58.0, vwap: 30.45, beta: 1.0, high52: 50.00, low52: 25.00, gapPercent: 0.3, shortFloat: 1.1, instOwn: 65.0, premarketChange: 0.15, peRatio: 32.0, dividendYield: 1.8, sector: 'Technology', earningsDate: '2024-07-25T00:00:00.000Z' },
  { id: '23', symbol: 'DIS', name: 'The Walt Disney Company', price: 102.00, changePercent: 0.8, float: 1800, volume: 8.0, newsSnippet: 'Streaming subscriber growth slows.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [101.0, 101.5, 102.5, 101.8, 102.2, 102.1, 102.00], marketCap: 102.00 * 1800 * 1e6, avgVolume: 10.0, atr: 2.5, rsi: 52.0, vwap: 101.90, beta: 1.2, high52: 120.00, low52: 80.00, gapPercent: 0.1, shortFloat: 0.9, instOwn: 68.0, premarketChange: 0.05, peRatio: 110.5, dividendYield: 0.3, sector: 'Communication Services', earningsDate: '2024-08-06T00:00:00.000Z' },
  { id: '24', symbol: 'BA', name: 'The Boeing Company', price: 175.00, changePercent: -1.8, float: 580, volume: 5.5, newsSnippet: 'Production delays on key aircraft model.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', historicalPrices: [178.0, 177.0, 176.5, 175.5, 176.0, 174.5, 175.00], marketCap: 175.00 * 580 * 1e6, avgVolume: 6.0, atr: 4.0, rsi: 38.0, vwap: 175.20, beta: 1.4, high52: 250.00, low52: 150.00, gapPercent: -0.5, shortFloat: 3.0, instOwn: 60.0, premarketChange: -0.3, peRatio: -50.2, dividendYield: 0.0, sector: 'Industrials', earningsDate: '2024-07-24T00:00:00.000Z' },
  { id: '25', symbol: 'AMD', name: 'Advanced Micro Devices, Inc.', price: 160.75, changePercent: 3.1, float: 1600, volume: 60.0, newsSnippet: 'New AI chip outperforms competitors.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [155.0, 157.0, 159.0, 158.0, 161.0, 160.0, 160.75], marketCap: 160.75 * 1600 * 1e6, avgVolume: 55.0, atr: 5.0, rsi: 65.0, vwap: 160.50, beta: 1.5, high52: 200.00, low52: 100.00, gapPercent: 0.8, shortFloat: 1.5, instOwn: 72.0, premarketChange: 0.4, peRatio: 230.0, dividendYield: 0.0, sector: 'Technology', earningsDate: '2024-07-30T00:00:00.000Z' },
  { id: '26', symbol: 'CVNA', name: 'Carvana Co.', price: 115.20, changePercent: 8.5, float: 70, volume: 15.0, newsSnippet: 'Short squeeze potential noted by analysts.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', historicalPrices: [105.0, 108.0, 112.0, 110.0, 116.0, 114.0, 115.20], marketCap: 115.20 * 70 * 1e6, avgVolume: 10.0, atr: 10.0, rsi: 78.0, vwap: 114.50, beta: 2.5, high52: 150.00, low52: 10.00, gapPercent: 2.0, shortFloat: 40.0, instOwn: 50.0, premarketChange: 1.5, peRatio: -10.8, dividendYield: 0.0, sector: 'Consumer Discretionary', earningsDate: '2024-08-01T00:00:00.000Z' },
  { id: '27', symbol: 'PFE', name: 'Pfizer Inc.', price: 28.30, changePercent: 0.2, float: 5600, volume: 25.0, newsSnippet: 'Positive trial results for new vaccine.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [28.0, 28.1, 28.4, 28.2, 28.5, 28.25, 28.30], marketCap: 28.30 * 5600 * 1e6, avgVolume: 30.0, atr: 0.7, rsi: 50.0, vwap: 28.28, beta: 0.8, high52: 45.00, low52: 25.00, gapPercent: 0.0, shortFloat: 0.5, instOwn: 75.0, premarketChange: 0.02, peRatio: 70.5, dividendYield: 5.9, sector: 'Healthcare', earningsDate: '2024-07-31T00:00:00.000Z' },
  { id: '28', symbol: 'UBER', name: 'Uber Technologies, Inc.', price: 70.60, changePercent: -0.9, float: 2000, volume: 18.0, newsSnippet: 'Regulatory concerns in European markets.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [71.5, 71.0, 70.8, 70.5, 70.9, 70.4, 70.60], marketCap: 70.60 * 2000 * 1e6, avgVolume: 20.0, atr: 2.0, rsi: 42.0, vwap: 70.65, beta: 1.6, high52: 85.00, low52: 40.00, gapPercent: -0.3, shortFloat: 1.8, instOwn: 78.0, premarketChange: -0.1, peRatio: 105.0, dividendYield: 0.0, sector: 'Industrials', earningsDate: '2024-08-06T00:00:00.000Z' },
  { id: '29', symbol: 'SHOP', name: 'Shopify Inc.', price: 65.40, changePercent: 1.5, float: 1200, volume: 7.0, newsSnippet: 'Announces new features for merchants.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [64.0, 64.5, 65.0, 65.8, 65.2, 65.5, 65.40], marketCap: 65.40 * 1200 * 1e6, avgVolume: 9.0, atr: 2.2, rsi: 60.0, vwap: 65.30, beta: 1.7, high52: 90.00, low52: 45.00, gapPercent: 0.4, shortFloat: 2.2, instOwn: 60.0, premarketChange: 0.2, peRatio: -300.0, dividendYield: 0.0, sector: 'Technology', earningsDate: '2024-08-01T00:00:00.000Z' },
  { id: '30', symbol: 'SQ', name: 'Block, Inc.', price: 64.80, changePercent: -2.2, float: 500, volume: 10.0, newsSnippet: 'Competition heating up in payment space.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [66.5, 66.0, 65.5, 65.0, 65.2, 64.5, 64.80], marketCap: 64.80 * 500 * 1e6, avgVolume: 12.0, atr: 2.5, rsi: 35.0, vwap: 64.90, beta: 1.9, high52: 100.00, low52: 40.00, gapPercent: -0.7, shortFloat: 5.0, instOwn: 67.0, premarketChange: -0.4, peRatio: 80.2, dividendYield: 0.0, sector: 'Financials', earningsDate: '2024-08-01T00:00:00.000Z' },
  { id: '31', symbol: 'ZM', name: 'Zoom Video Communications, Inc.', price: 58.00, changePercent: 0.1, float: 280, volume: 4.0, newsSnippet: 'Enterprise adoption continues steadily.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [57.5, 57.8, 58.2, 57.9, 58.1, 58.05, 58.00], marketCap: 58.00 * 280 * 1e6, avgVolume: 5.0, atr: 1.5, rsi: 48.0, vwap: 57.95, beta: 1.4, high52: 80.00, low52: 50.00, gapPercent: 0.0, shortFloat: 3.5, instOwn: 55.0, premarketChange: 0.01, peRatio: 28.1, dividendYield: 0.0, sector: 'Technology', earningsDate: '2024-08-19T00:00:00.000Z' },
  { id: '32', symbol: 'COIN', name: 'Coinbase Global, Inc.', price: 225.50, changePercent: 5.2, float: 200, volume: 12.0, newsSnippet: 'Bitcoin price surge boosts crypto stocks.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', historicalPrices: [210.0, 215.0, 220.0, 218.0, 226.0, 224.0, 225.50], marketCap: 225.50 * 200 * 1e6, avgVolume: 10.0, atr: 15.0, rsi: 72.0, vwap: 224.80, beta: 2.8, high52: 300.00, low52: 50.00, gapPercent: 1.5, shortFloat: 10.0, instOwn: 45.0, premarketChange: 0.9, peRatio: 50.7, dividendYield: 0.0, sector: 'Financials', earningsDate: '2024-08-07T00:00:00.000Z' },
  { id: '33', symbol: 'NFLX', name: 'Netflix, Inc.', price: 640.00, changePercent: -0.3, float: 430, volume: 2.5, newsSnippet: 'Password sharing crackdown impact unclear.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [642.0, 641.0, 638.0, 640.5, 639.0, 640.2, 640.00], marketCap: 640.00 * 430 * 1e6, avgVolume: 3.0, atr: 12.0, rsi: 49.0, vwap: 639.80, beta: 1.1, high52: 700.00, low52: 300.00, gapPercent: -0.1, shortFloat: 0.7, instOwn: 80.0, premarketChange: -0.05, peRatio: 45.9, dividendYield: 0.0, sector: 'Communication Services', earningsDate: '2024-07-18T00:00:00.000Z' },
  { id: '34', symbol: 'WMT', name: 'Walmart Inc.', price: 66.50, changePercent: 0.4, float: 2200, volume: 15.0, newsSnippet: 'Retail giant reports steady sales.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [66.0, 66.2, 66.6, 66.4, 66.8, 66.45, 66.50], marketCap: 66.50 * 2200 * 1e6, avgVolume: 18.0, atr: 1.0, rsi: 55.0, vwap: 66.48, beta: 0.7, high52: 70.00, low52: 50.00, gapPercent: 0.1, shortFloat: 0.4, instOwn: 40.0, premarketChange: 0.03, peRatio: 28.0, dividendYield: 1.3, sector: 'Consumer Staples', earningsDate: '2024-08-15T00:00:00.000Z' },
  { id: '35', symbol: 'COST', name: 'Costco Wholesale Corporation', price: 840.20, changePercent: 0.9, float: 440, volume: 1.0, newsSnippet: 'Membership renewal rates remain high.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [830.0, 835.0, 838.0, 842.0, 839.5, 841.0, 840.20], marketCap: 840.20 * 440 * 1e6, avgVolume: 1.2, atr: 10.0, rsi: 68.0, vwap: 840.00, beta: 0.9, high52: 850.00, low52: 500.00, gapPercent: 0.2, shortFloat: 0.6, instOwn: 70.0, premarketChange: 0.1, peRatio: 49.8, dividendYield: 0.5, sector: 'Consumer Staples', earningsDate: '2024-09-26T00:00:00.000Z' },
  { id: '36', symbol: 'GE', name: 'General Electric Company', price: 165.20, changePercent: -0.5, float: 1080, volume: 4.1, newsSnippet: 'Aerospace division shows strong growth.', lastUpdated: MOCK_INITIAL_TIMESTAMP, marketCap: 178.42 * 10^9, avgVolume: 5.2, atr: 3.153, rsi: 55.3, vwap: 165.10, beta: 1.02, high52: 180.50, low52: 130.75, gapPercent: -0.1, shortFloat: 1.2, instOwn: 78.5, premarketChange: -0.05, peRatio: 20.5, dividendYield: 0.7, sector: 'Industrials', earningsDate: '2024-07-23T00:00:00.000Z' },
  { id: '37', symbol: 'BAC', name: 'Bank of America Corporation', price: 39.80, changePercent: 1.2, float: 8100, volume: 35.5, newsSnippet: 'Bank earnings exceed expectations.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', marketCap: 314.42 * 10^9, avgVolume: 40.1, atr: 0.752, rsi: 62.1, vwap: 39.75, beta: 1.15, high52: 42.10, low52: 30.50, gapPercent: 0.3, shortFloat: 0.8, instOwn: 70.2, premarketChange: 0.15, peRatio: 11.8, dividendYield: 2.4, sector: 'Financials', earningsDate: '2024-07-16T00:00:00.000Z' },
  { id: '38', symbol: 'XLE', name: 'Energy Select Sector SPDR Fund', price: 92.75, changePercent: 0.3, float: 0, volume: 12.3, newsSnippet: 'Energy sector ETF tracking oil prices.', lastUpdated: MOCK_INITIAL_TIMESTAMP, marketCap: 40.00 * 10^9, avgVolume: 15.0, atr: 1.205, rsi: 58.0, vwap: 92.70, beta: 1.0, high52: 95.80, low52: 75.20, gapPercent: 0.05, shortFloat: 2.5, instOwn: 60.0, premarketChange: 0.02, peRatio: 10.5, dividendYield: 3.5, sector: 'ETF', earningsDate: undefined },
  { id: '39', symbol: 'FSR', name: 'Fisker Inc.', price: 0.152, changePercent: -5.2, float: 350, volume: 80.1, newsSnippet: 'EV company faces bankruptcy concerns.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', marketCap: 53.2 * 10^6, avgVolume: 65.0, atr: 0.025, rsi: 25.5, vwap: 0.155, beta: 2.5, high52: 2.50, low52: 0.10, gapPercent: -1.5, shortFloat: 35.0, instOwn: 20.5, premarketChange: -0.8, peRatio: -0.1, dividendYield: 0.0, sector: 'Consumer Discretionary', earningsDate: '2024-08-05T00:00:00.000Z' },
  { id: '40', symbol: 'PLTR', name: 'Palantir Technologies Inc.', price: 25.80, changePercent: 2.8, float: 1800, volume: 45.6, newsSnippet: 'New government contracts secured.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', marketCap: 55.73 * 10^9, avgVolume: 50.2, atr: 0.95, rsi: 68.2, vwap: 25.75, beta: 1.8, high52: 28.10, low52: 15.50, gapPercent: 0.7, shortFloat: 5.1, instOwn: 35.0, premarketChange: 0.4, peRatio: 200.5, dividendYield: 0.0, sector: 'Technology', earningsDate: '2024-08-05T00:00:00.000Z' },
  { id: '41', symbol: 'SOFI', name: 'SoFi Technologies, Inc.', price: 6.95, changePercent: -1.1, float: 900, volume: 22.3, newsSnippet: 'Fintech company reports mixed earnings.', lastUpdated: MOCK_INITIAL_TIMESTAMP, marketCap: 6.5 * 10^9, avgVolume: 25.0, atr: 0.353, rsi: 40.7, vwap: 6.98, beta: 1.9, high52: 10.50, low52: 5.80, gapPercent: -0.2, shortFloat: 12.3, instOwn: 40.1, premarketChange: -0.1, peRatio: -30.2, dividendYield: 0.0, sector: 'Financials', earningsDate: '2024-07-29T00:00:00.000Z' },
  { id: '42', symbol: 'RIOT', name: 'Riot Platforms, Inc.', price: 10.25, changePercent: 4.3, float: 220, volume: 18.9, newsSnippet: 'Bitcoin mining stock follows crypto rally.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', marketCap: 2.26 * 10^9, avgVolume: 20.5, atr: 0.851, rsi: 70.1, vwap: 10.20, beta: 3.1, high52: 15.50, low52: 5.10, gapPercent: 1.1, shortFloat: 22.8, instOwn: 30.7, premarketChange: 0.6, peRatio: -15.8, dividendYield: 0.0, sector: 'Financials', earningsDate: '2024-08-12T00:00:00.000Z' },
  { id: '43', symbol: 'MCD', name: "McDonald's Corporation", price: 255.80, changePercent: 0.15, float: 720, volume: 2.1, newsSnippet: 'McDonalds plans new menu items.', lastUpdated: MOCK_INITIAL_TIMESTAMP, marketCap: 186.73 * 10^9, avgVolume: 2.5, atr: 3.506, rsi: 52.3, vwap: 255.75, beta: 0.6, high52: 290.10, low52: 240.50, gapPercent: 0.0, shortFloat: 0.7, instOwn: 80.1, premarketChange: 0.03, peRatio: 23.5, dividendYield: 2.5, sector: 'Consumer Discretionary', earningsDate: '2024-07-29T00:00:00.000Z' },
  { id: '44', symbol: 'PG', name: 'Procter & Gamble Company', price: 168.30, changePercent: -0.2, float: 2300, volume: 5.3, newsSnippet: 'Procter & Gamble faces commodity cost pressures.', lastUpdated: MOCK_INITIAL_TIMESTAMP, marketCap: 399.5 * 10^9, avgVolume: 6.0, atr: 2.152, rsi: 48.8, vwap: 168.35, beta: 0.4, high52: 175.20, low52: 140.80, gapPercent: -0.05, shortFloat: 0.5, instOwn: 65.7, premarketChange: 0.0, peRatio: 26.7, dividendYield: 2.3, sector: 'Consumer Staples', earningsDate: '2024-07-30T00:00:00.000Z' },
  { id: '45', symbol: 'LLY', name: 'Eli Lilly and Company', price: 880.50, changePercent: 1.5, float: 940, volume: 1.8, newsSnippet: 'Eli Lilly drug trial shows positive results.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', marketCap: 834.47 * 10^9, avgVolume: 2.2, atr: 15.208, rsi: 75.6, vwap: 879.80, beta: 0.3, high52: 900.00, low52: 450.20, gapPercent: 0.4, shortFloat: 0.4, instOwn: 82.3, premarketChange: 0.25, peRatio: 130.2, dividendYield: 0.6, sector: 'Healthcare', earningsDate: '2024-08-06T00:00:00.000Z' },
  { id: '46', symbol: 'JNJ', name: 'Johnson & Johnson', price: 148.90, changePercent: 0.05, float: 2400, volume: 7.2, newsSnippet: 'Johnson & Johnson consumer health spinoff complete.', lastUpdated: MOCK_INITIAL_TIMESTAMP, marketCap: 349.41 * 10^9, avgVolume: 8.0, atr: 1.857, rsi: 50.1, vwap: 148.85, beta: 0.5, high52: 160.30, low52: 135.70, gapPercent: 0.01, shortFloat: 0.6, instOwn: 70.9, premarketChange: 0.0, peRatio: 22.7, dividendYield: 3.2, sector: 'Healthcare', earningsDate: '2024-07-17T00:00:00.000Z' },
  { id: '47', symbol: 'TGT', name: 'Target Corporation', price: 145.60, changePercent: -1.8, float: 460, volume: 3.1, newsSnippet: 'Target warns of slowing consumer demand.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', marketCap: 67.7 * 10^9, avgVolume: 3.5, atr: 2.904, rsi: 38.5, vwap: 145.70, beta: 1.1, high52: 170.20, low52: 120.50, gapPercent: -0.5, shortFloat: 3.1, instOwn: 75.8, premarketChange: -0.3, peRatio: 18.5, dividendYield: 3.0, sector: 'Consumer Staples', earningsDate: '2024-08-21T00:00:00.000Z' },
  { id: '48', symbol: 'SMCI', name: 'Super Micro Computer, Inc.', price: 810.20, changePercent: 3.3, float: 50, volume: 6.5, newsSnippet: 'Super Micro Computer benefits from AI server demand.', lastUpdated: MOCK_INITIAL_TIMESTAMP, marketCap: 47.8 * 10^9, avgVolume: 5.8, atr: 40.501, rsi: 60.2, vwap: 808.00, beta: 2.9, high52: 1200.00, low52: 200.50, gapPercent: 0.9, shortFloat: 15.2, instOwn: 55.1, premarketChange: 0.7, peRatio: 45.1, dividendYield: 0.0, sector: 'Technology', earningsDate: '2024-08-13T00:00:00.000Z' },
  { id: '49', symbol: 'DJT', name: 'Trump Media & Technology Group Corp.', price: 35.70, changePercent: -4.1, float: 70, volume: 5.2, newsSnippet: 'Trump Media stock experiences volatility.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', marketCap: 4.92 * 10^9, avgVolume: 6.0, atr: 3.108, rsi: 33.7, vwap: 35.80, beta: 3.5, high52: 70.00, low52: 20.10, gapPercent: -1.2, shortFloat: 18.9, instOwn: 10.3, premarketChange: -0.9, peRatio: -5.0, dividendYield: 0.0, sector: 'Communication Services', earningsDate: '2024-08-14T00:00:00.000Z' },
  { id: '50', symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', price: 547.80, changePercent: 0.22, float: 0, volume: 45.1, newsSnippet: 'S&P 500 ETF tracks broad market movement.', lastUpdated: MOCK_INITIAL_TIMESTAMP, marketCap: 503.01 * 10^9, avgVolume: 50.0, atr: 4.205, rsi: 65.3, vwap: 547.70, beta: 1.0, high52: 550.10, low52: 400.50, gapPercent: 0.05, shortFloat: 1.0, instOwn: 50.0, premarketChange: 0.03, peRatio: 25.0, dividendYield: 1.3, sector: 'ETF', earningsDate: undefined },
];


const initialMockMiloIdeas: MiloTradeIdea[] = [
  {
    id: 'milo1',
    ticker: 'NVDA',
    reason: 'RSI is nearing oversold (currently 32) and float is relatively low (2500M). Possible bounce setup if broader market holds.',
    action: 'Consider buying if volume spikes above 1.5x average (current avg: 70.1M) and price breaks above $905.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  },
  {
    id: 'milo2',
    ticker: 'AMD',
    reason: 'Recent breakout above $160 resistance, confirmed by strong earnings catalyst and sector strength.',
    action: 'Watch for entry on a minor pullback to the $158–$159 support zone. Set stop-loss below $155.',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString()
  },
  {
    id: 'milo3',
    ticker: 'BCTX',
    reason: 'Significant price increase (+15.2%) on high relative volume (22.5M vs 5.0M avg). Positive trial news catalyst.',
    action: 'Potential momentum play. Monitor for continuation above $5.25. High risk due to volatility.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
];

const dummyWatchlistSymbols = ['AAPL', 'MSFT', 'TSLA', 'GOOGL', 'NVDA', 'BCTX'];


function DashboardPageContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [stocks, setStocks] = useState<Stock[]>(initialMockStocks);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [selectedRuleId, setSelectedRuleId] = useState<string>('all');

  const [selectedStockForOrderCard, setSelectedStockForOrderCard] = useState<Stock | null>(null);
  const [orderCardActionType, setOrderCardActionType] = useState<OrderActionType | null>(null);
  const [orderCardInitialTradeMode, setOrderCardInitialTradeMode] = useState<TradeMode | undefined>(undefined);
  const [orderCardMiloActionContext, setOrderCardMiloActionContext] = useState<string | null>(null);

  const { openPositions, addOpenPosition, removeOpenPosition, updateAllPositionsPrices } = useOpenPositionsContext();
  const [miloIdeas, setMiloIdeas] = useState<MiloTradeIdea[]>(initialMockMiloIdeas);
  const [isMiloLoading, setIsMiloLoading] = useState(false);

  const { addTradeToHistory } = useTradeHistoryContext();

  const defaultColumnOrder = useMemo(() => initialColumnConfiguration.map(c => c.key), []);
  const defaultColumnWidths = useMemo(() => {
    const widths: Record<string, number> = {};
    initialColumnConfiguration.forEach(col => {
      widths[col.key as string] = col.defaultWidth || 120;
    });
    return widths;
  }, []);

  const [currentColumnOrder, setCurrentColumnOrder] = useState<(keyof Stock)[]>(defaultColumnOrder);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(defaultColumnWidths);
  
  const [draggedColumnKey, setDraggedColumnKey] = useState<keyof Stock | null>(null);
  const [draggingOverKey, setDraggingOverKey] = useState<keyof Stock | null>(null);
  const [resizingColumnKey, setResizingColumnKey] = useState<string | null>(null);
  const [resizeStartX, setResizeStartX] = useState<number>(0);
  const [initialColumnWidthForResize, setInitialColumnWidthForResize] = useState<number>(0);


  useEffect(() => {
    const savedOrderJSON = localStorage.getItem(LOCAL_STORAGE_COLUMN_ORDER_KEY);
    if (savedOrderJSON) {
      try {
        const savedOrder = JSON.parse(savedOrderJSON) as (keyof Stock)[];
        const validSavedOrder = savedOrder.filter(key => initialColumnConfiguration.some(c => c.key === key));
        const currentConfigKeys = initialColumnConfiguration.map(c => c.key);
        const newKeys = currentConfigKeys.filter(key => !validSavedOrder.includes(key));
        setCurrentColumnOrder([...validSavedOrder, ...newKeys]);
      } catch (e) {
        setCurrentColumnOrder(defaultColumnOrder);
      }
    } else {
      setCurrentColumnOrder(defaultColumnOrder);
    }

    const savedWidthsJSON = localStorage.getItem(LOCAL_STORAGE_COLUMN_WIDTHS_KEY);
    if (savedWidthsJSON) {
      try {
        const savedWidths = JSON.parse(savedWidthsJSON) as Record<string, number>;
        const mergedWidths = { ...defaultColumnWidths, ...savedWidths };
        const finalWidths: Record<string, number> = {};
        initialColumnConfiguration.forEach(col => {
           finalWidths[col.key as string] = mergedWidths[col.key as string] || defaultColumnWidths[col.key as string];
        });
        setColumnWidths(finalWidths);
      } catch (e) {
        setColumnWidths(defaultColumnWidths);
      }
    } else {
      setColumnWidths(defaultColumnWidths);
    }
  }, [defaultColumnOrder, defaultColumnWidths]);


  useEffect(() => {
    if (typeof window !== 'undefined' && currentColumnOrder.length > 0 && currentColumnOrder !== defaultColumnOrder) {
      localStorage.setItem(LOCAL_STORAGE_COLUMN_ORDER_KEY, JSON.stringify(currentColumnOrder));
    }
  }, [currentColumnOrder, defaultColumnOrder]);

  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(columnWidths).length > 0 && columnWidths !== defaultColumnWidths) {
      localStorage.setItem(LOCAL_STORAGE_COLUMN_WIDTHS_KEY, JSON.stringify(columnWidths));
    }
  }, [columnWidths, defaultColumnWidths]);


  const initialVisibleColumns = useMemo(() => {
    const visible: Record<string, boolean> = {};
    initialColumnConfiguration.forEach(col => {
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
    const columnObjectsInOrder = currentColumnOrder
      .map(key => initialColumnConfiguration.find(c => c.key === key))
      .filter(Boolean) as ColumnConfig<Stock>[];
    return columnObjectsInOrder.filter(col => !col.isToggleable || visibleColumns[col.key as string]);
  }, [currentColumnOrder, visibleColumns]);


  const handleRefreshData = useCallback(() => {
    setStocks(prevStocks => {
      const updatedStocksData = prevStocks.map(stock => {
        const priceChangeFactor = 1 + (Math.random() - 0.5) * 0.03;
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
          changePercent: parseFloat(((newPrice / (stock.price > 0 ? stock.price : newPrice) - 1) * 100).toFixed(1)),
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
          instOwn: parseFloat(Math.min(100, Math.max(0, (stock.instOwn || 60) + (Math.random() - 0.5) * 5).toFixed(1))),
          premarketChange: parseFloat(((Math.random() - 0.5) * 3).toFixed(1)),
          lastUpdated: new Date().toISOString(),
          historicalPrices: Array.from({ length: 7 }, (_, i) => parseFloat((newPrice * (1 + (Math.random() - 0.5) * (0.01 * (7-i)))).toFixed(2)))
        };
      });
      return updatedStocksData;
    });
    setLastRefreshed(new Date());
  }, []);

  useEffect(() => {
    if (stocks && stocks.length > 0) {
      updateAllPositionsPrices(stocks);
    }
  }, [stocks, updateAllPositionsPrices]);

  useEffect(() => {
    if (lastRefreshed === null) {
        setLastRefreshed(new Date());
    }
    const intervalId = setInterval(handleRefreshData, DASHBOARD_REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [handleRefreshData, lastRefreshed]);

  useEffect(() => {
    const tickerFromQuery = searchParams.get('ticker');
    if (tickerFromQuery) {
      const stockToSelect = initialMockStocks.find(s => s.symbol.toUpperCase() === tickerFromQuery.toUpperCase());
      if (stockToSelect) {
        setSelectedStockForOrderCard(stockToSelect);
        setOrderCardActionType(null); 
        setOrderCardInitialTradeMode('manual'); 
        setOrderCardMiloActionContext(null); 
         toast({
          title: "Ticker Loaded from Moo Alerts",
          description: `${stockToSelect.symbol} loaded into the trade panel.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Ticker Not Found",
          description: `The ticker "${tickerFromQuery.toUpperCase()}" from Moo Alerts was not found in the screener list.`,
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, toast]); 


  const activeRules = useMemo(() => mockRules.filter(rule => rule.isActive), []);

  const filteredStocks = useMemo(() => {
    let processedStocks = [...stocks];

    switch (selectedRuleId) {
      case 'all':
        return processedStocks;
      case 'my-watchlist':
        return processedStocks.filter(stock => dummyWatchlistSymbols.includes(stock.symbol));
      case 'top-gainers':
        return processedStocks.sort((a, b) => b.changePercent - a.changePercent);
      case 'top-losers':
        return processedStocks.sort((a, b) => a.changePercent - b.changePercent);
      case 'active':
        return processedStocks.sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));
      case '52-week':
        return processedStocks.filter(stock =>
          stock.price && stock.high52 && stock.low52 &&
          (stock.price >= (stock.high52 * 0.98) || stock.price <= (stock.low52 * 1.02))
        );
      default:
        const rule = activeRules.find(r => r.id === selectedRuleId);
        if (!rule) {
          return processedStocks;
        }
        return processedStocks.filter(stock => {
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
  }, [stocks, selectedRuleId, activeRules]);

  const handleSelectStockForOrder = (stock: Stock, action: OrderActionType | null) => {
    setSelectedStockForOrderCard(stock);
    setOrderCardActionType(action);
    setOrderCardInitialTradeMode(undefined);
    setOrderCardMiloActionContext(null);
  };

  const handleClearOrderCard = () => {
    setSelectedStockForOrderCard(null);
    setOrderCardActionType(null);
    setOrderCardInitialTradeMode(undefined);
    setOrderCardMiloActionContext(null);
  };

  const handleMiloIdeaSelect = (idea: MiloTradeIdea) => {
    const stock = stocks.find(s => s.symbol === idea.ticker);
    if (stock) {
        setSelectedStockForOrderCard(stock);

        let parsedActionType: OrderActionType = 'Buy';
        const actionLower = idea.action.toLowerCase();
        if (actionLower.includes('sell') || actionLower.includes('exit') || actionLower.includes('take profit')) {
            parsedActionType = 'Sell';
        } else if (actionLower.includes('short')) {
            parsedActionType = 'Short';
        } else if (actionLower.includes('buy') || actionLower.includes('entry') || actionLower.includes('acquire')) {
            parsedActionType = 'Buy';
        }
        setOrderCardActionType(parsedActionType);
        setOrderCardInitialTradeMode('manual');
        setOrderCardMiloActionContext(idea.action);
         toast({
          title: "Milo Idea Loaded",
          description: `${idea.ticker} details populated in the trade panel.`,
        });
    } else {
        toast({
            variant: "destructive",
            title: "Stock Not Found",
            description: `Could not find ${idea.ticker} in the current screener list.`,
        });
    }
  };

  const handleStockSymbolSubmitFromOrderCard = (symbol: string) => {
    const stockToSelect = stocks.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
    if (stockToSelect) {
      setSelectedStockForOrderCard(stockToSelect);
      setOrderCardActionType(null);
      setOrderCardInitialTradeMode(undefined);
      setOrderCardMiloActionContext(null);
    } else {
      toast({
        variant: "destructive",
        title: "Ticker Not Found",
        description: `The ticker "${symbol.toUpperCase()}" was not found in the screener list.`,
      });
    }
  };


  const handleTradeSubmit = (tradeDetails: TradeRequest) => {
    console.log("Trade Submitted via Order Card:", tradeDetails);
    toast({
      title: "Trade Processing",
      description: `${tradeDetails.action} ${tradeDetails.quantity} ${tradeDetails.symbol} (${tradeDetails.orderType}) submitted. Origin: ${tradeDetails.tradeModeOrigin || 'manual'}`,
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
        tradeModeOrigin: tradeDetails.tradeModeOrigin || 'manual',
        takeProfit: tradeDetails.takeProfit,
        stopLoss: tradeDetails.stopLoss,
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
            origin: tradeDetails.tradeModeOrigin || 'manual',
        };
        addOpenPosition(newPosition);
    }
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
    exportToCSV('stock_screener_data.csv', filteredStocks, initialColumnConfiguration);
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

  const handleRefreshMiloIdeas = useCallback(() => {
    setIsMiloLoading(true);
    setTimeout(() => {
      const shuffledIdeas = [...initialMockMiloIdeas].sort(() => Math.random() - 0.5);
      const updatedIdeas = shuffledIdeas.map(idea => ({
        ...idea,
        id: `${idea.id}_${Date.now()}`,
        timestamp: new Date().toISOString()
      }));
      setMiloIdeas(updatedIdeas.slice(0, 3 + Math.floor(Math.random()*2)));
      setIsMiloLoading(false);
    }, 1500);
  }, []);

  const handleDragStart = (e: React.DragEvent<HTMLTableCellElement>, columnKey: keyof Stock) => {
    e.dataTransfer.setData('draggedColumnKey', columnKey as string);
    setDraggedColumnKey(columnKey);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableCellElement>, columnKey: keyof Stock) => {
    e.preventDefault();
    if (draggedColumnKey && draggedColumnKey !== columnKey) {
        setDraggingOverKey(columnKey);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLTableCellElement>) => {
    setDraggingOverKey(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLTableCellElement>, targetColumnKey: keyof Stock) => {
    e.preventDefault();
    const sourceColumnKey = e.dataTransfer.getData('draggedColumnKey') as keyof Stock;
    setDraggingOverKey(null);
    setDraggedColumnKey(null);

    const sourceColConfig = initialColumnConfiguration.find(c => c.key === sourceColumnKey);
    const targetColConfig = initialColumnConfiguration.find(c => c.key === targetColumnKey);

    if (sourceColumnKey && targetColumnKey && sourceColumnKey !== targetColumnKey && sourceColConfig?.isDraggable && targetColConfig?.isDraggable) {
      setCurrentColumnOrder(prevOrder => {
        const newOrder = [...prevOrder];
        const draggedIndex = newOrder.indexOf(sourceColumnKey);
        const targetIndex = newOrder.indexOf(targetColumnKey);

        if (draggedIndex === -1 || targetIndex === -1) return prevOrder;

        const [draggedItem] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedItem);
        return newOrder;
      });
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>, columnKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumnKey(columnKey);
    setResizeStartX(e.clientX);
    const currentWidth = columnWidths[columnKey] || initialColumnConfiguration.find(c => c.key === columnKey)?.defaultWidth || 120;
    setInitialColumnWidthForResize(currentWidth);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingColumnKey) return;
      const deltaX = e.clientX - resizeStartX;
      const newWidth = Math.max(MIN_COLUMN_WIDTH, initialColumnWidthForResize + deltaX);
      setColumnWidths(prev => ({ ...prev, [resizingColumnKey]: newWidth }));
    };

    const handleMouseUp = () => {
      if (resizingColumnKey) {
        setResizingColumnKey(null);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    if (resizingColumnKey) {
      document.body.addEventListener('mousemove', handleMouseMove);
      document.body.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.body.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [resizingColumnKey, resizeStartX, initialColumnWidthForResize]);


  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Dashboard" />
      <div className="flex flex-1 p-1 md:p-1.5 space-x-0 md:space-x-1.5 overflow-hidden">

        <div className="flex-1 flex flex-col overflow-hidden space-y-1.5">
          <Card className="shadow-none flex-1 flex flex-col overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
              <div>
                <CardTitle className="text-2xl font-headline">Real-Time Stock Screener</CardTitle>
                <CardDescription>Filter and find top market movers based on selected rule.</CardDescription>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {lastRefreshed && <Dot className="h-6 w-6 text-[hsl(var(--confirm-green))] animate-pulse" />}
                {lastRefreshed && <span className="text-xs text-muted-foreground">Refreshed: {lastRefreshed.toLocaleTimeString()}</span>}
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleRefreshData}
                  className="h-7 px-2 text-xs"
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Refresh
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="default" size="sm" className="h-7 px-2 text-xs">
                      <Columns className="mr-1.5 h-3.5 w-3.5" /> Columns
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto max-w-xs md:max-w-sm p-0">
                     <div className="p-1 border-b border-border/[.1]">
                        <h4 className="font-medium text-xs text-foreground">Customize Columns</h4>
                     </div>
                     <ScrollArea className="h-[250px] md:h-[350px]">
                      <TooltipProvider>
                        <div className="p-1 space-y-0.5">
                          {initialColumnConfiguration
                            .filter(col => col.isToggleable)
                            .map(col => (
                              <Tooltip key={`tooltip-${col.key as string}`}>
                                <TooltipTrigger asChild>
                                  <Label
                                    htmlFor={`col-${col.key as string}`}
                                    className={cn(
                                      "flex items-center space-x-1 p-1 rounded-md hover:bg-white/5 transition-colors w-full",
                                      !visibleColumns[col.key as string] && "opacity-75"
                                    )}
                                  >
                                    <Checkbox
                                      id={`col-${col.key as string}`}
                                      checked={visibleColumns[col.key as string]}
                                      onCheckedChange={() => toggleColumnVisibility(col.key as string)}
                                    />
                                    <span className="text-xs font-normal text-foreground flex-1">{col.label}</span>
                                    {col.description && <Info className="h-3 w-3 text-muted-foreground opacity-50" />}
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
                  variant="default"
                  size="sm"
                  onClick={handleExport}
                  className="h-7 px-2 text-xs"
                >
                  <UploadCloud className="mr-1.5 h-3.5 w-3.5" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden space-y-1">
              <div className="flex items-center gap-1">
                  <Label htmlFor="ruleSelect" className="text-foreground text-xs font-medium flex items-center">
                    <ListFilter className="mr-1.5 h-3.5 w-3.5 text-primary" /> Apply Screener / Rule:
                  </Label>
                  <Select value={selectedRuleId} onValueChange={(value) => setSelectedRuleId(value)}>
                    <SelectTrigger id="ruleSelect" className="w-auto min-w-[180px] h-8 text-xs">
                        <SelectValue placeholder="Select a screener or rule..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all" className="text-xs">
                          <span className="flex items-center">
                            <List className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Show All Stocks
                          </span>
                        </SelectItem>
                        <SelectItem value="my-watchlist" className="text-xs">
                          <span className="flex items-center">
                            <Star className="mr-1.5 h-3.5 w-3.5 text-yellow-400" /> My Watchlist
                          </span>
                        </SelectItem>
                        <SelectItem value="top-gainers" className="text-[hsl(var(--confirm-green))] text-xs">
                          <span className="flex items-center">
                            <TrendingUp className="mr-1.5 h-3.5 w-3.5" /> Top Gainers
                          </span>
                        </SelectItem>
                        <SelectItem value="top-losers" className="text-destructive text-xs">
                          <span className="flex items-center">
                            <TrendingDown className="mr-1.5 h-3.5 w-3.5" /> Top Losers
                          </span>
                        </SelectItem>
                        <SelectItem value="active" className="text-xs">
                          <span className="flex items-center">
                            <Activity className="mr-1.5 h-3.5 w-3.5 text-primary" /> Most Active
                          </span>
                        </SelectItem>
                        <SelectItem value="52-week" className="text-xs">
                          <span className="flex items-center">
                            <CalendarCheck2 className="mr-1.5 h-3.5 w-3.5 text-accent" /> 52 Week Highs/Lows
                          </span>
                        </SelectItem>
                        {activeRules.map(rule => (
                          <SelectItem key={rule.id} value={rule.id} className="text-xs">
                            <span className="flex items-center">
                              <Filter className="mr-1.5 h-3.5 w-3.5 text-foreground/80" /> {rule.name}
                            </span>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
              </div>

              <div className="rounded-xl overflow-auto flex-1">
                <Table className="table-layout-fixed">
                  <colgroup>
                    {displayedColumns.map(col => (
                      <col key={`coldef-${col.key as string}`} style={{ width: columnWidths[col.key as string] ? `${columnWidths[col.key as string]}px` : (col.defaultWidth ? `${col.defaultWidth}px` : 'auto') }} />
                    ))}
                  </colgroup>
                  <TableHeader className="sticky top-0 bg-card/[.05] backdrop-blur-md z-10">
                    <TableRow>
                      {displayedColumns.map((col) => (
                        <TableHead
                          key={col.key as string}
                          draggable={col.isDraggable}
                          onDragStart={(e) => col.isDraggable && handleDragStart(e, col.key as keyof Stock)}
                          onDragOver={(e) => col.isDraggable && handleDragOver(e, col.key as keyof Stock)}
                          onDragLeave={(e) => col.isDraggable && handleDragLeave(e)}
                          onDrop={(e) => col.isDraggable && handleDrop(e, col.key as keyof Stock)}
                          className={cn(
                            col.align === 'right' && "text-right",
                            col.align === 'center' && "text-center",
                            col.isDraggable && "cursor-grab",
                            draggingOverKey === col.key && "bg-primary/20",
                            "transition-colors duration-150 relative group h-9" // Reduced height
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                             <div className="flex items-center gap-0.5 overflow-hidden">
                                {col.isDraggable ? <GripHorizontal className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" /> : <Lock className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />}
                                <span className="truncate text-xs">{col.label}</span>
                             </div>
                          </div>
                           <div
                              onMouseDown={(e) => handleResizeMouseDown(e, col.key as string)}
                              className="absolute top-0 right-0 h-full w-1 cursor-col-resize opacity-0 group-hover:opacity-100 hover:bg-primary/30 z-20 transition-opacity" // Reduced width
                              title={`Resize ${col.label} column`}
                            />
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
                                "text-foreground text-xs", // Reduced text size
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
                        <TableCell colSpan={displayedColumns.length} className="text-center h-24 text-muted-foreground text-xs">
                          No stocks match the selected filter or rule.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="w-full md:w-96 lg:w-[26rem] hidden md:flex flex-col flex-shrink-0 space-y-1 pr-px overflow-y-auto min-h-[600px]"> {/* Added min-h */}
          <OrderCard
            selectedStock={selectedStockForOrderCard}
            initialActionType={orderCardActionType}
            initialTradeMode={orderCardInitialTradeMode}
            miloActionContextText={orderCardMiloActionContext}
            onSubmit={handleTradeSubmit}
            onClear={handleClearOrderCard}
            onStockSymbolSubmit={handleStockSymbolSubmitFromOrderCard}
            className="min-h-[350px]"
          />
          <OpenPositionsCard className="min-h-[200px]" />
          <MilosTradeIdeasCard
            ideas={miloIdeas}
            onRefresh={handleRefreshMiloIdeas}
            isLoading={isMiloLoading}
            onIdeaSelect={handleMiloIdeaSelect}
            className="min-h-[200px]"
          />
        </div>
      </div>
    </main>
  );
}


export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading Dashboard...</div>}>
      <DashboardPageContent />
    </Suspense>
  );
}

