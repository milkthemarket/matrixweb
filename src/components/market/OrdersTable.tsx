
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PackageSearch, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface OrdersTableProps {
  className?: string;
}

export function OrdersTable({ className }: OrdersTableProps) {
  return (
    <div className={cn("h-full flex flex-col", className)}>
      <div className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <Table className="table-fixed">
            <TableHeader className="sticky top-0 bg-[#0d0d0d] z-[1]">
              <TableRow className="border-b-0 h-10">
                <TableHead className="px-4 py-2 text-left font-headline uppercase text-[15px] font-bold text-neutral-100">Action</TableHead>
                <TableHead className="px-4 py-2 text-left font-headline uppercase text-[15px] font-bold text-neutral-100">Symbol</TableHead>
                <TableHead className="px-4 py-2 text-left font-headline uppercase text-[15px] font-bold text-neutral-100">Side</TableHead>
                <TableHead className="px-4 py-2 text-right font-headline uppercase text-[15px] font-bold text-neutral-100">Qty</TableHead>
                <TableHead className="px-4 py-2 text-left font-headline uppercase text-[15px] font-bold text-neutral-100">Order Type</TableHead>
                <TableHead className="px-4 py-2 text-right font-headline uppercase text-[15px] font-bold text-neutral-100">Limit Price</TableHead>
                <TableHead className="px-4 py-2 text-left font-headline uppercase text-[15px] font-bold text-neutral-100">Status</TableHead>
                <TableHead className="px-4 py-2 text-left font-headline uppercase text-[15px] font-bold text-neutral-100">Time</TableHead>
              </TableRow>
            </TableHeader>
             <TableBody>
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                   <div className="flex flex-col items-center justify-center text-sm py-8 px-3">
                    <PackageSearch className="mx-auto h-8 w-8 mb-2 opacity-50 text-muted-foreground" />
                    <p className="text-muted-foreground text-center">No open orders currently.</p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
