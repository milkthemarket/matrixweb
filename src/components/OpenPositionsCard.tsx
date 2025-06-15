
"use client";

import React, { useState, useMemo } from 'react';
import type { OpenPosition, HistoryTradeMode } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { XSquare, Briefcase, User, Bot, Cpu } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext'; // Import context

interface OpenPositionsCardProps {
  // Positions and onClosePosition are now handled by context
}

export function OpenPositionsCard({}: OpenPositionsCardProps) {
  const { openPositions, removeOpenPosition } = useOpenPositionsContext(); // Use context
  const [selectedOriginFilter, setSelectedOriginFilter] = useState<HistoryTradeMode>('manual');

  const handleClose = (position: OpenPosition) => {
    console.log("Closing position:", position);
    removeOpenPosition(position.id); // Use context action
  };
  
  const calculatePnl = (position: OpenPosition) => {
    return (position.currentPrice - position.entryPrice) * position.shares;
  };

  const filteredPositions = useMemo(() => {
    return openPositions.filter(pos => (pos.origin || 'manual') === selectedOriginFilter);
  }, [openPositions, selectedOriginFilter]);

  const buttonBaseClass = "flex-1 flex items-center justify-center h-8 py-1.5 px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-background disabled:opacity-50";
  const activeModeClass = "bg-primary text-primary-foreground shadow-sm";
  const inactiveModeClass = "bg-transparent text-muted-foreground hover:bg-panel/[.05] hover:text-foreground";

  return (
    <Card className="shadow-md mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center text-foreground">
          <Briefcase className="mr-2 h-5 w-5 text-primary" />
          Open Positions
        </CardTitle>
        <CardDescription>Your currently active trades. Filter by origin below.</CardDescription>
        
        <div className="grid grid-cols-3 w-full max-w-sm rounded-md overflow-hidden border border-border/[.1] bg-panel/[.05] mt-3">
          <button
            onClick={() => setSelectedOriginFilter('manual')}
            className={cn(buttonBaseClass, selectedOriginFilter === 'manual' ? activeModeClass : inactiveModeClass)}
            title="Show Manual Trades"
          >
            <User className="mr-1.5 h-3.5 w-3.5" /> Manual
          </button>
          <button
            onClick={() => setSelectedOriginFilter('aiAssist')}
            className={cn(buttonBaseClass, selectedOriginFilter === 'aiAssist' ? activeModeClass : inactiveModeClass)}
            title="Show AI Assisted Trades"
          >
            <Bot className="mr-1.5 h-3.5 w-3.5" /> AI Assist
          </button>
          <button
            onClick={() => setSelectedOriginFilter('fullyAI')}
            className={cn(buttonBaseClass, selectedOriginFilter === 'fullyAI' ? activeModeClass : inactiveModeClass)}
            title="Show AI Auto Trades"
          >
            <Cpu className="mr-1.5 h-3.5 w-3.5" /> AI Auto
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filteredPositions.length > 0 ? (
          <ScrollArea className="h-[380px]">
            <Table>
              <TableHeader className="sticky top-0 bg-card/[.05] backdrop-blur-md z-10">
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right">Shares</TableHead>
                  <TableHead className="text-right">Entry</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">P&amp;L</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPositions.map((pos) => {
                  const pnl = calculatePnl(pos);
                  return (
                    <TableRow key={pos.id} className="hover:bg-muted/5">
                      <TableCell className="font-medium text-foreground">{pos.symbol}</TableCell>
                      <TableCell className="text-right text-foreground">{pos.shares}</TableCell>
                      <TableCell className="text-right text-foreground">${pos.entryPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-foreground">${pos.currentPrice.toFixed(2)}</TableCell>
                      <TableCell 
                        className={cn(
                          "text-right font-semibold",
                          pnl >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive"
                        )}
                      >
                        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive-foreground"
                          onClick={() => handleClose(pos)}
                        >
                          <XSquare className="mr-1 h-3.5 w-3.5" /> Close
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="text-center text-sm text-muted-foreground py-10 px-6">
            <Briefcase className="mx-auto h-10 w-10 mb-2 opacity-50" />
            No open positions matching "{selectedOriginFilter}" filter.
          </div>
        )}
      </CardContent>
      {filteredPositions.length > 0 && (
        <CardFooter className="pt-4">
            <p className="text-xs text-muted-foreground">
                Current prices are simulated and P&amp;L is indicative.
            </p>
        </CardFooter>
      )}
    </Card>
  );
}

