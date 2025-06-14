
"use client";

import React, { useMemo } from 'react';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { Wrench, Bot, Cpu, HistoryTradeMode } from 'lucide-react'; // Added Bot and Cpu
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
  const { state: sidebarState, isMobile } = useSidebar();

  const displayableTradesWithPnl = useMemo(() => {
    return openPositions
      .filter(pos => {
        if (showManualTicker && pos.origin === 'manual') return true;
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
      .sort((a, b) => new Date(b.id.replace('pos','')).getTime() - new Date(a.id.replace('pos','')).getTime()); // Sort by newest first
  }, [openPositions, showManualTicker, showAIAssistedTicker, showFullyAITicker]);

  if (displayableTradesWithPnl.length === 0) {
    return null;
  }

  const leftPaddingClass = !isMobile
    ? (sidebarState === 'expanded' ? 'pl-[16rem]' : 'pl-[3rem]')
    : '';

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
    return <Wrench className="h-3.5 w-3.5 mr-2 text-primary flex-shrink-0" />; // Default or mixed
  };


  return (
    <div className={cn(
      "w-full bg-black/40 text-white py-1.5 text-xs border-b border-primary shadow-inner sticky top-0 z-20",
      leftPaddingClass
    )}>
      <div className="overflow-hidden whitespace-nowrap">
        <div className={cn("flex items-center pr-4 pl-4 md:pl-0", tickerAnimationClass)}>
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
        </div>
      </div>
    </div>
  );
}
