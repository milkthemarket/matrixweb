
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { Stock, TradeRequest, OrderActionType, OrderSystemType } from '@/types';
import { DollarSign, PackageOpen, TrendingUp, TrendingDown, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderCardProps {
  selectedStock: Stock | null;
  initialActionType: OrderActionType | null;
  onSubmit: (tradeDetails: TradeRequest) => void;
  onClear: () => void;
}

export function OrderCard({ selectedStock, initialActionType, onSubmit, onClear }: OrderCardProps) {
  const [quantity, setQuantity] = useState('');
  const [orderType, setOrderType] = useState<OrderSystemType>('Market');
  const [limitPrice, setLimitPrice] = useState('');
  const [currentAction, setCurrentAction] = useState<OrderActionType | null>(initialActionType);

  useEffect(() => {
    if (selectedStock) {
      setQuantity('');
      setOrderType('Market');
      setLimitPrice('');
      setCurrentAction(initialActionType);
    } else {
      // Reset form when no stock is selected or selection is cleared
      setQuantity('');
      setOrderType('Market');
      setLimitPrice('');
      setCurrentAction(null);
    }
  }, [selectedStock, initialActionType]);


  const handleActionSelect = (action: OrderActionType) => {
    setCurrentAction(action);
  };
  
  const handleSubmit = () => {
    if (!selectedStock || !currentAction) {
      alert("No stock selected or action defined.");
      return;
    }
    if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }
    if (orderType === 'Limit' && (!limitPrice || isNaN(parseFloat(limitPrice)) || parseFloat(limitPrice) <= 0)) {
      alert("Please enter a valid limit price for limit orders.");
      return;
    }

    const tradeDetails: TradeRequest = {
      symbol: selectedStock.symbol,
      quantity: parseInt(quantity),
      action: currentAction,
      orderType: orderType,
      ...(orderType === 'Limit' && { limitPrice: parseFloat(limitPrice) }),
    };
    onSubmit(tradeDetails);
    // Optionally clear selection after submit, or let parent handle it
    // onClear(); 
  };

  if (!selectedStock) {
    return (
      <Card className="shadow-xl h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Trade Execution</CardTitle>
          <CardDescription>Select a stock from the screener to place an order.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No stock selected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const ActionIcon = currentAction === 'Buy' ? TrendingUp : TrendingDown;

  return (
    <Card className="shadow-xl h-full flex flex-col">
      <CardHeader className="relative">
        <CardTitle className="text-xl font-headline flex items-center">
          {currentAction && <ActionIcon className={cn("mr-2 h-5 w-5", currentAction === 'Buy' ? 'text-green-500' : 'text-red-500')} />}
          {currentAction ? `${currentAction} ${selectedStock.symbol}` : selectedStock.symbol}
        </CardTitle>
        <CardDescription>
          Current Price: ${selectedStock.price.toFixed(2)}
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={onClear} title="Clear Selection">
            <XCircle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Button>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 overflow-y-auto py-4">
        <div className="flex space-x-2 mb-4">
            <Button 
              onClick={() => handleActionSelect('Buy')} 
              className={cn("flex-1", currentAction === 'Buy' ? 'bg-green-600 hover:bg-green-700 text-white ring-2 ring-green-400' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30')}
              variant={currentAction === 'Buy' ? 'default' : 'outline'}
            >
              <TrendingUp className="mr-2 h-4 w-4" /> Buy
            </Button>
            <Button 
              onClick={() => handleActionSelect('Short')} 
              className={cn("flex-1", currentAction === 'Short' ? 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-400' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30')}
              variant={currentAction === 'Short' ? 'default' : 'outline'}
            >
              <TrendingDown className="mr-2 h-4 w-4" /> Short
            </Button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="quantity"><PackageOpen className="inline-block mr-1 h-4 w-4 text-muted-foreground" /> Quantity</Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g., 100"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="orderType">Order Type</Label>
          <Select value={orderType} onValueChange={(value) => setOrderType(value as OrderSystemType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select order type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Market">Market</SelectItem>
              <SelectItem value="Limit">Limit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {orderType === 'Limit' && (
          <div className="space-y-1.5">
            <Label htmlFor="limitPrice"><DollarSign className="inline-block mr-1 h-4 w-4 text-muted-foreground" /> Limit Price</Label>
            <Input
              id="limitPrice"
              type="number"
              step="0.01"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder="e.g., 150.50"
            />
          </div>
        )}
        
        <Separator className="my-6" />

        <div className="space-y-2 text-sm">
            <h4 className="font-medium text-muted-foreground">Stock Info</h4>
            <div className="flex justify-between"><span>Float:</span> <span>{selectedStock.float}M</span></div>
            <div className="flex justify-between"><span>Volume:</span> <span>{selectedStock.volume.toFixed(1)}M</span></div>
            {selectedStock.newsSnippet && (
                 <div className="pt-1">
                    <p className="text-muted-foreground">Catalyst:</p> 
                    <p className="text-xs leading-tight" title={selectedStock.newsSnippet}>{selectedStock.newsSnippet.substring(0,100)}{selectedStock.newsSnippet.length > 100 ? '...' : ''}</p>
                </div>
            )}
        </div>

      </CardContent>
      <CardFooter>
        <Button 
          type="button" 
          onClick={handleSubmit}
          disabled={!currentAction || !quantity}
          className={cn("w-full", 
            currentAction === 'Buy' && 'bg-green-600 hover:bg-green-700 text-white',
            currentAction === 'Short' && 'bg-red-600 hover:bg-red-700 text-white',
            !currentAction && 'bg-primary'
          )}
        >
          {currentAction ? <PackageOpen className="mr-2 h-4 w-4" /> : null}
          {currentAction ? `Submit ${currentAction} Order` : 'Select Action'}
        </Button>
      </CardFooter>
    </Card>
  );
}
