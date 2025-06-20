
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PackageSearch } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrdersTableProps {
  className?: string;
}

export function OrdersTable({ className }: OrdersTableProps) {
  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="p-2 border-b border-border/[.08]">
        <CardTitle className="text-sm font-medium text-foreground flex items-center">
          <PackageSearch className="h-4 w-4 mr-2 text-primary" />
          Open Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-muted-foreground text-center">
              No open orders currently. <br /> Orders placed will appear here.
            </p>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

    