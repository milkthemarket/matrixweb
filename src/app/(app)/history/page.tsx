
"use client";

import React from 'react';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useTradeHistoryContext } from "@/contexts/TradeHistoryContext";
import type { TradeHistoryEntry } from "@/types";
import { format, parseISO } from 'date-fns';
import { History as HistoryIcon, CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from '@/lib/utils';

const getStatusIcon = (status: TradeHistoryEntry['orderStatus']) => {
  switch (status) {
    case 'Filled':
      return <CheckCircle className="h-4 w-4 text-[hsl(var(--confirm-green))]" />;
    case 'Canceled':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'Pending':
      return <Clock className="h-4 w-4 text-yellow-500" />; // Yellow for pending is fine
    default:
      return null;
  }
};

export default function HistoryPage() {
  const { tradeHistory } = useTradeHistoryContext();

  const formatOptionalPrice = (price?: number) => price?.toFixed(2) ?? 'N/A';
  const formatOptionalNumber = (num?: number) => num?.toString() ?? 'N/A';
  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      return format(parseISO(isoString), "MM/dd/yy HH:mm:ss");
    } catch (e) {
      return 'Invalid Date';
    }
  };


  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Trade History" />
      <div className="flex-1 p-4 md:p-6 overflow-hidden">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center">
              <HistoryIcon className="mr-2 h-6 w-6 text-primary"/>
              Executed Trades
            </CardTitle>
            <CardDescription>Review your past trade executions. Automatically populated.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {tradeHistory.length > 0 ? (
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <Table>
                  <TableHeader className="sticky top-0 bg-card/[.05] backdrop-blur-md z-10">
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Side</TableHead>
                      <TableHead className="text-right">Total Qty</TableHead>
                      <TableHead className="text-right">Avg Price</TableHead>
                      <TableHead>Order Type</TableHead>
                      <TableHead className="text-right">Limit Price</TableHead>
                      <TableHead className="text-right">Stop Price</TableHead>
                      <TableHead className="text-right">Trail Amount</TableHead>
                      <TableHead>TIF</TableHead>
                      <TableHead>Trading Hours</TableHead>
                      <TableHead>Placed Time</TableHead>
                      <TableHead>Filled Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tradeHistory.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell className="font-medium text-foreground">{trade.symbol}</TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "border-transparent", // Ensure badges don't have outline variant's border
                              trade.side === 'Buy' && 'bg-[hsl(var(--confirm-green))] text-[hsl(var(--confirm-green-foreground))] hover:bg-[hsl(var(--confirm-green))]/90',
                              trade.side === 'Sell' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                              trade.side === 'Short' && 'bg-yellow-500 text-yellow-950 hover:bg-yellow-500/90'
                            )}
                          >
                            {trade.side}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-foreground">{trade.totalQty}</TableCell>
                        <TableCell className="text-right text-foreground">${trade.averagePrice.toFixed(2)}</TableCell>
                        <TableCell className="text-foreground">{trade.orderType}</TableCell>
                        <TableCell className="text-right text-foreground">{formatOptionalPrice(trade.limitPrice)}</TableCell>
                        <TableCell className="text-right text-foreground">{formatOptionalPrice(trade.stopPrice)}</TableCell>
                        <TableCell className="text-right text-foreground">{formatOptionalNumber(trade.trailAmount)}</TableCell>
                        <TableCell className="text-foreground">{trade.TIF}</TableCell>
                        <TableCell className="text-foreground">{trade.tradingHours}</TableCell>
                        <TableCell className="text-foreground">{formatDateTime(trade.placedTime)}</TableCell>
                        <TableCell className="text-foreground">{formatDateTime(trade.filledTime)}</TableCell>
                        <TableCell className="flex items-center space-x-1 text-foreground">
                          {getStatusIcon(trade.orderStatus)}
                          <span>{trade.orderStatus}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <HistoryIcon className="h-12 w-12 mb-4" />
                <p className="text-lg">No trade history yet.</p>
                <p>Executed trades will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
