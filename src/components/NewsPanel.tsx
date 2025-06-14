
"use client";

import React from 'react';
import type { Stock, NewsArticle } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ExternalLink, Rss } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface NewsPanelProps {
  selectedStock: Stock | null;
  newsArticles: NewsArticle[];
}

export function NewsPanel({ selectedStock, newsArticles }: NewsPanelProps) {
  if (!selectedStock) {
    return (
        <Card className="mt-6 shadow-lg">
            <CardHeader>
                <CardTitle className="text-lg font-headline flex items-center text-muted-foreground">
                    <Rss className="mr-2 h-5 w-5" />
                    News Feed
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                    Select a stock from the screener to view its latest news.
                </p>
            </CardContent>
        </Card>
    );
  }

  const filteredArticles = newsArticles.filter(article => article.symbol === selectedStock.symbol);

  return (
    <Card className="mt-6 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-headline flex items-center">
          <Rss className="mr-2 h-5 w-5 text-primary" />
          News for {selectedStock.symbol}
        </CardTitle>
        <CardDescription>Latest updates and articles.</CardDescription>
      </CardHeader>
      <CardContent>
        {filteredArticles.length > 0 ? (
          <ScrollArea className="h-[250px] pr-3"> {/* Adjust height as needed */}
            <ul className="space-y-4">
              {filteredArticles.map(article => (
                <li key={article.id} className="pb-3 border-b border-border last:border-b-0">
                  <h3 className="font-semibold text-base mb-1">{article.headline}</h3>
                  <p className="text-xs text-muted-foreground mb-1">
                    {format(parseISO(article.timestamp), "MMM dd, yyyy HH:mm")} - {article.source}
                  </p>
                  <p className="text-sm mb-2">{article.preview}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="text-accent hover:text-accent-foreground border-accent"
                  >
                    <a href={article.link} target="_blank" rel="noopener noreferrer">
                      Read More <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No news articles found for {selectedStock.symbol}.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
