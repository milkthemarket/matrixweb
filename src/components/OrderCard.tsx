
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
import { DollarSign, PackageOpen, TrendingUp, TrendingDown, CircleSlash, XCircle, Info, Clock4, User, Cog, ListChecks, Lightbulb, Search, Percent, ShieldCheck, Target, Wallet, Briefcase, Landmark, NotebookText } from 'lucide-react';
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
  initialQuantity?: string;
  initialOrderType?: OrderSystemType;
  initialLimitPrice?: string;
  className?: string;
}

const dummyAutoRules = [
  { id: 'ar1', name: 'RSI Momentum Play', description: 'Buy on RSI < 30, Sell on RSI > 70 with volume confirmation.' },
  { id: 'ar2', name: 'Low Float Breakout', description: 'Enter on breakout above key resistance for low float stocks.' },
];

const getAccountIcon = (type?: Account['type']) => {
    if (!type) return <Wallet className="h-3.5 w-3.5 text-primary mr-1.5 flex-shrink-0" />;
    if (type === 'margin') return <Briefcase className="h-3.5 w-3.5 text-primary mr-1.5 flex-shrink-0" />;
    if (type === 'ira') return <Landmark className="h-3.5 w-3.5 text-primary mr-1.5 flex-shrink-0" />;
    if (type === 'paper') return <NotebookText className="h-3.5 w-3.5 text-primary mr-1.5 flex-shrink-0" />;
    return <Wallet className="h-3.5 w-3.5 text-primary mr-1.5 flex-shrink-0" />;
};


