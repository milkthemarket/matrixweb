
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Rss } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, parseISO } from 'date-fns';
import type { NewsArticle } from '@/types';
import { NewsArticleModal } from './NewsArticleModal';

export const dummyNewsData: NewsArticle[] = [
  { id: 'n1', symbol: 'TSLA', headline: 'Tesla shares surge after earnings beat', sentiment: 'Positive', timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(), source: 'Reuters', preview: 'Tesla (TSLA) reported quarterly earnings that crushed analyst estimates, sending shares soaring in pre-market trading.', link: '#' },
  { id: 'n2', symbol: 'AAPL', headline: 'Apple delays new product launch to Q4', sentiment: 'Negative', timestamp: new Date(Date.now() - 1000 * 60 * 17).toISOString(), source: 'Bloomberg', preview: 'Sources familiar with the matter say Apple (AAPL) is facing supply chain hurdles, pushing back the launch of its much-anticipated AR headset.', link: '#' },
  { id: 'n3', symbol: 'MSFT', headline: 'Microsoft announces major AI partnership', sentiment: 'Positive', timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(), source: 'MarketWatch', preview: 'Microsoft has entered into a strategic partnership with a leading AI research firm to accelerate the development of next-generation AI models.', link: '#' },
  { id: 'n4', symbol: 'NVDA', headline: 'Nvidia faces chip supply chain issues', sentiment: 'Negative', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), source: 'WSJ', preview: 'Nvidia (NVDA) stock dipped after reports of ongoing supply chain constraints that could impact production of its popular GPUs.', link: '#' },
  { id: 'n5', symbol: 'AMZN', headline: 'Amazon maintains steady growth in Q2', sentiment: 'Neutral', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), source: 'Associated Press', preview: 'Amazon (AMZN) reported Q2 results in line with expectations, showing steady but not spectacular growth in its retail and cloud segments.', link: '#' },
  { id: 'n6', symbol: 'COIN', headline: 'Coinbase surges on crypto ETF approval rumors', sentiment: 'Positive', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), source: 'CoinDesk', preview: 'Shares of Coinbase (COIN) are up significantly as speculation mounts that the SEC is close to approving a spot Bitcoin ETF.', link: '#' },
  { id: 'n7', symbol: 'SPY', headline: 'Federal Reserve signals potential rate cuts later this year', sentiment: 'Positive', timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), source: 'FedWire', preview: 'In its latest meeting, the Federal Reserve hinted at the possibility of interest rate cuts before the end of the year, boosting market sentiment.', link: '#' },
  { id: 'n8', symbol: 'XOM', headline: 'Oil prices decline amid global demand concerns', sentiment: 'Negative', timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(), source: 'Reuters', preview: 'Crude oil futures fell as new economic data from China fueled concerns about slowing global demand for energy.', link: '#' },
  { id: 'n9', symbol: 'AAPL', headline: 'Apple Vision Pro demand exceeds expectations in early preorders.', sentiment: 'Positive', timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), source: 'TechCrunch', preview: 'Initial preorder numbers for the Apple Vision Pro have surpassed even the most optimistic Wall Street estimates, indicating strong early demand.', link: '#' },
  { id: 'n10', symbol: 'TSLA', headline: 'Tesla recalls Model 3 vehicles due to software glitch.', sentiment: 'Negative', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), source: 'NHTSA', preview: 'The National Highway Traffic Safety Administration announced a recall for certain Tesla Model 3 vehicles to address a software issue.', link: '#' },
  { id: 'n11', symbol: 'TPL', headline: 'Insider Trading Scandal Unfolds at Texas Pacific Land Corporation', sentiment: 'Negative', timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), source: 'SEC Filings', preview: 'The SEC has launched an investigation into unusual trading activity at Texas Pacific Land (TPL) preceding a major announcement.', link: '#' },
  { id: 'n12', symbol: 'TPL', headline: 'TPL launches AI-powered land appraisal tool, stock pops 3%', sentiment: 'Positive', timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(), source: 'Business Wire', preview: 'Texas Pacific Land (TPL) unveiled a new AI platform designed to revolutionize land appraisals, causing a jump in its stock price.', link: '#' },
  { id: 'n13', symbol: 'TPL', headline: 'Texas drought deepens, but TPL monetizes water rights in record Q2 earnings', sentiment: 'Positive', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), source: 'Texas Tribune', preview: 'In a surprising move, Texas Pacific Land Corporation reported record earnings from its water rights segment despite ongoing drought conditions.', link: '#' },
  { id: 'n14', symbol: 'TPL', headline: 'Short-seller targets TPL, calls land valuation model "voodoo math"', sentiment: 'Negative', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), source: 'Hindenburg Research', preview: 'A new report from a prominent short-seller alleges that Texas Pacific Land (TPL) uses questionable valuation models for its assets.', link: '#' },
];

const dummyArticlesContent: Record<string, { title: string; paragraphs?: string[]; content?: string; }> = {
  'n11': {
    title: "TPL News Story – Insider Trading Scandal Unfolds",
    content: `<p>In a bizarre twist of events, a mid-level manager at Texas Pacific Land Corporation (<span style="text-decoration: underline; color: #3b82f6;">NYSE: TPL</span>), known internally and in several Discord servers as <em>DJ 4Play</em>, has been found guilty of insider trading. The violation came to light after the manager leaked confidential trade information to a low-level employee at Travelers Insurance.</p>
    <p>The message, shared via Discord, included sensitive details about upcoming land deals and strategic partnerships not yet disclosed to the public. Unfortunately for <em>DJ 4Play</em> and the Travelers employee, the suspiciously timed trade triggered compliance alerts across two broker-dealers.</p>
    <p>The SEC confirmed it traced the trades back to a conversation that took place in Waco, TX. While the Travelers employee is currently under internal review, no formal charges have been filed yet. Texas Pacific Land has suspended <em>DJ 4Play</em> pending further disciplinary action and announced plans to overhaul internal communication protocols — including a ban on non-secure chat apps.</p>
    <p style="color: #dc2626;"><strong>In an internal memo, company leadership called the incident "deeply embarrassing" and a "cautionary tale about how casually shared information can spiral into serious legal exposure."</strong></p>`
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
  const [selectedArticle, setSelectedArticle] = useState<{
    articles: NewsArticle[];
    title: string;
  } | null>(null);

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

  const handleNewsItemClick = (item: NewsArticle) => {
    const articleContent = dummyArticlesContent[item.id];
    if (articleContent) {
      const fullArticle: NewsArticle = {
        ...item,
        headline: articleContent.title,
        ...articleContent,
      };
      setSelectedArticle({
        articles: [fullArticle],
        title: item.headline
      });
      setIsModalOpen(true);
    } else {
      onTickerSelect(item.symbol);
    }
  };

  const getSentimentBadgeClass = (sentiment: NewsArticle['sentiment']) => {
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
        articles={selectedArticle?.articles || null}
        title={selectedArticle?.title || ''}
      />
    </>
  );
}
