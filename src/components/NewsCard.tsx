
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Rss } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, parseISO } from 'date-fns';
import type { NewsItem } from '@/types';
import { NewsArticleModal } from './NewsArticleModal';

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
  { id: 'n11', symbol: 'TPL', headline: 'TPL mid-manager caught insider trading after group chat blunder', sentiment: 'Negative', timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString() },
  { id: 'n12', symbol: 'TPL', headline: 'TPL launches AI-powered land appraisal tool, stock pops 3%', sentiment: 'Positive', timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString() },
  { id: 'n13', symbol: 'TPL', headline: 'Texas drought deepens, but TPL monetizes water rights in record Q2 earnings', sentiment: 'Positive', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
  { id: 'n14', symbol: 'TPL', headline: 'Short-seller targets TPL, calls land valuation model ‘voodoo math’', sentiment: 'Negative', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
];

const dummyArticlesContent: Record<string, { title: string; paragraphs: string[] }> = {
  'n11': {
    title: "TPL’s DJ 4Play Busted: Insider Info Spilled in Group Chat Blunder",
    paragraphs: [
      "In a bizarre twist of events, a mid-level manager at Texas Pacific Land Corporation (NYSE: TPL), known internally and in several Discord servers as 'DJ 4Play,' has been found guilty of insider trading. The violation came to light after the manager accidentally sent confidential trade information to a group chat named 'Dawg Pound' — originally intended as a space for memes, fantasy football talk, and barbecue plans.",
      "The leaked message included sensitive details about upcoming land deals and strategic partnerships that had not yet been disclosed to the public. Unfortunately for DJ 4Play, among the Dawg Pound participants was a low-level employee at Travelers Insurance who acted on the information, executing a suspiciously timed trade that triggered compliance alerts across two broker-dealers.",
      "The SEC confirmed it traced the trades back to the conversation in the Dawg Pound. The Travelers employee is now under internal review, though no formal charges have been filed yet. Texas Pacific Land has suspended DJ 4Play pending further disciplinary action and has vowed to rework its communication policies — including banning non-secure chat apps for internal discussion. In an internal memo, leadership described the incident as 'deeply embarrassing' and a 'cautionary tale for anyone mixing memes and material non-public info.'"
    ]
  },
  'n12': {
    title: "TPL Launches AI-Powered Land Appraisal Tool",
    paragraphs: ["Texas Pacific Land Corporation today announced the launch of its new proprietary AI-powered land appraisal tool, causing the stock to pop 3% in early trading.", "The tool leverages satellite imagery and historical data to provide real-time valuation estimates, a move that analysts say could revolutionize the land management industry.", "Further details about the technology and its market impact will be released next week."]
  },
  'n13': {
    title: "TPL Monetizes Water Rights Amidst Drought",
    paragraphs: ["Despite deepening drought conditions in Texas, TPL has successfully monetized its extensive water rights, contributing to record Q2 earnings.", "The company reported a 25% increase in revenue from its water segment, selling surplus water to agricultural and industrial clients.", "The company's innovative approach to water management is being hailed as a model for the industry."]
  },
  'n14': {
    title: "Short-Seller Targets TPL",
    paragraphs: ["A prominent short-seller has targeted Texas Pacific Land, calling its land valuation model 'voodoo math' in a scathing report released this morning.", "The report alleges that TPL's valuation methods are opaque and do not reflect current market realities, creating an unsustainable bubble.", "TPL's stock has seen increased volatility following the report's publication, dropping 8% before recovering slightly."]
  }
};


interface NewsCardProps {
  className?: string;
  selectedTickerSymbol: string | null;
  onTickerSelect: (symbol: string) => void;
}

export function NewsCard({ className, selectedTickerSymbol, onTickerSelect }: NewsCardProps) {
  const [clientTimestamps, setClientTimestamps] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<{ title: string; paragraphs: string[]; sentiment: NewsItem['sentiment']; timestamp: string; } | null>(null);

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

  const handleNewsItemClick = (item: NewsItem) => {
    const articleContent = dummyArticlesContent[item.id];
    if (articleContent) {
      setSelectedArticle({
        ...articleContent,
        sentiment: item.sentiment,
        timestamp: clientTimestamps[item.id] || new Date(item.timestamp).toLocaleString()
      });
      setIsModalOpen(true);
    } else {
      onTickerSelect(item.symbol);
    }
  };

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
    <>
      <div className={cn("h-full flex flex-col", className)}>
        <div className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full p-2">
            {filteredNews.length > 0 ? (
              <ul className="space-y-2">
                {filteredNews.map(item => (
                  <li key={item.id} className="pb-1.5 border-b border-border/[.05] last:border-b-0">
                    <button
                      onClick={() => handleNewsItemClick(item)}
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
        </div>
      </div>
       <NewsArticleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        article={selectedArticle}
      />
    </>
  );
}
