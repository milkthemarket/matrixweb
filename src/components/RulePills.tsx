
"use client";

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowDownNarrowWide, Scaling } from 'lucide-react';

interface RulePillsProps {
  minChangePercent: number;
  maxFloat: number; // in millions
  minVolume: number; // in millions
}

export function RulePills({ minChangePercent, maxFloat, minVolume }: RulePillsProps) {
  const pills = [];

  if (minChangePercent !== 0 && minChangePercent !== -10) { // Default slider min is -10
    pills.push(
      <Badge key="change" variant="outline" className="text-accent border-accent flex items-center">
        <TrendingUp className="mr-1 h-3 w-3" /> % Change &ge; {minChangePercent}%
      </Badge>
    );
  }
  if (maxFloat !== 20000) { // Default slider max is 20000
     pills.push(
      <Badge key="float" variant="outline" className="text-accent border-accent flex items-center">
        <ArrowDownNarrowWide className="mr-1 h-3 w-3" /> Float &le; {maxFloat}M
      </Badge>
    );
  }
  if (minVolume !== 0) {
     pills.push(
      <Badge key="volume" variant="outline" className="text-accent border-accent flex items-center">
        <Scaling className="mr-1 h-3 w-3" /> Volume &ge; {minVolume}M
      </Badge>
    );
  }

  if (pills.length === 0) {
    return <p className="text-sm text-muted-foreground">No active filters.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2 items-center mb-4">
      <span className="text-sm font-medium text-muted-foreground">Active Filters:</span>
      {pills}
    </div>
  );
}
