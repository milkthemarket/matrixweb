
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
            <Table>
              <TableHeader className="sticky top-0 bg-card/[.05] backdrop-blur-md z-[1]">
                <TableRow>
                  <TableHead className="text-xs h-7 px-2">Symbol</TableHead>
                  <TableHead className="text-xs h-7 px-2">Side</TableHead>
                  <TableHead className="text-xs h-7 px-2 text-right">Qty</TableHead>
                  <TableHead className="text-xs h-7 px-2 text-right">Avg Price</TableHead>
                  <TableHead className="text-xs h-7 px-2">Type</TableHead>
                  <TableHead className="text-xs h-7 px-2">Time</TableHead>
                  <TableHead className="text-xs h-7 px-2">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((trade) => (
                  <TableRow key={trade.id} className="text-xs hover:bg-white/5">
                    <TableCell className="px-2 py-1.5">{trade.symbol}</TableCell>
                    <TableCell className="px-2 py-1.5">{trade.side}</TableCell>
                    <TableCell className="px-2 py-1.5 text-right">{trade.totalQty}</TableCell>
                    <TableCell className="px-2 py-1.5 text-right">${trade.averagePrice.toFixed(2)}</TableCell>
                    <TableCell className="px-2 py-1.5">{trade.orderType}</TableCell>
                    <TableCell className="px-2 py-1.5">{format(parseISO(trade.filledTime), "HH:mm:ss")}</TableCell>
                    <TableCell className="px-2 py-1.5">{trade.orderStatus}</TableCell>
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

    
