
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Rss } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsItem {
  id: string;
  headline: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
}

const dummyNewsData: NewsItem[] = [
  { id: 'n1', headline: 'Tesla shares surge after earnings beat', sentiment: 'Positive' },
  { id: 'n2', headline: 'Apple delays new product launch to Q4', sentiment: 'Negative' },
  { id: 'n3', headline: 'Microsoft announces major AI partnership', sentiment: 'Positive' },
  { id: 'n4', headline: 'Nvidia faces chip supply chain issues', sentiment: 'Negative' },
  { id: 'n5', headline: 'Amazon maintains steady growth in Q2', sentiment: 'Neutral' },
  { id: 'n6', headline: 'Coinbase surges on crypto ETF approval rumors', sentiment: 'Positive' },
  { id: 'n7', headline: 'Federal Reserve signals potential rate cuts later this year', sentiment: 'Positive' },
  { id: 'n8', headline: 'Oil prices decline amid global demand concerns', sentiment: 'Negative' },
];

interface NewsCardProps {
  className?: string;
}

export function NewsCard({ className }: NewsCardProps) {
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
    <Card className={cn("shadow-lg flex flex-col", className)}>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base font-headline flex items-center text-foreground">
          <Rss className="mr-2 h-4 w-4 text-primary" />
          Latest News
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4 pt-0">
          <ul className="space-y-3">
            {dummyNewsData.map(item => (
              <li key={item.id} className="pb-2 border-b border-border/[.08] last:border-b-0">
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm text-foreground leading-snug flex-1">{item.headline}</p>
                  <Badge variant="outline" className={cn("text-xs py-0.5 px-1.5 h-auto whitespace-nowrap", getSentimentBadgeClass(item.sentiment))}>
                    {item.sentiment}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
