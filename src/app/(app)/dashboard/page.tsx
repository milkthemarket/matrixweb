
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw, UploadCloud, Flame, Megaphone, Dot, Columns, Info, ListFilter, Bot, Cog } from "lucide-react";
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

const MOCK_INITIAL_TIMESTAMP = '2024-07-01T10:00:00.000Z';
const DASHBOARD_REFRESH_INTERVAL: RefreshInterval = 15000; 

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
  { id: '6', symbol: 'AMZN', price: 185.50, changePercent: 1.8, float: 10000, volume: 52.3, newsSnippet: 'Prime Day sales exceed expectations.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [182.1, 183.5, 184.0, 185.8, 185.1, 186.2, 185.5], marketCap: 185.50 * 10000 * 1e6, avgVolume: 50.1, atr: 3.5, rsi: 62.0, vwap: 185.40, beta: 1.15, high52: 190.00, low52: 125.00, gapPercent: 0.4, shortFloat: 1.2, instOwn: 60.0, premarketChange: 0.25 },
  { id: '7', symbol: 'SNOW', price: 128.75, changePercent: -2.1, float: 300, volume: 5.5, newsSnippet: 'Lowered guidance for next quarter.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [132.0, 131.5, 130.0, 129.5, 128.0, 127.5, 128.75], marketCap: 128.75 * 300 * 1e6, avgVolume: 6.2, atr: 4.1, rsi: 38.5, vwap: 129.00, beta: 1.4, high52: 210.00, low52: 120.00, gapPercent: -0.8, shortFloat: 5.5, instOwn: 70.5, premarketChange: -0.5 },
  { id: '8', symbol: 'XOM', price: 112.30, changePercent: 0.45, float: 4000, volume: 15.2, newsSnippet: 'Oil prices show slight increase.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [111.8, 112.0, 112.5, 112.1, 112.6, 112.4, 112.3], marketCap: 112.30 * 4000 * 1e6, avgVolume: 16.0, atr: 1.8, rsi: 53.0, vwap: 112.25, beta: 0.9, high52: 125.00, low52: 95.00, gapPercent: 0.1, shortFloat: 1.0, instOwn: 55.8, premarketChange: 0.05 },
  { id: '9', symbol: 'LULU', price: 305.60, changePercent: 3.5, float: 120, volume: 2.1, newsSnippet: 'Strong international sales growth reported.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', historicalPrices: [295.0, 298.5, 300.0, 303.2, 301.8, 306.5, 305.6], marketCap: 305.60 * 120 * 1e6, avgVolume: 1.9, atr: 8.5, rsi: 68.3, vwap: 304.90, beta: 1.3, high52: 420.00, low52: 280.00, gapPercent: 1.1, shortFloat: 4.1, instOwn: 80.2, premarketChange: 0.7 },
  { id: '10', symbol: 'BCTX', price: 5.15, changePercent: 15.2, float: 50, volume: 22.5, newsSnippet: 'Positive phase 2 trial results announced.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', historicalPrices: [4.5, 4.6, 4.8, 5.0, 4.9, 5.2, 5.15], marketCap: 5.15 * 50 * 1e6, avgVolume: 5.0, atr: 0.75, rsi: 80.5, vwap: 5.05, beta: 2.1, high52: 10.50, low52: 2.00, gapPercent: 3.2, shortFloat: 18.0, instOwn: 30.1, premarketChange: 1.5 },
  { id: '11', symbol: 'CAT', price: 328.40, changePercent: -0.25, float: 500, volume: 1.1, newsSnippet: 'Infrastructure spending bill faces delays.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [329.0, 328.5, 328.8, 328.0, 328.6, 328.2, 328.4], marketCap: 328.40 * 500 * 1e6, avgVolume: 1.5, atr: 5.2, rsi: 48.0, vwap: 328.50, beta: 1.05, high52: 360.00, low52: 280.00, gapPercent: -0.1, shortFloat: 0.9, instOwn: 72.3, premarketChange: 0.0 },
  { id: '12', symbol: 'JPM', price: 198.88, changePercent: 0.05, float: 2800, volume: 8.3, newsSnippet: 'Federal Reserve maintains current interest rates.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [198.5, 199.0, 198.7, 198.9, 198.6, 199.1, 198.88], marketCap: 198.88 * 2800 * 1e6, avgVolume: 9.0, atr: 2.5, rsi: 51.2, vwap: 198.85, beta: 0.95, high52: 210.00, low52: 150.00, gapPercent: 0.0, shortFloat: 0.7, instOwn: 78.0, premarketChange: -0.02 },
  { id: '13', symbol: 'AVGO', price: 1605.70, changePercent: 2.2, float: 400, volume: 2.3, newsSnippet: 'Demand for AI chips continues to surge.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [1570.0, 1585.5, 1590.0, 1610.2, 1600.8, 1615.5, 1605.7], marketCap: 1605.70 * 400 * 1e6, avgVolume: 2.0, atr: 35.0, rsi: 66.7, vwap: 1603.00, beta: 1.25, high52: 1700.00, low52: 800.00, gapPercent: 0.6, shortFloat: 1.8, instOwn: 85.0, premarketChange: 0.4 },
  { id: '14', symbol: 'KSS', price: 23.50, changePercent: -1.5, float: 110, volume: 3.1, newsSnippet: 'Retail sales disappoint for the month.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [24.0, 23.8, 23.6, 23.4, 23.7, 23.3, 23.5], marketCap: 23.50 * 110 * 1e6, avgVolume: 3.5, atr: 0.9, rsi: 35.0, vwap: 23.55, beta: 1.6, high52: 35.00, low52: 20.00, gapPercent: -0.5, shortFloat: 12.5, instOwn: 63.4, premarketChange: -0.2 },
  { id: '15', symbol: 'RIVN', price: 10.80, changePercent: -4.2, float: 850, volume: 33.8, newsSnippet: 'Production targets missed, stock downgraded.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', historicalPrices: [11.5, 11.2, 11.0, 10.7, 10.9, 10.6, 10.8], marketCap: 10.80 * 850 * 1e6, avgVolume: 30.0, atr: 0.8, rsi: 30.1, vwap: 10.85, beta: 2.3, high52: 25.00, low52: 8.50, gapPercent: -1.8, shortFloat: 25.2, instOwn: 40.7, premarketChange: -0.9 },
  { id: '16', symbol: 'CRM', price: 232.10, changePercent: 1.15, float: 920, volume: 4.2, newsSnippet: 'Acquires smaller AI startup.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [229.0, 230.5, 231.0, 232.5, 231.7, 233.0, 232.1], marketCap: 232.10 * 920 * 1e6, avgVolume: 4.0, atr: 5.5, rsi: 58.0, vwap: 232.00, beta: 1.1, high52: 280.00, low52: 180.00, gapPercent: 0.3, shortFloat: 2.0, instOwn: 88.1, premarketChange: 0.15 },
  { id: '17', symbol: 'NEE', price: 72.50, changePercent: 0.75, float: 2000, volume: 10.5, newsSnippet: 'Invests heavily in new solar projects.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [71.8, 72.0, 72.3, 72.8, 72.4, 72.9, 72.5], marketCap: 72.50 * 2000 * 1e6, avgVolume: 11.2, atr: 1.2, rsi: 54.5, vwap: 72.45, beta: 0.7, high52: 85.00, low52: 60.00, gapPercent: 0.2, shortFloat: 0.5, instOwn: 79.8, premarketChange: 0.1 },
  { id: '18', symbol: 'GTHX', price: 14.90, changePercent: -0.8, float: 80, volume: 0.45, newsSnippet: 'Awaiting FDA decision, quiet period.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [15.2, 15.1, 15.0, 14.8, 14.95, 14.7, 14.9], marketCap: 14.90 * 80 * 1e6, avgVolume: 0.6, atr: 1.1, rsi: 28.0, vwap: 14.92, beta: 1.7, high52: 30.00, low52: 10.00, gapPercent: -0.1, shortFloat: 8.2, instOwn: 50.3, premarketChange: 0.05 },
  { id: '19', symbol: 'UAL', price: 51.20, changePercent: 2.9, float: 320, volume: 7.2, newsSnippet: 'Travel demand remains strong for summer.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [49.8, 50.1, 50.5, 51.5, 51.0, 51.8, 51.2], marketCap: 51.20 * 320 * 1e6, avgVolume: 6.5, atr: 1.5, rsi: 60.7, vwap: 51.10, beta: 1.5, high52: 60.00, low52: 35.00, gapPercent: 0.7, shortFloat: 3.3, instOwn: 68.9, premarketChange: 0.3 },
  { id: '20', symbol: 'RBLX', price: 35.75, changePercent: 0.1, float: 550, volume: 10.1, newsSnippet: 'User engagement metrics stable.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [35.5, 35.6, 35.8, 35.7, 35.9, 35.65, 35.75], marketCap: 35.75 * 550 * 1e6, avgVolume: 12.0, atr: 1.3, rsi: 50.2, vwap: 35.70, beta: 1.9, high52: 50.00, low52: 25.00, gapPercent: 0.0, shortFloat: 7.8, instOwn: 73.5, premarketChange: -0.05 },
  { id: '21', symbol: 'PYPL', price: 60.10, changePercent: -0.5, float: 1100, volume: 12.5, newsSnippet: 'New CEO outlines turnaround plan.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [60.5, 60.2, 59.8, 60.3, 60.0, 60.15, 60.10], marketCap: 60.10 * 1100 * 1e6, avgVolume: 15.0, atr: 1.8, rsi: 45.0, vwap: 60.05, beta: 1.3, high52: 80.00, low52: 50.00, gapPercent: -0.2, shortFloat: 2.5, instOwn: 70.0, premarketChange: -0.1 },
  { id: '22', symbol: 'INTC', price: 30.50, changePercent: 1.2, float: 4200, volume: 45.0, newsSnippet: 'Foundry services gain new customer.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [30.0, 30.2, 30.6, 30.4, 30.8, 30.3, 30.50], marketCap: 30.50 * 4200 * 1e6, avgVolume: 50.0, atr: 0.9, rsi: 58.0, vwap: 30.45, beta: 1.0, high52: 50.00, low52: 25.00, gapPercent: 0.3, shortFloat: 1.1, instOwn: 65.0, premarketChange: 0.15 },
  { id: '23', symbol: 'DIS', price: 102.00, changePercent: 0.8, float: 1800, volume: 8.0, newsSnippet: 'Streaming subscriber growth slows.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [101.0, 101.5, 102.5, 101.8, 102.2, 102.1, 102.00], marketCap: 102.00 * 1800 * 1e6, avgVolume: 10.0, atr: 2.5, rsi: 52.0, vwap: 101.90, beta: 1.2, high52: 120.00, low52: 80.00, gapPercent: 0.1, shortFloat: 0.9, instOwn: 68.0, premarketChange: 0.05 },
  { id: '24', symbol: 'BA', price: 175.00, changePercent: -1.8, float: 580, volume: 5.5, newsSnippet: 'Production delays on key aircraft model.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', historicalPrices: [178.0, 177.0, 176.5, 175.5, 176.0, 174.5, 175.00], marketCap: 175.00 * 580 * 1e6, avgVolume: 6.0, atr: 4.0, rsi: 38.0, vwap: 175.20, beta: 1.4, high52: 250.00, low52: 150.00, gapPercent: -0.5, shortFloat: 3.0, instOwn: 60.0, premarketChange: -0.3 },
  { id: '25', symbol: 'AMD', price: 160.75, changePercent: 3.1, float: 1600, volume: 60.0, newsSnippet: 'New AI chip outperforms competitors.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [155.0, 157.0, 159.0, 158.0, 161.0, 160.0, 160.75], marketCap: 160.75 * 1600 * 1e6, avgVolume: 55.0, atr: 5.0, rsi: 65.0, vwap: 160.50, beta: 1.5, high52: 200.00, low52: 100.00, gapPercent: 0.8, shortFloat: 1.5, instOwn: 72.0, premarketChange: 0.4 },
  { id: '26', symbol: 'CVNA', price: 115.20, changePercent: 8.5, float: 70, volume: 15.0, newsSnippet: 'Short squeeze potential noted by analysts.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', historicalPrices: [105.0, 108.0, 112.0, 110.0, 116.0, 114.0, 115.20], marketCap: 115.20 * 70 * 1e6, avgVolume: 10.0, atr: 10.0, rsi: 78.0, vwap: 114.50, beta: 2.5, high52: 150.00, low52: 10.00, gapPercent: 2.0, shortFloat: 40.0, instOwn: 50.0, premarketChange: 1.5 },
  { id: '27', symbol: 'PFE', price: 28.30, changePercent: 0.2, float: 5600, volume: 25.0, newsSnippet: 'Positive trial results for new vaccine.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [28.0, 28.1, 28.4, 28.2, 28.5, 28.25, 28.30], marketCap: 28.30 * 5600 * 1e6, avgVolume: 30.0, atr: 0.7, rsi: 50.0, vwap: 28.28, beta: 0.8, high52: 45.00, low52: 25.00, gapPercent: 0.0, shortFloat: 0.5, instOwn: 75.0, premarketChange: 0.02 },
  { id: '28', symbol: 'UBER', price: 70.60, changePercent: -0.9, float: 2000, volume: 18.0, newsSnippet: 'Regulatory concerns in European markets.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [71.5, 71.0, 70.8, 70.5, 70.9, 70.4, 70.60], marketCap: 70.60 * 2000 * 1e6, avgVolume: 20.0, atr: 2.0, rsi: 42.0, vwap: 70.65, beta: 1.6, high52: 85.00, low52: 40.00, gapPercent: -0.3, shortFloat: 1.8, instOwn: 78.0, premarketChange: -0.1 },
  { id: '29', symbol: 'SHOP', price: 65.40, changePercent: 1.5, float: 1200, volume: 7.0, newsSnippet: 'Announces new features for merchants.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [64.0, 64.5, 65.0, 65.8, 65.2, 65.5, 65.40], marketCap: 65.40 * 1200 * 1e6, avgVolume: 9.0, atr: 2.2, rsi: 60.0, vwap: 65.30, beta: 1.7, high52: 90.00, low52: 45.00, gapPercent: 0.4, shortFloat: 2.2, instOwn: 60.0, premarketChange: 0.2 },
  { id: '30', symbol: 'SQ', price: 64.80, changePercent: -2.2, float: 500, volume: 10.0, newsSnippet: 'Competition heating up in payment space.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [66.5, 66.0, 65.5, 65.0, 65.2, 64.5, 64.80], marketCap: 64.80 * 500 * 1e6, avgVolume: 12.0, atr: 2.5, rsi: 35.0, vwap: 64.90, beta: 1.9, high52: 100.00, low52: 40.00, gapPercent: -0.7, shortFloat: 5.0, instOwn: 67.0, premarketChange: -0.4 },
  { id: '31', symbol: 'ZM', price: 58.00, changePercent: 0.1, float: 280, volume: 4.0, newsSnippet: 'Enterprise adoption continues steadily.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [57.5, 57.8, 58.2, 57.9, 58.1, 58.05, 58.00], marketCap: 58.00 * 280 * 1e6, avgVolume: 5.0, atr: 1.5, rsi: 48.0, vwap: 57.95, beta: 1.4, high52: 80.00, low52: 50.00, gapPercent: 0.0, shortFloat: 3.5, instOwn: 55.0, premarketChange: 0.01 },
  { id: '32', symbol: 'COIN', price: 225.50, changePercent: 5.2, float: 200, volume: 12.0, newsSnippet: 'Bitcoin price surge boosts crypto stocks.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', historicalPrices: [210.0, 215.0, 220.0, 218.0, 226.0, 224.0, 225.50], marketCap: 225.50 * 200 * 1e6, avgVolume: 10.0, atr: 15.0, rsi: 72.0, vwap: 224.80, beta: 2.8, high52: 300.00, low52: 50.00, gapPercent: 1.5, shortFloat: 10.0, instOwn: 45.0, premarketChange: 0.9 },
  { id: '33', symbol: 'NFLX', price: 640.00, changePercent: -0.3, float: 430, volume: 2.5, newsSnippet: 'Password sharing crackdown impact unclear.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [642.0, 641.0, 638.0, 640.5, 639.0, 640.2, 640.00], marketCap: 640.00 * 430 * 1e6, avgVolume: 3.0, atr: 12.0, rsi: 49.0, vwap: 639.80, beta: 1.1, high52: 700.00, low52: 300.00, gapPercent: -0.1, shortFloat: 0.7, instOwn: 80.0, premarketChange: -0.05 },
  { id: '34', symbol: 'WMT', price: 66.50, changePercent: 0.4, float: 2200, volume: 15.0, newsSnippet: 'Retail giant reports steady sales.', lastUpdated: MOCK_INITIAL_TIMESTAMP, historicalPrices: [66.0, 66.2, 66.6, 66.4, 66.8, 66.45, 66.50], marketCap: 66.50 * 2200 * 1e6, avgVolume: 18.0, atr: 1.0, rsi: 55.0, vwap: 66.48, beta: 0.7, high52: 70.00, low52: 50.00, gapPercent: 0.1, shortFloat: 0.4, instOwn: 40.0, premarketChange: 0.03 },
  { id: '35', symbol: 'COST', price: 840.20, changePercent: 0.9, float: 440, volume: 1.0, newsSnippet: 'Membership renewal rates remain high.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', historicalPrices: [830.0, 835.0, 838.0, 842.0, 839.5, 841.0, 840.20], marketCap: 840.20 * 440 * 1e6, avgVolume: 1.2, atr: 10.0, rsi: 68.0, vwap: 840.00, beta: 0.9, high52: 850.00, low52: 500.00, gapPercent: 0.2, shortFloat: 0.6, instOwn: 70.0, premarketChange: 0.1 },
  { id: '36', symbol: 'GE', price: 165.20, changePercent: -0.5, float: 1080, volume: 4.1, newsSnippet: 'Aerospace division shows strong growth.', lastUpdated: MOCK_INITIAL_TIMESTAMP, marketCap: 178.42 * 10^9, avgVolume: 5.2, atr: 3.153, rsi: 55.3, vwap: 165.10, beta: 1.02, high52: 180.50, low52: 130.75, gapPercent: -0.1, shortFloat: 1.2, instOwn: 78.5, premarketChange: -0.05 },
  { id: '37', symbol: 'BAC', price: 39.80, changePercent: 1.2, float: 8100, volume: 35.5, newsSnippet: 'Bank earnings exceed expectations.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', marketCap: 314.42 * 10^9, avgVolume: 40.1, atr: 0.752, rsi: 62.1, vwap: 39.75, beta: 1.15, high52: 42.10, low52: 30.50, gapPercent: 0.3, shortFloat: 0.8, instOwn: 70.2, premarketChange: 0.15 },
  { id: '38', symbol: 'XLE', price: 92.75, changePercent: 0.3, float: 0, volume: 12.3, newsSnippet: 'Energy sector ETF tracking oil prices.', lastUpdated: MOCK_INITIAL_TIMESTAMP, marketCap: 40.00 * 10^9, avgVolume: 15.0, atr: 1.205, rsi: 58.0, vwap: 92.70, beta: 1.0, high52: 95.80, low52: 75.20, gapPercent: 0.05, shortFloat: 2.5, instOwn: 60.0, premarketChange: 0.02 },
  { id: '39', symbol: 'FSR', price: 0.152, changePercent: -5.2, float: 350, volume: 80.1, newsSnippet: 'EV company faces bankruptcy concerns.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', marketCap: 53.2 * 10^6, avgVolume: 65.0, atr: 0.025, rsi: 25.5, vwap: 0.155, beta: 2.5, high52: 2.50, low52: 0.10, gapPercent: -1.5, shortFloat: 35.0, instOwn: 20.5, premarketChange: -0.8 },
  { id: '40', symbol: 'PLTR', price: 25.80, changePercent: 2.8, float: 1800, volume: 45.6, newsSnippet: 'New government contracts secured.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', marketCap: 55.73 * 10^9, avgVolume: 50.2, atr: 0.95, rsi: 68.2, vwap: 25.75, beta: 1.8, high52: 28.10, low52: 15.50, gapPercent: 0.7, shortFloat: 5.1, instOwn: 35.0, premarketChange: 0.4 },
  { id: '41', symbol: 'SOFI', price: 6.95, changePercent: -1.1, float: 900, volume: 22.3, newsSnippet: 'Fintech company reports mixed earnings.', lastUpdated: MOCK_INITIAL_TIMESTAMP, marketCap: 6.5 * 10^9, avgVolume: 25.0, atr: 0.353, rsi: 40.7, vwap: 6.98, beta: 1.9, high52: 10.50, low52: 5.80, gapPercent: -0.2, shortFloat: 12.3, instOwn: 40.1, premarketChange: -0.1 },
  { id: '42', symbol: 'RIOT', price: 10.25, changePercent: 4.3, float: 220, volume: 18.9, newsSnippet: 'Bitcoin mining stock follows crypto rally.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', marketCap: 2.26 * 10^9, avgVolume: 20.5, atr: 0.851, rsi: 70.1, vwap: 10.20, beta: 3.1, high52: 15.50, low52: 5.10, gapPercent: 1.1, shortFloat: 22.8, instOwn: 30.7, premarketChange: 0.6 },
  { id: '43', symbol: 'MCD', price: 255.80, changePercent: 0.15, float: 720, volume: 2.1, newsSnippet: 'McDonalds plans new menu items.', lastUpdated: MOCK_INITIAL_TIMESTAMP, marketCap: 186.73 * 10^9, avgVolume: 2.5, atr: 3.506, rsi: 52.3, vwap: 255.75, beta: 0.6, high52: 290.10, low52: 240.50, gapPercent: 0.0, shortFloat: 0.7, instOwn: 80.1, premarketChange: 0.03 },
  { id: '44', symbol: 'PG', price: 168.30, changePercent: -0.2, float: 2300, volume: 5.3, newsSnippet: 'Procter & Gamble faces commodity cost pressures.', lastUpdated: MOCK_INITIAL_TIMESTAMP, marketCap: 399.5 * 10^9, avgVolume: 6.0, atr: 2.152, rsi: 48.8, vwap: 168.35, beta: 0.4, high52: 175.20, low52: 140.80, gapPercent: -0.05, shortFloat: 0.5, instOwn: 65.7, premarketChange: 0.0 },
  { id: '45', symbol: 'LLY', price: 880.50, changePercent: 1.5, float: 940, volume: 1.8, newsSnippet: 'Eli Lilly drug trial shows positive results.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', marketCap: 834.47 * 10^9, avgVolume: 2.2, atr: 15.208, rsi: 75.6, vwap: 879.80, beta: 0.3, high52: 900.00, low52: 450.20, gapPercent: 0.4, shortFloat: 0.4, instOwn: 82.3, premarketChange: 0.25 },
  { id: '46', symbol: 'JNJ', price: 148.90, changePercent: 0.05, float: 2400, volume: 7.2, newsSnippet: 'Johnson & Johnson consumer health spinoff complete.', lastUpdated: MOCK_INITIAL_TIMESTAMP, marketCap: 349.41 * 10^9, avgVolume: 8.0, atr: 1.857, rsi: 50.1, vwap: 148.85, beta: 0.5, high52: 160.30, low52: 135.70, gapPercent: 0.01, shortFloat: 0.6, instOwn: 70.9, premarketChange: 0.0 },
  { id: '47', symbol: 'TGT', price: 145.60, changePercent: -1.8, float: 460, volume: 3.1, newsSnippet: 'Target warns of slowing consumer demand.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', marketCap: 67.7 * 10^9, avgVolume: 3.5, atr: 2.904, rsi: 38.5, vwap: 145.70, beta: 1.1, high52: 170.20, low52: 120.50, gapPercent: -0.5, shortFloat: 3.1, instOwn: 75.8, premarketChange: -0.3 },
  { id: '48', symbol: 'SMCI', price: 810.20, changePercent: 3.3, float: 50, volume: 6.5, newsSnippet: 'Super Micro Computer benefits from AI server demand.', lastUpdated: MOCK_INITIAL_TIMESTAMP, marketCap: 47.8 * 10^9, avgVolume: 5.8, atr: 40.501, rsi: 60.2, vwap: 808.00, beta: 2.9, high52: 1200.00, low52: 200.50, gapPercent: 0.9, shortFloat: 15.2, instOwn: 55.1, premarketChange: 0.7 },
  { id: '49', symbol: 'DJT', price: 35.70, changePercent: -4.1, float: 70, volume: 5.2, newsSnippet: 'Trump Media stock experiences volatility.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', marketCap: 4.92 * 10^9, avgVolume: 6.0, atr: 3.108, rsi: 33.7, vwap: 35.80, beta: 3.5, high52: 70.00, low52: 20.10, gapPercent: -1.2, shortFloat: 18.9, instOwn: 10.3, premarketChange: -0.9 },
  { id: '50', symbol: 'SPY', price: 547.80, changePercent: 0.22, float: 0, volume: 45.1, newsSnippet: 'S&P 500 ETF tracks broad market movement.', lastUpdated: MOCK_INITIAL_TIMESTAMP, marketCap: 503.01 * 10^9, avgVolume: 50.0, atr: 4.205, rsi: 65.3, vwap: 547.70, beta: 1.0, high52: 550.10, low52: 400.50, gapPercent: 0.05, shortFloat: 1.0, instOwn: 50.0, premarketChange: 0.03 },
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


export default function DashboardPage() {
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
    let latestGeneratedStockData: Stock[] = [];

    setStocks(prevStocks => {
      const updatedStocks = prevStocks.map(stock => {
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
      latestGeneratedStockData = updatedStocks;
      return updatedStocks;
    });
    
    updateAllPositionsPrices(latestGeneratedStockData);
    setLastRefreshed(new Date());
  }, [updateAllPositionsPrices]); 


  useEffect(() => {
    setLastRefreshed(new Date()); 
    const intervalId = setInterval(handleRefreshData, DASHBOARD_REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [handleRefreshData]); 

  const activeRules = useMemo(() => mockRules.filter(rule => rule.isActive), []);

  const filteredStocks = useMemo(() => {
    if (selectedRuleId === 'all') {
      return stocks;
    }
    const rule = activeRules.find(r => r.id === selectedRuleId);
    if (!rule) {
      return stocks; 
    }

    return stocks.filter(stock => {
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
  }, [stocks, selectedRuleId, activeRules]);

  const handleSelectStockForOrder = (stock: Stock, action: OrderActionType | null) => {
    setSelectedStockForOrderCard(stock);
    setOrderCardActionType(action);
    setOrderCardInitialTradeMode(undefined); // Clear Milo context if user clicks a stock row
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
        
        let parsedActionType: OrderActionType = 'Buy'; // Default
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
        setOrderCardMiloActionContext(idea.action); // Pass the descriptive action from Milo
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

  const handleRefreshMiloIdeas = useCallback(() => {
    setIsMiloLoading(true);
    // Simulate API call
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


  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Dashboard" />
      <div className="flex flex-1 p-4 md:p-6 space-x-0 md:space-x-6 overflow-hidden">

        <div className="flex-1 flex flex-col overflow-hidden space-y-6">
          <Card className="shadow-none flex-1 flex flex-col overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-2xl font-headline">Real-Time Stock Screener</CardTitle>
                <CardDescription>Filter and find top market movers based on selected rule.</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Dot className="h-6 w-6 text-[hsl(var(--confirm-green))] animate-pulse" />
                {lastRefreshed && <span className="text-sm text-muted-foreground">Refreshed: {new Date(lastRefreshed).toLocaleTimeString()}</span>}
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleRefreshData}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="default" size="sm">
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
                  variant="default"
                  size="sm"
                  onClick={handleExport}
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden space-y-4">
              <div className="flex items-center gap-3">
                  <Label htmlFor="ruleSelect" className="text-foreground text-sm font-medium flex items-center">
                    <ListFilter className="mr-2 h-4 w-4 text-primary" /> Apply Rule:
                  </Label>
                  <Select value={selectedRuleId} onValueChange={(value) => setSelectedRuleId(value)}>
                    <SelectTrigger id="ruleSelect" className="w-auto min-w-[200px] max-w-xs">
                        <SelectValue placeholder="Select a rule..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Show All Stocks</SelectItem>
                        {activeRules.map(rule => (
                            <SelectItem key={rule.id} value={rule.id}>{rule.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
              </div>
              
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
                          No stocks match the selected rule.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="w-full md:w-96 lg:w-[26rem] hidden md:flex flex-col flex-shrink-0 space-y-6 pr-1 overflow-y-auto">
          <OrderCard
            selectedStock={selectedStockForOrderCard}
            initialActionType={orderCardActionType}
            initialTradeMode={orderCardInitialTradeMode}
            miloActionContextText={orderCardMiloActionContext}
            onSubmit={handleTradeSubmit}
            onClear={handleClearOrderCard}
          />
          
            <OpenPositionsCard /> 
          
          <MilosTradeIdeasCard 
            ideas={miloIdeas} 
            onRefresh={handleRefreshMiloIdeas}
            isLoading={isMiloLoading}
            onIdeaSelect={handleMiloIdeaSelect}
          />
        </div>
      </div>
    </main>
  );
}
