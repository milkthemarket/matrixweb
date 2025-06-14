
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import type { Stock, TradeRequest, OrderActionType, OrderSystemType, QuantityInputMode, TradeMode } from '@/types';
import { DollarSign, PackageOpen, TrendingUp, TrendingDown, CircleSlash, XCircle, Info, Repeat, Clock4, Bot, User, Cog, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AiTradeCard } from '@/components/AiTradeCard';

interface OrderCardProps {
  selectedStock: Stock | null;
  initialActionType: OrderActionType | null;
  onSubmit: (tradeDetails: TradeRequest) => void;
  onClear: () => void;
}

const MOCK_BUYING_POWER = 10000; 

const dummyAutoRules = [
  {
    id: "auto_rule_1",
    name: "Momentum Short",
    description: "Short any stock up >15% intraday with float under 10M"
  },
  {
    id: "auto_rule_2",
    name: "Gap Reversal",
    description: "Buy dip on stocks with large pre-market gap downs >10%"
  },
  {
    id: "auto_rule_3",
    name: "Low RSI Buy",
    description: "Buy stocks with RSI < 25 and high news volume"
  }
];

export function OrderCard({ selectedStock, initialActionType, onSubmit, onClear }: OrderCardProps) {
  const [tradeMode, setTradeMode] = useState<TradeMode>('manual');
  const [quantityValue, setQuantityValue] = useState('');
  const [quantityMode, setQuantityMode] = useState<QuantityInputMode>('Shares');
  const [orderType, setOrderType] = useState<OrderSystemType>('Market');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [trailingOffset, setTrailingOffset] = useState('');
  const [currentAction, setCurrentAction] = useState<OrderActionType | null>(null);
  const [timeInForce, setTimeInForce] = useState<string>('Day');
  const [isAutoTradingEnabled, setIsAutoTradingEnabled] = useState(true);
  
  const [buyingPower] = useState<number>(MOCK_BUYING_POWER); 

  useEffect(() => {
    if (selectedStock) {
      if (tradeMode === 'manual') {
         setCurrentAction(initialActionType);
         setQuantityValue(''); 
         setOrderType('Market');
         setLimitPrice('');
         setStopPrice('');
         setTrailingOffset('');
         setTimeInForce('Day');
      }
    } else {
      setCurrentAction(null);
      setQuantityValue('');
    }
  }, [selectedStock, initialActionType, tradeMode]);

  useEffect(() => {
    if (tradeMode === 'ai' || tradeMode === 'auto' || !selectedStock) {
      setQuantityValue('');
      setOrderType('Market');
      setLimitPrice('');
      setStopPrice('');
      setTrailingOffset('');
      setCurrentAction(null); 
      setTimeInForce('Day');
    }
  }, [tradeMode, selectedStock]);


  const handleActionSelect = (action: OrderActionType) => {
    setCurrentAction(action);
  };

  const toggleQuantityMode = () => {
    setQuantityMode(prevMode => {
      const nextMode = prevMode === 'Shares' ? 'DollarAmount' : prevMode === 'DollarAmount' ? 'PercentOfBuyingPower' : 'Shares';
      return nextMode;
    });
    setQuantityValue(''); 
  };

  const getQuantityInputPlaceholder = () => {
    if (quantityMode === 'Shares') return "e.g., 100";
    if (quantityMode === 'DollarAmount') return "e.g., 1000";
    if (quantityMode === 'PercentOfBuyingPower') return "e.g., 10";
    return "";
  };


  const { finalSharesToSubmit, estimatedCost, isValidQuantity } = useMemo(() => {
    let shares = 0;
    let cost = 0;
    let valid = false;
    const stockPrice = selectedStock?.price || 0;
    const rawValue = parseFloat(quantityValue);

    if (selectedStock && !isNaN(rawValue) && rawValue > 0) {
      valid = true;
      if (quantityMode === 'Shares') {
        shares = Math.floor(rawValue);
        cost = shares * stockPrice;
      } else if (quantityMode === 'DollarAmount') {
        if (stockPrice > 0) {
          shares = Math.floor(rawValue / stockPrice);
        } else {
          shares = 0;
        }
        cost = rawValue; 
      } else if (quantityMode === 'PercentOfBuyingPower') {
        if (rawValue > 0 && rawValue <= 100) {
          const dollarAmount = (rawValue / 100) * buyingPower;
          if (stockPrice > 0) {
            shares = Math.floor(dollarAmount / stockPrice);
          } else {
            shares = 0; 
          }
          cost = dollarAmount; 
        } else {
          valid = false; 
        }
      }
      if (shares <= 0 && quantityMode !== 'DollarAmount' && quantityMode !== 'PercentOfBuyingPower') valid = false;
      if (shares <= 0 && (quantityMode === 'DollarAmount' || quantityMode === 'PercentOfBuyingPower') && stockPrice > 0 ) valid = false;


    }
    return { finalSharesToSubmit: shares, estimatedCost: cost, isValidQuantity: valid };
  }, [quantityValue, quantityMode, selectedStock, buyingPower]);
  
  const handleManualSubmit = () => {
    if (!selectedStock || !currentAction || !isValidQuantity || finalSharesToSubmit <= 0) {
      alert("Stock, action, and a valid positive quantity resulting in at least 1 share are required.");
      return;
    }

    const tradeDetails: TradeRequest = {
      symbol: selectedStock.symbol,
      quantity: finalSharesToSubmit,
      action: currentAction,
      orderType: orderType,
      TIF: timeInForce,
      rawQuantityValue: quantityValue,
      rawQuantityMode: quantityMode,
    };

    if (orderType === 'Limit' || orderType === 'Stop Limit') {
      if (!limitPrice || isNaN(parseFloat(limitPrice)) || parseFloat(limitPrice) <= 0) {
        alert("Please enter a valid limit price."); return;
      }
      tradeDetails.limitPrice = parseFloat(limitPrice);
    }
    if (orderType === 'Stop' || orderType === 'Stop Limit') {
      if (!stopPrice || isNaN(parseFloat(stopPrice)) || parseFloat(stopPrice) <= 0) {
        alert("Please enter a valid stop price."); return;
      }
      tradeDetails.stopPrice = parseFloat(stopPrice);
    }
    if (orderType === 'Trailing Stop') {
      if (!trailingOffset || isNaN(parseFloat(trailingOffset)) || parseFloat(trailingOffset) <= 0) {
        alert("Please enter a valid trailing offset."); return;
      }
      tradeDetails.trailingOffset = parseFloat(trailingOffset);
    }
    onSubmit(tradeDetails);
    setQuantityValue(''); 
  };

  const getCardTitle = () => {
    if (!selectedStock) return "Trade Panel";
    if (tradeMode === 'ai') return `AI Assist: ${selectedStock.symbol}`;
    if (tradeMode === 'auto') return `Auto Trade: ${selectedStock.symbol}`;
    if (currentAction) return `${currentAction} ${selectedStock.symbol}`;
    return selectedStock.symbol;
  };

  const getCardDescription = () => {
    if (!selectedStock) return "Select ticker from screener";
    if (tradeMode === 'auto') return `Status for ${selectedStock.symbol}`;
    return `Current Price: $${selectedStock.price.toFixed(2)}`;
  };

  const getSubmitButtonText = () => {
    if (!selectedStock) return "Select Stock to Trade";
    if (!currentAction) return "Select Action";
    return `Submit ${currentAction} Order`;
  };

  const isSubmitDisabled = () => {
    if (!selectedStock || !currentAction || !isValidQuantity || finalSharesToSubmit <= 0) return true;
    if ((orderType === 'Limit' || orderType === 'Stop Limit') && (!limitPrice || parseFloat(limitPrice) <= 0)) return true;
    if ((orderType === 'Stop' || orderType === 'Stop Limit') && (!stopPrice || parseFloat(stopPrice) <= 0)) return true;
    if (orderType === 'Trailing Stop' && (!trailingOffset || parseFloat(trailingOffset) <= 0)) return true;
    return false;
  };

  const buyButtonBase = "border-[hsl(var(--confirm-green))] text-[hsl(var(--confirm-green))] hover:bg-[hsl(var(--confirm-green))]/.10";
  const buyButtonSelected = "bg-[hsl(var(--confirm-green))] text-[hsl(var(--confirm-green-foreground))] hover:bg-[hsl(var(--confirm-green))]/90";

  const sellButtonBase = "border-destructive text-destructive hover:bg-destructive/10";
  const sellButtonSelected = "bg-destructive text-destructive-foreground hover:bg-destructive/90";
  
  const shortButtonBase = "border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300";
  const shortButtonSelected = "bg-yellow-500 text-yellow-950 hover:bg-yellow-500/90";

  const buttonBaseClass = "flex-1 flex items-center justify-center h-9 py-2 px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-background disabled:opacity-50";
  const inactiveButtonClass = "bg-transparent text-muted-foreground hover:bg-panel/[.05]";


  return (
    <Card className="shadow-none flex flex-col">
      <CardHeader className="relative">
        <CardTitle className="text-xl font-headline text-foreground">
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
      <CardContent className="space-y-4 py-4 overflow-y-auto">
        <div className="grid grid-cols-3 w-full rounded-md overflow-hidden border border-border/[.1] bg-panel/[.05]">
          <button
            onClick={() => setTradeMode('manual')}
            className={cn(
              buttonBaseClass,
              tradeMode === 'manual'
                ? 'bg-panel/[.1] text-foreground shadow-sm' 
                : inactiveButtonClass
            )}
            disabled={!selectedStock}
          >
            <User className="mr-2 h-4 w-4" /> Manual
          </button>
          <button
            onClick={() => setTradeMode('ai')}
            className={cn(
              buttonBaseClass,
              tradeMode === 'ai'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : inactiveButtonClass
            )}
            disabled={!selectedStock}
          >
            <Bot className="mr-2 h-4 w-4" /> AI Assist
          </button>
          <button
            onClick={() => setTradeMode('auto')}
            className={cn(
              buttonBaseClass,
              tradeMode === 'auto'
                ? 'bg-accent text-accent-foreground shadow-sm'
                : inactiveButtonClass
            )}
            disabled={!selectedStock}
          >
            <Cog className="mr-2 h-4 w-4" /> Auto
          </button>
        </div>

        {tradeMode === 'manual' && selectedStock && (
          <>
            <div className="grid grid-cols-3 gap-2 mb-4">
                <Button
                  onClick={() => handleActionSelect('Buy')}
                  variant="outline"
                  className={cn("flex-1", currentAction === 'Buy' ? buyButtonSelected : buyButtonBase, currentAction === 'Buy' && 'hover:text-[hsl(var(--confirm-green-foreground))]')}
                  disabled={!selectedStock}
                >
                  <TrendingUp className="mr-2 h-4 w-4" /> Buy
                </Button>
                <Button
                  onClick={() => handleActionSelect('Sell')}
                  variant="outline"
                  className={cn("flex-1", currentAction === 'Sell' ? sellButtonSelected : sellButtonBase, currentAction === 'Sell' && 'hover:text-destructive-foreground')}
                  disabled={!selectedStock}
                >
                  <CircleSlash className="mr-2 h-4 w-4" /> Sell
                </Button>
                <Button
                  onClick={() => handleActionSelect('Short')}
                  variant="outline"
                  className={cn("flex-1", currentAction === 'Short' ? shortButtonSelected : shortButtonBase, currentAction === 'Short' && 'hover:text-yellow-950')}
                  disabled={!selectedStock}
                >
                  <TrendingDown className="mr-2 h-4 w-4" /> Short
                </Button>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="quantityValue" className="text-sm font-medium text-foreground">
                <PackageOpen className="inline-block mr-1 h-4 w-4 text-muted-foreground" />
                Quantity ({quantityMode === 'DollarAmount' ? '$ Amount' : quantityMode === 'PercentOfBuyingPower' ? '% Buying Power' : 'Shares'})
              </Label>
              <div className="flex items-center rounded-md border border-input bg-transparent focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-background">
                <Input
                  id="quantityValue"
                  type="number"
                  value={quantityValue}
                  onChange={(e) => setQuantityValue(e.target.value)}
                  placeholder={getQuantityInputPlaceholder()}
                  disabled={!selectedStock}
                  className="flex-1 h-9 bg-transparent px-3 py-2 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleQuantityMode}
                  disabled={!selectedStock}
                  className="h-8 w-8 mr-1 text-muted-foreground hover:text-primary shrink-0"
                  type="button"
                >
                  <Repeat className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {selectedStock && quantityValue && isValidQuantity && (
              <div className="text-xs text-muted-foreground space-y-0.5">
                {quantityMode !== 'Shares' && finalSharesToSubmit > 0 && <p><Info className="inline-block mr-1 h-3 w-3" />Est. Shares: {finalSharesToSubmit}</p>}
                {(quantityMode === 'Shares' || finalSharesToSubmit > 0) && <p><Info className="inline-block mr-1 h-3 w-3" />Est. Cost: ${estimatedCost.toFixed(2)}</p>}
                 {quantityMode === 'PercentOfBuyingPower' && <p className="text-xs text-muted-foreground">Using Buying Power: ${buyingPower.toLocaleString()}</p>}
              </div>
            )}
             {!isValidQuantity && quantityValue && selectedStock && <p className="text-xs text-destructive">Please enter a valid positive quantity.</p>}

            <div className="space-y-1.5">
              <Label htmlFor="orderType" className="text-sm font-medium text-foreground">Order Type</Label>
              <Select value={orderType} onValueChange={(value) => setOrderType(value as OrderSystemType)} disabled={!selectedStock}>
                <SelectTrigger id="orderType"><SelectValue placeholder="Select order type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Market">Market</SelectItem><SelectItem value="Limit">Limit</SelectItem>
                  <SelectItem value="Stop">Stop</SelectItem><SelectItem value="Stop Limit">Stop Limit</SelectItem>
                  <SelectItem value="Trailing Stop">Trailing Stop</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="timeInForce" className="text-sm font-medium text-foreground">
                <Clock4 className="inline-block mr-1 h-4 w-4 text-muted-foreground" /> Time-in-Force
              </Label>
              <Select value={timeInForce} onValueChange={(value) => setTimeInForce(value)} disabled={!selectedStock}>
                <SelectTrigger id="timeInForce"><SelectValue placeholder="Select TIF" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Day">Day</SelectItem>
                  <SelectItem value="GTC">Good-Til-Canceled (GTC)</SelectItem>
                  <SelectItem value="IOC">Immediate or Cancel (IOC)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(orderType === 'Limit' || orderType === 'Stop Limit') && (
              <div className="space-y-1.5">
                <Label htmlFor="limitPrice" className="text-sm font-medium text-foreground"><DollarSign className="inline-block mr-1 h-4 w-4 text-muted-foreground" /> Limit Price</Label>
                <Input id="limitPrice" type="number" step="0.01" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} placeholder="e.g., 150.50" disabled={!selectedStock} className="bg-transparent" />
              </div>
            )}
            {(orderType === 'Stop' || orderType === 'Stop Limit') && (
              <div className="space-y-1.5">
                <Label htmlFor="stopPrice" className="text-sm font-medium text-foreground"><DollarSign className="inline-block mr-1 h-4 w-4 text-muted-foreground" /> Stop Price</Label>
                <Input id="stopPrice" type="number" step="0.01" value={stopPrice} onChange={(e) => setStopPrice(e.target.value)} placeholder="e.g., 149.00" disabled={!selectedStock} className="bg-transparent"/>
              </div>
            )}
            {orderType === 'Trailing Stop' && (
              <div className="space-y-1.5">
                <Label htmlFor="trailingOffset" className="text-sm font-medium text-foreground"><DollarSign className="inline-block mr-1 h-4 w-4 text-muted-foreground" /> Trailing Offset ($ or % points)</Label>
                <Input id="trailingOffset" type="number" step="0.01" value={trailingOffset} onChange={(e) => setTrailingOffset(e.target.value)} placeholder="e.g., 1.5 (for $1.50 or 1.5%)" disabled={!selectedStock} className="bg-transparent"/>
              </div>
            )}
            
            {selectedStock && (
              <>
                <Separator className="my-6 border-border/[.1]" /> 
                <div className="space-y-2 text-sm">
                    <h4 className="font-medium text-muted-foreground">Stock Info</h4>
                    <div className="flex justify-between text-foreground"><span>Float:</span> <span>{selectedStock.float}M</span></div>
                    <div className="flex justify-between text-foreground"><span>Volume:</span> <span>{selectedStock.volume.toFixed(1)}M</span></div>
                    {selectedStock.newsSnippet && (
                        <div className="pt-1">
                            <p className="text-muted-foreground">Catalyst:</p> 
                            <p className="text-xs leading-tight text-foreground" title={selectedStock.newsSnippet}>{selectedStock.newsSnippet.substring(0,100)}{selectedStock.newsSnippet.length > 100 ? '...' : ''}</p>
                        </div>
                    )}
                </div>
              </>
            )}
          </>
        )}
        {tradeMode === 'ai' && selectedStock && (
           <AiTradeCard selectedStock={selectedStock} onSubmit={onSubmit} buyingPower={buyingPower} />
        )}
        {tradeMode === 'ai' && !selectedStock && (
          <div className="text-center py-10 text-muted-foreground">
            <Bot className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Select a stock to get AI suggestions.</p>
          </div>
        )}

        {tradeMode === 'auto' && selectedStock && (
          <div className="space-y-4">
            <Card className="bg-transparent shadow-none border-none">
              <CardHeader className="p-0 pb-3">
                <CardTitle className="text-lg font-semibold text-foreground">Auto Mode Active</CardTitle>
                <CardDescription>Trades will be placed automatically based on your selected rules for {selectedStock.symbol}.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                <div>
                  <h4 className="font-medium text-muted-foreground mb-2 flex items-center">
                    <ListChecks className="mr-2 h-4 w-4 text-primary" /> Active Strategies (Examples)
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {dummyAutoRules.map(rule => (
                      <li key={rule.id} className="p-2.5 rounded-md bg-panel/[.05] border border-border/[.08]">
                        <p className="font-medium text-foreground">{rule.name}</p>
                        <p className="text-xs text-muted-foreground">{rule.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/[.1] p-3 shadow-sm mt-4 bg-transparent">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-foreground">
                      Auto-Trading Enabled
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Allow automated execution for {selectedStock.symbol}.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={isAutoTradingEnabled}
                      onCheckedChange={setIsAutoTradingEnabled}
                    />
                  </FormControl>
                </FormItem>
              </CardContent>
            </Card>
             <Link href="/rules" passHref legacyBehavior>
                <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent/10 hover:text-accent-foreground">
                    <Cog className="mr-2 h-4 w-4" /> Manage Rules & Strategies
                </Button>
            </Link>
          </div>
        )}
         {tradeMode === 'auto' && !selectedStock && (
          <div className="text-center py-10 text-muted-foreground">
            <Cog className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Select a stock to configure Auto Mode settings.</p>
          </div>
        )}


      </CardContent>
      {tradeMode === 'manual' && selectedStock && (
        <CardFooter>
          <Button
            type="button"
            onClick={handleManualSubmit}
            disabled={isSubmitDisabled()}
            className={cn("w-full",
              currentAction === 'Buy' && selectedStock && buyButtonSelected,
              currentAction === 'Sell' && selectedStock && sellButtonSelected,
              currentAction === 'Short' && selectedStock && shortButtonSelected,
              (!selectedStock || !currentAction) && 'bg-muted text-muted-foreground hover:bg-muted/80 cursor-not-allowed'
            )}
          >
            {currentAction && selectedStock ? <PackageOpen className="mr-2 h-4 w-4" /> : null}
            {getSubmitButtonText()}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

