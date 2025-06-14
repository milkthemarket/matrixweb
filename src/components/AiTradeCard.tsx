
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Stock, AISuggestion, TradeRequest, OrderActionType, OrderSystemType, HistoryTradeMode } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, PackageOpen, RefreshCw, TrendingDown, TrendingUp, Lightbulb, DollarSign, AlertTriangle } from 'lucide-react';
import { getTradeSuggestion } from '@/ai/flows/get-trade-suggestion-flow';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AiTradeCardProps {
  selectedStock: Stock | null;
  onSubmit: (tradeDetails: TradeRequest) => void;
  buyingPower: number;
}

export function AiTradeCard({ selectedStock, onSubmit, buyingPower }: AiTradeCardProps) {
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSuggestion = useCallback(async () => {
    if (!selectedStock) {
      setSuggestion(null);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const aiInput = {
        symbol: selectedStock.symbol,
        currentPrice: selectedStock.price,
        volume: selectedStock.volume,
        floatVal: selectedStock.float, 
        newsSnippet: selectedStock.newsSnippet || "No specific news.",
        buyingPower: buyingPower,
      };
      const result = await getTradeSuggestion(aiInput);
      setSuggestion(result);
    } catch (err) {
      console.error("Error fetching AI suggestion:", err);
      setError("Failed to get AI suggestion. Please try again.");
      setSuggestion(null);
      toast({
        variant: "destructive",
        title: "AI Suggestion Error",
        description: "Could not fetch a trade suggestion at this time.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedStock, buyingPower, toast]);

  useEffect(() => {
    fetchSuggestion();
  }, [fetchSuggestion]);

  const handleAcceptAndTrade = () => {
    if (!suggestion || !selectedStock) return;

    const tradeDetails: TradeRequest = {
      symbol: suggestion.symbol,
      quantity: suggestion.quantity,
      action: suggestion.action,
      orderType: suggestion.orderType,
      limitPrice: suggestion.limitPrice,
      TIF: "Day",
      tradeModeOrigin: 'aiAssist', 
    };
    onSubmit(tradeDetails);
  };

  const ActionIcon = suggestion?.action === 'Buy' ? TrendingUp : suggestion?.action === 'Short' ? TrendingDown : TrendingDown; 
  const actionColorClass = suggestion?.action === 'Buy' ? 'text-[hsl(var(--confirm-green))]' : suggestion?.action === 'Short' ? 'text-yellow-400' : 'text-destructive';

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-10 w-full mt-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        <AlertTriangle className="mx-auto h-10 w-10 mb-2" />
        <p>{error}</p>
        <Button onClick={fetchSuggestion} variant="outline" className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }

  if (!suggestion || !selectedStock) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Bot className="mx-auto h-10 w-10 mb-2 opacity-50" />
        <p>No AI suggestion available. Select a stock or refresh.</p>
         <Button onClick={fetchSuggestion} variant="outline" className="mt-4" disabled={!selectedStock}>
          <RefreshCw className="mr-2 h-4 w-4" /> Get Suggestion
        </Button>
      </div>
    );
  }

  const buyButtonSelected = "bg-[hsl(var(--confirm-green))] text-[hsl(var(--confirm-green-foreground))] hover:bg-[hsl(var(--confirm-green))]/90";
  const sellButtonSelected = "bg-destructive text-destructive-foreground hover:bg-destructive/90";
  const shortButtonSelected = "bg-yellow-500 text-yellow-950 hover:bg-yellow-500/90";

  let submitButtonClass = "";
  if (suggestion.action === 'Buy') submitButtonClass = buyButtonSelected;
  else if (suggestion.action === 'Sell') submitButtonClass = sellButtonSelected;
  else if (suggestion.action === 'Short') submitButtonClass = shortButtonSelected;


  return (
    <div className="space-y-4 text-sm">
      <Card className="bg-transparent shadow-none border-none">
        <CardHeader className="p-0 pb-2">
          <CardTitle className={cn("text-lg flex items-center font-semibold", actionColorClass)}>
            <ActionIcon className="mr-2 h-5 w-5" />
            AI Suggests: {suggestion.action} {suggestion.quantity} shares of {suggestion.symbol}
          </CardTitle>
          <CardDescription>Order Type: {suggestion.orderType} {suggestion.orderType === 'Limit' && suggestion.limitPrice ? `@ $${suggestion.limitPrice.toFixed(2)}` : ''}</CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-3">
          {suggestion.entryPrice && (
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center"><DollarSign className="mr-1 h-3.5 w-3.5" /> Suggested Entry:</span>
              <span className="font-medium text-foreground">${suggestion.entryPrice.toFixed(2)}</span>
            </div>
          )}
          {suggestion.takeProfitPrice && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Take Profit:</span>
              <span className="font-medium text-foreground">${suggestion.takeProfitPrice.toFixed(2)}</span>
            </div>
          )}
           {suggestion.stopLossPrice && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stop Loss:</span>
              <span className="font-medium text-foreground">${suggestion.stopLossPrice.toFixed(2)}</span>
            </div>
          )}

          <div>
            <h4 className="font-medium text-muted-foreground flex items-center mb-1"><Lightbulb className="mr-1 h-4 w-4 text-primary" />Rationale:</h4>
            <p className="text-foreground/90">{suggestion.rationale}</p>
          </div>
           <div>
            <h4 className="font-medium text-muted-foreground">Strategy:</h4>
            <p className="text-foreground/90">{suggestion.strategy}</p>
          </div>
        </CardContent>
      </Card>
      <div className="flex space-x-2 pt-2">
        <Button onClick={fetchSuggestion} variant="outline" className="flex-1">
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh Suggestion
        </Button>
        <Button 
          onClick={handleAcceptAndTrade} 
          className={cn("flex-1", submitButtonClass)}
        >
          <PackageOpen className="mr-2 h-4 w-4" /> Accept & Trade
        </Button>
      </div>
       <p className="text-xs text-muted-foreground text-center pt-2">
        AI suggestions are for informational purposes only and not financial advice.
      </p>
    </div>
  );
}
