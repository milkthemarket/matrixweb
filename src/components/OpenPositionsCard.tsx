
"use client";

import React, { useMemo } from 'react';
import type { OpenPosition } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { XSquare, Briefcase, User, Cpu } from 'lucide-react';
import { MiloAvatarIcon } from '@/components/icons/MiloAvatarIcon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface OpenPositionsCardProps {
  className?: string;
}

export function OpenPositionsCard({ className }: OpenPositionsCardProps) {
  const { openPositions, removeOpenPosition, selectedAccountId } = useOpenPositionsContext();
  const { notificationSounds, playSound } = useSettingsContext();

  const handleClose = (position: OpenPosition) => {
    console.log("Closing position:", position);
    removeOpenPosition(position.id);
    if (notificationSounds.tradeClosed !== 'off') {
      playSound(notificationSounds.tradeClosed);
    }
  };

  const calculatePnl = (position: OpenPosition) => {
    return (position.currentPrice - position.entryPrice) * position.shares;
  };
  
  const calculatePnlPercent = (position: OpenPosition) => {
    if (position.entryPrice === 0) return 0;
    return ((position.currentPrice - position.entryPrice) / position.entryPrice) * 100;
  };

  const filteredPositions = useMemo(() => {
    return openPositions.filter(pos => pos.accountId === selectedAccountId)
                        .sort((a, b) => new Date(b.id.replace('pos','')).getTime() - new Date(a.id.replace('pos','')).getTime());
  }, [openPositions, selectedAccountId]);

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <div className="p-0 flex-1 overflow-hidden">
        {filteredPositions.length > 0 ? (
          <ScrollArea className="h-full">
            <Table>
                <TableHeader>
                    <TableRow className="h-7">
                        <TableHead className="px-2 text-left">Actions</TableHead>
                        <TableHead className="px-2 text-left">Symbol</TableHead>
                        <TableHead className="px-2 text-center">Open P&L %</TableHead>
                        <TableHead className="px-2 text-center">Open P&L</TableHead>
                        <TableHead className="px-2 text-center">Avg Price</TableHead>
                        <TableHead className="px-2 text-center">Last Price</TableHead>
                        <TableHead className="px-2 text-center">Quantity</TableHead>
                    </TableRow>
                </TableHeader>
                 <TableBody>
                    {filteredPositions.map((pos) => {
                        const pnl = calculatePnl(pos);
                        const pnlPercent = calculatePnlPercent(pos);
                        const pnlColorClass = pnl >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive";

                        return (
                            <TableRow key={pos.id} className="text-[11px] hover:bg-white/5 h-auto py-1.5 border-b border-border/5 last:border-b-0">
                                <TableCell className="px-2 text-left">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-6 px-1.5 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive-foreground text-[10px]"
                                        onClick={() => handleClose(pos)}
                                    >
                                        <XSquare className="mr-0.5 h-3 w-3" /> Close
                                    </Button>
                                </TableCell>
                                <TableCell className="px-2 font-bold text-foreground text-left">{pos.symbol}</TableCell>
                                <TableCell className={cn("px-2 text-center font-bold", pnlColorClass)}>
                                    {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                                </TableCell>
                                <TableCell className={cn("px-2 text-center font-bold", pnlColorClass)}>
                                    {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                                </TableCell>
                                <TableCell className="px-2 text-center font-medium text-foreground">${pos.entryPrice.toFixed(2)}</TableCell>
                                <TableCell className="px-2 text-center font-bold text-foreground">${pos.currentPrice.toFixed(2)}</TableCell>
                                <TableCell className="px-2 text-center font-medium text-foreground">{pos.shares}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-xs py-8 px-3">
            <Briefcase className="mx-auto h-8 w-8 mb-2 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground text-center">No open positions for this account.</p>
          </div>
        )}
      </div>
    </div>
  );
}
