
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
import { X } from 'lucide-react';

interface LearningModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  paragraphs: string[];
}

export function LearningModuleModal({ isOpen, onClose, title, paragraphs }: LearningModuleModalProps) {
  if (!isOpen) {
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
            {paragraphs.map((paragraph, index) => (
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
