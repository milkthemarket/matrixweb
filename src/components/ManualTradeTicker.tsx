
"use client";

import React, { useMemo } from 'react';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { Wrench, Bot, Cpu } from 'lucide-react'; 
import type { HistoryTradeMode } from '@/types';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

const getTradeOriginPrefix = (origin?: HistoryTradeMode): string => {
  if (origin === 'manual') return '(M)';
  if (origin === 'aiAssist') return '(AA)';
  if (origin === 'fullyAI') return '(FAI)';
  return '';
};

export function ManualTradeTicker() {
  const {
    showManualTicker,
    showAIAssistedTicker,
    showFullyAITicker,
    tickerSpeed
  } = useSettingsContext();
  const { openPositions } = useOpenPositionsContext();
  const { state: sidebarState, isMobile, hasMounted } = useSidebar();

  const displayableTradesWithPnl = useMemo(() => {
    return openPositions
      .filter(pos => {
        if (!hasMounted) return false; // Don't display until client mounted to avoid hydration issues with context
        if (showManualTicker && (pos.origin === 'manual' || !pos.origin) ) return true; // Treat undefined origin as manual for display
        if (showAIAssistedTicker && pos.origin === 'aiAssist') return true;
        if (showFullyAITicker && pos.origin === 'fullyAI') return true;
        return false;
      })
      .map(pos => {
        const pnl = (pos.currentPrice - pos.entryPrice) * pos.shares;
        return {
          ...pos,
          pnl,
        };
      })
      .sort((a, b) => new Date(b.id.replace('pos','')).getTime() - new Date(a.id.replace('pos','')).getTime()); 
  }, [openPositions, showManualTicker, showAIAssistedTicker, showFullyAITicker, hasMounted]);

  if (!hasMounted || displayableTradesWithPnl.length === 0) {
    return null;
  }

  const leftPaddingClass = !isMobile
    ? (sidebarState === 'expanded' ? 'pl-[16rem]' : 'pl-[3rem]')
    : 'pl-4'; // Add some base padding for mobile

  const tickerAnimationClass = `animate-ticker-${tickerSpeed}`;

  let tickerMainLabel = "Live Trades:";
  const activeTradeTypesCount = [showManualTicker, showAIAssistedTicker, showFullyAITicker].filter(Boolean).length;
  
  if (activeTradeTypesCount === 1) {
    if (showManualTicker) tickerMainLabel = "Manual Trades:";
    else if (showAIAssistedTicker) tickerMainLabel = "AI-Assisted Trades:";
    else if (showFullyAITicker) tickerMainLabel = "Fully AI Trades:";
  }


  const MainIcon = () => {
    if (showManualTicker && activeTradeTypesCount === 1) return <Wrench className="h-3.5 w-3.5 mr-2 text-primary flex-shrink-0" />;
    if (showAIAssistedTicker && activeTradeTypesCount === 1) return <Bot className="h-3.5 w-3.5 mr-2 text-primary flex-shrink-0" />;
    if (showFullyAITicker && activeTradeTypesCount === 1) return <Cpu className="h-3.5 w-3.5 mr-2 text-primary flex-shrink-0" />;
    // Default or mixed icon if multiple types are shown, or use a generic "live" icon
    return <Wrench className="h-3.5 w-3.5 mr-2 text-primary flex-shrink-0" />; 
  };


  return (
    <div className={cn(
      "w-full bg-black/40 text-white text-xs border-b border-primary shadow-inner sticky top-0 z-20 h-7 flex items-center", // Added h-7 and flex items-center
      leftPaddingClass // This padding is for the content area, not the bar itself if it's full-width
    )}>
      <div className="overflow-hidden whitespace-nowrap w-full"> {/* Ensure this takes up available width */}
        <div className={cn("flex items-center pr-4", tickerAnimationClass)}> {/* Removed pl-4 md:pl-0, padding is handled by leftPaddingClass */}
          <MainIcon />
          <span className="font-medium mr-3 flex-shrink-0">{tickerMainLabel}</span>
          {displayableTradesWithPnl.map((trade, idx) => (
            <span
              key={trade.id}
              className={cn(
                "mx-3 flex-shrink-0",
                trade.pnl >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive"
              )}
            >
              {getTradeOriginPrefix(trade.origin)} {trade.symbol}{' '}
              {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
              {idx < displayableTradesWithPnl.length - 1 && <span className="text-muted-foreground mx-2">|</span>}
            </span>
          ))}
           {/* Duplicate content to ensure smooth continuous scroll for marquee effect */}
          {displayableTradesWithPnl.length > 0 && <span className="text-muted-foreground mx-2 flex-shrink-0">|</span>}
          {displayableTradesWithPnl.map((trade, idx) => (
             <span
              key={`${trade.id}-clone`}
              className={cn(
                "mx-3 flex-shrink-0",
                trade.pnl >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive"
              )}
              aria-hidden="true" // Hide clones from screen readers
            >
              {getTradeOriginPrefix(trade.origin)} {trade.symbol}{' '}
              {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
              {idx < displayableTradesWithPnl.length - 1 && <span className="text-muted-foreground mx-2">|</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