export function OrderCard({
  selectedStock,
  initialActionType,
  onSubmit,
  onClear,
  initialTradeMode,
  miloActionContextText,
  initialQuantity,
  initialOrderType,
  initialLimitPrice,
  className,
}: OrderCardProps) {
  const { selectedAccountId, setSelectedAccountId, accounts } = useOpenPositionsContext();
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
        // Only fully reset if not pre-filling and no Milo context
        setCurrentAction(null);
        setQuantityValue('');
        setOrderType('Market');
        setLimitPrice('');
        setStopPrice('');
        setTrailingOffset('');
      }

      if (initialTradeMode) {
        setTradeMode(initialTradeMode);
      } else if (!miloActionContextText) {
        setTradeMode('manual'); // Default to manual if no specific mode set and not from Milo
      }
      setDisplayedMiloContext(miloActionContextText || null);

    } else { // No stock selected
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
    }
  }, [
    selectedStock,
    initialActionType,
    initialTradeMode,
    miloActionContextText,
    initialQuantity,
    initialOrderType,
    initialLimitPrice,
  ]);


  useEffect(() => {
    if (orderType !== 'Limit') {
      setAllowExtendedHours(false);
    }
  }, [orderType]);


  const handleActionSelect = (action: OrderActionType) => {
    setCurrentAction(action);
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

    if (showTakeProfit && takeProfitValue && !isNaN(parseFloat(takeProfitValue))) {
      const tpValue = parseFloat(takeProfitValue);
      if (tpValue > 0) {
        let calculatedTpPrice: number | undefined = undefined;
        const entryPriceForCalc = (orderType === 'Limit' && limitPrice && !isNaN(parseFloat(limitPrice)))
          ? parseFloat(limitPrice)
          : selectedStock.price;

        if (quantityMode === 'Shares') { // TP input is a price
          calculatedTpPrice = tpValue;
        } else if (quantityMode === 'DollarAmount') { // TP input is total profit $
          if (finalSharesToSubmit > 0) {
            const profitPerShare = tpValue / finalSharesToSubmit;
            calculatedTpPrice = currentAction === 'Buy' ? entryPriceForCalc + profitPerShare : entryPriceForCalc - profitPerShare;
          }
        } else if (quantityMode === 'PercentOfBuyingPower') { // TP input is % gain
          calculatedTpPrice = currentAction === 'Buy' ? entryPriceForCalc * (1 + tpValue / 100) : entryPriceForCalc * (1 - tpValue / 100);
        }

        if (calculatedTpPrice !== undefined && calculatedTpPrice > 0) {
          tradeDetails.takeProfit = parseFloat(calculatedTpPrice.toFixed(2));
        }
      }
    }
    
    if (showStopLoss && stopLossValue && !isNaN(parseFloat(stopLossValue))) {
      const slValue = parseFloat(stopLossValue);
      if (slValue > 0) {
        let calculatedSlPrice: number | undefined = undefined;
        const entryPriceForCalc = (orderType === 'Limit' && limitPrice && !isNaN(parseFloat(limitPrice)))
          ? parseFloat(limitPrice)
          : selectedStock.price;

        if (quantityMode === 'Shares') { // SL input is a price
          calculatedSlPrice = slValue;
        } else if (quantityMode === 'DollarAmount') { // SL input is total loss $
          if (finalSharesToSubmit > 0) {
            const lossPerShare = slValue / finalSharesToSubmit;
            calculatedSlPrice = currentAction === 'Buy' ? entryPriceForCalc - lossPerShare : entryPriceForCalc + lossPerShare;
          }
        } else if (quantityMode === 'PercentOfBuyingPower') { // SL input is % loss
          calculatedSlPrice = currentAction === 'Buy' ? entryPriceForCalc * (1 - slValue / 100) : entryPriceForCalc * (1 + slValue / 100);
        }

        if (calculatedSlPrice !== undefined && calculatedSlPrice > 0) {
          tradeDetails.stopLoss = parseFloat(calculatedSlPrice.toFixed(2));
        }
      }
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
  
  const getTakeProfitLabel = () => {
    if (quantityMode === 'Shares') return 'Target Price ($)';
    if (quantityMode === 'DollarAmount') return 'Profit Amount ($)';
    if (quantityMode === 'PercentOfBuyingPower') return 'Gain (%)';
    return 'Target Price';
  };

  const getStopLossLabel = () => {
    if (quantityMode === 'Shares') return 'Stop Price ($)';
    if (quantityMode === 'DollarAmount') return 'Max Loss ($)';
    if (quantityMode === 'PercentOfBuyingPower') return 'Max Loss (%)';
    return 'Stop Price';
  };

  const buyButtonBase = "border-[hsl(var(--confirm-green))] text-[hsl(var(--confirm-green))] hover:bg-[hsl(var(--confirm-green))]/.10";
  const buyButtonSelected = "bg-[hsl(var(--confirm-green))] text-[hsl(var(--confirm-green-foreground))] hover:bg-[hsl(var(--confirm-green))]/90";

  const sellButtonBase = "border-destructive text-destructive hover:bg-destructive/10";
  const sellButtonSelected = "bg-destructive text-destructive-foreground hover:bg-destructive/90";

  const shortButtonBase = "border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300";
  const shortButtonSelected = "bg-yellow-500 text-yellow-950 hover:bg-yellow-500/90";

  return (
    <>
      <Card className={cn("shadow-none flex flex-col h-full", className)}>
        <CardHeader className="pb-0.5 pt-3 px-3 space-y-0.5">
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger id="accountSelectOrderCard" className="w-full h-8 text-[11px] truncate">
              <div className="flex items-center gap-1.5 truncate">
                {getAccountIcon(selectedAccount?.type)}
                <span className="truncate">{selectedAccount?.label} ({selectedAccount?.number})</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {accounts.map(acc => (
                <SelectItem key={acc.id} value={acc.id} className="text-xs">
                  <div className="flex items-center gap-1.5">
                    {getAccountIcon(acc.type)}
                    <span>{acc.label} ({acc.number})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-3 py-3 px-3 overflow-y-auto flex-1">
          <div className="h-[34px] flex flex-col justify-center">
              {selectedStock ? (
                  <div>
                      <h3 className="text-sm font-bold text-foreground">{selectedStock.symbol}</h3>
                      <p className="text-[10px] text-muted-foreground truncate">{selectedStock.name}</p>
                  </div>
              ) : (
                  <div className="flex items-center justify-center h-full">
                       <span className="text-sm text-muted-foreground">No Ticker Selected</span>
                  </div>
              )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTradeMode('manual')}
              className={cn(
                "border rounded-md h-[38px] px-4 flex items-center justify-center gap-2 transition-all text-sm",
                tradeMode === 'manual' 
                  ? 'border-primary text-primary bg-background shadow-[0_0_8px_hsl(var(--primary)/0.4)]'
                  : 'border-input text-muted-foreground bg-transparent hover:border-foreground/30'
              )}
            >
              <User className="w-4 h-4" />
              Manual
            </button>
            <button
              type="button"
              onClick={() => setTradeMode('autopilot')}
              className={cn(
                "border rounded-md h-[38px] px-4 flex items-center justify-center gap-2 transition-all text-sm",
                tradeMode === 'autopilot' 
                  ? 'border-primary text-primary bg-background shadow-[0_0_8px_hsl(var(--primary)/0.4)]'
                  : 'border-input text-muted-foreground bg-transparent hover:border-foreground/30'
              )}
            >
              <Cog className="w-4 h-4" />
              Autopilot
            </button>
          </div>

          {tradeMode === 'manual' && (
            <>
              {displayedMiloContext && (
                <div className="mt-1.5 p-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 text-xs">
                  <h4 className="text-[10px] font-medium text-primary mb-0.5 flex items-center">
                    <Lightbulb className="mr-1 h-3 w-3" /> Milo's Context:
                  </h4>
                  <p className="text-[10px] text-primary/80">{displayedMiloContext}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-1 mb-2">
                  <Button
                    onClick={() => handleActionSelect('Buy')}
                    variant="outline"
                    className={cn("flex-1 h-6 text-[10px]", currentAction === 'Buy' ? buyButtonSelected : buyButtonBase, currentAction === 'Buy' && 'hover:text-[hsl(var(--confirm-green-foreground))]')}
                  >
                    <TrendingUp className="mr-1 h-3 w-3" /> Buy
                  </Button>
                  <Button
                    onClick={() => handleActionSelect('Sell')}
                    variant="outline"
                    className={cn("flex-1 h-6 text-[10px]", currentAction === 'Sell' ? sellButtonSelected : sellButtonBase, currentAction === 'Sell' && 'hover:text-destructive-foreground')}
                  >
                    <CircleSlash className="mr-1 h-3 w-3" /> Sell
                  </Button>
                  <Button
                    onClick={() => handleActionSelect('Short')}
                    variant="outline"
                    className={cn("flex-1 h-6 text-[10px]", currentAction === 'Short' ? shortButtonSelected : shortButtonBase, currentAction === 'Short' && 'hover:text-yellow-950')}
                  >
                    <TrendingDown className="mr-1 h-3 w-3" /> Short
                  </Button>
              </div>
              
              <div className="grid grid-cols-[1fr_auto] gap-1.5 items-end">
                  <div className="space-y-1">
                    <Label htmlFor="orderType" className="text-[10px] font-medium text-foreground">Order Type</Label>
                    <Select value={orderType} onValueChange={(value) => setOrderType(value as OrderSystemType)}>
                      <SelectTrigger id="orderType" className="h-8 text-[11px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Market" className="text-xs">Market</SelectItem>
                        <SelectItem value="Limit" className="text-xs">Limit</SelectItem>
                        <SelectItem value="Stop" className="text-xs">Stop</SelectItem>
                        <SelectItem value="Stop Limit" className="text-xs">Stop Limit</SelectItem>
                        <SelectItem value="Trailing Stop" className="text-xs">Trailing Stop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="quantityValue" className="text-[10px] font-medium text-foreground">Quantity</Label>
                    <div className="flex items-center gap-1.5">
                       <div className="relative w-24">
                         {quantityMode === 'DollarAmount' && (
                           <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                         )}
                         <Input
                           ref={quantityInputRef}
                           id="quantityValue"
                           type="number"
                           value={quantityValue}
                           onChange={(e) => setQuantityValue(e.target.value)}
                           placeholder=""
                           className={cn(
                             "h-8 bg-transparent py-1.5 focus-visible:ring-ring text-[11px] w-full",
                             quantityMode === 'DollarAmount' ? 'pl-6 pr-2' : 'px-2',
                             quantityMode === 'PercentOfBuyingPower' && 'pr-6'
                           )}
                         />
                         {quantityMode === 'PercentOfBuyingPower' && (
                           <Percent className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                         )}
                       </div>
                       <div className="flex items-center space-x-1 p-0.5 rounded-md border border-input">
                          <Button
                              variant={quantityMode === 'Shares' ? 'secondary' : 'ghost'}
                              size="icon"
                              onClick={() => { setQuantityMode('Shares'); setQuantityValue(''); }}
                              className="h-6 w-6"
                              title="Enter quantity in shares"
                          >
                              <PackageOpen className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                              variant={quantityMode === 'DollarAmount' ? 'secondary' : 'ghost'}
                              size="icon"
                              onClick={() => { setQuantityMode('DollarAmount'); setQuantityValue(''); }}
                              className="h-6 w-6"
                              title="Enter quantity in dollar amount"
                          >
                              <DollarSign className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                              variant={quantityMode === 'PercentOfBuyingPower' ? 'secondary' : 'ghost'}
                              size="icon"
                              onClick={() => { setQuantityMode('PercentOfBuyingPower'); setQuantityValue(''); }}
                              className="h-6 w-6"
                              title="Enter quantity as a percentage of buying power"
                          >
                              <Percent className="h-3.5 w-3.5" />
                          </Button>
                      </div>
                    </div>
                  </div>
              </div>
               {validationMessage && !isValidQuantity && quantityValue && (
                <p className="text-xs text-destructive mt-0.5">{validationMessage}</p>
              )}
              
              {selectedStock && quantityValue && isValidQuantity && estimatedCost > 0 && (
                <div className="text-[11px] text-foreground space-y-0.5 mt-2 p-2 bg-black/10 rounded-md border border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Est. amount:</span>
                    <span className="font-bold">${estimatedCost.toFixed(2)}</span>
                  </div>
                  {quantityMode !== 'Shares' && finalSharesToSubmit > 0 && 
                    <p className="text-[10px] text-muted-foreground"><Info className="inline-block mr-0.5 h-2.5 w-2.5" />Est. Shares: {finalSharesToSubmit}</p>}
                  {quantityMode === 'PercentOfBuyingPower' && 
                    <p className="text-[10px] text-muted-foreground"><Info className="inline-block mr-0.5 h-2.5 w-2.5" />Using ~{quantityValue}% of BP</p>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {orderType === 'Limit' && (
                  <div className="space-y-1">
                    <Label htmlFor="allowExtendedHours" className="text-[10px] font-medium text-foreground">
                      Extended Hours
                    </Label>
                    <Select
                      value={allowExtendedHours ? 'yes' : 'no'}
                      onValueChange={(value) => setAllowExtendedHours(value === 'yes')}
                    >
                      <SelectTrigger id="allowExtendedHours" className="h-8 text-[11px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no" className="text-xs">No</SelectItem>
                        <SelectItem value="yes" className="text-xs">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className={cn("space-y-1", orderType !== 'Limit' && "col-span-2")}>
                  <Label htmlFor="timeInForce" className="text-[10px] font-medium text-foreground">
                    Time-in-Force
                  </Label>
                  <Select value={timeInForce} onValueChange={(value) => setTimeInForce(value)}>
                    <SelectTrigger id="timeInForce" className="h-8 text-[11px]"><SelectValue placeholder="Select TIF" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Day" className="text-xs">Day</SelectItem>
                      <SelectItem value="GTC" className="text-xs">Good-Til-Canceled (GTC)</SelectItem>
                      <SelectItem value="IOC" className="text-xs">Immediate or Cancel (IOC)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>


              {(orderType === 'Limit' || orderType === 'Stop Limit') && (
                <div className="space-y-1 mt-2">
                  <Label htmlFor="limitPrice" className="text-[10px] font-medium text-foreground">Limit Price</Label>
                  <Input id="limitPrice" type="number" step="0.01" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} placeholder="" className="bg-transparent text-[11px] h-8" />
                </div>
              )}
              {(orderType === 'Stop' || orderType === 'Stop Limit') && (
                <div className="space-y-1 mt-2">
                  <Label htmlFor="stopPrice" className="text-[10px] font-medium text-foreground">Stop Price</Label>
                  <Input id="stopPrice" type="number" step="0.01" value={stopPrice} onChange={(e) => setStopPrice(e.target.value)} placeholder="" className="bg-transparent text-[11px] h-8"/>
                </div>
              )}
              {orderType === 'Trailing Stop' && (
                <div className="space-y-1 mt-2">
                  <Label htmlFor="trailingOffset" className="text-[10px] font-medium text-foreground">Trailing Offset ($ or %)</Label>
                  <Input id="trailingOffset" type="number" step="0.01" value={trailingOffset} onChange={(e) => setTrailingOffset(e.target.value)} placeholder="" className="bg-transparent text-[11px] h-8"/>
                </div>
              )}

              <div className="flex flex-row items-center justify-between rounded-lg border border-white/5 p-2 shadow-sm bg-black/10 mt-2">
                <div className="space-y-0.5">
                  <Label htmlFor="takeProfitSwitch" className="font-medium text-foreground cursor-pointer flex items-center text-[11px]">
                    <Target className="h-3.5 w-3.5 mr-1.5 text-green-400" /> Take Profit
                  </Label>
                  <p className="text-[10px] text-muted-foreground pl-[22px]">Set a target profit level.</p>
                </div>
                <Switch
                  id="takeProfitSwitch"
                  checked={showTakeProfit}
                  onCheckedChange={setShowTakeProfit}
                  className="h-5 w-9 data-[state=checked]:[&>span]:translate-x-4 [&>span]:h-4 [&>span]:w-4"
                />
              </div>
              {showTakeProfit && (
                <div className="space-y-1 pl-2 mt-1.5">
                    <Label htmlFor="takeProfitValueInput" className="text-[10px] font-medium text-foreground">
                      {getTakeProfitLabel()}
                    </Label>
                    <Input
                      id="takeProfitValueInput"
                      type="number"
                      step={quantityMode === 'PercentOfBuyingPower' ? '0.1' : '0.01'}
                      value={takeProfitValue}
                      onChange={(e) => setTakeProfitValue(e.target.value)}
                      placeholder=""
                      className="bg-transparent h-8 text-[11px]"
                    />
                </div>
              )}

              <div className="flex flex-row items-center justify-between rounded-lg border border-white/5 p-2 shadow-sm bg-black/10 mt-2">
                <div className="space-y-0.5">
                  <Label htmlFor="stopLossSwitch" className="font-medium text-foreground cursor-pointer flex items-center text-[11px]">
                    <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-red-400" /> Stop Loss
                  </Label>
                  <p className="text-[10px] text-muted-foreground pl-[22px]">Set a price to limit potential losses.</p>
                </div>
                <Switch
                  id="stopLossSwitch"
                  checked={showStopLoss}
                  onCheckedChange={setShowStopLoss}
                  className="h-5 w-9 data-[state=checked]:[&>span]:translate-x-4 [&>span]:h-4 [&>span]:w-4"
                />
              </div>
              {showStopLoss && (
                <div className="space-y-1 pl-2 mt-1.5">
                  <Label htmlFor="stopLossPriceInput" className="text-[10px] font-medium text-foreground flex items-center">
                    {getStopLossLabel()}
                  </Label>
                  <Input
                    id="stopLossPriceInput"
                    type="number"
                    step={quantityMode === 'PercentOfBuyingPower' ? '0.1' : '0.01'}
                    value={stopLossValue}
                    onChange={(e) => setStopLossValue(e.target.value)}
                    placeholder=""
                    className="bg-transparent h-8 text-[11px]"
                  />
                </div>
              )}
            </>
          )}
          {tradeMode === 'autopilot' && (
             selectedStock ? (
              <div className="space-y-3">
                <Card className="bg-transparent shadow-none border-none">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-[12px] font-semibold text-foreground">Autopilot Active</CardTitle>
                    <CardDescription className="text-[11px]">Trades for {selectedStock.symbol} based on rules.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 space-y-2">
                    <div>
                      <h4 className="font-medium text-muted-foreground text-[11px] mb-1.5 flex items-center">
                        <ListChecks className="mr-1.5 h-3.5 w-3.5 text-primary" /> Active Strategies
                      </h4>
                      <ul className="space-y-1.5 text-xs">
                        {dummyAutoRules.map(rule => (
                          <li key={rule.id} className="p-2 rounded-md bg-black/10 border border-white/5">
                            <p className="font-medium text-foreground text-[11px]">{rule.name}</p>
                            <p className="text-[10px] text-muted-foreground">{rule.description}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                      <div className="space-y-1 !mt-3">
                        <div className="flex flex-row items-center justify-between rounded-lg border border-white/5 p-2 shadow-sm bg-black/10">
                            <div className="space-y-0.5">
                                <Label htmlFor="autopilotSwitch" className="text-[11px] font-medium text-foreground cursor-pointer">
                                Autopilot Enabled
                                </Label>
                                  <p className="text-[10px] text-muted-foreground">
                                AI execution for {selectedStock.symbol}.
                                </p>
                            </div>
                            <Switch
                                id="autopilotSwitch"
                                checked={isAutopilotEnabled}
                                onCheckedChange={handleAutopilotSwitchChange}
                                className="h-5 w-9 data-[state=checked]:[&>span]:translate-x-4 [&>span]:h-4 [&>span]:w-4"
                            />
                        </div>
                    </div>
                  </CardContent>
                </Card>
                  <Link href="/rules" className="block">
                    <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent/10 hover:text-accent-foreground h-8 text-[11px]">
                        <Cog className="mr-1.5 h-3.5 w-3.5" /> Manage Rules
                    </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground flex flex-col items-center justify-center space-y-2 h-full">
                <Cog className="h-10 w-10 opacity-30" />
                <p className="text-xs">Select ticker for Autopilot.</p>
              </div>
            )
          )}
        </CardContent>
        {tradeMode === 'manual' && (
          <CardFooter className="mt-auto pt-3 pb-3 px-3">
            <Button
              type="button"
              onClick={handleManualSubmit}
              disabled={isSubmitDisabled()}
              className={cn("w-full h-9 text-[11px]",
                currentAction === 'Buy' && selectedStock && isValidQuantity && buyButtonSelected,
                currentAction === 'Sell' && selectedStock && isValidQuantity && sellButtonSelected,
                currentAction === 'Short' && selectedStock && isValidQuantity && shortButtonSelected,
                (!selectedStock || !currentAction || !isValidQuantity) && 'bg-muted text-muted-foreground hover:bg-muted/80 cursor-not-allowed'
              )}
            >
              {currentAction && selectedStock && isValidQuantity ? <PackageOpen className="mr-1.5 h-4 w-4" /> : null}
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
