
"use client";

import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Newspaper, BarChartBig, LineChart, Megaphone, MousePointerSquareDashed, AlertCircle, Info, TrendingDown, TrafficCone, DollarSign, ShieldCheck, Target, Percent, PackageOpen } from "lucide-react";
import { MiloAvatarIcon } from '@/components/icons/MiloAvatarIcon';
import type { MooAlertItem, MooAlertSentiment, Stock, TradeRequest, OrderActionType, TradeMode, OrderSystemType } from '@/types';
import { cn } from '@/lib/utils';
import { OrderCard } from '@/components/OrderCard';
import { useToast } from "@/hooks/use-toast";
import { useTradeHistoryContext } from "@/contexts/TradeHistoryContext";
import { useOpenPositionsContext } from "@/contexts/OpenPositionsContext";


const generateTradePlan = (price: number, sentiment: MooAlertSentiment): Partial<MooAlertItem> => {
  let action: OrderActionType = 'Buy';
  if (sentiment === 'Negative') action = 'Short';
  
  const orderType: OrderSystemType = Math.random() > 0.5 ? 'Limit' : 'Market';
  const quantity = Math.floor(Math.random() * 20) + 10; // 10-29 shares

  let entryPrice: number;
  if (orderType === 'Limit') {
    entryPrice = action === 'Buy' ? parseFloat((price * 0.995).toFixed(2)) : parseFloat((price * 1.005).toFixed(2));
  } else {
    entryPrice = price;
  }

  const targetGainPercent = parseFloat((Math.random() * 4 + 2).toFixed(1)); // 2-6%
  const stopLossRiskPercent = parseFloat((Math.random() * 2 + 1).toFixed(1)); // 1-3%

  const targetPrice = action === 'Buy' 
    ? parseFloat((entryPrice * (1 + targetGainPercent / 100)).toFixed(2))
    : parseFloat((entryPrice * (1 - targetGainPercent / 100)).toFixed(2));
  
  const stopLossPrice = action === 'Buy'
    ? parseFloat((entryPrice * (1 - stopLossRiskPercent / 100)).toFixed(2))
    : parseFloat((entryPrice * (1 + stopLossRiskPercent / 100)).toFixed(2));
    
  return {
    suggestedAction: action,
    suggestedEntryPrice: entryPrice,
    suggestedTargetPrice: targetPrice,
    suggestedStopLossPrice: stopLossPrice,
    targetGainPercent,
    stopLossRiskPercent,
    suggestedOrderType: orderType,
    suggestedQuantity: quantity,
  };
};


