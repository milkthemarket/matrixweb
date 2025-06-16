
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { Stock, TradeRequest, OrderActionType, OrderSystemType, QuantityInputMode, TradeMode, HistoryTradeMode, Account } from '@/types';
import { DollarSign, PackageOpen, TrendingUp, TrendingDown, CircleSlash, XCircle, Info, Clock4, User, Cog, ListChecks, Lightbulb, MousePointerSquareDashed, Search, Briefcase, Landmark, NotebookText, Percent } from 'lucide-react';
import { MiloAvatarIcon } from '@/components/icons/MiloAvatarIcon';
import { cn } from '@/lib/utils';
// AiTradeCard is no longer directly rendered by OrderCard when "AI Assist" tab is removed
// import { AiTradeCard } from '@/components/AiTradeCard'; 
import { ManualTradeWarningModal } from '@/components/ManualTradeWarningModal';
import { AiAutoTradingWarningModal } from '@/components/AiAutoTradingWarningModal';
// AiAssistWarningModal is no longer triggered directly by a dedicated "AI Assist" tab in this component
// import { AiAssistWarningModal } from '@/components/AiAssistWarningModal'; 
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';

interface OrderCardProps {
  selectedStock: Stock | null;
  initialActionType: OrderActionType | null;
  onSubmit: (tradeDetails: TradeRequest) => void;
  onClear: () => void;
  initialTradeMode?: TradeMode;
  miloActionContextText?: string | null;
  onStockSymbolSubmit: (symbol: string) => void;
}

const dummyAutoRules = [
  { id: 'ar1', name: 'RSI Momentum Play', description: 'Buy on RSI < 30, Sell on RSI > 70 with volume confirmation.' },
  { id: 'ar2', name: 'Low Float Breakout', description: 'Enter on breakout above key resistance for low float stocks.' },
];


