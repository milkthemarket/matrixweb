
"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Mail, CheckCircle2, XCircle, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AlertMethodsModal({ isOpen, onClose }: AlertMethodsModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  
  // Placeholder verification status
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const handleSaveChanges = () => {
    console.log("Saving alert methods:", { phoneNumber, emailAddress });
    // In a real app, you'd save this to Firebase/backend
    // and potentially trigger verification flows.
    onClose(); // Close modal after saving
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-foreground">
            <Settings className="mr-2 h-5 w-5 text-primary" />
            Manage Alert Contact Methods
          </DialogTitle>
          <DialogDescription>
            Add or update your phone number and email for SMS and email alerts.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Phone Number Input */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-sm font-medium text-foreground flex items-center">
              <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
              Phone Number
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+1 (555) 555-5555"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-transparent flex-1"
              />
              {/* Placeholder verification status */}
              {phoneNumber && (
                isPhoneVerified ? (
                  <CheckCircle2 className="h-5 w-5 text-[hsl(var(--confirm-green))]" title="Verified" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" title="Not Verified" />
                )
              )}
            </div>
            {!isPhoneVerified && phoneNumber && (
                <p className="text-xs text-muted-foreground">
                    Phone number not verified. A verification code might be sent.
                </p>
            )}
          </div>

          {/* Email Address Input */}
          <div className="space-y-2">
            <Label htmlFor="emailAddress" className="text-sm font-medium text-foreground flex items-center">
              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
              Email Address
            </Label>
             <div className="flex items-center space-x-2">
              <Input
                id="emailAddress"
                type="email"
                placeholder="you@example.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="bg-transparent flex-1"
              />
              {/* Placeholder verification status */}
              {emailAddress && (
                isEmailVerified ? (
                  <CheckCircle2 className="h-5 w-5 text-[hsl(var(--confirm-green))]" title="Verified" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" title="Not Verified" />
                )
              )}
            </div>
             {!isEmailVerified && emailAddress && (
                <p className="text-xs text-muted-foreground">
                    Email address not verified. Check your inbox for a verification link.
                </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSaveChanges}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
