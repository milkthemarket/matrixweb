
"use client";

import React from 'react';
import type { OpenPosition } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button, buttonVariants } from '@/components/ui/button';
import { XSquare, Briefcase } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface OpenPositionsCardProps {
  positions: OpenPosition[];
  onClosePosition: (positionId: string) => void;
}

export function OpenPositionsCard({ positions, onClosePosition }: OpenPositionsCardProps) {
  const { toast } = useToast();

  const handleClose = (position: OpenPosition) => {
    console.log("Closing position:", position);
    toast({
      title: "Position Close Requested",
      description: `Closing ${position.shares} shares of ${position.symbol}.`,
    });
    onClosePosition(position.id);
  };
  
  const calculatePnl = (position: OpenPosition) => {
    return (position.currentPrice - position.entryPrice) * position.shares;
  };

  return (
    <Card className="shadow-md mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center text-foreground">
          <Briefcase className="mr-2 h-5 w-5 text-primary" />
          Open Positions
        </CardTitle>
        <CardDescription>Your currently active trades.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {positions.length > 0 ? (
          <ScrollArea className="h-[250px]">
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
                {positions.map((pos) => {
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
          <div className="text-center text-sm text-muted-foreground py-10 px-6">
            <Briefcase className="mx-auto h-10 w-10 mb-2 opacity-50" />
            No open positions.
          </div>
        )}
      </CardContent>
      {positions.length > 0 && (
        <CardFooter className="pt-4">
            <p className="text-xs text-muted-foreground">
                Current prices are simulated and P&amp;L is indicative.
            </p>
        </CardFooter>
      )}
    </Card>
  );
}
