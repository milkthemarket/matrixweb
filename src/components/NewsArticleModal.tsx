
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
import type { NewsItem } from '@/types';

interface NewsArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    title: string;
    paragraphs: string[];
    sentiment: NewsItem['sentiment'];
    timestamp: string;
  } | null;
}

export function NewsArticleModal({ isOpen, onClose, article }: NewsArticleModalProps) {
  if (!isOpen || !article) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-black/15 backdrop-blur-md border border-white/5 text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-headline text-primary">{article.title}</DialogTitle>
          <div className="text-xs text-muted-foreground pt-1">
            <span>Published: {article.timestamp}</span>
            <span className="mx-2">|</span>
            <span>Sentiment: {article.sentiment}</span>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] p-1 pr-6">
          <div className="space-y-4 py-4 text-sm leading-relaxed">
            {article.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
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
