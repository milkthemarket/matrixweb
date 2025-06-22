
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
            <TableHeader className="sticky top-0 bg-card/[.05] backdrop-blur-md z-[1]">
              <TableRow>
                <TableHead className="h-7 px-2 text-[10px] text-center text-muted-foreground font-medium">Action</TableHead>
                <TableHead className="h-7 px-2 text-[10px] text-left text-muted-foreground font-medium">Symbol</TableHead>
                <TableHead className="h-7 px-2 text-[10px] text-left text-muted-foreground font-medium">Side</TableHead>
                <TableHead className="h-7 px-2 text-[10px] text-right text-muted-foreground font-medium">Qty</TableHead>
                <TableHead className="h-7 px-2 text-[10px] text-left text-muted-foreground font-medium">Order Type</TableHead>
                <TableHead className="h-7 px-2 text-[10px] text-right text-muted-foreground font-medium">Limit Price</TableHead>
                <TableHead className="h-7 px-2 text-[10px] text-left text-muted-foreground font-medium">Status</TableHead>
                <TableHead className="h-7 px-2 text-[10px] text-left text-muted-foreground font-medium">Time</TableHead>
              </TableRow>
            </TableHeader>
             <TableBody>
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                   <div className="flex flex-col items-center justify-center text-xs py-8 px-3">
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
