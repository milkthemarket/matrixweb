
"use client";

import React, { useState, useMemo } from 'react';
import type { OpenPosition, HistoryTradeMode } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { XSquare, Briefcase, User, Layers, Cpu } from 'lucide-react';
import { MiloAvatarIcon } from '@/components/icons/MiloAvatarIcon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { useSettingsContext } from '@/contexts/SettingsContext'; // Import settings context

interface OpenPositionsCardProps {
  className?: string; // Added className prop
}

type OpenPositionFilterMode = HistoryTradeMode | 'all';

export function OpenPositionsCard({ className }: OpenPositionsCardProps) { // Added className to props
  const { openPositions, removeOpenPosition, selectedAccountId } = useOpenPositionsContext();
  const { notificationSounds, playSound } = useSettingsContext(); // Get sound settings
  const [selectedOriginFilter, setSelectedOriginFilter] = useState<OpenPositionFilterMode>('all');

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

  const filteredPositions = useMemo(() => {
    const accountPositions = openPositions.filter(pos => pos.accountId === selectedAccountId);

    if (selectedOriginFilter === 'all') {
      return accountPositions;
    }
    return accountPositions.filter(pos => (pos.origin || 'manual') === selectedOriginFilter);
  }, [openPositions, selectedAccountId, selectedOriginFilter]);

  const buttonBaseClass = "flex-1 flex items-center justify-center h-8 py-1.5 px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-background disabled:opacity-50";
  const activeModeClass = "bg-primary text-primary-foreground shadow-sm";
  const inactiveModeClass = "bg-transparent text-muted-foreground hover:bg-panel/[.05] hover:text-foreground";

  return (
    <Card className={cn("shadow-none flex flex-col", className)}> {/* Updated shadow and added className */}
      <CardHeader className="pt-4 pb-3">
        <CardTitle className="text-xl font-headline flex items-center text-foreground">
          <Briefcase className="mr-2 h-5 w-5 text-primary" />
          Open Positions
        </CardTitle>
        {/* Removed CardDescription here */}

        <div className="grid grid-cols-4 w-full max-w-md rounded-md overflow-hidden border border-border/[.1] bg-panel/[.05] mt-3">
          <button
            onClick={() => setSelectedOriginFilter('all')}
            className={cn(buttonBaseClass, selectedOriginFilter === 'all' ? activeModeClass : inactiveModeClass)}
            title="Show All Trades for this Account"
          >
            <Layers className="mr-1.5 h-3.5 w-3.5" /> All
          </button>
          <button
            onClick={() => setSelectedOriginFilter('manual')}
            className={cn(buttonBaseClass, selectedOriginFilter === 'manual' ? activeModeClass : inactiveModeClass)}
            title="Show Manual Trades for this Account"
          >
            <User className="mr-1.5 h-3.5 w-3.5" /> Manual
          </button>
          <button
            onClick={() => setSelectedOriginFilter('aiAssist')}
            className={cn(buttonBaseClass, selectedOriginFilter === 'aiAssist' ? activeModeClass : inactiveModeClass)}
            title="Show AI Assisted Trades for this Account"
          >
            <MiloAvatarIcon size={14} className="mr-1.5" /> AI Assist
          </button>
          <button
            onClick={() => setSelectedOriginFilter('autopilot')}
            className={cn(buttonBaseClass, selectedOriginFilter === 'autopilot' ? activeModeClass : inactiveModeClass)}
            title="Show Autopilot Trades for this Account"
          >
            <Cpu className="mr-1.5 h-3.5 w-3.5" /> Autopilot
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        {filteredPositions.length > 0 ? (
          <ScrollArea className="h-full"> {/* Changed from h-[380px] to h-full */}
            <Table>
              <TableHeader className="sticky top-0 bg-card/[.05] backdrop-blur-md z-10">
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right">Shares</TableHead>
                  <TableHead className="text-right">Entry</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">P&amp;L</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPositions.map((pos) => {
                  const pnl = calculatePnl(pos);
                  return (
                    <TableRow key={pos.id} className="hover:bg-muted/5">
                      <TableCell className="font-medium text-foreground">{pos.symbol}</TableCell>
                      <TableCell className="text-right text-foreground">{pos.shares}</TableCell>
                      <TableCell className="text-right text-foreground">${pos.entryPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-foreground">${pos.currentPrice.toFixed(2)}</TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-semibold",
                          pnl >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive"
                        )}
                      >
                        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive-foreground"
                          onClick={() => handleClose(pos)}
                        >
                          <XSquare className="mr-1 h-3.5 w-3.5" /> Close
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-sm py-10 px-6"> {/* Added h-full */}
            <Briefcase className="mx-auto h-10 w-10 mb-3 opacity-50 text-muted-foreground" />
            { (selectedOriginFilter === 'aiAssist' || selectedOriginFilter === 'autopilot') ? (
              <p className="text-primary text-center">
                Milo’s looking for greener pastures—no trades just yet for this filter!
              </p>
            ) : selectedOriginFilter === 'all' ? (
              <p className="text-muted-foreground text-center">No open positions for this account.</p>
            ) : (
              <p className="text-muted-foreground text-center">{`No open positions matching "${selectedOriginFilter}" filter for this account.`}</p>
            )}
          </div>
        )}
      </CardContent>
      {filteredPositions.length > 0 && (
        <CardFooter className="pt-3 pb-4">
            <p className="text-xs text-muted-foreground">
                Current prices are simulated and P&amp;L is indicative for the selected account.
            </p>
        </CardFooter>
      )}
    </Card>
  );
}

