
"use client";

import React, { useMemo } from 'react';
import type { OpenPosition } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { XSquare, Briefcase, User, Cpu } from 'lucide-react';
import { MiloAvatarIcon } from '@/components/icons/MiloAvatarIcon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { useSettingsContext } from '@/contexts/SettingsContext';

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
              <TableHeader className="sticky top-0 bg-card/[.05] backdrop-blur-md z-[1]">
                <TableRow>
                  <TableHead className="h-7 px-2 text-[10px] text-muted-foreground font-medium text-center">Actions</TableHead>
                  <TableHead className="h-7 px-2 text-[10px] text-left text-muted-foreground font-medium">Symbol</TableHead>
                  <TableHead className="h-7 px-2 text-[10px] text-right text-muted-foreground font-medium">Open P&L</TableHead>
                  <TableHead className="h-7 px-2 text-[10px] text-right text-muted-foreground font-medium">Open P&L %</TableHead>
                  <TableHead className="h-7 px-2 text-[10px] text-right text-muted-foreground font-medium">Quantity</TableHead>
                  <TableHead className="h-7 px-2 text-[10px] text-right text-muted-foreground font-medium">Avg Price</TableHead>
                  <TableHead className="h-7 px-2 text-[10px] text-right text-muted-foreground font-medium">Last Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPositions.map((pos) => {
                  const pnl = calculatePnl(pos);
                  const pnlPercent = calculatePnlPercent(pos);
                  const pnlColorClass = pnl >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive";

                  return (
                    <TableRow key={pos.id} className="text-[11px] hover:bg-white/5">
                      <TableCell className="text-center px-2 py-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-1.5 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive-foreground text-[10px]"
                          onClick={() => handleClose(pos)}
                        >
                          <XSquare className="mr-0.5 h-3 w-3" /> Close
                        </Button>
                      </TableCell>
                      <TableCell className="font-bold text-foreground px-2 py-1.5 text-left">{pos.symbol}</TableCell>
                      <TableCell className={cn("text-right font-bold px-2 py-1.5", pnlColorClass)}>
                        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                      </TableCell>
                       <TableCell className={cn("text-right font-bold px-2 py-1.5", pnlColorClass)}>
                        {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground px-2 py-1.5">{pos.shares}</TableCell>
                      <TableCell className="text-right font-medium text-foreground px-2 py-1.5">${pos.entryPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-bold text-foreground px-2 py-1.5">${pos.currentPrice.toFixed(2)}</TableCell>
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
