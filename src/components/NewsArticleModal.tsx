
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NewsArticle } from '@/types';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ExternalLink } from 'lucide-react';

interface NewsArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: NewsArticle[] | null;
  title: string;
}

export function NewsArticleModal({ isOpen, onClose, articles, title }: NewsArticleModalProps) {
  if (!isOpen || !articles) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-black/15 backdrop-blur-md border border-white/5 text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-headline text-primary">{title}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] p-1 pr-6">
          <div className="space-y-4 py-4 text-sm leading-relaxed">
            {articles.length > 0 ? (
              articles.map((article) => (
                <div key={article.id} className="pb-3 border-b border-border/10 last:border-b-0">
                  <DialogTitle className="text-base font-semibold text-foreground mb-1">{article.headline}</DialogTitle>
                  <div className="text-xs text-muted-foreground mb-2">
                    <span>{article.source}</span>
                    <span className="mx-2">|</span>
                    <span>{formatDistanceToNow(parseISO(article.timestamp), { addSuffix: true })}</span>
                  </div>
                  {article.content ? (
                    <div
                      className="space-y-4 text-sm"
                      dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                  ) : article.paragraphs ? (
                     article.paragraphs.map((p, i) => <p key={i} className="mb-2">{p}</p>)
                  ) : (
                    <p>{article.preview}</p>
                  )}
                  {article.link && article.link !== '#' && (
                    <Button variant="link" asChild className="p-0 h-auto mt-2 text-accent">
                      <a href={article.link} target="_blank" rel="noopener noreferrer">
                        Read Full Story <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No news articles to display.</p>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
