
"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { OptionContract, OptionOrderActionType } from '@/types';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptionsChainTableProps {
  chainData: OptionContract[];
  underlyingPrice: number;
  onSelectContract: (contract: OptionContract) => void;
  tradeAction: OptionOrderActionType;
}

export function OptionsChainTable({ chainData, underlyingPrice, onSelectContract, tradeAction }: OptionsChainTableProps) {
  
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

  if (!chainData || chainData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No option data available for the selected criteria.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full">
      <Table className="min-w-max">
        <TableHeader className="sticky top-0 bg-card/[.05] backdrop-blur-md z-10">
          <TableRow>
            <TableHead className="w-[80px] text-center">Add</TableHead>
            <TableHead className="w-[100px] text-right">Strike</TableHead>
            <TableHead className="w-[100px] text-right">Ask</TableHead>
            <TableHead className="w-[100px] text-right">Bid</TableHead>
            <TableHead className="w-[100px] text-right">Last</TableHead>
            <TableHead className="w-[100px] text-right">Change</TableHead>
            <TableHead className="w-[100px] text-right">% Change</TableHead>
            <TableHead className="w-[120px] text-right">Breakeven</TableHead>
            <TableHead className="w-[120px] text-right">To B/E (%)</TableHead>
            <TableHead className="w-[100px] text-right">Volume</TableHead>
            <TableHead className="w-[100px] text-right">Open Int.</TableHead>
            <TableHead className="w-[100px] text-right">IV (%)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chainData.map((contract, index) => {
            const isATM = index === atmIndex;
            const isITM = contract.type === 'Call' ? contract.strike < underlyingPrice : contract.strike > underlyingPrice;
            const isOTM = contract.type === 'Call' ? contract.strike > underlyingPrice : contract.strike < underlyingPrice;

            return (
              <TableRow
                key={contract.id}
                className={cn(
                  "hover:bg-white/10 transition-colors duration-150",
                  isATM ? "bg-primary/10" : 
                  isITM ? "bg-green-500/5" : 
                  isOTM ? "bg-red-500/5" : ""
                )}
              >
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-primary hover:bg-primary/10"
                    onClick={() => onSelectContract(contract)}
                    title={`Add ${contract.type} @ ${contract.strike} to trade`}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell className={cn("text-right font-medium", isATM && "text-primary font-bold")}>
                  {contract.strike.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                   <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "h-7 px-2 font-mono",
                        tradeAction === 'Buy' ? "text-orange-400 hover:bg-orange-400/10 hover:text-orange-300" : "text-foreground",
                        "focus-visible:ring-orange-500 focus-visible:ring-offset-card"
                    )}
                    onClick={() => onSelectContract(contract)}
                    title={`${tradeAction} ${contract.type} @ ${contract.strike} (Ask: ${contract.ask.toFixed(2)})`}
                   >
                    {contract.ask.toFixed(2)}
                   </Button>
                </TableCell>
                <TableCell className="text-right font-mono">{contract.bid.toFixed(2)}</TableCell>
                <TableCell className="text-right font-mono">{contract.lastPrice?.toFixed(2) || '-'}</TableCell>
                <TableCell className={cn("text-right font-mono", contract.change >= 0 ? 'text-green-400' : 'text-red-400')}>
                  {contract.change.toFixed(2)}
                </TableCell>
                <TableCell className={cn("text-right font-mono", contract.percentChange >= 0 ? 'text-green-400' : 'text-red-400')}>
                  {contract.percentChange.toFixed(2)}%
                </TableCell>
                <TableCell className="text-right font-mono">{contract.breakeven.toFixed(2)}</TableCell>
                <TableCell className={cn("text-right font-mono", contract.toBreakevenPercent && contract.toBreakevenPercent >= 0 ? 'text-green-400' : 'text-red-400')}>
                  {contract.toBreakevenPercent?.toFixed(2) || '-'}%
                </TableCell>
                <TableCell className="text-right font-mono">{contract.volume?.toLocaleString() || '-'}</TableCell>
                <TableCell className="text-right font-mono">{contract.openInterest?.toLocaleString() || '-'}</TableCell>
                <TableCell className="text-right font-mono">{contract.impliedVolatility?.toFixed(1) || '-'}%</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
