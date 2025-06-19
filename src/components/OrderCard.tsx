
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
import { DollarSign, PackageOpen, TrendingUp, TrendingDown, CircleSlash, XCircle, Info, Clock4, User, Cog, ListChecks, Lightbulb, Search, Percent, ShieldCheck, Target } from 'lucide-react';
import { MiloAvatarIcon } from '@/components/icons/MiloAvatarIcon';
import { cn } from '@/lib/utils';
import { ManualTradeWarningModal } from '@/components/ManualTradeWarningModal';
import { AiAutoTradingWarningModal } from '@/components/AiAutoTradingWarningModal';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { useSettingsContext } from '@/contexts/SettingsContext';

interface OrderCardProps {
  selectedStock: Stock | null;
  initialActionType: OrderActionType | null;
  onSubmit: (tradeDetails: TradeRequest) => void;
  onClear: () => void;
  initialTradeMode?: TradeMode;
  miloActionContextText?: string | null;
  onStockSymbolSubmit: (symbol: string) => void;
  initialQuantity?: string;
  initialOrderType?: OrderSystemType;
  initialLimitPrice?: string;
  className?: string;
}

const dummyAutoRules = [
  { id: 'ar1', name: 'RSI Momentum Play', description: 'Buy on RSI < 30, Sell on RSI > 70 with volume confirmation.' },
  { id: 'ar2', name: 'Low Float Breakout', description: 'Enter on breakout above key resistance for low float stocks.' },
];


