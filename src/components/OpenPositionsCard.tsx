
"use client";

import React, { useMemo } from 'react';
import type { OpenPosition } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  const filteredPositions = useMemo(() => {
    return openPositions.filter(pos => pos.accountId === selectedAccountId);
  }, [openPositions, selectedAccountId]);

  return (
    <Card className={cn("shadow-none flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between pt-4 pb-3 px-4">
        <CardTitle className="text-xl font-headline flex items-center text-foreground">
          <Briefcase className="mr-2 h-5 w-5 text-primary" />
          Open Positions
        </CardTitle>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-muted-foreground border-muted-foreground/40 bg-muted/20 hover:bg-muted/30 text-[10px] px-1.5 py-px h-auto whitespace-nowrap">
            <User className="mr-1 h-2.5 w-2.5" />
            Manual
          </Badge>
          <Badge variant="outline" className="text-primary border-primary/40 bg-primary/10 hover:bg-primary/20 text-[10px] px-1.5 py-px h-auto whitespace-nowrap">
            <MiloAvatarIcon size={10} className="mr-1 h-2.5 w-2.5" />
            AI Assist
          </Badge>
          <Badge variant="outline" className="text-[hsl(var(--confirm-green))] border-[hsl(var(--confirm-green))]/40 bg-[hsl(var(--confirm-green))]/10 hover:bg-[hsl(var(--confirm-green))]/20 text-[10px] px-1.5 py-px h-auto whitespace-nowrap">
            <Cpu className="mr-1 h-2.5 w-2.5" />
            Autopilot
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        {filteredPositions.length > 0 ? (
          <ScrollArea className="h-full">
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
          <div className="flex flex-col items-center justify-center h-full text-sm py-10 px-6">
            <Briefcase className="mx-auto h-10 w-10 mb-3 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground text-center">No open positions for this account.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
