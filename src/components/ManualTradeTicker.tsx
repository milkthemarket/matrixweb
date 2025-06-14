
"use client";

import React, { useMemo } from 'react';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar'; // Import useSidebar

export function ManualTradeTicker() {
  const { showManualTicker } = useSettingsContext();
  const { openPositions } = useOpenPositionsContext();
  const { state: sidebarState, isMobile } = useSidebar(); // Get sidebar state and isMobile

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
      .sort((a, b) => new Date(b.id.replace('pos','')).getTime() - new Date(a.id.replace('pos','')).getTime());
  }, [openPositions]);

  if (!showManualTicker || manualTradesWithPnl.length === 0) {
    return null;
  }

  // Define classes for padding based on sidebar state, only for non-mobile
  const leftPaddingClass = !isMobile 
    ? (sidebarState === 'expanded' ? 'pl-[16rem]' : 'pl-[3rem]') 
    : '';

  return (
    <div className={cn(
      "w-full bg-black/40 text-white py-1.5 text-xs border-b border-primary shadow-inner sticky top-0 z-20",
      leftPaddingClass // Apply dynamic left padding for desktop
    )}>
      <div className="overflow-hidden whitespace-nowrap"> {/* This div clips the content */}
        <div className="animate-ticker flex items-center pr-4 pl-4 md:pl-0"> {/* This div animates and has its own content padding */}
          <Wrench className="h-3.5 w-3.5 mr-2 text-primary flex-shrink-0" />
          <span className="font-medium mr-3 flex-shrink-0">Manual Trades:</span>
          {manualTradesWithPnl.map((trade, idx) => (
            <span 
              key={trade.id} 
              className={cn(
                "mx-3 flex-shrink-0",
                trade.pnl >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive"
              )}
            >
              {trade.symbol}{' '}
              {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
              {idx < manualTradesWithPnl.length - 1 && <span className="text-muted-foreground mx-2">|</span>}
            </span>
          ))}
          {/* To ensure smooth looping for very short content, you might duplicate the items here if necessary,
              but for longer content, the single pass of animate-ticker should be okay.
              For simplicity, duplication is omitted here.
           */}
        </div>
      </div>
    </div>
  );
}
