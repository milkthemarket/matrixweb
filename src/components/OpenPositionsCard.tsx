
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
            {/* Header */}
            <div className="grid grid-cols-7 gap-2 sticky top-0 bg-card/[.05] backdrop-blur-md z-[1] h-7 px-2 items-center text-[10px] text-muted-foreground font-medium border-b border-border/10">
                <div className="text-left">Actions</div>
                <div className="text-left">Symbol</div>
                <div className="text-center">Open P&L %</div>
                <div className="text-center">Open P&L</div>
                <div className="text-center">Avg Price</div>
                <div className="text-center">Last Price</div>
                <div className="text-center">Quantity</div>
            </div>
             {/* Body */}
            <div className="px-1">
                {filteredPositions.map((pos) => {
                    const pnl = calculatePnl(pos);
                    const pnlPercent = calculatePnlPercent(pos);
                    const pnlColorClass = pnl >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive";

                    return (
                        <div key={pos.id} className="grid grid-cols-7 gap-2 items-center text-[11px] hover:bg-white/5 px-1 py-1.5 border-b border-border/5 last:border-b-0">
                            <div className="text-left">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 px-1.5 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive-foreground text-[10px]"
                                    onClick={() => handleClose(pos)}
                                >
                                    <XSquare className="mr-0.5 h-3 w-3" /> Close
                                </Button>
                            </div>
                            <div className="font-bold text-foreground text-left">{pos.symbol}</div>
                            <div className={cn("text-center font-bold", pnlColorClass)}>
                                {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                            </div>
                            <div className={cn("text-center font-bold", pnlColorClass)}>
                                {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                            </div>
                            <div className="text-center font-medium text-foreground">${pos.entryPrice.toFixed(2)}</div>
                            <div className="text-center font-bold text-foreground">${pos.currentPrice.toFixed(2)}</div>
                            <div className="text-center font-medium text-foreground">{pos.shares}</div>
                        </div>
                    );
                })}
            </div>
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
