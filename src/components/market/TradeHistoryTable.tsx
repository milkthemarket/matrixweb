
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTradeHistoryContext } from "@/contexts/TradeHistoryContext";
import { format, parseISO } from 'date-fns';
import type { TradeHistoryEntry } from '@/types';
import { History } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TradeHistoryTableProps {
  className?: string;
  syncedTickerSymbol: string | null;
}

export function TradeHistoryTable({ className, syncedTickerSymbol }: TradeHistoryTableProps) {
  const { tradeHistory } = useTradeHistoryContext();
  
  const filteredHistory = React.useMemo(() => {
    const sortedHistory = [...tradeHistory].sort((a, b) => parseISO(b.filledTime).getTime() - parseISO(a.filledTime).getTime());
    if (syncedTickerSymbol) {
      return sortedHistory.filter(t => t.symbol === syncedTickerSymbol).slice(0, 20); // Show top 20 for symbol
    }
    return sortedHistory.slice(0, 20); // Show latest 20 overall
  }, [tradeHistory, syncedTickerSymbol]);

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <div className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {filteredHistory.length > 0 ? (
            <Table className="table-fixed">
              <TableHeader className="sticky top-0 bg-[#0d0d0d] z-[1]">
                <TableRow className="border-b border-white/10">
                  <TableHead className="h-10 px-4 py-2 text-left font-headline uppercase text-[15px] font-bold text-neutral-100">Symbol</TableHead>
                  <TableHead className="h-10 px-4 py-2 text-left font-headline uppercase text-[15px] font-bold text-neutral-100">Side</TableHead>
                  <TableHead className="h-10 px-4 py-2 text-right font-headline uppercase text-[15px] font-bold text-neutral-100">Qty</TableHead>
                  <TableHead className="h-10 px-4 py-2 text-right font-headline uppercase text-[15px] font-bold text-neutral-100">Avg Price</TableHead>
                  <TableHead className="h-10 px-4 py-2 text-left font-headline uppercase text-[15px] font-bold text-neutral-100">Type</TableHead>
                  <TableHead className="h-10 px-4 py-2 text-left font-headline uppercase text-[15px] font-bold text-neutral-100">Time</TableHead>
                  <TableHead className="h-10 px-4 py-2 text-left font-headline uppercase text-[15px] font-bold text-neutral-100">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((trade) => (
                  <TableRow key={trade.id} className="text-sm hover:bg-white/5 h-10 border-b border-border/5 last:border-b-0">
                    <TableCell className="px-4 py-2 font-bold text-left">{trade.symbol}</TableCell>
                    <TableCell className="px-4 py-2 font-bold text-left">{trade.side}</TableCell>
                    <TableCell className="px-4 py-2 text-right font-bold">{trade.totalQty}</TableCell>
                    <TableCell className="px-4 py-2 text-right font-bold">${trade.averagePrice.toFixed(2)}</TableCell>
                    <TableCell className="px-4 py-2 font-bold text-left">{trade.orderType}</TableCell>
                    <TableCell className="px-4 py-2 font-bold text-left">{format(parseISO(trade.filledTime), "HH:mm:ss")}</TableCell>
                    <TableCell className="px-4 py-2 font-bold text-left">{trade.orderStatus}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="p-4 text-xs text-muted-foreground text-center">
                No trade history {syncedTickerSymbol ? `for ${syncedTickerSymbol}` : 'available'}.
              </p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
