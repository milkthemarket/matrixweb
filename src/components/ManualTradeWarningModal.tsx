
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
import { AlertTriangle } from 'lucide-react';

interface ManualTradeWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dontShowAgain: boolean) => void;
}

export function ManualTradeWarningModal({ isOpen, onClose, onConfirm }: ManualTradeWarningModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleConfirm = () => {
    onConfirm(dontShowAgain);
  };

  // Reset checkbox state when modal is closed/reopened
  React.useEffect(() => {
    if (isOpen) {
      setDontShowAgain(false);
    }
  }, [isOpen]);

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-400" />
            Manual Trade Warning
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-2">
            You are placing a manual trade. This means Milo will not automatically manage or exit this position for you. Please ensure you have your own risk management strategy in place.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <Checkbox 
            id="dontShowAgainManualTrade" 
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(Boolean(checked))}
          />
          <Label htmlFor="dontShowAgainManualTrade" className="text-sm font-normal text-muted-foreground cursor-pointer">
            Don’t show this warning again
          </Label>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleConfirm}>Place Trade</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
