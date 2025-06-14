
"use client";

import React, { useMemo } from 'react';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { Tool } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ManualTradeTicker() {
  const { showManualTicker } = useSettingsContext();
  const { openPositions } = useOpenPositionsContext();

  const manualTradesWithPnl = useMemo(() => {
    return openPositions
      .filter(pos => pos.origin === 'manual')
      .map(pos => {
        const pnl = (pos.currentPrice - pos.entryPrice) * pos.shares;
        return {
          ...pos,
          pnl,
        };
      })
      .sort((a, b) => new Date(b.id.replace('pos','')).getTime() - new Date(a.id.replace('pos','')).getTime()); // Sort by pseudo-timestamp from ID
  }, [openPositions]);

  if (!showManualTicker || manualTradesWithPnl.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-black/40 text-white px-4 py-1.5 text-xs overflow-hidden whitespace-nowrap border-b border-primary shadow-inner sticky top-0 z-20">
      <div className="animate-ticker flex items-center"> {/* Flex container for icon and text */}
        <Tool className="h-3.5 w-3.5 mr-2 text-primary flex-shrink-0" />
        <span className="font-medium mr-3 flex-shrink-0">Manual Trades:</span>
        {manualTradesWithPnl.map((trade, idx) => (
          <span 
            key={trade.id} 
            className={cn(
              "mx-3 flex-shrink-0", // Prevent individual items from shrinking too much
              trade.pnl >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive"
            )}
          >
            {trade.symbol}{' '}
            {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
            {idx < manualTradesWithPnl.length - 1 && <span className="text-muted-foreground mx-2">|</span>}
          </span>
        ))}
        {/* Duplicate content for seamless looping, if needed, based on animation method */}
        {/* This simple CSS animation might not need duplication if the content is wide enough */}
      </div>
    </div>
  );
}
