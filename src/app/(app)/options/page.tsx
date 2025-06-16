
"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AreaChart, SlidersHorizontal, ChevronDown, PlusCircle, Eye, Loader2 } from "lucide-react";
import { OptionsChainTable } from '@/components/options/OptionsChainTable';
import { OptionTradeModal } from '@/components/options/OptionTradeModal';
import type { OptionsTickerInfo, OptionContract, OptionOrderActionType, OptionType, OptionTradeRequest } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const mockTickerInfo: OptionsTickerInfo = {
  symbol: 'SPY',
  lastPrice: 543.10,
  priceChange: -3.45,
  priceChangePercent: -0.63,
  marketStatus: 'Market Open', // Changed from Late Close for realism
};

const mockExpirations = [
  { value: '2024-06-21', label: 'June 21, 2024 (0d)', daysRemaining: 0 },
  { value: '2024-06-28', label: 'June 28, 2024 (7d)', daysRemaining: 7 },
  { value: '2024-07-05', label: 'July 5, 2024 (14d)', daysRemaining: 14 },
  { value: '2024-07-19', label: 'July 19, 2024 (28d)', daysRemaining: 28 },
];

const generateMockOptionsChain = (underlyingPrice: number, expirationDate: string, type: OptionType, daysRemaining: number): OptionContract[] => {
  const chain: OptionContract[] = [];
  const numStrikes = 15; // Generate 15 strikes
  const strikeIncrement = underlyingPrice > 200 ? 1 : (underlyingPrice > 50 ? 0.5 : 0.25); // Smaller increments for SPY
  const baseStrike = Math.round(underlyingPrice / strikeIncrement) * strikeIncrement;

  for (let i = -Math.floor(numStrikes / 2) ; i <= Math.floor(numStrikes / 2); i++) {
    const strike = baseStrike + i * strikeIncrement;
    if (strike <= 0) continue;

    const isCall = type === 'Call';
    const moneyness = isCall ? underlyingPrice - strike : strike - underlyingPrice;
    
    let intrinsicValue = Math.max(0, moneyness);
    // More realistic extrinsic value: higher for ATM, lower for deep ITM/OTM, decays with time
    let extrinsicValueFactor = (1 - Math.abs(i) / (numStrikes / 1.5)); // Peaked at ATM
    extrinsicValueFactor = Math.max(0.1, extrinsicValueFactor); // ensure some extrinsic
    let timeDecayFactor = Math.sqrt(Math.max(1, daysRemaining) / 30); // Sqrt for non-linear decay, ensure daysRemaining > 0 for calc
    
    let extrinsicValue = Math.max(0.01, (Math.random() * 0.5 + 0.2) * extrinsicValueFactor * timeDecayFactor * (underlyingPrice * 0.005));

    // Reduce extrinsic for very deep ITM/OTM
    if (Math.abs(underlyingPrice - strike) > underlyingPrice * 0.1) {
        extrinsicValue *= 0.3;
    }
    extrinsicValue = parseFloat(Math.max(0.01, extrinsicValue).toFixed(2));

    const price = parseFloat((intrinsicValue + extrinsicValue).toFixed(2));
    
    const bidAskSpread = Math.max(0.01, price * (0.02 + Math.random() * 0.03)); // 2-5% spread
    const ask = parseFloat((price + bidAskSpread / 2).toFixed(2));
    const bid = parseFloat(Math.max(0.01, (price - bidAskSpread / 2)).toFixed(2));
    
    const changeDirection = Math.random() < 0.5 ? -1 : 1;
    const changeMagnitude = price * (Math.random() * 0.1 + 0.05); // 5-15% change
    const change = parseFloat((changeDirection * changeMagnitude).toFixed(2));
    
    const lastPriceCand = parseFloat((price - change).toFixed(2));
    const lastPrice = lastPriceCand > 0.01 ? lastPriceCand : undefined; // Can be undefined

    const percentChange = lastPrice && lastPrice > 0.01 ? parseFloat(((change / lastPrice) * 100).toFixed(2)) : (Math.random() - 0.5) * 100; // Random if no last
    
    const breakeven = isCall ? strike + ask : strike - ask;
    const toBreakevenPercent = underlyingPrice > 0 ? parseFloat(((breakeven - underlyingPrice) / underlyingPrice * 100).toFixed(2)) : undefined;

    chain.push({
      id: `${mockTickerInfo.symbol}-${expirationDate.replace(/-/g, '')}-${type[0]}${strike.toFixed(0).replace('.', '')}`,
      strike,
      type,
      expirationDate: expirationDate,
      daysToExpiration: daysRemaining,
      ask,
      bid,
      lastPrice,
      change,
      percentChange,
      breakeven: parseFloat(breakeven.toFixed(2)),
      toBreakevenPercent,
      volume: Math.floor(Math.random() * 1500 + (isCall && strike > underlyingPrice - 5 && strike < underlyingPrice + 5 ? 500 : 50)), // Higher volume for ATM
      openInterest: Math.floor(Math.random() * 5000 + (isCall && strike > underlyingPrice - 5 && strike < underlyingPrice + 5 ? 1000 : 100)),
      impliedVolatility: parseFloat((Math.random() * 15 + 10 + (5 * extrinsicValueFactor)).toFixed(2)), // IV higher for ATM
    });
  }
  return chain.sort((a,b) => a.strike - b.strike);
};


