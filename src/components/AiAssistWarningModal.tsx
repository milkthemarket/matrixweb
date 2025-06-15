
"use client";

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MiloAvatarIcon } from '@/components/icons/MiloAvatarIcon'; // Using Milo for AI related features

interface AiAssistWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dontShowAgain: boolean) => void;
}

export function AiAssistWarningModal({ isOpen, onClose, onConfirm }: AiAssistWarningModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleConfirm = () => {
    onConfirm(dontShowAgain);
  };

  React.useEffect(() => {
    if (isOpen) {
      setDontShowAgain(false);
    }
  }, [isOpen]);

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center text-foreground">
            <MiloAvatarIcon size={24} className="h-6 w-6 mr-2 text-primary" />
            AI Assisted Trade
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-2 text-muted-foreground space-y-2">
            <div>You're about to place a trade based on Milo's suggestion.</div>
            <div>Remember, AI Assist provides ideas, but you are fully responsible for managing and exiting this position.</div>
            <div className="font-medium text-foreground">Milo will not automatically manage this trade.</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <Checkbox 
            id="dontShowAgainAiAssistTrade" 
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(Boolean(checked))}
          />
          <Label htmlFor="dontShowAgainAiAssistTrade" className="text-sm font-normal text-muted-foreground cursor-pointer">
            Don’t show this message again
          </Label>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleConfirm} className="bg-primary hover:bg-primary/90 text-primary-foreground">Place Trade</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
