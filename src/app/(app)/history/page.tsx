
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import type { TradeLogEntry } from "@/types";
import { format, parseISO } from 'date-fns';
import { PlusCircle, BookOpen, Edit3, Trash2 } from "lucide-react";
import { cn } from '@/lib/utils';

const tradeLogSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").toUpperCase(),
  entryPrice: z.coerce.number().positive("Entry price must be positive"),
  exitPrice: z.coerce.number().positive("Exit price must be positive"),
  quantity: z.coerce.number().int().positive("Quantity must be a positive integer"),
  notes: z.string().optional(),
  tradeDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date" }),
});

type TradeLogFormData = z.infer<typeof tradeLogSchema>;

const initialMockTrades: TradeLogEntry[] = [
  { id: '1', symbol: 'TSLA', entryPrice: 175.50, exitPrice: 180.20, quantity: 10, pnl: (180.20 - 175.50) * 10, notes: 'Breakout momentum trade', tradeDate: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: '2', symbol: 'AAPL', entryPrice: 168.00, exitPrice: 170.50, quantity: 20, pnl: (170.50 - 168.00) * 20, notes: 'Earnings play', tradeDate: new Date(Date.now() - 86400000).toISOString() },
];

export default function HistoryPage() {
  const [trades, setTrades] = useState<TradeLogEntry[]>(initialMockTrades);
  const [editingTrade, setEditingTrade] = useState<TradeLogEntry | null>(null);
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(format(new Date(), "yyyy-MM-dd"));
  }, []);

  const form = useForm<TradeLogFormData>({
    resolver: zodResolver(tradeLogSchema),
    defaultValues: {
      symbol: '',
      entryPrice: undefined,
      exitPrice: undefined,
      quantity: undefined,
      notes: '',
      tradeDate: currentDate,
    },
  });

  useEffect(() => {
    if (currentDate) {
      form.setValue('tradeDate', currentDate);
    }
  }, [currentDate, form]);

  const onSubmit: SubmitHandler<TradeLogFormData> = (data) => {
    const pnl = (data.exitPrice - data.entryPrice) * data.quantity;
    if (editingTrade) {
      setTrades(trades.map(t => t.id === editingTrade.id ? { ...editingTrade, ...data, pnl } : t));
      toast({ title: "Trade Updated", description: `Trade for ${data.symbol} has been updated.` });
      setEditingTrade(null);
    } else {
      const newTrade: TradeLogEntry = { id: String(Date.now()), ...data, pnl };
      setTrades([newTrade, ...trades]); // Add new trade to the beginning
      toast({ title: "Trade Logged", description: `New trade for ${data.symbol} has been added.` });
    }
    form.reset({ tradeDate: currentDate, symbol: '', entryPrice: undefined, exitPrice: undefined, quantity: undefined, notes: '' });
  };
  
  const handleEdit = (trade: TradeLogEntry) => {
    setEditingTrade(trade);
    form.reset({
      ...trade,
      tradeDate: format(parseISO(trade.tradeDate), "yyyy-MM-dd") // Ensure date is in yyyy-MM-dd for input
    });
  };

  const handleDelete = (tradeId: string) => {
    setTrades(trades.filter(t => t.id !== tradeId));
    toast({ title: "Trade Deleted", description: "The trade log entry has been deleted.", variant: "destructive" });
  };

  const totalPnl = useMemo(() => trades.reduce((acc, trade) => acc + trade.pnl, 0), [trades]);

  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Trade History & Log" />
      <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center">
              <BookOpen className="mr-2 h-6 w-6 text-primary"/>
              {editingTrade ? 'Edit Trade' : 'Log New Trade'}
            </CardTitle>
            <CardDescription>Manually record your trades for analysis and performance tracking.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="symbol" render={({ field }) => (<FormItem><FormLabel>Symbol</FormLabel><FormControl><Input placeholder="e.g., AAPL" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="tradeDate" render={({ field }) => (<FormItem><FormLabel>Trade Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="quantity" render={({ field }) => (<FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" placeholder="e.g., 100" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="entryPrice" render={({ field }) => (<FormItem><FormLabel>Entry Price</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 150.25" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="exitPrice" render={({ field }) => (<FormItem><FormLabel>Exit Price</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 155.75" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="e.g., Scalp trade based on support bounce..." {...field} /></FormControl><FormMessage /></FormItem>)} />
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {editingTrade && <Button type="button" variant="outline" onClick={() => { setEditingTrade(null); form.reset({ tradeDate: currentDate, symbol: '', entryPrice: undefined, exitPrice: undefined, quantity: undefined, notes: '' }); }}>Cancel Edit</Button>}
                <Button type="submit" className="text-primary-foreground bg-primary hover:bg-primary/90">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {editingTrade ? 'Save Changes' : 'Log Trade'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Logged Trades</CardTitle>
            <CardDescription className="flex justify-between items-center">
              <span>Review your past performance.</span>
              <span className="text-base font-semibold">Total P&L: 
                <span className={cn(totalPnl >= 0 ? "text-green-400" : "text-red-400")}>
                  ${totalPnl.toFixed(2)}
                </span>
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border max-h-[500px] overflow-y-auto"> {/* Max height for scroll */}
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead className="text-right">Entry</TableHead>
                    <TableHead className="text-right">Exit</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">P&L</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.length > 0 ? (
                    trades.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell>{format(parseISO(trade.tradeDate), 'MM/dd/yyyy')}</TableCell>
                        <TableCell className="font-medium">{trade.symbol}</TableCell>
                        <TableCell className="text-right">${trade.entryPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${trade.exitPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{trade.quantity}</TableCell>
                        <TableCell className={cn("text-right font-semibold", trade.pnl >= 0 ? "text-green-400" : "text-red-400")}>
                          ${trade.pnl.toFixed(2)}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={trade.notes}>{trade.notes || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(trade)} className="text-accent hover:text-accent-foreground">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(trade.id)} className="text-destructive hover:text-destructive/80">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        No trades logged yet. Add one above!
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
