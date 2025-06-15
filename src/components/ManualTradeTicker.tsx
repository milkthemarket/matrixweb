
"use client";

import React, { useMemo } from 'react';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { Wrench, Cpu } from 'lucide-react'; 
import { MiloAvatarIcon } from '@/components/icons/MiloAvatarIcon'; // Changed Bot to MiloAvatarIcon
import type { HistoryTradeMode } from '@/types';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

const getTradeOriginPrefix = (origin?: HistoryTradeMode): string => {
  if (origin === 'manual') return '(M)';
  if (origin === 'aiAssist') return '(AA)';
  if (origin === 'autopilot') return '(AP)'; 
  return '';
};

export function ManualTradeTicker() {
  const {
    showManualTicker,
    showAIAssistedTicker,
    showAutopilotTicker, 
    tickerSpeed
  } = useSettingsContext();
  const { openPositions } = useOpenPositionsContext();
  const { state: sidebarState, isMobile, hasMounted } = useSidebar();

  const displayableTradesWithPnl = useMemo(() => {
    return openPositions
      .filter(pos => {
        if (!hasMounted) return false; 
        if (showManualTicker && (pos.origin === 'manual' || !pos.origin) ) return true; 
        if (showAIAssistedTicker && pos.origin === 'aiAssist') return true;
        if (showAutopilotTicker && pos.origin === 'autopilot') return true; 
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
  }, [openPositions, showManualTicker, showAIAssistedTicker, showAutopilotTicker, hasMounted]); 

  if (!hasMounted || displayableTradesWithPnl.length === 0) {
    return null;
  }

  const leftPaddingClass = !isMobile
    ? (sidebarState === 'expanded' ? 'pl-[16rem]' : 'pl-[3rem]')
    : 'pl-4'; 

  const tickerAnimationClass = `animate-ticker-${tickerSpeed}`;

  let tickerMainLabel = "Live Trades:";
  const activeTradeTypesCount = [showManualTicker, showAIAssistedTicker, showAutopilotTicker].filter(Boolean).length;
  
  if (activeTradeTypesCount === 1) {
    if (showManualTicker) tickerMainLabel = "Manual Trades:";
    else if (showAIAssistedTicker) tickerMainLabel = "AI-Assisted Trades:";
    else if (showAutopilotTicker) tickerMainLabel = "Autopilot Trades:"; 
  }


  const MainIcon = () => {
    if (showManualTicker && activeTradeTypesCount === 1) return <Wrench className="h-3.5 w-3.5 mr-2 text-primary flex-shrink-0" />;
    if (showAIAssistedTicker && activeTradeTypesCount === 1) return <MiloAvatarIcon size={14} className="mr-2 text-primary flex-shrink-0" />; // Changed Bot to MiloAvatarIcon
    if (showAutopilotTicker && activeTradeTypesCount === 1) return <Cpu className="h-3.5 w-3.5 mr-2 text-primary flex-shrink-0" />; 
    return <Wrench className="h-3.5 w-3.5 mr-2 text-primary flex-shrink-0" />; 
  };


  return (
    <div className={cn(
      "w-full bg-black/40 text-white text-xs border-b border-primary shadow-inner sticky top-0 z-20 h-5 flex items-center", 
      leftPaddingClass 
    )}>
      <div className="overflow-hidden whitespace-nowrap w-full"> 
        <div className={cn("flex items-center pr-4", tickerAnimationClass)}> 
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
          {displayableTradesWithPnl.length > 0 && <span className="text-muted-foreground mx-2 flex-shrink-0">|</span>}
          {displayableTradesWithPnl.map((trade, idx) => (
             <span
              key={`${trade.id}-clone`}
              className={cn(
                "mx-3 flex-shrink-0",
                trade.pnl >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive"
              )}
              aria-hidden="true" 
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

