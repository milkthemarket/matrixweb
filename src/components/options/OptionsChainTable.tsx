
"use client";

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { OptionContract, OptionOrderActionType } from '@/types';
import { PlusCircle, SlidersHorizontal } from 'lucide-react'; // Added SlidersHorizontal
import { cn } from '@/lib/utils';
import { OptionDetailPanel } from './OptionDetailPanel';

interface OptionsChainTableProps {
  chainData: OptionContract[];
  underlyingPrice: number;
  underlyingTicker: string;
  onSelectContract: (contract: OptionContract) => void;
  tradeAction: OptionOrderActionType;
}

export function OptionsChainTable({ chainData, underlyingPrice, underlyingTicker, onSelectContract, tradeAction }: OptionsChainTableProps) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const findATMStrikeIndex = () => {
    if (!chainData || chainData.length === 0) return -1;
    let closestIndex = 0;
    let minDiff = Math.abs(chainData[0].strike - underlyingPrice);
    for (let i = 1; i < chainData.length; i++) {
      const diff = Math.abs(chainData[i].strike - underlyingPrice);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }
    return closestIndex;
  };

  const atmIndex = findATMStrikeIndex();

  const handleRowClick = (contractId: string) => {
    setExpandedRowId(prevId => (prevId === contractId ? null : contractId));
  };

  if (!chainData || chainData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
        <SlidersHorizontal className="h-10 w-10 mb-2 opacity-50" />
        <p className="text-xs">No options data to display.</p>
        <p className="text-xs">Please check your filters or try again later.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full overflow-auto">
      <Table className="min-w-max table-fixed">
        <TableHeader className="sticky top-0 bg-card/[.05] backdrop-blur-md z-10">
          <TableRow>
            <TableHead className="w-[60px] text-center">Add</TableHead>
            <TableHead className="w-[80px] text-right">Strike</TableHead>
            <TableHead className="w-[80px] text-right">Bid</TableHead>
            <TableHead className="w-[80px] text-right">Ask</TableHead>
            <TableHead className="w-[80px] text-right">Last</TableHead>
            <TableHead className="w-[90px] text-right">% Change</TableHead>
            <TableHead className="w-[80px] text-right">Volume</TableHead>
            <TableHead className="w-[80px] text-right">OI</TableHead>
            <TableHead className="w-[80px] text-right">IV (%)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chainData.map((contract, index) => {
            const isATM = index === atmIndex;
            const isITM = contract.type === 'Call' ? contract.strike < underlyingPrice : contract.strike > underlyingPrice;
            const isOTM = contract.type === 'Call' ? contract.strike > underlyingPrice : contract.strike < underlyingPrice;
            const isExpanded = expandedRowId === contract.id;

            return (
              <React.Fragment key={contract.id}>
                <TableRow
                  className={cn(
                    "hover:bg-white/10 transition-colors duration-150 cursor-pointer",
                    isExpanded && "bg-primary/15",
                    !isExpanded && isATM ? "bg-primary/10" : 
                    !isExpanded && isITM ? "bg-[hsl(var(--confirm-green))]/5" : 
                    !isExpanded && isOTM ? "bg-destructive/5" : ""
                  )}
                  onClick={() => handleRowClick(contract.id)}
                >
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-primary hover:bg-primary/10"
                      onClick={(e) => { e.stopPropagation(); onSelectContract(contract); }}
                      title={`Select ${contract.type} @ ${contract.strike} for trade`}
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                  <TableCell className={cn("text-right font-mono text-[10px]", isATM && "text-primary font-bold")}>
                    {contract.strike.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[10px]">{contract.bid.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                     <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                          "h-6 px-1.5 font-mono text-[10px]",
                           "text-orange-400 hover:bg-orange-400/10 hover:text-orange-300", 
                          "focus-visible:ring-orange-500 focus-visible:ring-offset-card"
                      )}
                      onClick={(e) => { e.stopPropagation(); onSelectContract(contract); }}
                      title={`${tradeAction} ${contract.type} @ ${contract.strike} (Ask: ${contract.ask.toFixed(2)})`}
                     >
                      {contract.ask.toFixed(2)}
                     </Button>
                  </TableCell>
                  <TableCell className="text-right font-mono text-[10px]">{contract.lastPrice?.toFixed(2) || '-'}</TableCell>
                  <TableCell className={cn("text-right font-mono text-[10px]", contract.percentChange >= 0 ? 'text-[hsl(var(--confirm-green))]' : 'text-destructive')}>
                    {contract.percentChange >= 0 ? '+' : ''}{contract.percentChange.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right font-mono text-[10px]">{contract.volume?.toLocaleString() || '-'}</TableCell>
                  <TableCell className="text-right font-mono text-[10px]">{contract.openInterest?.toLocaleString() || '-'}</TableCell>
                  <TableCell className="text-right font-mono text-[10px]">{contract.impliedVolatility?.toFixed(1) || '-'}%</TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow className="bg-black/20 hover:bg-black/25">
                    <TableCell colSpan={9} className="p-0"> 
                      <OptionDetailPanel contract={contract} underlyingTicker={underlyingTicker} />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