const initialDummyAlertsData: Omit<MooAlertItem, 'suggestedAction' | 'suggestedEntryPrice' | 'suggestedTargetPrice' | 'suggestedStopLossPrice' | 'targetGainPercent' | 'stopLossRiskPercent' | 'suggestedOrderType' | 'suggestedQuantity'>[] = [
  {
    id: 'ma1',
    symbol: "TSLA",
    fullText: "TSLA surges after earnings beat — 7:08am — Positive",
    headline: "TSLA surges after earnings beat",
    time: "7:08am",
    sentiment: "Positive",
    currentPrice: 182.50,
    premarketChangePercent: 1.5,
    criteria: { news: true, volume: true, chart: true, shortable: true }
  },
  {
    id: 'ma2',
    symbol: "NVDA",
    fullText: "NVDA announces new AI chip — 6:51am — Positive",
    headline: "NVDA announces new AI chip",
    time: "6:51am",
    sentiment: "Positive",
    currentPrice: 905.75,
    premarketChangePercent: 0.8,
    criteria: { news: true, volume: false, chart: true, shortable: false }
  },
  {
    id: 'ma3',
    symbol: "AMC",
    fullText: "AMC in focus on pre-market spike — 7:12am — Neutral",
    headline: "AMC in focus on pre-market spike",
    time: "7:12am",
    sentiment: "Neutral",
    currentPrice: 5.12,
    premarketChangePercent: 3.2,
    criteria: { news: false, volume: true, chart: false, shortable: true }
  },
  {
    id: 'ma4',
    symbol: "GME",
    fullText: "GME showing unusual options activity — 8:02am — Negative",
    headline: "GME showing unusual options activity",
    time: "8:02am",
    sentiment: "Negative",
    currentPrice: 24.80,
    premarketChangePercent: -1.1,
    criteria: { news: true, volume: true, chart: true, shortable: true }
  },
  {
    id: 'ma5',
    symbol: "SPY",
    fullText: "SPY testing key support level — 8:15am — Neutral",
    headline: "SPY testing key support level",
    time: "8:15am",
    sentiment: "Neutral",
    currentPrice: 549.30,
    premarketChangePercent: -0.2,
    criteria: { news: false, volume: false, chart: true, shortable: false }
  },
  {
    id: 'ma6',
    symbol: "AAPL",
    fullText: "AAPL rumored to unveil new product next week — 8:30am — Positive",
    headline: "AAPL rumored to unveil new product next week",
    time: "8:30am",
    sentiment: "Positive",
    currentPrice: 171.05,
    premarketChangePercent: 0.5,
    criteria: { news: true, volume: false, chart: false, shortable: true }
  },
  {
    id: 'ma7',
    symbol: "NFLX",
    fullText: "Netflix tops subscriber estimates after new series launch — 8:15am — Positive",
    headline: "Netflix tops subscriber estimates after new series launch",
    time: "8:15am",
    sentiment: "Positive",
    currentPrice: 670.20,
    premarketChangePercent: 2.10,
    criteria: { news: true, volume: true, chart: true, shortable: true }
  },
  {
    id: 'ma8',
    symbol: "BA",
    fullText: "Boeing faces new delivery delays — 7:52am — Negative",
    headline: "Boeing faces new delivery delays",
    time: "7:52am",
    sentiment: "Negative",
    currentPrice: 214.80,
    premarketChangePercent: -0.50,
    criteria: { news: true, volume: true, chart: true, shortable: true }
  },
  {
    id: 'ma9',
    symbol: "COIN",
    fullText: "Coinbase surges on crypto ETF approval rumors — 6:48am — Positive",
    headline: "Coinbase surges on crypto ETF approval rumors",
    time: "6:48am",
    sentiment: "Positive",
    currentPrice: 245.15,
    premarketChangePercent: 3.70,
    criteria: { news: true, volume: true, chart: true, shortable: true }
  },
  {
    id: 'ma10',
    symbol: "META",
    fullText: "Meta announces new privacy features — 7:40am — Neutral",
    headline: "Meta announces new privacy features",
    time: "7:40am",
    sentiment: "Neutral",
    currentPrice: 332.25,
    premarketChangePercent: 1.00,
    criteria: { news: true, volume: true, chart: true, shortable: true }
  },
  {
    id: 'ma11',
    symbol: "SQ",
    fullText: "Block, Inc. drops after earnings miss — 7:10am — Negative",
    headline: "Block, Inc. drops after earnings miss",
    time: "7:10am",
    sentiment: "Negative",
    currentPrice: 71.05,
    premarketChangePercent: -1.90,
    criteria: { news: true, volume: true, chart: true, shortable: true }
  },
  {
    id: 'ma12',
    symbol: "AMD",
    fullText: "AMD rallies on strong chip sales guidance — 6:33am — Positive",
    headline: "AMD rallies on strong chip sales guidance",
    time: "6:33am",
    sentiment: "Positive",
    currentPrice: 164.70,
    premarketChangePercent: 2.80,
    criteria: { news: true, volume: true, chart: true, shortable: true }
  }
];

const initialDummyAlerts: MooAlertItem[] = initialDummyAlertsData.map(alert => ({
  ...alert,
  ...generateTradePlan(alert.currentPrice, alert.sentiment),
}));


const CriteriaIcon: React.FC<{ met: boolean; IconComponent: React.ElementType; label: string; activeColorClass?: string }> = ({ met, IconComponent, label, activeColorClass = "text-green-400" }) => (
  <TooltipProviderWrapper content={label}>
    <IconComponent className={cn("h-3.5 w-3.5", met ? activeColorClass : "text-muted-foreground/50")} />
  </TooltipProviderWrapper>
);

