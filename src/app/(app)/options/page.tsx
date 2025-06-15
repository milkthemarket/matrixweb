
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
  marketStatus: 'Late Close',
};

const mockExpirations = [
  { value: '2024-06-21', label: 'June 21, 2024 (2d)', daysRemaining: 2 },
  { value: '2024-06-28', label: 'June 28, 2024 (9d)', daysRemaining: 9 },
  { value: '2024-07-05', label: 'July 5, 2024 (16d)', daysRemaining: 16 },
  { value: '2024-07-19', label: 'July 19, 2024 (30d)', daysRemaining: 30 },
];

const generateMockOptionsChain = (underlyingPrice: number, expirationDate: string, type: OptionType, daysToExpiration: number): OptionContract[] => {
  const chain: OptionContract[] = [];
  const numStrikes = 20; // 10 ITM/ATM, 10 OTM
  const strikeIncrement = underlyingPrice > 200 ? 5 : (underlyingPrice > 50 ? 2.5 : 1);
  const baseStrike = Math.round(underlyingPrice / strikeIncrement) * strikeIncrement;

  for (let i = -Math.floor(numStrikes / 3) ; i < Math.ceil(numStrikes * 2 / 3); i++) {
    const strike = baseStrike + i * strikeIncrement;
    if (strike <= 0) continue;

    const isCall = type === 'Call';
    const moneyness = isCall ? underlyingPrice - strike : strike - underlyingPrice;
    
    let intrinsicValue = Math.max(0, moneyness);
    let extrinsicValue = Math.max(0.1, (Math.random() * 2 + 0.5) * (1 - Math.abs(i) / numStrikes) * (Math.sqrt(underlyingPrice) / 10));
    
    if ((isCall && strike < underlyingPrice * 0.8) || (!isCall && strike > underlyingPrice * 1.2)) {
        extrinsicValue *= 0.5;
    }

    const ask = parseFloat((intrinsicValue + extrinsicValue).toFixed(2));
    const bid = parseFloat(Math.max(0.01, ask - Math.random() * 0.1 * ask - 0.05).toFixed(2));
    const change = parseFloat(((Math.random() - 0.45) * ask * 0.2).toFixed(2));
    const lastPrice = parseFloat((ask - change).toFixed(2));
    const percentChange = lastPrice > 0 ? parseFloat(((change / lastPrice) * 100).toFixed(2)) : 0;
    const breakeven = isCall ? strike + ask : strike - ask;
    const toBreakevenPercent = underlyingPrice > 0 ? parseFloat(((breakeven - underlyingPrice) / underlyingPrice * 100).toFixed(2)) : 0;

    chain.push({
      id: `${mockTickerInfo.symbol}-${expirationDate.replace(/-/g, '')}-${type[0]}${strike}`, // Ensure ID is unique
      strike,
      type,
      expirationDate: expirationDate,
      daysToExpiration: daysToExpiration,
      ask,
      bid,
      lastPrice: lastPrice > 0.01 ? lastPrice : undefined,
      change,
      percentChange,
      breakeven: parseFloat(breakeven.toFixed(2)),
      toBreakevenPercent,
      volume: Math.floor(Math.random() * 2000 + 50),
      openInterest: Math.floor(Math.random() * 10000 + 100),
      impliedVolatility: parseFloat((Math.random() * 30 + 15).toFixed(2)),
    });
  }
  return chain.sort((a,b) => a.strike - b.strike);
};


export default function OptionsPage() {
  const [tickerInfo, setTickerInfo] = useState<OptionsTickerInfo>(mockTickerInfo);
  const [tradeAction, setTradeAction] = useState<OptionOrderActionType>('Buy');
  const [optionType, setOptionType] = useState<OptionType>('Call');
  const [selectedExpiration, setSelectedExpiration] = useState<string>(mockExpirations[0].value);
  
  const [optionsChain, setOptionsChain] = useState<OptionContract[]>([]);
  const [isChainDataReady, setIsChainDataReady] = useState(false); // New state
  const [selectedContract, setSelectedContract] = useState<OptionContract | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  
  const { toast } = useToast();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [stickyPricePillVisible, setStickyPricePillVisible] = useState(false); // Initialize to false

  useEffect(() => {
    setIsChainDataReady(false); // Reset ready state when dependencies change
    const currentExpirationDetails = mockExpirations.find(exp => exp.value === selectedExpiration);
    if (currentExpirationDetails) {
      const chain = generateMockOptionsChain(tickerInfo.lastPrice, selectedExpiration, optionType, currentExpirationDetails.daysRemaining);
      setOptionsChain(chain);
      setIsChainDataReady(true); // Mark data as ready after generation
    } else {
      setOptionsChain([]); // Clear chain if no details found
      setIsChainDataReady(true); // Consider empty chain as "ready" to avoid indefinite loading state
    }
  }, [tickerInfo.lastPrice, selectedExpiration, optionType]);

  const handleSelectContract = (contract: OptionContract) => {
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

  const getMarketStatusColor = (status: OptionsTickerInfo['marketStatus']) => {
    switch (status) {
      case 'Market Open': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Market Closed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Late Close': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    if (!tableContainer) return;

    const handleScroll = () => {
      const tableHeader = tableContainer.querySelector('thead');
      if (tableHeader) {
        const tableHeaderBottom = tableHeader.getBoundingClientRect().bottom;
        // Ensure calculations are done only on client
        setStickyPricePillVisible(tableHeaderBottom < (tableContainer.getBoundingClientRect().top + 60));
      } else {
        setStickyPricePillVisible(false); // Default to not visible if header isn't found
      }
    };
    
    handleScroll(); // Initial check on mount

    tableContainer.addEventListener('scroll', handleScroll);
    return () => tableContainer.removeEventListener('scroll', handleScroll);
  }, [isChainDataReady]); // Re-run when chain data is ready as table might appear/affect layout


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
                <SlidersHorizontal className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {tickerInfo.symbol}{' '}
                    <span className={cn("text-xl", tickerInfo.priceChange >= 0 ? 'text-green-400' : 'text-red-400')}>
                      ${tickerInfo.lastPrice.toFixed(2)}
                    </span>
                  </h2>
                  <p className={cn("text-sm", tickerInfo.priceChange >= 0 ? 'text-green-400' : 'text-red-400')}>
                    {tickerInfo.priceChange.toFixed(2)} ({tickerInfo.priceChangePercent.toFixed(2)}%)
                  </p>
                </div>
                <Badge variant="outline" className={cn("text-xs whitespace-nowrap", getMarketStatusColor(tickerInfo.marketStatus))}>
                  {tickerInfo.marketStatus}
                </Badge>
              </div>
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
                    <p>Loading options data...</p>
                </div>
            ) : optionsChain.length === 0 && isChainDataReady ? (
                 <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <SlidersHorizontal className="h-12 w-12 mb-4 opacity-50" />
                    <p>No options data available for the selected criteria.</p>
                    <p>Try a different expiration or ticker.</p>
                </div>
            ) : (
                <OptionsChainTable
                chainData={optionsChain}
                underlyingPrice={tickerInfo.lastPrice}
                onSelectContract={handleSelectContract}
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
