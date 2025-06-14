
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { Stock, TradeRequest, OrderActionType, OrderSystemType } from '@/types';
import { DollarSign, PackageOpen, TrendingUp, TrendingDown, CircleSlash, XCircle } from 'lucide-react';
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
  const [currentAction, setCurrentAction] = useState<OrderActionType | null>(null);

  useEffect(() => {
    if (selectedStock) {
      setCurrentAction(initialActionType);
    } else {
      setCurrentAction(null);
    }
  }, [selectedStock, initialActionType]);


  const handleActionSelect = (action: OrderActionType) => {
    setCurrentAction(action);
  };
  
  const handleSubmit = () => {
    if (!selectedStock || !currentAction || !quantity) {
      alert("Stock, action, and quantity are required.");
      return;
    }
    if (isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
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
  };

  const getCardTitle = () => {
    if (!selectedStock) return "Trade A Stock";
    if (currentAction) return `${currentAction} ${selectedStock.symbol}`;
    return selectedStock.symbol;
  };

  const getCardDescription = () => {
    if (!selectedStock) return "Select a ticker from the screener table to begin";
    return `Current Price: $${selectedStock.price.toFixed(2)}`;
  };

  const getSubmitButtonText = () => {
    if (!selectedStock) return "Select Stock to Trade";
    if (!currentAction) return "Select Action";
    return `Submit ${currentAction} Order`;
  };

  return (
    <Card className="shadow-xl h-full flex flex-col">
      <CardHeader className="relative">
        <CardTitle className="text-xl font-headline flex items-center">
          {getCardTitle()}
        </CardTitle>
        <CardDescription>
          {getCardDescription()}
        </CardDescription>
        {selectedStock && (
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={onClear} title="Clear Selection">
            <XCircle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4 flex-1 overflow-y-auto py-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
            <Button 
              onClick={() => handleActionSelect('Buy')}
              variant={currentAction === 'Buy' ? 'default' : 'outline'}
              className={cn(
                "flex-1", 
                currentAction === 'Buy' 
                  ? 'bg-green-600 hover:bg-green-700 text-white ring-2 ring-green-400' 
                  : 'border-green-500 text-green-500 hover:bg-green-500 hover:text-white'
              )}
              disabled={!selectedStock}
            >
              <TrendingUp className="mr-2 h-4 w-4" /> Buy
            </Button>
            <Button 
              onClick={() => handleActionSelect('Sell')}
              variant={currentAction === 'Sell' ? 'default' : 'secondary'}
              className={cn(
                "flex-1",
                currentAction === 'Sell'
                  ? 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-400'
                  : 'bg-slate-600 hover:bg-slate-500 text-slate-100'
              )}
              disabled={!selectedStock}
            >
              <CircleSlash className="mr-2 h-4 w-4" /> Sell
            </Button>
            <Button 
              onClick={() => handleActionSelect('Short')} 
              variant={currentAction === 'Short' ? 'default' : 'outline'}
              className={cn(
                "flex-1",
                currentAction === 'Short'
                  ? 'bg-red-700 hover:bg-red-800 text-white ring-2 ring-red-400'
                  : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
              )}
              disabled={!selectedStock}
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
            disabled={!selectedStock}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="orderType">Order Type</Label>
          <Select 
            value={orderType} 
            onValueChange={(value) => setOrderType(value as OrderSystemType)}
            disabled={!selectedStock}
          >
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
              disabled={!selectedStock}
            />
          </div>
        )}
        
        {selectedStock && (
          <>
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
          </>
        )}

      </CardContent>
      <CardFooter>
        <Button 
          type="button" 
          onClick={handleSubmit}
          disabled={!selectedStock || !currentAction || !quantity || parseInt(quantity) <= 0}
          className={cn("w-full", 
            currentAction === 'Buy' && selectedStock && 'bg-green-600 hover:bg-green-700 text-white',
            currentAction === 'Sell' && selectedStock && 'bg-red-600 hover:bg-red-700 text-white',
            currentAction === 'Short' && selectedStock && 'bg-red-700 hover:bg-red-800 text-white', // Darker red for Short submit
            (!selectedStock || !currentAction) && 'bg-primary/70 hover:bg-primary/70 cursor-not-allowed'
          )}
        >
          {currentAction && selectedStock ? <PackageOpen className="mr-2 h-4 w-4" /> : null}
          {getSubmitButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
}
