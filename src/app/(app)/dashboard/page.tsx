"use client";

import * as React from 'react';
import Image from "next/image";
import { PlaceholderCard } from '@/components/dashboard/PlaceholderCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Newspaper,
  Search,
  Send,
  Landmark,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  BarChart4,
  Cpu,
  CalendarDays,
  Sparkles
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

interface MarketData {
  label: string;
  polygonTicker: string;
  icon?: React.ElementType;
  openTime?: string;
  closeTime?: string;
  timezone?: string;
}

const initialMarketOverviewData: MarketData[] = [
  { label: 'Apple (AAPL)', polygonTicker: 'AAPL', icon: Landmark, openTime: '09:30', closeTime: '16:00', timezone: 'America/New_York' },
  { label: 'Microsoft (MSFT)', polygonTicker: 'MSFT', icon: Landmark, openTime: '09:30', closeTime: '16:00', timezone: 'America/New_York' },
  { label: 'S&P 500 (SPY)', polygonTicker: 'SPY', icon: Landmark, openTime: '09:30', closeTime: '16:00', timezone: 'America/New_York' },
  { label: 'Dow Jones (DIA)', polygonTicker: 'DIA', icon: Landmark, openTime: '09:30', closeTime: '16:00', timezone: 'America/New_York' },
];

const newsData = [
  {
    id: 1,
    headline: "Global Markets Rally on Positive Inflation Outlook",
    summary: "Major indices saw significant gains as new inflation data suggests a cooling trend, boosting investor confidence.",
    timestamp: "2h ago",
    sentiment: "positive",
  },
  {
    id: 2,
    headline: "Tech Sector Faces Scrutiny Over New Regulations",
    summary: "Upcoming regulatory changes are causing uncertainty in the tech industry, with several large-cap stocks experiencing volatility.",
    timestamp: "5h ago",
    sentiment: "neutral",
  },
  {
    id: 3,
    headline: "Oil Prices Surge Amid Geopolitical Tensions",
    summary: "Crude oil futures jumped over 3% today following new developments in international relations, impacting energy stocks.",
    timestamp: "1d ago",
    sentiment: "negative",
  },
];

const getNewsSentimentBadgeClass = (sentiment: string) => {
  switch (sentiment) {
    case "positive":
      return "bg-green-500/20 text-green-400 border-green-500/50";
    case "negative":
      return "bg-red-500/20 text-red-400 border-red-500/50";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/50";
  }
};

interface FetchedIndexData {
  c?: number; // Close price
  o?: number; // Open price
  error?: string;
  loading?: boolean;
}

interface MarketStatusInfo {
  statusText: string;
  tooltipText: string;
  shadowClass: string;
}

// Function to fetch index data
const fetchIndexData = async (symbol: string): Promise<FetchedIndexData> => {
  const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
  // CRITICAL LOG: Check if the API key is being read.
  console.log(`[Polygon API] Attempting to use API key ending with: ...${apiKey ? apiKey.slice(-4) : 'UNDEFINED'} for symbol: ${symbol}`);

  if (!apiKey) {
    console.error(`[Polygon API Error] NEXT_PUBLIC_POLYGON_API_KEY is UNDEFINED. Please ensure it's set in .env.local and the dev server was restarted.`);
    return { error: 'API Key Missing. Configure in .env.local & restart server.' };
  }

  try {
    const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${apiKey}`);
    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`; // Default message
      try {
        const errorData = await response.json();
        if (Object.keys(errorData).length === 0 && errorData.constructor === Object) {
          console.warn(`[Polygon API Warn] Received empty JSON error object from Polygon for ${symbol}. Status: ${response.status}.`);
          errorMessage = `API Error: ${response.status} - Polygon returned an empty error response.`;
        } else {
          console.log(`[Polygon API Info] Full error response object for ${symbol}:`, errorData); // Changed to log for non-empty error objects
          if (errorData.message) errorMessage = `API Error: ${response.status} - ${errorData.message}`;
          else if (errorData.error) errorMessage = `API Error: ${response.status} - ${errorData.error}`;
          else if (errorData.request_id) errorMessage = `API Error: ${response.status} (Request ID: ${errorData.request_id})`;
          else if (response.statusText && errorMessage === `API Error: ${response.status}`) {
             errorMessage = `API Error: ${response.status} - ${response.statusText}`;
          }
        }
      } catch (e) {
        try {
            const textError = await response.text();
            console.warn(`[Polygon API Warn] Could not parse JSON error response for ${symbol}. Status: ${response.status}. Response text snippet:`, textError.substring(0, 200) + (textError.length > 200 ? '...' : ''));
            errorMessage = `API Error: ${response.status} - ${response.statusText || 'Failed to parse error response as JSON or text.'}`;
        } catch (textE) {
            console.warn(`[Polygon API Warn] Could not parse JSON or text error response for ${symbol}. Status: ${response.status}.`);
            errorMessage = `API Error: ${response.status} - ${response.statusText || 'Unknown error structure and failed to read response text.'}`;
        }
      }
      console.error(`Error fetching ${symbol}: ${errorMessage}`);
      return { error: errorMessage };
    }
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const { c, o } = data.results[0];
      return { c, o };
    }
    console.warn(`[Polygon API Warn] No data results found for ${symbol} in Polygon response.`);
    return { error: 'No data from Polygon' };
  } catch (error: any) {
    console.error(`[Polygon API Error] Network/Fetch error for ${symbol}:`, error.message || error);
    return { error: `Fetch error: ${error.message || 'Unknown network error'}` };
  }
};

