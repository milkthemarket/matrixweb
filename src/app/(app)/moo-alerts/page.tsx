
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
import { useSettingsContext } from '@/contexts/SettingsContext';


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
  const [alerts, setAlerts] = useState<MooAlertItem[]>([]); 
  const [selectedCriteria, setSelectedCriteria] = useState<SelectedCriteriaState>(initialCriteriaFilterState);

  const { toast } = useToast();
  const { addTradeToHistory } = useTradeHistoryContext();
  const { addOpenPosition, selectedAccountId } = useOpenPositionsContext();
  const { notificationSounds, playSound } = useSettingsContext();


  const [selectedStockForOrderCard, setSelectedStockForOrderCard] = useState<Stock | null>(null);
  const [orderCardActionType, setOrderCardActionType] = useState<OrderActionType | null>(null);
  const [orderCardInitialTradeMode, setOrderCardInitialTradeMode] = useState<TradeMode | undefined>(undefined);
  const [orderCardMiloActionContext, setOrderCardMiloActionContext] = useState<string | null>(null);
  
  const [orderCardInitialQuantity, setOrderCardInitialQuantity] = useState<string | undefined>(undefined);
  const [orderCardInitialOrderType, setOrderCardInitialOrderType] = useState<OrderSystemType | undefined>(undefined);
  const [orderCardInitialLimitPrice, setOrderCardInitialLimitPrice] = useState<string | undefined>(undefined);


  useEffect(() => {
    const processedInitialAlerts = initialDummyAlertsData.map(alert => ({
      ...alert,
      ...generateTradePlan(alert.currentPrice, alert.sentiment),
    }));
    setAlerts(processedInitialAlerts);
  }, []); 

  useEffect(() => {
    const newAlertInterval = setInterval(() => {
      const randomBaseAlert = initialDummyAlertsData[Math.floor(Math.random() * initialDummyAlertsData.length)];
      const newPrice = parseFloat((randomBaseAlert.currentPrice * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2));
      const newSentiment = ['Positive', 'Negative', 'Neutral'][Math.floor(Math.random() * 3)] as MooAlertSentiment;
      
      const newAlert: MooAlertItem = {
        ...randomBaseAlert,
        id: String(Date.now()),
        currentPrice: newPrice,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        sentiment: newSentiment,
        premarketChangePercent: parseFloat(((Math.random() - 0.5) * 5).toFixed(2)), 
        ...generateTradePlan(newPrice, newSentiment), 
      };

      setAlerts(prevAlerts => [newAlert, ...prevAlerts].slice(0, 20)); 
      
      if (notificationSounds.mooAlert !== 'off') {
        playSound(notificationSounds.mooAlert);
      }

    }, 30000); 
    return () => clearInterval(newAlertInterval);
  }, [notificationSounds.mooAlert, playSound]);


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
        id: symbol, symbol, name: symbol, price: 0, changePercent: 0, float:0, volume:0, lastUpdated: new Date().toISOString(), historicalPrices: []
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
    return 'text-foreground';
  };


  return (
    <main className="flex flex-col flex-1 h-full overflow-auto">
      <PageHeader title="Moo Alerts" />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_400px] p-4 gap-4 overflow-auto">
        
        <div className="flex-1 flex flex-col gap-4 overflow-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Megaphone className="mr-2 h-5 w-5 text-primary"/>
                Real-Time Trade Signals
              </CardTitle>
              <CardDescription>
                Actionable signals with trade plans. Click an alert to populate the trade panel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Button
                  variant={Object.values(selectedCriteria).every(v => !v) ? "default" : "outline"}
                  onClick={handleShowAll}
                  size="sm"
                  className={cn(Object.values(selectedCriteria).every(v => !v) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
                >
                  Show All
                </Button>
                {criteriaFilterConfig.map(({ key, label, Icon }) => (
                  <Button
                    key={key}
                    variant={selectedCriteria[key] ? "default" : "outline"}
                    onClick={() => handleCriteriaToggle(key)}
                    size="sm"
                    className={cn(
                      "flex items-center gap-2",
                      selectedCriteria[key] ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {Icon && <Icon className={cn("h-4 w-4", selectedCriteria[key] ? "text-primary-foreground" : "text-muted-foreground")} />}
                    {label}
                  </Button>
                ))}
              </div>

              {alerts.length === 0 && ( 
                 <div className="flex flex-col items-center justify-center text-center py-10 text-muted-foreground">
                  <MiloAvatarIcon size={40} className="mb-2 opacity-70 animate-pulse" />
                  <p className="text-sm font-medium">Moo-ving data into place...</p>
                  <p className="text-xs">Loading initial alerts.</p>
                </div>
              )}

              {alerts.length > 0 && filteredAlerts.length === 0 && ( 
                 <div className="flex flex-col items-center justify-center text-center py-10 text-muted-foreground">
                  <MiloAvatarIcon size={40} className="mb-2 opacity-70" />
                  <p className="text-sm font-medium">No alerts match your current filter.</p>
                  <p className="text-xs">Try adjusting the criteria or "Show All".</p>
                </div>
              )}

              {filteredAlerts.length > 0 && (
                 <ScrollArea className="h-[calc(100vh-22rem)]"> 
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                    {filteredAlerts.map(alert => (
                      <Card 
                        key={alert.id} 
                        className="flex flex-col hover:border-primary/50 transition-all duration-150 ease-in-out cursor-pointer"
                        onClick={() => handleMooAlertSelectForOrder(alert)}
                      >
                        <CardHeader className="pb-2 space-y-1">
                           <div className="flex items-center justify-between gap-2 flex-wrap w-full">
                                <div className="flex items-baseline gap-2 flex-wrap">
                                    <button onClick={(e) => { e.stopPropagation(); handleMooAlertSelectForOrder(alert); }} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
                                      <CardTitle className="text-base font-semibold text-primary hover:underline">{alert.symbol}</CardTitle>
                                    </button>
                                    <span className="text-sm font-mono text-foreground">${alert.currentPrice.toFixed(2)}</span>
                                    {alert.premarketChangePercent !== undefined && (
                                        <span className={cn("text-sm font-semibold", alert.premarketChangePercent >= 0 ? "text-green-400" : "text-red-400")}>
                                          Pre: {alert.premarketChangePercent >= 0 ? '+' : ''}{alert.premarketChangePercent.toFixed(2)}%
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={cn("text-xs", getSentimentBadgeClass(alert.sentiment))}>
                                      {alert.sentiment}
                                    </Badge>
                                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                                </div>
                            </div>
                            <p className="text-sm text-foreground leading-tight line-clamp-2 pt-1">{alert.headline}</p>
                            <div className="flex items-center space-x-2 pt-2">
                                <CriteriaIcon met={alert.criteria.news} IconComponent={Newspaper} label="Positive News" />
                                <CriteriaIcon met={alert.criteria.volume} IconComponent={BarChartBig} label="High Pre-market Volume" />
                                <CriteriaIcon met={alert.criteria.chart} IconComponent={LineChart} label="Clean Chart Structure" />
                                <CriteriaIcon met={alert.criteria.shortable} IconComponent={TrendingDown} label="Shortable" activeColorClass="text-yellow-400" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2 flex-1 flex flex-col justify-between space-y-2">
                          {alert.suggestedAction && (
                            <div className="border-t border-border pt-2 mt-2 space-y-1 text-sm">
                              <div className="flex items-center font-medium text-primary">
                                <TrafficCone className="h-4 w-4 mr-2" /> Trade Plan:
                              </div>
                              <div className="flex items-center">
                                <span className="text-foreground">Action:</span>
                                <span className={cn("font-semibold ml-2", getActionTextColorClass(alert.suggestedAction))}>{alert.suggestedAction}</span>
                                <span className="text-foreground ml-4">, Qty:</span>
                                <span className="font-semibold ml-2 text-foreground">{alert.suggestedQuantity}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-foreground">Entry:</span>
                                <span className="ml-2 text-foreground">${alert.suggestedEntryPrice?.toFixed(2)} ({alert.suggestedOrderType})</span>
                              </div>
                              <div className="flex items-center">
                                <Target className="h-4 w-4 mr-2 text-green-400" />
                                <span className="text-foreground">Target:</span>
                                <span className="ml-2 text-green-400">${alert.suggestedTargetPrice?.toFixed(2)} (+{alert.targetGainPercent?.toFixed(1)}%)</span>
                              </div>
                              <div className="flex items-center">
                                <ShieldCheck className="h-4 w-4 mr-2 text-red-400" />
                                <span className="text-foreground">Stop:</span>
                                <span className="ml-2 text-red-400">${alert.suggestedStopLossPrice?.toFixed(2)} (-{alert.stopLossRiskPercent?.toFixed(1)}%)</span>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center space-x-2 pt-2 justify-start mt-auto">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-accent text-accent hover:bg-accent/10 hover:text-accent"
                                onClick={(e) => { e.stopPropagation(); handleMooAlertSelectForOrder(alert); }}
                            >
                                <MousePointerSquareDashed className="mr-2 h-4 w-4" /> Trade
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" onClick={(e) => {e.stopPropagation(); toast({title: "Alert Setting", description:"Alert configuration UI for this specific Moo Alert would go here."})}}>
                                <AlertCircle className="mr-2 h-4 w-4" /> Alert
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

        </div>

        <div className="w-full lg:w-[400px] flex-shrink-0 lg:flex flex-col gap-4 overflow-auto min-h-[500px]">
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
            className="min-h-[400px]"
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
