
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Rss } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, parseISO } from 'date-fns';
import type { Stock } from '@/types';

interface NewsItem {
  id: string;
  symbol: string;
  headline: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  timestamp: string; // ISO string format for date-fns
}

const dummyNewsData: NewsItem[] = [
  { id: 'n1', symbol: 'TSLA', headline: 'Tesla shares surge after earnings beat', sentiment: 'Positive', timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString() },
  { id: 'n2', symbol: 'AAPL', headline: 'Apple delays new product launch to Q4', sentiment: 'Negative', timestamp: new Date(Date.now() - 1000 * 60 * 17).toISOString() },
  { id: 'n3', symbol: 'MSFT', headline: 'Microsoft announces major AI partnership', sentiment: 'Positive', timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString() },
  { id: 'n4', symbol: 'NVDA', headline: 'Nvidia faces chip supply chain issues', sentiment: 'Negative', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
  { id: 'n5', symbol: 'AMZN', headline: 'Amazon maintains steady growth in Q2', sentiment: 'Neutral', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: 'n6', symbol: 'COIN', headline: 'Coinbase surges on crypto ETF approval rumors', sentiment: 'Positive', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: 'n7', symbol: 'SPY', headline: 'Federal Reserve signals potential rate cuts later this year', sentiment: 'Positive', timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString() },
  { id: 'n8', symbol: 'XOM', headline: 'Oil prices decline amid global demand concerns', sentiment: 'Negative', timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString() },
  { id: 'n9', symbol: 'AAPL', headline: 'Apple Vision Pro demand exceeds expectations in early preorders.', sentiment: 'Positive', timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
  { id: 'n10', symbol: 'TSLA', headline: 'Tesla recalls Model 3 vehicles due to software glitch.', sentiment: 'Negative', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
];

interface NewsCardProps {
  className?: string;
  selectedTickerSymbol: string | null;
  onTickerSelect: (symbol: string) => void;
}

export function NewsCard({ className, selectedTickerSymbol, onTickerSelect }: NewsCardProps) {
  const [clientTimestamps, setClientTimestamps] = useState<Record<string, string>>({});

  const filteredNews = React.useMemo(() => {
    if (!selectedTickerSymbol) {
      return dummyNewsData.sort((a,b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime()).slice(0, 10); // Show latest 10 if no ticker
    }
    return dummyNewsData.filter(item => item.symbol.toUpperCase() === selectedTickerSymbol.toUpperCase())
                       .sort((a,b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime());
  }, [selectedTickerSymbol]);

  useEffect(() => {
    const newTimestamps: Record<string, string> = {};
    filteredNews.forEach(item => {
      try {
        newTimestamps[item.id] = formatDistanceToNow(parseISO(item.timestamp), { addSuffix: true });
      } catch (e) {
        console.error("Error parsing news timestamp:", item.timestamp, e);
        newTimestamps[item.id] = "Error";
      }
    });
    setClientTimestamps(newTimestamps);
  }, [filteredNews]);


  const getSentimentBadgeClass = (sentiment: NewsItem['sentiment']) => {
    switch (sentiment) {
      case 'Positive': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Negative': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Neutral':
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className={cn("shadow-none flex flex-col", className)}>
      <CardHeader className="py-2 px-3 border-b border-border/[.08]">
        <CardTitle className="text-sm font-headline flex items-center text-foreground">
          <Rss className="mr-1.5 h-3.5 w-3.5 text-primary" />
          News {selectedTickerSymbol ? `for ${selectedTickerSymbol}` : '(All Market)'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full p-2">
          {filteredNews.length > 0 ? (
            <ul className="space-y-2">
              {filteredNews.map(item => (
                <li key={item.id} className="pb-1.5 border-b border-border/[.05] last:border-b-0">
                  <button
                    onClick={() => onTickerSelect(item.symbol)}
                    className="w-full text-left hover:bg-white/5 p-1 rounded-md transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    aria-label={`View news for ${item.symbol}: ${item.headline}`}
                  >
                    <div className="flex justify-between items-start gap-1.5 mb-0.5">
                      <div className="flex-1">
                        <span className="font-semibold text-primary text-xs mr-1">{item.symbol}:</span>
                        <span className="text-xs text-foreground leading-tight">{item.headline}</span>
                      </div>
                      <Badge variant="outline" className={cn("text-[10px] py-0 px-1 h-auto whitespace-nowrap", getSentimentBadgeClass(item.sentiment))}>
                        {item.sentiment}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{clientTimestamps[item.id] || 'Calculating...'}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-muted-foreground text-center">
                No news found {selectedTickerSymbol ? `for ${selectedTickerSymbol}` : 'at the moment'}.
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

    