export function OrderCard({
  selectedStock,
  initialActionType,
  onSubmit,
  onClear,
  initialTradeMode,
  miloActionContextText,
  onStockSymbolSubmit,
  initialQuantity,
  initialOrderType,
  initialLimitPrice,
  className,
}: OrderCardProps) {
  const { selectedAccountId, accounts } = useOpenPositionsContext(); // Removed setSelectedAccountId
  const { notificationSounds, playSound } = useSettingsContext();

  const [tradeMode, setTradeMode] = useState<TradeMode>(initialTradeMode || 'manual');
  const [quantityValue, setQuantityValue] = useState('');
  const [quantityMode, setQuantityMode] = useState<QuantityInputMode>('Shares');
  const [orderType, setOrderType] = useState<OrderSystemType>('Market');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [trailingOffset, setTrailingOffset] = useState('');
  const [currentAction, setCurrentAction] = useState<OrderActionType | null>(null);
  const [timeInForce, setTimeInForce] = useState<string>('Day');
  const [allowExtendedHours, setAllowExtendedHours] = useState<boolean>(false);
  const [isAutopilotEnabled, setIsAutopilotEnabled] = useState(false);
  const [displayedMiloContext, setDisplayedMiloContext] = useState<string | null>(null);
  const [tickerInputValue, setTickerInputValue] = useState('');
  const [showTakeProfit, setShowTakeProfit] = useState(false);
  const [takeProfitValue, setTakeProfitValue] = useState('');
  const [showStopLoss, setShowStopLoss] = useState(false);
  const [stopLossValue, setStopLossValue] = useState('');

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
    if (selectedStock) {
      if (tickerInputValue.toUpperCase() !== selectedStock.symbol.toUpperCase()) {
        setTickerInputValue(selectedStock.symbol);
      }

      const isPreFillScenario = initialActionType !== undefined || initialQuantity !== undefined || initialOrderType !== undefined || initialLimitPrice !== undefined;

      if (isPreFillScenario) {
        setCurrentAction(initialActionType || null);
        setQuantityValue(initialQuantity !== undefined ? String(initialQuantity) : '');
        setOrderType(initialOrderType || 'Market');

        if ((initialOrderType === 'Limit' || initialOrderType === 'Stop Limit') && initialLimitPrice !== undefined) {
          setLimitPrice(String(initialLimitPrice));
        } else {
          setLimitPrice('');
        }

        setStopPrice('');
        setTrailingOffset('');
        setTimeInForce('Day');
        setAllowExtendedHours(false);
        setShowTakeProfit(false);
        setTakeProfitValue('');
        setShowStopLoss(false);
        setStopLossValue('');

      } else if (!miloActionContextText) {
        setCurrentAction(null);
        setQuantityValue('');
        setOrderType('Market');
        setLimitPrice('');
        setStopPrice('');
        setTrailingOffset('');
        setTimeInForce('Day');
        setAllowExtendedHours(false);
        setShowTakeProfit(false);
        setTakeProfitValue('');
        setShowStopLoss(false);
        setStopLossValue('');
      }

      if (initialTradeMode) {
        setTradeMode(initialTradeMode);
      } else if (!miloActionContextText) {
        setTradeMode('manual');
      }
      setDisplayedMiloContext(miloActionContextText || null);

    } else {
      setCurrentAction(null);
      setQuantityValue('');
      setOrderType('Market');
      setLimitPrice('');
      setStopPrice('');
      setTrailingOffset('');
      setTimeInForce('Day');
      setAllowExtendedHours(false);
      setShowTakeProfit(false);
      setTakeProfitValue('');
      setShowStopLoss(false);
      setStopLossValue('');
      setDisplayedMiloContext(null);
      setIsAutopilotEnabled(false);
      if (document.activeElement !== document.getElementById('tickerInput')) {
          setTickerInputValue('');
      }
    }
  }, [
    selectedStock,
    initialActionType,
    initialTradeMode,
    miloActionContextText,
    initialQuantity,
    initialOrderType,
    initialLimitPrice,
    tickerInputValue,
  ]);


  useEffect(() => {
    if (orderType !== 'Limit') {
      setAllowExtendedHours(false);
    }
  }, [orderType]);


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
        if (selectedStock && !quantityValue) message = "Enter quantity.";
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

    let origin: HistoryTradeMode = miloActionContextText ? 'aiAssist' : 'manual';

    const tradeDetails: TradeRequest = {
      symbol: selectedStock.symbol,
      quantity: finalSharesToSubmit,
      action: currentAction,
      orderType: orderType,
      TIF: timeInForce,
      allowExtendedHours: orderType === 'Limit' ? allowExtendedHours : undefined,
      rawQuantityValue: quantityValue,
      rawQuantityMode: quantityMode,
      tradeModeOrigin: origin,
      accountId: selectedAccountId,
    };

    if (orderType === 'Limit' || orderType === 'Stop Limit') {
      const numLimitPrice = parseFloat(limitPrice);
      if (!limitPrice || isNaN(numLimitPrice) || numLimitPrice <= 0) {
        alert("Please enter a valid limit price."); return;
      }
      tradeDetails.limitPrice = numLimitPrice;
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

    if (showTakeProfit && takeProfitValue && !isNaN(parseFloat(takeProfitValue)) && parseFloat(takeProfitValue) > 0) {
      tradeDetails.takeProfit = parseFloat(takeProfitValue);
    }
    if (showStopLoss && stopLossValue && !isNaN(parseFloat(stopLossValue)) && parseFloat(stopLossValue) > 0) {
      tradeDetails.stopLoss = parseFloat(stopLossValue);
    }

    if (selectedAccount?.type !== 'paper' && origin === 'manual' && !manualTradeDisclaimerAcknowledged) {
      setPendingTradeDetails(tradeDetails);
      setShowManualTradeWarningModal(true);
    } else {
      onSubmit(tradeDetails);
      if (notificationSounds.tradePlaced !== 'off') {
        playSound(notificationSounds.tradePlaced);
      }
      if (!initialQuantity && !miloActionContextText) {
         setQuantityValue('');
         setTakeProfitValue('');
         setStopLossValue('');
      }
    }
  };

  const handleConfirmManualTrade = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      setManualTradeDisclaimerAcknowledged(true);
    }
    if (pendingTradeDetails) {
      onSubmit(pendingTradeDetails);
      if (notificationSounds.tradePlaced !== 'off') {
        playSound(notificationSounds.tradePlaced);
      }
      if (!initialQuantity && !miloActionContextText) {
         setQuantityValue('');
         setTakeProfitValue('');
         setStopLossValue('');
      }
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
        if (notificationSounds.tradePlaced !== 'off') {
            playSound(notificationSounds.tradePlaced);
        }
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
    if (notificationSounds.tradePlaced !== 'off') {
        playSound(notificationSounds.tradePlaced);
    }
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
    if (showTakeProfit && (!takeProfitValue || parseFloat(takeProfitValue) <= 0)) return true;
    if (showStopLoss && (!stopLossValue || parseFloat(stopLossValue) <= 0)) return true;
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


  return (
    <>
      <Card className={cn("shadow-none flex flex-col h-full", className)}>
        <CardHeader className="relative pb-2 pt-4">
          <CardTitle className="text-xl font-headline text-foreground mb-0">
            Trade Panel
          </CardTitle>
          {selectedStock && (
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={handleClearSelection} title="Clear Selection">
              <XCircle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4 py-4 overflow-y-auto flex-1">
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

              {validationMessage && !isValidQuantity && quantityValue && (
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

              {orderType === 'Limit' && (
                <div className="space-y-1.5">
                  <Label htmlFor="allowExtendedHours" className="text-sm font-medium text-foreground">
                     <Clock4 className="inline-block mr-1 h-4 w-4 text-muted-foreground" /> Extended Hours
                  </Label>
                  <Select
                    value={allowExtendedHours ? 'yes' : 'no'}
                    onValueChange={(value) => setAllowExtendedHours(value === 'yes')}
                  >
                    <SelectTrigger id="allowExtendedHours"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No (Regular Market Hours Only)</SelectItem>
                      <SelectItem value="yes">Yes (Allow Pre/Post Market)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

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

              <div className="flex flex-row items-center justify-between rounded-lg border border-white/5 p-3 shadow-sm bg-black/10 mt-3">
                <div className="space-y-0.5">
                  <Label htmlFor="takeProfitSwitch" className="font-medium text-foreground cursor-pointer flex items-center">
                    <Target className="h-4 w-4 mr-2 text-green-400" /> Take Profit
                  </Label>
                  <p className="text-xs text-muted-foreground pl-6">Set a target price to secure gains.</p>
                </div>
                <Switch
                  id="takeProfitSwitch"
                  checked={showTakeProfit}
                  onCheckedChange={setShowTakeProfit}
                />
              </div>
              {showTakeProfit && (
                <div className="space-y-1.5 pl-3 mt-2">
                  <Label htmlFor="takeProfitPriceInput" className="text-sm font-medium text-foreground flex items-center">
                    <DollarSign className="inline-block mr-1 h-4 w-4 text-muted-foreground" /> Take Profit Price
                  </Label>
                  <Input
                    id="takeProfitPriceInput"
                    type="number"
                    step="0.01"
                    value={takeProfitValue}
                    onChange={(e) => setTakeProfitValue(e.target.value)}
                    placeholder="e.g., 155.00"
                    className="bg-transparent"
                  />
                </div>
              )}

              <div className="flex flex-row items-center justify-between rounded-lg border border-white/5 p-3 shadow-sm bg-black/10 mt-3">
                <div className="space-y-0.5">
                  <Label htmlFor="stopLossSwitch" className="font-medium text-foreground cursor-pointer flex items-center">
                    <ShieldCheck className="h-4 w-4 mr-2 text-red-400" /> Stop Loss
                  </Label>
                  <p className="text-xs text-muted-foreground pl-6">Set a price to limit potential losses.</p>
                </div>
                <Switch
                  id="stopLossSwitch"
                  checked={showStopLoss}
                  onCheckedChange={setShowStopLoss}
                />
              </div>
              {showStopLoss && (
                <div className="space-y-1.5 pl-3 mt-2">
                  <Label htmlFor="stopLossPriceInput" className="text-sm font-medium text-foreground flex items-center">
                    <DollarSign className="inline-block mr-1 h-4 w-4 text-muted-foreground" /> Stop Loss Price
                  </Label>
                  <Input
                    id="stopLossPriceInput"
                    type="number"
                    step="0.01"
                    value={stopLossValue}
                    onChange={(e) => setStopLossValue(e.target.value)}
                    placeholder="e.g., 145.00"
                    className="bg-transparent"
                  />
                </div>
              )}

              <Separator className="my-6 border-white/5" />
              <div className="space-y-2 text-sm">
                  <h4 className="font-medium text-muted-foreground">Stock Info for {selectedStock ? selectedStock.symbol : '—'}</h4>
                  <div className="flex justify-between text-foreground">
                    <span>Last Price:</span>
                    <span>{selectedStock ? `$${selectedStock.price.toFixed(2)}` : '—'}</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>Float:</span>
                    <span>{selectedStock ? `${selectedStock.float}M` : '—'}</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>Volume:</span>
                    <span>{selectedStock ? `${selectedStock.volume.toFixed(1)}M` : '—'}</span>
                  </div>
                  <div className="pt-1">
                      <p className="text-muted-foreground">Catalyst:</p>
                      {selectedStock?.newsSnippet ? (
                        <p className="text-xs leading-tight text-foreground" title={selectedStock.newsSnippet}>
                          {selectedStock.newsSnippet.substring(0,100)}{selectedStock.newsSnippet.length > 100 ? '...' : ''}
                        </p>
                      ) : (
                        <p className="text-xs leading-tight text-muted-foreground italic">
                          {selectedStock ? (selectedStock.newsSnippet || 'No specific news snippet.') : 'Enter a ticker to see stock info.'}
                        </p>
                      )}
                  </div>
              </div>
            </>
          )}
          {tradeMode === 'autopilot' && (
             selectedStock ? (
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
            ) : (
              <div className="text-center py-12 text-muted-foreground flex flex-col items-center justify-center space-y-3 h-full">
                <Cog className="h-12 w-12 opacity-30" />
                <p className="text-sm">Select a stock or enter a ticker to configure Autopilot settings.</p>
              </div>
            )
          )}
        </CardContent>
        {tradeMode === 'manual' && (
          <CardFooter className="mt-auto pt-4">
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