export default function DashboardPage() {
  const [marketApiData, setMarketApiData] = React.useState<Record<string, FetchedIndexData>>({});
  const [tickerQuery, setTickerQuery] = React.useState('');
  const [tickerData, setTickerData] = React.useState<any>(null);
  const [isLoadingTicker, setIsLoadingTicker] = React.useState(false);
  const [marketStatuses, setMarketStatuses] = React.useState<Record<string, MarketStatusInfo>>({});
  const [currentTimeEST, setCurrentTimeEST] = React.useState<string>('Loading...');

  React.useEffect(() => {
    const loadMarketData = async () => {
      if (!process.env.NEXT_PUBLIC_POLYGON_API_KEY) {
        console.warn("[Polygon API] CRITICAL: NEXT_PUBLIC_POLYGON_API_KEY is not defined in the environment. Market data will not be fetched. Ensure .env.local is set and the dev server was restarted.");
        const errorState: Record<string, FetchedIndexData> = {};
        initialMarketOverviewData.forEach(market => {
          errorState[market.polygonTicker] = { error: 'API Key Missing. Check .env.local & restart server.' };
        });
        setMarketApiData(errorState);
        return;
      }

      const initialApiData: Record<string, FetchedIndexData> = {};
      initialMarketOverviewData.forEach(market => {
        initialApiData[market.polygonTicker] = { loading: true };
      });
      setMarketApiData(initialApiData);

      const promises = initialMarketOverviewData.map(market =>
        fetchIndexData(market.polygonTicker).then(data => ({ symbol: market.polygonTicker, data }))
      );

      const results = await Promise.allSettled(promises);

      const newApiData: Record<string, FetchedIndexData> = {};
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          newApiData[result.value.symbol] = result.value.data;
        } else {
          console.error("[Polygon API] Promise rejected unexpectedly in loadMarketData:", result.reason);
        }
      });
      setMarketApiData(prevData => ({ ...prevData, ...newApiData }));
    };
    loadMarketData();
  }, []);

  const calculateChangePercent = (currentPrice?: number, openPrice?: number) => {
    if (typeof currentPrice !== 'number' || typeof openPrice !== 'number' || openPrice === 0) {
      return null;
    }
    return ((currentPrice - openPrice) / openPrice) * 100;
  };

  const handleTickerLookup = () => {
    if (!tickerQuery.trim()) return;
    setIsLoadingTicker(true);
    setTickerData(null);
    setTimeout(() => {
      const companySymbol = tickerQuery.toUpperCase();
      setTickerData({
        companyName: `${companySymbol} Innovations Inc.`,
        symbol: companySymbol,
        exchange: "NASDAQ",
        sector: "Technology",
        industry: "Software - Application",
        logo: `https://placehold.co/48x48.png?text=${companySymbol}`,
        marketCap: "1.75T",
        currentPrice: (Math.random() * 200 + 100).toFixed(2),
        priceChangeAmount: (Math.random() * 5 - 2.5).toFixed(2),
        priceChangePercent: (Math.random() * 2 - 1).toFixed(2),
        previousClose: (Math.random() * 200 + 98).toFixed(2),
        openPrice: (Math.random() * 200 + 99).toFixed(2),
        daysRange: `${(Math.random() * 190 + 95).toFixed(2)} - ${(Math.random() * 210 + 105).toFixed(2)}`,
        fiftyTwoWeekRange: `${(Math.random() * 150 + 50).toFixed(2)} - ${(Math.random() * 250 + 150).toFixed(2)}`,
        volume: (Math.random() * 10000000 + 5000000).toLocaleString(undefined, {maximumFractionDigits:0}),
        avgVolume: (Math.random() * 12000000 + 6000000).toLocaleString(undefined, {maximumFractionDigits:0}),
        peRatio: (Math.random() * 30 + 15).toFixed(1),
        epsTTM: (Math.random() * 10 + 2).toFixed(2),
        dividendYield: `${(Math.random() * 2.5).toFixed(2)}%`,
        beta: (Math.random() * 0.8 + 0.7).toFixed(2),
        nextEarningsDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        dividendDate: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString() : "N/A",
        priceHistory1D: Array.from({ length: 20 }, () => Math.random() * 5 + 150),
        recentNews: [
          { id: 'n1', headline: `${companySymbol} announces breakthrough in AI research.`, sentiment: 'positive', source: 'Tech Times' },
          { id: 'n2', headline: `Analysts upgrade ${companySymbol} to 'Buy'.`, sentiment: 'positive', source: 'Finance Today' },
          { id: 'n3', headline: `Market volatility impacts ${companySymbol} stock price.`, sentiment: 'neutral', source: 'Market Watch' },
        ]
      });
      setIsLoadingTicker(false);
    }, 1500);
  };

  React.useEffect(() => {
    const updateMarketStatuses = () => {
      const newStatuses: Record<string, MarketStatusInfo> = {};
      const now = new Date();

      let currentHourEST = 0;
      let currentMinuteEST = 0;

      try {
        const estFormatter = new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: false,
          timeZone: 'America/New_York',
        });
        const parts = estFormatter.formatToParts(now);
        parts.forEach(part => {
          if (part.type === 'hour') currentHourEST = parseInt(part.value);
          if (part.type === 'minute') currentMinuteEST = parseInt(part.value);
        });
      } catch (e) {
        console.error("Error formatting EST time, defaulting to local time for logic:", e);
        const localNow = new Date();
        currentHourEST = localNow.getHours();
        currentMinuteEST = localNow.getMinutes();
      }
      
      const todayForLogic = new Date(now.toLocaleString('en-US', {timeZone: 'America/New_York'}));
      todayForLogic.setHours(0,0,0,0);

      initialMarketOverviewData.forEach(market => {
        if (market.openTime && market.closeTime) {
          const [openHour, openMinute] = market.openTime.split(':').map(Number);
          const [closeHour, closeMinute] = market.closeTime.split(':').map(Number);

          const marketOpenTime = new Date(todayForLogic);
          marketOpenTime.setHours(openHour, openMinute, 0, 0);

          const marketCloseTime = new Date(todayForLogic);
          marketCloseTime.setHours(closeHour, closeMinute, 0, 0);

          const nowInEstEquivalentForLogic = new Date(todayForLogic);
          nowInEstEquivalentForLogic.setHours(currentHourEST, currentMinuteEST, 0, 0);

          const isCurrentlyOpen =
            nowInEstEquivalentForLogic >= marketOpenTime &&
            nowInEstEquivalentForLogic < marketCloseTime;

          const timeToCloseMs = marketCloseTime.getTime() - nowInEstEquivalentForLogic.getTime();
          const isClosingSoon = isCurrentlyOpen && timeToCloseMs > 0 && timeToCloseMs <= 60 * 60 * 1000; // 1 hour

          let statusText = "🔴 Market Closed";
          let shadowClass = "shadow-market-closed";
          let tooltipText = `Market Hours: ${market.openTime} - ${market.closeTime} ET`;

          if (isClosingSoon) {
            statusText = "🟡 Closing Soon";
            shadowClass = "shadow-market-closing";
            tooltipText = `Market closes at ${market.closeTime} ET`;
          } else if (isCurrentlyOpen) {
            statusText = "🟢 Market Open";
            shadowClass = "shadow-market-open";
            tooltipText = `Market closes at ${market.closeTime} ET`;
          }

          newStatuses[market.label] = { statusText, tooltipText, shadowClass };
        } else {
          newStatuses[market.label] = { statusText: "Status N/A", tooltipText: "Market hours not defined", shadowClass: "" };
        }
      });
      setMarketStatuses(newStatuses);
    };

    updateMarketStatuses();
    const intervalId = setInterval(updateMarketStatuses, 60000);
    const clockIntervalId = setInterval(() => {
      try {
        setCurrentTimeEST(new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (e) {
        setCurrentTimeEST(new Date().toLocaleTimeString());
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
      clearInterval(clockIntervalId);
    };
  }, []);

  return (
    <main className="flex-1 p-6 space-y-8 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Welcome Josh!
      </h1>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-6">Market Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {initialMarketOverviewData.map((market) => {
            const apiResult = marketApiData[market.polygonTicker];
            const statusInfo = marketStatuses[market.label] || { statusText: "Loading...", tooltipText: "Fetching status...", shadowClass: "" };

            let valueDisplay: React.ReactNode = "$0.00";
            let changeDisplay: React.ReactNode = "0.00%";
            let valueProp: string | undefined;
            let descriptionProp: React.ReactNode | undefined;

            if (apiResult?.loading) {
              valueProp = "Loading...";
              descriptionProp = <span className="text-xs text-muted-foreground">Loading...</span>;
            } else if (apiResult?.error) {
              valueProp = undefined;
              descriptionProp = <span className="text-sm text-destructive flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {apiResult.error}</span>;
            } else if (apiResult?.c !== undefined && apiResult?.o !== undefined) {
              valueProp = `$${apiResult.c.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              const percentChange = calculateChangePercent(apiResult.c, apiResult.o);
              if (percentChange !== null) {
                const changeType = percentChange >= 0 ? 'up' : 'down';
                descriptionProp = (
                  <span className={cn("text-sm font-semibold", changeType === 'up' ? 'text-[hsl(var(--confirm-green))]' : 'text-destructive')}>
                    {changeType === 'up' ? <TrendingUp className="inline-block w-4 h-4 mr-1" /> : <TrendingDown className="inline-block w-4 h-4 mr-1" />}
                    {percentChange.toFixed(2)}%
                  </span>
                );
              } else {
                descriptionProp = <span className="text-xs text-muted-foreground">N/A</span>;
              }
            }

            return (
              <PlaceholderCard
                key={market.polygonTicker}
                title={market.label}
                icon={market.icon || Landmark}
                className={cn(
                  "transition-all duration-300 ease-in-out",
                  statusInfo.shadowClass
                )}
                value={valueProp}
                description={descriptionProp}
              >
                <div className="h-10 w-full my-2 bg-black/30 rounded-md flex items-center justify-center backdrop-blur-sm" data-ai-hint="mini trendline chart">
                  <span className="text-xs text-muted-foreground/50">Mini Trend</span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-xs text-muted-foreground mt-auto pt-2 border-t border-border/20 flex justify-between items-center">
                        <span>{statusInfo.statusText}</span>
                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{currentTimeEST.replace(/\s(AM|PM)/, '')}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-popover text-popover-foreground">
                      <p>{statusInfo.tooltipText}</p>
                      {apiResult?.c !== undefined && <p>Prev. Close: ${apiResult.c.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>}
                      {apiResult?.o !== undefined && <p>Prev. Open: ${apiResult.o.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </PlaceholderCard>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PlaceholderCard title="Why the Market Moved" icon={Cpu} className="lg:col-span-1 h-full">
          <p className="text-sm text-muted-foreground leading-relaxed font-serif mt-2">
            Market sentiment turned positive following the release of favorable inflation data, suggesting that price pressures may be easing. This led to a broad rally across major indices, particularly in growth-oriented sectors like technology and consumer discretionary. Investors are now keenly awaiting upcoming corporate earnings reports for further direction.
          </p>
        </PlaceholderCard>
        <PlaceholderCard title="Top News Stories" icon={Newspaper} className="lg:col-span-2 h-full">
          <ul className="space-y-4">
            {newsData.map((news) => (
              <li key={news.id} className="pb-3 border-b border-border/30 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-base font-semibold text-foreground">{news.headline}</h4>
                  <Badge variant="outline" className={cn("text-xs", getNewsSentimentBadgeClass(news.sentiment))}>
                    {news.sentiment}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{news.summary}</p>
                <p className="text-xs text-muted-foreground/70">{news.timestamp}</p>
              </li>
            ))}
          </ul>
        </PlaceholderCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 hidden lg:block"> {/* Spacer */} </div>
        <PlaceholderCard title="Ticker Lookup Tool" icon={Search} className="lg:col-span-3">
          <div className="flex space-x-2 mb-4">
            <Input
              type="text"
              placeholder="Enter stock ticker (e.g., AAPL)"
              className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:ring-primary"
              value={tickerQuery}
              onChange={(e) => setTickerQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTickerLookup()}
            />
            <Button onClick={handleTickerLookup} disabled={isLoadingTicker}>
              {isLoadingTicker ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          {isLoadingTicker && <p className="text-sm text-muted-foreground text-center">Fetching data...</p>}
          {tickerData && !isLoadingTicker && (
            <div className="space-y-6 text-sm">
              {/* Header Section */}
              <div className="pb-4 border-b border-border/30">
                <div className="flex items-start space-x-4 mb-3">
                  <Image src={tickerData.logo} alt={`${tickerData.companyName} logo`} width={48} height={48} className="rounded-md bg-muted p-1" data-ai-hint="company logo"/>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{tickerData.companyName}</h3>
                    <p className="text-muted-foreground">
                      {tickerData.symbol} • {tickerData.exchange}
                    </p>
                    <p className="text-xs text-muted-foreground/80">
                      {tickerData.sector} • {tickerData.industry}
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Price Section */}
              <div className="pb-4 border-b border-border/30">
                <div className="flex items-baseline space-x-2 mb-2">
                  <p className="text-4xl font-bold text-foreground">${tickerData.currentPrice}</p>
                  <p className={cn(
                    "text-lg font-semibold",
                    parseFloat(tickerData.priceChangeAmount) >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive"
                  )}>
                    {parseFloat(tickerData.priceChangeAmount) >= 0 ? <ArrowUpRight className="inline h-4 w-4 mb-1" /> : <ArrowDownRight className="inline h-4 w-4 mb-1" />}
                    {tickerData.priceChangeAmount} ({tickerData.priceChangePercent}%)
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div><strong className="text-muted-foreground">Prev. Close:</strong> ${tickerData.previousClose}</div>
                  <div><strong className="text-muted-foreground">Open:</strong> ${tickerData.openPrice}</div>
                  <div><strong className="text-muted-foreground">Day's Range:</strong> {tickerData.daysRange}</div>
                  <div><strong className="text-muted-foreground">52W Range:</strong> {tickerData.fiftyTwoWeekRange}</div>
                  <div><strong className="text-muted-foreground">Volume:</strong> {tickerData.volume}</div>
                  <div><strong className="text-muted-foreground">Avg. Volume:</strong> {tickerData.avgVolume}</div>
                </div>
              </div>

              {/* Valuation Metrics Section */}
              <div className="pb-4 border-b border-border/30">
                <h4 className="text-md font-semibold text-foreground mb-2">Valuation Metrics</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div><strong className="text-muted-foreground">Market Cap:</strong> {tickerData.marketCap}</div>
                  <div><strong className="text-muted-foreground">P/E Ratio (TTM):</strong> {tickerData.peRatio}</div>
                  <div><strong className="text-muted-foreground">EPS (TTM):</strong> ${tickerData.epsTTM}</div>
                  <div><strong className="text-muted-foreground">Div. Yield:</strong> {tickerData.dividendYield}</div>
                  <div><strong className="text-muted-foreground">Beta:</strong> {tickerData.beta}</div>
                </div>
              </div>

              {/* Key Dates Section */}
              <div className="pb-4 border-b border-border/30">
                <h4 className="text-md font-semibold text-foreground mb-2">Key Dates</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div><strong className="text-muted-foreground">Next Earnings:</strong> {tickerData.nextEarningsDate}</div>
                  <div><strong className="text-muted-foreground">Dividend Date:</strong> {tickerData.dividendDate}</div>
                </div>
              </div>

              {/* Optional: 1D Price Trend (Placeholder) */}
              <div className="pb-4 border-b border-border/30">
                <h4 className="text-md font-semibold text-foreground mb-2">1D Price Trend</h4>
                <div className="h-20 w-full bg-muted/30 rounded-md flex items-center justify-center" data-ai-hint="mini stock chart">
                  <span className="text-xs text-muted-foreground">Chart Placeholder</span>
                </div>
              </div>

              {/* Optional: Recent News (Placeholder) */}
              <div>
                <h4 className="text-md font-semibold text-foreground mb-2">Recent News</h4>
                <ul className="space-y-2 text-xs">
                  {tickerData.recentNews.map((newsItem: any) => (
                    <li key={newsItem.id} className="pb-1 border-b border-border/20 last:border-b-0">
                      <p className="text-foreground hover:text-primary cursor-pointer">{newsItem.headline}</p>
                      <p className={cn(
                        "text-xs",
                        newsItem.sentiment === 'positive' ? 'text-[hsl(var(--confirm-green))]' :
                        newsItem.sentiment === 'negative' ? 'text-destructive' :
                        'text-muted-foreground'
                      )}>
                        {newsItem.source} - {newsItem.sentiment}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </PlaceholderCard>
      </div>
    </main>
  );
}
