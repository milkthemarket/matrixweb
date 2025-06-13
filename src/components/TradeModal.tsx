
"use client";

import React, { useState, useEffect } from 'react';
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
import type { TradeRequest, OrderActionType, OrderSystemType } from '@/types';
import { DollarSign, BarChartBig, PackageOpen, TrendingUp, TrendingDown } from 'lucide-react'; // Added TrendingUp/Down

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockSymbol: string | null;
  actionType: OrderActionType | null;
  onSubmit: (tradeDetails: TradeRequest) => void;
}

export function TradeModal({ isOpen, onClose, stockSymbol, actionType, onSubmit }: TradeModalProps) {
  const [quantity, setQuantity] = useState('');
  const [orderType, setOrderType] = useState<OrderSystemType>('Market');
  const [limitPrice, setLimitPrice] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setQuantity('');
      setOrderType('Market');
      setLimitPrice('');
    }
  }, [isOpen]);

  if (!stockSymbol || !actionType) {
    return null;
  }

  const handleSubmit = () => {
    if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }
    if (orderType === 'Limit' && (!limitPrice || isNaN(parseFloat(limitPrice)) || parseFloat(limitPrice) <= 0)) {
      alert("Please enter a valid limit price for limit orders.");
      return;
    }

    const tradeDetails: TradeRequest = {
      symbol: stockSymbol,
      quantity: parseInt(quantity),
      action: actionType,
      orderType: orderType,
      ...(orderType === 'Limit' && { limitPrice: parseFloat(limitPrice) }),
    };
    onSubmit(tradeDetails);
    onClose();
  };
  
  const ActionIcon = actionType === 'Buy' ? TrendingUp : TrendingDown;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-primary flex items-center">
            <ActionIcon className={`mr-2 h-5 w-5 ${actionType === 'Buy' ? 'text-green-500' : 'text-red-500'}`} />
            {actionType} Order for {stockSymbol}
          </DialogTitle>
          <DialogDescription>
            Enter the details for your trade. Review carefully before submitting.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="symbol" className="text-right text-muted-foreground">
              Symbol
            </Label>
            <Input id="symbol" value={stockSymbol} readOnly className="col-span-3 bg-muted border-muted" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right text-muted-foreground">
             <PackageOpen className="inline-block mr-1 h-4 w-4" /> Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g., 100"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="orderType" className="text-right text-muted-foreground">
              Order Type
            </Label>
            <Select value={orderType} onValueChange={(value) => setOrderType(value as OrderSystemType)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select order type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Market">Market</SelectItem>
                <SelectItem value="Limit">Limit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {orderType === 'Limit' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="limitPrice" className="text-right text-muted-foreground">
                <DollarSign className="inline-block mr-1 h-4 w-4" /> Limit Price
              </Label>
              <Input
                id="limitPrice"
                type="number"
                step="0.01"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                placeholder="e.g., 150.50"
                className="col-span-3"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            className={actionType === 'Buy' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
          >
            <PackageOpen className="mr-2 h-4 w-4" />
            Submit {actionType} Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
