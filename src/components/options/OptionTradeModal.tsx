
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OptionContract, OptionOrderActionType, OptionTradeRequest } from '@/types';
import { PackageOpen, Info, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { useSettingsContext } from '@/contexts/SettingsContext'; // Import settings context

interface OptionTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: OptionContract | null;
  tradeAction: OptionOrderActionType;
  underlyingTicker: string;
  underlyingPrice: number;
  onSubmit: (tradeDetails: OptionTradeRequest) => void;
}

export function OptionTradeModal({
  isOpen,
  onClose,
  contract,
  tradeAction,
  underlyingTicker,
  underlyingPrice,
  onSubmit,
}: OptionTradeModalProps) {
  const [quantity, setQuantity] = useState('1');
  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market');
  const [limitPrice, setLimitPrice] = useState('');
  
  const { accounts, selectedAccountId, setSelectedAccountId } = useOpenPositionsContext();
  const { notificationSounds, playSound } = useSettingsContext(); // Get sound settings
  
  const estimatedCost = useMemo(() => {
    if (!contract) return 0;
    const numQuantity = parseInt(quantity) || 0;
    const pricePerContract = orderType === 'Limit' && limitPrice ? parseFloat(limitPrice) : contract.ask;
    return numQuantity * pricePerContract * 100;
  }, [contract, quantity, orderType, limitPrice]);

  useEffect(() => {
    if (isOpen && contract) {
      setQuantity('1');
      setOrderType('Market');
      setLimitPrice(contract.ask.toFixed(2));
    }
  }, [isOpen, contract]);

  if (!contract) return null;

  const handleSubmit = () => {
    const numQuantity = parseInt(quantity);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }
    if (orderType === 'Limit' && (!limitPrice || isNaN(parseFloat(limitPrice)) || parseFloat(limitPrice) <= 0)) {
      alert("Please enter a valid limit price for limit orders.");
      return;
    }

    const tradeDetails: OptionTradeRequest = {
      contract,
      action: tradeAction,
      quantity: numQuantity,
      orderType,
      limitPrice: orderType === 'Limit' ? parseFloat(limitPrice) : undefined,
      accountId: selectedAccountId,
    };
    onSubmit(tradeDetails);
    if (notificationSounds.tradePlaced !== 'off') {
      playSound(notificationSounds.tradePlaced);
    }
  };

  const actionColorClass = tradeAction === 'Buy' ? 'text-green-400' : 'text-red-400';
  const actionButtonClass = tradeAction === 'Buy' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white';


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={cn("text-xl flex items-center", actionColorClass)}>
            {tradeAction} {underlyingTicker} {contract.type} Option
          </DialogTitle>
          <DialogDescription>
            Strike: ${contract.strike.toFixed(2)} | Expires: {new Date(contract.expirationDate).toLocaleDateString()} ({contract.daysToExpiration}d)
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="optQuantity" className="text-right text-sm">Quantity</Label>
            <Input
              id="optQuantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="No. of Contracts"
              className="col-span-2 bg-transparent"
              min="1"
            />
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="optOrderType" className="text-right text-sm">Order Type</Label>
            <Select value={orderType} onValueChange={(value) => setOrderType(value as 'Market' | 'Limit')}>
              <SelectTrigger className="col-span-2">
                <SelectValue placeholder="Select order type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Market">Market</SelectItem>
                <SelectItem value="Limit">Limit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {orderType === 'Limit' && (
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="optLimitPrice" className="text-right text-sm">Limit Price</Label>
              <Input
                id="optLimitPrice"
                type="number"
                step="0.01"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                placeholder="e.g., 2.50"
                className="col-span-2 bg-transparent"
              />
            </div>
          )}

          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="optAccount" className="text-right text-sm">Account</Label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                    {accounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>{acc.label} ({acc.number})</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>

          <div className="mt-4 p-3 rounded-md bg-muted/30 border border-muted/50 text-sm space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center"><Info className="h-4 w-4 mr-1.5" /> Current Ask:</span>
              <span className="font-mono text-foreground">${contract.ask.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center"><Info className="h-4 w-4 mr-1.5" /> Current Bid:</span>
              <span className="font-mono text-foreground">${contract.bid.toFixed(2)}</span>
            </div>
             <div className="flex justify-between items-center pt-1">
              <span className="text-muted-foreground flex items-center"><DollarSign className="h-4 w-4 mr-1.5" /> Est. Cost:</span>
              <span className="font-mono font-semibold text-foreground">${estimatedCost.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">Note: Cost is (Price x Quantity x 100 shares/contract). Market orders may fill at a different price.</p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            className={cn(actionButtonClass)}
            disabled={parseInt(quantity) <=0 || (orderType === 'Limit' && (!limitPrice || parseFloat(limitPrice) <= 0))}
          >
            <PackageOpen className="mr-2 h-4 w-4" /> Review & Place {tradeAction} Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