export default function OptionsPage() {
  const [tickerInfo, setTickerInfo] = useState<OptionsTickerInfo>(mockTickerInfo);
  const [tradeAction, setTradeAction] = useState<OptionOrderActionType>('Buy');
  const [optionType, setOptionType] = useState<OptionType>('Call'); // Default to Call
  const [selectedExpiration, setSelectedExpiration] = useState<string>(mockExpirations[0].value);
  
  const [optionsChain, setOptionsChain] = useState<OptionContract[]>([]);
  const [isChainDataReady, setIsChainDataReady] = useState(false);
  const [selectedContract, setSelectedContract] = useState<OptionContract | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  
  const { toast } = useToast();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [stickyPricePillVisible, setStickyPricePillVisible] = useState(false);

  useEffect(() => {
    setIsChainDataReady(false); 
    const currentExpirationDetails = mockExpirations.find(exp => exp.value === selectedExpiration);
    if (currentExpirationDetails) {
      // Simulate data fetching delay
      const timer = setTimeout(() => {
        const chain = generateMockOptionsChain(tickerInfo.lastPrice, selectedExpiration, optionType, currentExpirationDetails.daysRemaining);
        setOptionsChain(chain);
        setIsChainDataReady(true); 
      }, 300); // Reduced delay
      return () => clearTimeout(timer);
    } else {
      setOptionsChain([]); 
      setIsChainDataReady(true);
    }
  }, [tickerInfo.lastPrice, selectedExpiration, optionType]);

  const handleSelectContractForTrade = (contract: OptionContract) => {
    setSelectedContract(contract);
    setIsTradeModalOpen(true);
  };

  const handleTradeSubmit = (tradeDetails: OptionTradeRequest) => {
    console.log("Option Trade Submitted:", tradeDetails);
    toast({
      title: "Option Trade Processing",
      description: `${tradeDetails.action} ${tradeDetails.quantity} ${tradeDetails.contract.type} @ ${tradeDetails.contract.strike} for ${tickerInfo.symbol} (Exp: ${new Date(tradeDetails.contract.expirationDate).toLocaleDateString()})`,
    });
    setIsTradeModalOpen(false);
  };

  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    if (!tableContainer || !isChainDataReady) {
      setStickyPricePillVisible(false);
      return;
    }

    const handleScroll = () => {
      const tableHeader = tableContainer.querySelector('thead');
      if (tableHeader) {
        const tableHeaderBottom = tableHeader.getBoundingClientRect().bottom;
        setStickyPricePillVisible(tableHeaderBottom < (tableContainer.getBoundingClientRect().top + 60)); 
      } else {
        setStickyPricePillVisible(false); 
      }
    };
    
    if (isChainDataReady) { // Only attach listener if data is ready and table might be visible
      handleScroll(); 
      tableContainer.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (tableContainer) { // Check if tableContainer is still valid during cleanup
         tableContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isChainDataReady]);


  const buttonBaseClass = "h-10 px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-background rounded-md";
  const activeTradeButtonClass = "bg-primary text-primary-foreground shadow-sm";
  const inactiveTradeButtonClass = "bg-muted/50 text-muted-foreground hover:bg-muted/70";


  return (
    <>
      <main className="flex flex-col flex-1 h-full overflow-hidden">
        <PageHeader title="Options Trading" />
        
        <div className="flex-1 p-4 md:p-6 space-y-4 flex flex-col overflow-hidden">
          {/* Header Section */}
          <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {tickerInfo.symbol}{' '}
                    <span className={cn("text-xl", tickerInfo.priceChange >= 0 ? 'text-[hsl(var(--confirm-green))]' : 'text-destructive')}>
                      ${tickerInfo.lastPrice.toFixed(2)}
                    </span>
                  </h2>
                  <p className={cn("text-sm", tickerInfo.priceChange >= 0 ? 'text-[hsl(var(--confirm-green))]' : 'text-destructive')}>
                    {tickerInfo.priceChange >= 0 ? '+' : ''}{tickerInfo.priceChange.toFixed(2)} ({tickerInfo.priceChangePercent.toFixed(2)}%)
                  </p>
                </div>
                {/* Removed Market Status Badge */}
              </div>
              {/* Removed SlidersHorizontal icon from Price History Button */}
              <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">
                <AreaChart className="mr-2 h-4 w-4" /> Price History
              </Button>
            </CardContent>
          </Card>

          {/* Order Mode Controls */}
          <Card>
            <CardContent className="p-4 flex flex-wrap items-center gap-3 md:gap-4">
              <div className="flex rounded-md border border-input overflow-hidden">
                <Button
                  onClick={() => setTradeAction('Buy')}
                  variant={tradeAction === 'Buy' ? 'default' : 'ghost'}
                  className={cn("rounded-none border-r border-input", tradeAction === 'Buy' ? "bg-green-500 hover:bg-green-600 text-white" : "hover:bg-muted/50")}
                  size="sm"
                >
                  Buy
                </Button>
                <Button
                  onClick={() => setTradeAction('Sell')}
                  variant={tradeAction === 'Sell' ? 'default' : 'ghost'}
                  className={cn("rounded-none", tradeAction === 'Sell' ? "bg-red-500 hover:bg-red-600 text-white" : "hover:bg-muted/50")}
                  size="sm"
                >
                  Sell
                </Button>
              </div>

              <div className="flex rounded-md border border-input overflow-hidden">
                <Button
                  onClick={() => setOptionType('Call')}
                  variant={optionType === 'Call' ? 'default' : 'ghost'}
                  className={cn("rounded-none border-r border-input", optionType === 'Call' ? activeTradeButtonClass : inactiveTradeButtonClass)}
                  size="sm"
                >
                  Calls
                </Button>
                <Button
                  onClick={() => setOptionType('Put')}
                  variant={optionType === 'Put' ? 'default' : 'ghost'}
                  className={cn("rounded-none", optionType === 'Put' ? activeTradeButtonClass : inactiveTradeButtonClass)}
                  size="sm"
                >
                  Puts
                </Button>
              </div>
              
              <Select value={selectedExpiration} onValueChange={setSelectedExpiration}>
                <SelectTrigger className="w-auto min-w-[180px] h-9 text-sm">
                  <SelectValue placeholder="Select Expiration" />
                </SelectTrigger>
                <SelectContent>
                  {mockExpirations.map(exp => (
                    <SelectItem key={exp.value} value={exp.value}>{exp.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" className="border-dashed text-muted-foreground hover:text-foreground">
                <PlusCircle className="mr-2 h-4 w-4" /> Builder
              </Button>
               <Button variant="outline" size="sm" className="text-muted-foreground hover:text-foreground">
                <Eye className="mr-2 h-4 w-4" /> View Mode
              </Button>
            </CardContent>
          </Card>

          {/* Options Chain Table */}
          <div className="flex-1 relative overflow-hidden" ref={tableContainerRef}>
             {isChainDataReady && stickyPricePillVisible && (
                <div className="sticky top-0 z-20 flex justify-center py-1 mb-1">
                    <Badge
                    variant="outline"
                    className="bg-card/80 backdrop-blur-sm text-sm font-semibold text-primary border-primary shadow-lg px-3 py-1.5"
                    >
                    {tickerInfo.symbol} Underlying: ${tickerInfo.lastPrice.toFixed(2)}
                    </Badge>
                </div>
            )}
            {!isChainDataReady ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
                    <p>Loading options data for {optionType}s...</p>
                </div>
            ) : ( // Data is ready, now check if optionsChain is empty or not
                <OptionsChainTable
                  chainData={optionsChain}
                  underlyingPrice={tickerInfo.lastPrice}
                  underlyingTicker={tickerInfo.symbol}
                  onSelectContract={handleSelectContractForTrade}
                  tradeAction={tradeAction}
                />
            )}
          </div>

        </div>
      </main>

      <OptionTradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        contract={selectedContract}
        tradeAction={tradeAction}
        underlyingTicker={tickerInfo.symbol}
        underlyingPrice={tickerInfo.lastPrice}
        onSubmit={handleTradeSubmit}
      />
    </>
  );
}
