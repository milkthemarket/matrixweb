
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Filter, RotateCcw, Search } from "lucide-react";
import type { Stock } from "@/types";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const initialMockStocks: Stock[] = [
  { id: '1', symbol: 'AAPL', price: 170.34, changePercent: 2.5, float: 15000, volume: 90.5, newsSnippet: 'New iPhone announced.', lastUpdated: new Date().toISOString() },
  { id: '2', symbol: 'MSFT', price: 420.72, changePercent: -1.2, float: 7000, volume: 60.2, newsSnippet: 'AI partnership expansion.', lastUpdated: new Date().toISOString() },
  { id: '3', symbol: 'TSLA', price: 180.01, changePercent: 5.8, float: 800, volume: 120.1, newsSnippet: 'Cybertruck deliveries ramp up.', lastUpdated: new Date().toISOString() },
  { id: '4', symbol: 'NVDA', price: 900.50, changePercent: 0.5, float: 2500, volume: 75.3, newsSnippet: 'New GPU architecture unveiled.', lastUpdated: new Date().toISOString() },
  { id: '5', symbol: 'GOOGL', price: 140.22, changePercent: 1.1, float: 6000, volume: 40.8, newsSnippet: 'Search algorithm update.', lastUpdated: new Date().toISOString() },
];

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [minChangePercent, setMinChangePercent] = useState(0);
  const [maxFloat, setMaxFloat] = useState(20000); // Max float in millions
  const [minVolume, setMinVolume] = useState(0);
  const [stocks, setStocks] = useState<Stock[]>(initialMockStocks);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  useEffect(() => {
    setLastRefreshed(new Date());
  }, []);
  
  const filteredStocks = useMemo(() => {
    return stocks.filter(stock =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) &&
      stock.changePercent >= minChangePercent &&
      stock.float <= maxFloat &&
      stock.volume >= minVolume
    );
  }, [stocks, searchTerm, minChangePercent, maxFloat, minVolume]);

  const handleRefresh = () => {
    // In a real app, this would fetch new data
    const refreshedStocks = initialMockStocks.map(stock => ({
      ...stock,
      price: parseFloat((stock.price * (1 + (Math.random() - 0.5) * 0.1)).toFixed(2)), // Simulate price change
      changePercent: parseFloat(((Math.random() - 0.5) * 10).toFixed(1)), // Simulate % change
      volume: parseFloat((stock.volume * (1 + (Math.random() - 0.2) * 0.2)).toFixed(1)), // Simulate volume change
      lastUpdated: new Date().toISOString(),
    }));
    setStocks(refreshedStocks);
    setLastRefreshed(new Date());
  };

  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Dashboard & Screener" />
      <div className="flex-1 p-4 md:p-6 space-y-6 overflow-auto">
        <Card className="shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-headline">Real-Time Stock Screener</CardTitle>
              <CardDescription>Filter and find top market movers.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {lastRefreshed && <span className="text-sm text-muted-foreground">Last refreshed: {format(lastRefreshed, "HH:mm:ss")}</span>}
              <Button variant="outline" size="sm" onClick={handleRefresh} className="text-accent hover:text-accent-foreground border-accent">
                <RotateCcw className="mr-2 h-4 w-4" />
                Refresh
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStocks.length > 0 ? (
                    filteredStocks.map((stock) => (
                      <TableRow key={stock.id}>
                        <TableCell className="font-medium">{stock.symbol}</TableCell>
                        <TableCell className="text-right">${stock.price.toFixed(2)}</TableCell>
                        <TableCell className={cn("text-right", stock.changePercent >= 0 ? "text-green-400" : "text-red-400")}>
                          {stock.changePercent.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right">{stock.float.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{stock.volume.toLocaleString()}</TableCell>
                        <TableCell className="max-w-xs truncate">{stock.newsSnippet || 'N/A'}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">{format(new Date(stock.lastUpdated), "HH:mm:ss")}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
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
    </main>
  );
}