const TooltipProviderWrapper: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
  return <div title={content}>{children}</div>;
};

interface SelectedCriteriaState {
  news: boolean;
  volume: boolean;
  chart: boolean;
  shortable: boolean;
}

const initialCriteriaFilterState: SelectedCriteriaState = {
  news: false,
  volume: false,
  chart: false,
  shortable: false,
};

const criteriaFilterConfig: Array<{ key: keyof SelectedCriteriaState; label: string; Icon?: React.ElementType }> = [
  { key: 'news', label: 'News', Icon: Newspaper },
  { key: 'volume', label: 'Volume', Icon: BarChartBig },
  { key: 'chart', label: 'Chart', Icon: LineChart },
  { key: 'shortable', label: 'Shortable', Icon: TrendingDown },
];


const MooAlertsContent: React.FC = () => {
  const [alerts, setAlerts] = useState<MooAlertItem[]>(initialDummyAlerts);
  const [selectedCriteria, setSelectedCriteria] = useState<SelectedCriteriaState>(initialCriteriaFilterState);

  const { toast } = useToast();
  const { addTradeToHistory } = useTradeHistoryContext();
  const { addOpenPosition, selectedAccountId } = useOpenPositionsContext();

  const [selectedStockForOrderCard, setSelectedStockForOrderCard] = useState<Stock | null>(null);
  const [orderCardActionType, setOrderCardActionType] = useState<OrderActionType | null>(null);
  const [orderCardInitialTradeMode, setOrderCardInitialTradeMode] = useState<TradeMode | undefined>(undefined);
  const [orderCardMiloActionContext, setOrderCardMiloActionContext] = useState<string | null>(null);
  
  const [orderCardInitialQuantity, setOrderCardInitialQuantity] = useState<string | undefined>(undefined);
  const [orderCardInitialOrderType, setOrderCardInitialOrderType] = useState<OrderSystemType | undefined>(undefined);
  const [orderCardInitialLimitPrice, setOrderCardInitialLimitPrice] = useState<string | undefined>(undefined);


  const handleMooAlertSelectForOrder = (alertItem: MooAlertItem) => {
    const stockForOrderCard: Stock = {
      id: alertItem.id,
      symbol: alertItem.symbol,
      name: alertItem.symbol, 
      price: alertItem.currentPrice,
      changePercent: alertItem.premarketChangePercent || 0,
      float: 0, 
      volume: 0, 
      newsSnippet: alertItem.headline,
      lastUpdated: new Date().toISOString(),
      historicalPrices: [alertItem.currentPrice], 
    };
    setSelectedStockForOrderCard(stockForOrderCard);
    setOrderCardActionType(alertItem.suggestedAction || null); 
    setOrderCardInitialTradeMode('manual'); 
    
    setOrderCardInitialQuantity(alertItem.suggestedQuantity !== undefined ? String(alertItem.suggestedQuantity) : undefined);
    setOrderCardInitialOrderType(alertItem.suggestedOrderType);
    setOrderCardInitialLimitPrice(
      (alertItem.suggestedOrderType === 'Limit' || alertItem.suggestedOrderType === 'Stop Limit') && alertItem.suggestedEntryPrice !== undefined
        ? String(alertItem.suggestedEntryPrice)
        : undefined
    );

    let contextSummary = `Moo Alert Plan for ${alertItem.symbol}: ${alertItem.suggestedAction || 'Review'} ${alertItem.suggestedQuantity || ''} shares`;
    if (alertItem.suggestedOrderType) contextSummary += ` via ${alertItem.suggestedOrderType}`;
    if (alertItem.suggestedEntryPrice && (alertItem.suggestedOrderType === 'Limit' || alertItem.suggestedOrderType === 'Stop Limit')) contextSummary += ` @ $${alertItem.suggestedEntryPrice.toFixed(2)}`;
    setOrderCardMiloActionContext(contextSummary);
    
    toast({
      title: "Trade Plan Loaded",
      description: `${alertItem.symbol} trade plan sent to panel. Review and confirm.`,
    });
  };

  const handleClearOrderCard = () => {
    setSelectedStockForOrderCard(null);
    setOrderCardActionType(null);
    setOrderCardInitialTradeMode(undefined);
    setOrderCardMiloActionContext(null);
    setOrderCardInitialQuantity(undefined);
    setOrderCardInitialOrderType(undefined);
    setOrderCardInitialLimitPrice(undefined);
  };

  const handleTradeSubmit = (tradeDetails: TradeRequest) => {
    console.log("Trade Submitted via Order Card on Moo Alerts Page:", tradeDetails);
    toast({
      title: "Trade Processing",
      description: `${tradeDetails.action} ${tradeDetails.quantity} ${tradeDetails.symbol} (${tradeDetails.orderType}) submitted. Origin: ${tradeDetails.tradeModeOrigin || 'manual'}`,
    });

    if (selectedStockForOrderCard) { 
      addTradeToHistory({
        id: String(Date.now()),
        symbol: tradeDetails.symbol,
        side: tradeDetails.action,
        totalQty: tradeDetails.quantity,
        orderType: tradeDetails.orderType,
        limitPrice: tradeDetails.limitPrice,
        stopPrice: tradeDetails.stopPrice,
        trailAmount: tradeDetails.trailingOffset,
        TIF: tradeDetails.TIF || "Day",
        tradingHours: tradeDetails.allowExtendedHours ? "Include Extended Hours" : "Regular Market Hours Only",
        placedTime: new Date().toISOString(),
        filledTime: new Date(Date.now() + Math.random() * 5000 + 1000).toISOString(),
        orderStatus: "Filled",
        averagePrice: (tradeDetails.orderType === "Limit" && tradeDetails.limitPrice) ? tradeDetails.limitPrice : selectedStockForOrderCard.price,
        tradeModeOrigin: tradeDetails.tradeModeOrigin || 'manual',
        accountId: tradeDetails.accountId || selectedAccountId,
      });
    }
    
    if (tradeDetails.action === 'Buy' || tradeDetails.action === 'Short') {
        addOpenPosition({
            id: `pos${Date.now()}`,
            symbol: tradeDetails.symbol,
            entryPrice: selectedStockForOrderCard?.price || 0,
            shares: tradeDetails.quantity,
            currentPrice: selectedStockForOrderCard?.price || 0,
            origin: tradeDetails.tradeModeOrigin || 'manual',
            accountId: tradeDetails.accountId || selectedAccountId,
        });
    }
  };

  const handleStockSymbolSubmitFromOrderCard = (symbol: string) => {
    const alertItem = alerts.find(a => a.symbol.toUpperCase() === symbol.toUpperCase());
    if (alertItem) {
      handleMooAlertSelectForOrder(alertItem);
    } else {
      setSelectedStockForOrderCard({ 
        id: symbol, symbol, name: symbol, price: 0, changePercent: 0, float:0, volume:0, lastUpdated: new Date().toISOString()
      });
      setOrderCardActionType(null);
      setOrderCardInitialTradeMode('manual');
      setOrderCardMiloActionContext(null);
      setOrderCardInitialQuantity(undefined);
      setOrderCardInitialOrderType(undefined);
      setOrderCardInitialLimitPrice(undefined);
      toast({
        title: "Ticker Loaded Manually",
        description: `The ticker "${symbol.toUpperCase()}" was loaded. Please verify details.`,
      });
    }
  };


  const filteredAlerts = useMemo(() => {
    const activeFilterKeys = (Object.keys(selectedCriteria) as Array<keyof SelectedCriteriaState>)
      .filter(key => selectedCriteria[key]);

    if (activeFilterKeys.length === 0) {
      return alerts;
    }

    return alerts.filter(alert => {
      return activeFilterKeys.every(key => alert.criteria[key]);
    });
  }, [alerts, selectedCriteria]);

  const getSentimentBadgeClass = (sentiment: MooAlertSentiment) => {
    switch (sentiment) {
      case 'Positive': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Negative': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Neutral':
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };
  
  const handleCriteriaToggle = (criterionKey: keyof SelectedCriteriaState) => {
    setSelectedCriteria(prev => ({
      ...prev,
      [criterionKey]: !prev[criterionKey],
    }));
  };

  const handleShowAll = () => {
    setSelectedCriteria(initialCriteriaFilterState);
  };

  const getActionTextColorClass = (action?: OrderActionType) => {
    if (action === 'Buy') return 'text-[hsl(var(--confirm-green))]';
    if (action === 'Sell') return 'text-destructive';
    if (action === 'Short') return 'text-yellow-400';
    return 'text-foreground/90';
  };


  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Moo Alerts" />
      <div className="flex-1 flex flex-col md:flex-row p-4 md:p-6 space-y-6 md:space-y-0 md:space-x-6 overflow-hidden">
        
        <div className="flex-1 flex flex-col space-y-6 overflow-y-auto">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-headline flex items-center">
                <Megaphone className="mr-2 h-5 w-5 text-primary"/>
                Real-Time Trade Signals
              </CardTitle>
              <CardDescription>
                Actionable signals with trade plans. Click an alert to populate the trade panel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <Button
                  variant={Object.values(selectedCriteria).every(v => !v) ? "default" : "outline"}
                  onClick={handleShowAll}
                  className={cn(
                    "h-8 px-3 text-xs",
                    Object.values(selectedCriteria).every(v => !v) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/5"
                  )}
                >
                  Show All
                </Button>
                {criteriaFilterConfig.map(({ key, label, Icon }) => (
                  <Button
                    key={key}
                    variant={selectedCriteria[key] ? "default" : "outline"}
                    onClick={() => handleCriteriaToggle(key)}
                    className={cn(
                      "flex items-center gap-1.5 h-8 px-3 text-xs",
                      selectedCriteria[key] ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/5"
                    )}
                  >
                    {Icon && <Icon className={cn("h-3.5 w-3.5", selectedCriteria[key] ? "text-primary-foreground" : "text-muted-foreground/80")} />}
                    {label}
                  </Button>
                ))}
              </div>

              {filteredAlerts.length > 0 ? (
                 <ScrollArea className="h-[calc(100vh-30rem)] md:h-[calc(100vh-28rem)] pr-1"> 
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
                    {filteredAlerts.map(alert => (
                      <Card 
                        key={alert.id} 
                        className="bg-black/20 border border-white/10 shadow-sm flex flex-col hover:border-primary/50 transition-all duration-150 ease-in-out"
                        onClick={() => handleMooAlertSelectForOrder(alert)}
                      >
                        <CardHeader className="p-3 pb-2 space-y-1">
                           <div className="flex items-center justify-between gap-2 flex-wrap w-full">
                                <div className="flex items-baseline gap-2 flex-wrap">
                                    <button onClick={(e) => { e.stopPropagation(); handleMooAlertSelectForOrder(alert); }} className="focus:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-sm">
                                      <CardTitle className="text-base font-semibold text-primary hover:underline">{alert.symbol}</CardTitle>
                                    </button>
                                    <span className="text-sm font-mono text-foreground">${alert.currentPrice.toFixed(2)}</span>
                                    {alert.premarketChangePercent !== undefined && (
                                        <span className={cn("text-xs font-semibold", alert.premarketChangePercent >= 0 ? "text-green-400" : "text-red-400")}>
                                          Pre: {alert.premarketChangePercent >= 0 ? '+' : ''}{alert.premarketChangePercent.toFixed(2)}%
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Badge variant="outline" className={cn("text-xs py-0.5 px-1.5 h-auto", getSentimentBadgeClass(alert.sentiment))}>
                                      {alert.sentiment}
                                    </Badge>
                                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                                </div>
                            </div>
                            <p className="text-sm text-foreground leading-snug line-clamp-2 pt-0.5">{alert.headline}</p>
                            <div className="flex items-center space-x-2.5 pt-1">
                                <CriteriaIcon met={alert.criteria.news} IconComponent={Newspaper} label="Positive News" />
                                <CriteriaIcon met={alert.criteria.volume} IconComponent={BarChartBig} label="High Pre-market Volume" />
                                <CriteriaIcon met={alert.criteria.chart} IconComponent={LineChart} label="Clean Chart Structure" />
                                <CriteriaIcon met={alert.criteria.shortable} IconComponent={TrendingDown} label="Shortable" activeColorClass="text-yellow-400" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-1 flex-1 flex flex-col justify-between space-y-2">
                          {alert.suggestedAction && (
                            <div className="border-t border-white/5 pt-2 mt-1 space-y-1 text-xs">
                              <div className="flex items-center font-medium text-primary">
                                <TrafficCone className="h-3.5 w-3.5 mr-1.5" /> Trade Plan:
                              </div>
                              <div className={cn("flex items-center", getActionTextColorClass(alert.suggestedAction))}>
                                <DollarSign className="h-3 w-3 mr-1 text-muted-foreground" />
                                Action: <span className="font-semibold ml-1">{alert.suggestedAction}</span>, 
                                Qty: <span className="font-semibold ml-1">{alert.suggestedQuantity}</span>
                              </div>
                              <div className="flex items-center text-foreground/90">
                                <DollarSign className="h-3 w-3 mr-1 text-muted-foreground" />
                                Entry: ${alert.suggestedEntryPrice?.toFixed(2)} ({alert.suggestedOrderType})
                              </div>
                              <div className="flex items-center text-green-400">
                                <Target className="h-3 w-3 mr-1" />
                                Target: ${alert.suggestedTargetPrice?.toFixed(2)} (+{alert.targetGainPercent?.toFixed(1)}%)
                              </div>
                              <div className="flex items-center text-red-400">
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                Stop: ${alert.suggestedStopLossPrice?.toFixed(2)} (-{alert.stopLossRiskPercent?.toFixed(1)}%)
                              </div>
                            </div>
                          )}
                          <div className="flex items-center space-x-2 pt-2 justify-start mt-auto">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-accent text-accent hover:bg-accent/10 hover:text-accent h-7 px-2 text-xs"
                                onClick={(e) => { e.stopPropagation(); handleMooAlertSelectForOrder(alert); }}
                            >
                                <MousePointerSquareDashed className="mr-1 h-3 w-3" /> Trade
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary h-7 px-2 text-xs" onClick={(e) => {e.stopPropagation(); toast({title: "Alert Setting", description:"Alert configuration UI for this specific Moo Alert would go here."})}}>
                                <AlertCircle className="mr-1 h-3 w-3" /> Alert
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 text-muted-foreground">
                  <MiloAvatarIcon size={60} className="mb-4 opacity-70" />
                  <p className="text-lg font-medium">No headlines worth moo-ving on yet.</p>
                  <p className="text-sm">Check back soon for the latest alerts!</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-sm font-semibold flex items-center">
                <Info className="mr-2 h-4 w-4 text-muted-foreground"/>
                Criteria Key
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-0.5 p-3 pt-0">
              <p className="flex items-center"><Newspaper className="mr-1.5 h-3.5 w-3.5 text-green-400"/> Positive News Catalyst</p>
              <p className="flex items-center"><BarChartBig className="mr-1.5 h-3.5 w-3.5 text-green-400"/> High Pre-market Volume</p>
              <p className="flex items-center"><LineChart className="mr-1.5 h-3.5 w-3.5 text-green-400"/> Clean Chart Structure</p>
              <p className="flex items-center"><TrendingDown className="mr-1.5 h-3.5 w-3.5 text-yellow-400"/> Shortable</p>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-96 lg:w-[26rem] flex-shrink-0 md:flex flex-col space-y-6 md:overflow-y-auto">
           <OrderCard
            selectedStock={selectedStockForOrderCard}
            initialActionType={orderCardActionType}
            initialTradeMode={orderCardInitialTradeMode}
            miloActionContextText={orderCardMiloActionContext}
            onSubmit={handleTradeSubmit}
            onClear={handleClearOrderCard}
            onStockSymbolSubmit={handleStockSymbolSubmitFromOrderCard}
            initialQuantity={orderCardInitialQuantity}
            initialOrderType={orderCardInitialOrderType}
            initialLimitPrice={orderCardInitialLimitPrice}
          />
        </div>
      </div>
    </main>
  );
}

export default function MooAlertsPage() {
  return (
    <Suspense fallback={<div>Loading Moo Alerts...</div>}>
      <MooAlertsContent />
    </Suspense>
  );
}

