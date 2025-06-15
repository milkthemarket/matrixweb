
"use client";

import React from 'react';
import type { OptionContract, OptionContractDetails } from '@/types'; // Assuming OptionContractDetails might be used later
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card'; // Using Card for consistent styling
import { TrendingUp, ListPlus } from 'lucide-react'; // Example icon for watchlist
import { cn } from '@/lib/utils';

interface OptionDetailPanelProps {
  contract: OptionContract;
  underlyingTicker: string;
}

// Static data for display as per prompt
const staticDetails = {
  bidSize: 50,
  askSize: 50,
  mark: 5.35,
  high: 7.00,
  low: 3.02,
  previousClose: 2.38,
  lastTrade: 5.73,
  volume: 5120, // This is already in OptionContract, can use contract.volume
  impliedVolatility: 17.59, // This is already in OptionContract, can use contract.impliedVolatility
  openInterest: 1355, // This is already in OptionContract, can use contract.openInterest
  delta: -0.7000,
  gamma: 0.0474,
  theta: -0.6594,
  vega: 0.1471,
  rho: -0.0191,
};

const DetailItem: React.FC<{ label: string; value: string | number; valueClass?: string }> = ({ label, value, valueClass }) => (
  <div className="flex justify-between items-baseline">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={cn("text-sm font-medium text-foreground", valueClass)}>{value}</span>
  </div>
);

export function OptionDetailPanel({ contract, underlyingTicker }: OptionDetailPanelProps) {
  const handleAddToWatchlist = () => {
    // Placeholder for future watchlist functionality
    console.log(`Add to Watchlist: ${underlyingTicker} ${contract.strike} ${contract.type} Exp ${contract.expirationDate}`);
  };

  return (
    <div className="p-4 bg-card/80 backdrop-blur-sm"> {/* Matches Card component style - black/15, blur, border */}
      <div className="max-w-3xl mx-auto">
        <h3 className="text-lg font-semibold text-primary mb-3">
          {underlyingTicker} ${contract.strike.toFixed(2)} {contract.type} &ndash; Exp: {new Date(contract.expirationDate).toLocaleDateString()}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mb-6">
          {/* Column 1 */}
          <div className="space-y-1.5">
            <DetailItem label="Bid" value={`$${contract.bid.toFixed(2)} x ${staticDetails.bidSize}`} />
            <DetailItem label="Ask" value={`$${contract.ask.toFixed(2)} x ${staticDetails.askSize}`} />
            <DetailItem label="Mark" value={`$${staticDetails.mark.toFixed(2)}`} />
            <DetailItem label="High" value={`$${staticDetails.high.toFixed(2)}`} />
            <DetailItem label="Low" value={`$${staticDetails.low.toFixed(2)}`} />
          </div>
          {/* Column 2 */}
          <div className="space-y-1.5">
            <DetailItem label="Prev. Close" value={`$${staticDetails.previousClose.toFixed(2)}`} />
            <DetailItem label="Last Trade" value={`$${staticDetails.lastTrade.toFixed(2)}`} />
            <DetailItem label="Volume" value={contract.volume?.toLocaleString() || staticDetails.volume.toLocaleString()} />
            <DetailItem label="Open Interest" value={contract.openInterest?.toLocaleString() || staticDetails.openInterest.toLocaleString()} />
            <DetailItem label="Implied Vol." value={`${(contract.impliedVolatility || staticDetails.impliedVolatility).toFixed(2)}%`} />
          </div>
        </div>

        <h4 className="text-md font-bold text-foreground mb-2">The Greeks</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          {/* Column 1 */}
          <div className="space-y-1.5">
            <DetailItem label="Delta" value={staticDetails.delta.toFixed(4)} />
            <DetailItem label="Gamma" value={staticDetails.gamma.toFixed(4)} />
            <DetailItem label="Theta" value={staticDetails.theta.toFixed(4)} />
          </div>
          {/* Column 2 */}
          <div className="space-y-1.5">
            <DetailItem label="Vega" value={staticDetails.vega.toFixed(4)} />
            <DetailItem label="Rho" value={staticDetails.rho.toFixed(4)} />
          </div>
        </div>

        <div className="flex justify-start mt-4">
          <Button
            onClick={handleAddToWatchlist}
            variant="outline"
            className="border-[hsl(var(--confirm-green))] text-[hsl(var(--confirm-green))] hover:bg-[hsl(var(--confirm-green))] hover:text-[hsl(var(--confirm-green-foreground))]"
            size="sm"
          >
            <ListPlus className="mr-2 h-4 w-4" />
            Add to Watchlist
          </Button>
        </div>
      </div>
    </div>
  );
}