export function OrderCard({ selectedStock, initialActionType, onSubmit, onClear, initialTradeMode, miloActionContextText, onStockSymbolSubmit }: OrderCardProps) {
  const { selectedAccountId, setSelectedAccountId, accounts } = useOpenPositionsContext();

  // Default to 'manual' if 'ai' was passed as initialTradeMode, as 'ai' tab is removed.
  const [tradeMode, setTradeMode] = useState<TradeMode>(initialTradeMode === 'ai' ? 'manual' : (initialTradeMode || 'manual'));
  const [quantityValue, setQuantityValue] = useState('');
  const [quantityMode, setQuantityMode] = useState<QuantityInputMode>('Shares');
  const [orderType, setOrderType] = useState<OrderSystemType>('Market');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [trailingOffset, setTrailingOffset] = useState('');
  const [currentAction, setCurrentAction] = useState<OrderActionType | null>(null);
  const [timeInForce, setTimeInForce] = useState<string>('Day');
  const [isAutopilotEnabled, setIsAutopilotEnabled] = useState(false);
  const [displayedMiloContext, setDisplayedMiloContext] = useState<string | null>(null);
  const [tickerInputValue, setTickerInputValue] = useState('');

  const quantityInputRef = useRef<HTMLInputElement>(null);

  const selectedAccount = useMemo(() => {
    return accounts.find(acc => acc.id === selectedAccountId) || accounts[0];
  }, [accounts, selectedAccountId]);

  const currentBuyingPower = selectedAccount?.buyingPower || 0;

  const [showManualTradeWarningModal, setShowManualTradeWarningModal] = useState(false);
  const [manualTradeDisclaimerAcknowledged, setManualTradeDisclaimerAcknowledged] = useState(false);
  
  const [pendingTradeDetails, setPendingTradeDetails] = useState<TradeRequest | null>(null);

  const [showAiAutopilotWarningModal, setShowAiAutopilotWarningModal] = useState(false);
  const [aiAutopilotDisclaimerAcknowledged, setAiAutopilotDisclaimerAcknowledged] = useState(false);


  useEffect(() => {
    if (initialTradeMode) {
      // If initial mode was 'ai', default to 'manual' as 'ai' tab is removed
      setTradeMode(initialTradeMode === 'ai' ? 'manual' : initialTradeMode);
    }
  }, [initialTradeMode]);

  useEffect(() => {
     setDisplayedMiloContext(miloActionContextText || null);
  }, [miloActionContextText]);

  useEffect(() => {
    if (selectedStock) {
      if (tickerInputValue.toUpperCase() !== selectedStock.symbol.toUpperCase()) {
        setTickerInputValue(selectedStock.symbol);
      }
    } else {
      setTickerInputValue(''); // Clear ticker input when selectedStock is null
    }
  }, [selectedStock, tickerInputValue]);

  useEffect(() => {
    if (selectedStock) {
      // Only reset manual panel fields if not coming from a miloActionContext or if mode is changing to manual
      if (tradeMode === 'manual') {
         setCurrentAction(initialActionType);
         if (initialTradeMode === 'manual' || !miloActionContextText ) {
            setOrderType('Market');
            setLimitPrice('');
            setStopPrice('');
            setTrailingOffset('');
            setTimeInForce('Day');
         }
      }
      // Clear Milo context if user switches away from manual mode after it was populated by Milo
      if (tradeMode !== 'manual' && initialTradeMode === 'manual' && !miloActionContextText) {
          setDisplayedMiloContext(null);
      }
    } else {
      setCurrentAction(null);
      setQuantityValue('');
      setOrderType('Market');
      setLimitPrice('');
      setStopPrice('');
      setTrailingOffset('');
      setTimeInForce('Day');
      setDisplayedMiloContext(null);
      setIsAutopilotEnabled(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStock, initialActionType, tradeMode, miloActionContextText]);


  const handleActionSelect = (action: OrderActionType) => {
    setCurrentAction(action);
  };

  const handleQuantityModeChange = (mode: QuantityInputMode) => {
    setQuantityMode(mode);
    setQuantityValue('');
    quantityInputRef.current?.focus();
  };

  const getQuantityInputPlaceholder = () => {
    if (quantityMode === 'Shares') return "e.g., 100";
    if (quantityMode === 'DollarAmount') return "e.g., $200";
    if (quantityMode === 'PercentOfBuyingPower') return "e.g., 10";
    return "";
  };


  const { finalSharesToSubmit, estimatedCost, isValidQuantity, validationMessage } = useMemo(() => {
    let shares = 0;
    let cost = 0;
    let valid = true; 
    let message = "";
    const stockPrice = selectedStock?.price || 0;
    const rawValue = parseFloat(quantityValue);

    if (!selectedStock || !quantityValue) { 
        valid = false; 
    } else if (isNaN(rawValue) || rawValue <= 0) {
      message = "Please enter a valid positive number.";
      valid = false;
    } else {
      if (quantityMode === 'Shares') {
        shares = Math.floor(rawValue);
        if (shares <= 0) { 
          valid = false;
          message = "Number of shares must be positive.";
        }
        cost = shares * stockPrice;
      } else if (quantityMode === 'DollarAmount') {
        cost = rawValue;
        if (stockPrice > 0) {
          shares = Math.floor(rawValue / stockPrice);
          if (shares <= 0) {
            valid = false;
            message = "Dollar amount is too low to purchase at least 1 share at the current price.";
          }
        } else {
          shares = 0;
          valid = false;
          message = "Cannot calculate shares; stock price is zero or unavailable.";
        }
      } else if (quantityMode === 'PercentOfBuyingPower') {
        if (rawValue > 0 && rawValue <= 100) {
          const dollarAmount = (rawValue / 100) * currentBuyingPower;
          cost = dollarAmount;
          if (stockPrice > 0) {
            shares = Math.floor(dollarAmount / stockPrice);
            if (shares <= 0) {
              valid = false;
              message = "Calculated dollar amount from percentage is too low to purchase at least 1 share.";
            }
          } else {
            shares = 0;
            valid = false;
            message = "Cannot calculate shares; stock price is zero or unavailable.";
          }
        } else {
          valid = false;
          message = "Percentage must be between 0 and 100.";
        }
      }
    }
    
    if (valid && shares <= 0 && stockPrice > 0) {
        if (quantityMode === 'Shares') {
           message = "Quantity must result in at least 1 share.";
        }
        valid = false;
    }


    return { finalSharesToSubmit: shares, estimatedCost: cost, isValidQuantity: valid, validationMessage: message };
  }, [quantityValue, quantityMode, selectedStock, currentBuyingPower]);

  const handleManualSubmit = () => {
    if (!selectedStock || !currentAction || !isValidQuantity || finalSharesToSubmit <= 0) {
      return;
    }

    // If miloActionContextText is present, it's an AI-assisted idea executed manually.
    // Otherwise, it's purely manual or autopilot if that mode is active (autopilot has its own flow).
    let origin: HistoryTradeMode = miloActionContextText ? 'aiAssist' : 'manual';
    
    const tradeDetails: TradeRequest = {
      symbol: selectedStock.symbol,
      quantity: finalSharesToSubmit,
      action: currentAction,
      orderType: orderType,
      TIF: timeInForce,
      rawQuantityValue: quantityValue,
      rawQuantityMode: quantityMode,
      tradeModeOrigin: origin, 
      accountId: selectedAccountId,
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
    
    // For manual trades or AI-assisted ideas executed manually, show the manual trade warning
    // if it's a real account and disclaimer not acknowledged.
    if (selectedAccount?.type !== 'paper' && !manualTradeDisclaimerAcknowledged) {
      setPendingTradeDetails(tradeDetails);
      setShowManualTradeWarningModal(true);
    } else {
      onSubmit(tradeDetails);
      setQuantityValue(''); 
    }
  };

  const handleConfirmManualTrade = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      setManualTradeDisclaimerAcknowledged(true);
    }
    if (pendingTradeDetails) {
      onSubmit(pendingTradeDetails);
      if (pendingTradeDetails.tradeModeOrigin === 'manual' && !miloActionContextText) setQuantityValue(''); 
    }
    setPendingTradeDetails(null);
    setShowManualTradeWarningModal(false);
  };

  const handleCancelManualTrade = () => {
    setPendingTradeDetails(null);
    setShowManualTradeWarningModal(false);
  };
  
  const handleAutopilotSwitchChange = (checked: boolean) => {
    if (checked) {
      if (selectedAccount?.type !== 'paper' && !aiAutopilotDisclaimerAcknowledged) {
        setShowAiAutopilotWarningModal(true);
      } else {
        setIsAutopilotEnabled(true);
      }
    } else {
      setIsAutopilotEnabled(false);
    }
  };

  const handleConfirmAiAutopilotWarning = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      setAiAutopilotDisclaimerAcknowledged(true);
    }
    setIsAutopilotEnabled(true);
    setShowAiAutopilotWarningModal(false);
  };

  const handleCloseAiAutopilotWarning = () => {
    setIsAutopilotEnabled(false); 
    setShowAiAutopilotWarningModal(false);
  };

  const handleClearSelection = () => {
    setDisplayedMiloContext(null);
    onClear();
  }

  const handleTickerSearch = () => {
    if (tickerInputValue.trim()) {
      onStockSymbolSubmit(tickerInputValue.trim());
    }
  };

  const getCardTitleSuffix = () => {
    if (selectedStock) {
      // "AI Assist" mode removed, so no specific suffix for it.
      if (tradeMode === 'autopilot') return `: ${selectedStock.symbol}`;
      if (currentAction) return `: ${currentAction} ${selectedStock.symbol}`;
      return `: ${selectedStock.symbol}`;
    }
    return "";
  };


  const getSubmitButtonText = () => {
    if (!selectedStock) return "Load Ticker to Trade";
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
  const activeModeClass = "bg-primary text-primary-foreground shadow-sm";
  const inactiveModeClass = "bg-transparent text-muted-foreground hover:bg-white/5";

  const getAccountIcon = (type?: Account['type']) => {
    if (!type) return null;
    if (type === 'margin') return <Briefcase className="h-4 w-4 text-muted-foreground" />;
    if (type === 'ira') return <Landmark className="h-4 w-4 text-muted-foreground" />;
    if (type === 'paper') return <NotebookText className="h-4 w-4 text-muted-foreground" />;
    return null;
  };


  return (
    <>
      <Card className="shadow-none flex flex-col">
        <CardHeader className="relative pb-2 pt-4">
          <CardTitle className="text-xl font-headline text-foreground mb-0"> 
            Trade Panel
          </CardTitle>
          <div className="space-y-3 p-3 rounded-lg border border-white/5 bg-black/5 mt-2"> 
            <div className="flex items-center gap-2">
              <Label htmlFor="accountSelect" className="text-sm font-medium text-muted-foreground shrink-0">Account:</Label>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger id="accountSelect" className="flex-1 min-w-[180px] h-9">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>
                      <div className="flex items-center gap-2">
                        {getAccountIcon(acc.type)}
                        <span>{acc.label} ({acc.number})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="text-muted-foreground">Available to Trade:</div>
              <div className="text-right font-medium text-foreground">${(selectedAccount?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-muted-foreground">Buying Power:</div>
              <div className="text-right font-medium text-foreground">${(selectedAccount?.buyingPower || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
          </div>
          {selectedStock && (
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={handleClearSelection} title="Clear Selection">
              <XCircle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4 py-4 overflow-y-auto">
          <div className="flex items-center space-x-2">
            <Input
              id="tickerInput"
              type="text"
              placeholder="Enter ticker (e.g., AAPL)"
              value={tickerInputValue}
              onChange={(e) => setTickerInputValue(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === 'Enter') handleTickerSearch(); }}
              className="bg-transparent"
            />
            <Button variant="ghost" size="icon" onClick={handleTickerSearch} title="Search Ticker">
              <Search className="h-5 w-5 text-primary" />
            </Button>
          </div>

          <div className="grid grid-cols-2 w-full rounded-md overflow-hidden border border-white/5 bg-black/15">
            <button
              onClick={() => setTradeMode('manual')}
              className={cn(
                buttonBaseClass,
                tradeMode === 'manual' ? activeModeClass : inactiveModeClass
              )}
            >
              <User className="mr-2 h-4 w-4" /> Manual
            </button>
            <button
              onClick={() => setTradeMode('autopilot')}
              className={cn(
                buttonBaseClass,
                tradeMode === 'autopilot' ? activeModeClass : inactiveModeClass
              )}
            >
              <Cog className="mr-2 h-4 w-4" /> Autopilot
            </button>
          </div>

          {!selectedStock ? (
            <div className="text-center py-12 text-muted-foreground flex flex-col items-center justify-center space-y-3">
              <MousePointerSquareDashed className="h-12 w-12 opacity-50" />
              <p className="text-sm">Select a stock from the screener or type a ticker above to start trading.</p>
            </div>
          ) : (
            <>
              {tradeMode === 'manual' && (
                <>
                  {displayedMiloContext && (
                    <div className="mt-2 p-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 text-sm">
                      <h4 className="text-xs font-medium text-primary mb-1 flex items-center">
                        <Lightbulb className="mr-1.5 h-3.5 w-3.5" /> Milo's Action Context:
                      </h4>
                      <p className="text-xs text-primary/80">{displayedMiloContext}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                      <Button
                        onClick={() => handleActionSelect('Buy')}
                        variant="outline"
                        className={cn("flex-1", currentAction === 'Buy' ? buyButtonSelected : buyButtonBase, currentAction === 'Buy' && 'hover:text-[hsl(var(--confirm-green-foreground))]')}
                      >
                        <TrendingUp className="mr-2 h-4 w-4" /> Buy
                      </Button>
                      <Button
                        onClick={() => handleActionSelect('Sell')}
                        variant="outline"
                        className={cn("flex-1", currentAction === 'Sell' ? sellButtonSelected : sellButtonBase, currentAction === 'Sell' && 'hover:text-destructive-foreground')}
                      >
                        <CircleSlash className="mr-2 h-4 w-4" /> Sell
                      </Button>
                      <Button
                        onClick={() => handleActionSelect('Short')}
                        variant="outline"
                        className={cn("flex-1", currentAction === 'Short' ? shortButtonSelected : shortButtonBase, currentAction === 'Short' && 'hover:text-yellow-950')}
                      >
                        <TrendingDown className="mr-2 h-4 w-4" /> Short
                      </Button>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="quantityValue" className="text-sm font-medium text-foreground">
                      Quantity
                    </Label>
                    <div className="flex items-stretch space-x-1">
                      <Input
                        ref={quantityInputRef}
                        id="quantityValue"
                        type="number"
                        value={quantityValue}
                        onChange={(e) => setQuantityValue(e.target.value)}
                        placeholder={getQuantityInputPlaceholder()}
                        className="flex-1 h-9 bg-transparent px-3 py-2 focus-visible:ring-ring"
                        
                      />
                      <Button
                        variant={quantityMode === 'Shares' ? 'default' : 'outline'}
                        onClick={() => handleQuantityModeChange('Shares')}
                        className="h-9 px-3 text-xs"
                        size="sm"
                        title="Enter number of shares"
                      >
                        Shares
                      </Button>
                      <Button
                        variant={quantityMode === 'DollarAmount' ? 'default' : 'outline'}
                        onClick={() => handleQuantityModeChange('DollarAmount')}
                        className="h-9 px-3 text-xs"
                        size="sm"
                        title="Enter total dollar amount for trade"
                      >
                        <DollarSign className="h-3 w-3" />
                      </Button>
                      <Button
                        variant={quantityMode === 'PercentOfBuyingPower' ? 'default' : 'outline'}
                        onClick={() => handleQuantityModeChange('PercentOfBuyingPower')}
                        className="h-9 px-3 text-xs"
                        size="sm"
                        title="Enter percent of buying power to use"
                      >
                        <Percent className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {validationMessage && !isValidQuantity && quantityValue && selectedStock && (
                    <p className="text-xs text-destructive mt-1">{validationMessage}</p>
                  )}

                  {selectedStock && quantityValue && isValidQuantity && (
                    <div className="text-xs text-muted-foreground space-y-0.5 mt-1.5">
                      {quantityMode !== 'Shares' && finalSharesToSubmit > 0 && <p><Info className="inline-block mr-1 h-3 w-3" />Est. Shares: {finalSharesToSubmit}</p>}
                      {(quantityMode === 'Shares' || finalSharesToSubmit > 0) && <p><Info className="inline-block mr-1 h-3 w-3" />Est. Cost: ${estimatedCost.toFixed(2)}</p>}
                       {quantityMode === 'PercentOfBuyingPower' && <p><Info className="inline-block mr-1 h-3 w-3" />Using ~{quantityValue}% of ${currentBuyingPower.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} buying power.</p>}
                    </div>
                  )}


                  <div className="space-y-1.5">
                    <Label htmlFor="orderType" className="text-sm font-medium text-foreground">Order Type</Label>
                    <Select value={orderType} onValueChange={(value) => setOrderType(value as OrderSystemType)}>
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
                    <Select value={timeInForce} onValueChange={(value) => setTimeInForce(value)}>
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
                      <Input id="limitPrice" type="number" step="0.01" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} placeholder="e.g., 150.50" className="bg-transparent" />
                    </div>
                  )}
                  {(orderType === 'Stop' || orderType === 'Stop Limit') && (
                    <div className="space-y-1.5">
                      <Label htmlFor="stopPrice" className="text-sm font-medium text-foreground"><DollarSign className="inline-block mr-1 h-4 w-4 text-muted-foreground" /> Stop Price</Label>
                      <Input id="stopPrice" type="number" step="0.01" value={stopPrice} onChange={(e) => setStopPrice(e.target.value)} placeholder="e.g., 149.00" className="bg-transparent"/>
                    </div>
                  )}
                  {orderType === 'Trailing Stop' && (
                    <div className="space-y-1.5">
                      <Label htmlFor="trailingOffset" className="text-sm font-medium text-foreground"><DollarSign className="inline-block mr-1 h-4 w-4 text-muted-foreground" /> Trailing Offset ($ or % points)</Label>
                      <Input id="trailingOffset" type="number" step="0.01" value={trailingOffset} onChange={(e) => setTrailingOffset(e.target.value)} placeholder="e.g., 1.5 (for $1.50 or 1.5%)" className="bg-transparent"/>
                    </div>
                  )}

                  {selectedStock && (
                    <>
                      <Separator className="my-6 border-white/5" />
                      <div className="space-y-2 text-sm">
                          <h4 className="font-medium text-muted-foreground">Stock Info for {selectedStock.symbol}</h4>
                          <div className="flex justify-between text-foreground"><span>Last Price:</span> <span>${selectedStock.price.toFixed(2)}</span></div>
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
              {tradeMode === 'autopilot' && selectedStock && (
                <div className="space-y-4">
                  <Card className="bg-transparent shadow-none border-none">
                    <CardHeader className="p-0 pb-3">
                      <CardTitle className="text-lg font-semibold text-foreground">Autopilot Mode Active</CardTitle>
                      <CardDescription>Trades will be placed automatically based on your selected rules for {selectedStock.symbol}.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-3">
                      <div>
                        <h4 className="font-medium text-muted-foreground mb-2 flex items-center">
                          <ListChecks className="mr-2 h-4 w-4 text-primary" /> Active Strategies (Examples)
                        </h4>
                        <ul className="space-y-2 text-sm">
                          {dummyAutoRules.map(rule => (
                            <li key={rule.id} className="p-2.5 rounded-md bg-black/10 border border-white/5">
                              <p className="font-medium text-foreground">{rule.name}</p>
                              <p className="text-xs text-muted-foreground">{rule.description}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                       <div className="space-y-1.5 !mt-4">
                          <div className="flex flex-row items-center justify-between rounded-lg border border-white/5 p-3 shadow-sm bg-black/10">
                              <div className="space-y-0.5">
                                  <Label htmlFor="autopilotSwitch" className="text-base font-medium text-foreground cursor-pointer">
                                  Autopilot Enabled
                                  </Label>
                                   <p className="text-xs text-muted-foreground">
                                  Allow Autopilot execution for {selectedStock.symbol}.
                                  </p>
                              </div>
                              <Switch
                                  id="autopilotSwitch"
                                  checked={isAutopilotEnabled}
                                  onCheckedChange={handleAutopilotSwitchChange}
                              />
                          </div>
                      </div>
                    </CardContent>
                  </Card>
                   <Link href="/rules">
                      <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent/10 hover:text-accent-foreground">
                          <Cog className="mr-2 h-4 w-4" /> Manage Rules & Strategies
                      </Button>
                  </Link>
                </div>
              )}
            </>
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
      <ManualTradeWarningModal
        isOpen={showManualTradeWarningModal}
        onClose={handleCancelManualTrade}
        onConfirm={handleConfirmManualTrade}
      />
      <AiAutoTradingWarningModal
        isOpen={showAiAutopilotWarningModal}
        onClose={handleCloseAiAutopilotWarning}
        onConfirm={handleConfirmAiAutopilotWarning}
      />
    </>
  );
}
