
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
import { MiloAvatarIcon } from '@/components/icons/MiloAvatarIcon';

interface AiAutoTradingWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dontShowAgain: boolean) => void;
}

export function AiAutoTradingWarningModal({ isOpen, onClose, onConfirm }: AiAutoTradingWarningModalProps) {
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
            Autopilot Enabled
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-2 text-muted-foreground space-y-2">
            <span className="block">Milo (the AI bot) will now place and exit trades automatically for you in Autopilot mode, based on your preset rules and risk tolerance.</span>
            <span className="block">Trading will continue until you turn off this feature.</span>
            <span className="block font-medium text-foreground">Please monitor your account regularly.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <Checkbox
            id="dontShowAgainAiAutoTrade"
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(Boolean(checked))}
          />
          <Label htmlFor="dontShowAgainAiAutoTrade" className="text-sm font-normal text-muted-foreground cursor-pointer">
            Don’t show this message again
          </Label>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleConfirm} className="bg-primary hover:bg-primary/90 text-primary-foreground">OK, I Understand</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
