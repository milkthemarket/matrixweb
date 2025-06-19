
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { DollarSign, Briefcase, Landmark, NotebookText, Wallet, Settings } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import type { Account } from '@/types';

interface AccountSummaryCardProps {
  className?: string;
}

const DetailItem: React.FC<{ label: string; value: string | number; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex justify-between items-baseline">
    <span className="text-sm text-muted-foreground flex items-center">
      {icon && React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4 mr-2 text-muted-foreground/80"})}
      {label}:
    </span>
    <span className="text-sm font-semibold text-foreground">{value}</span>
  </div>
);

const getAccountIcon = (type?: Account['type']) => {
    if (!type) return <Wallet className="h-4 w-4 text-primary" />; // Fallback icon
    if (type === 'margin') return <Briefcase className="h-4 w-4 text-primary" />;
    if (type === 'ira') return <Landmark className="h-4 w-4 text-primary" />;
    if (type === 'paper') return <NotebookText className="h-4 w-4 text-primary" />;
    return <Wallet className="h-4 w-4 text-primary" />;
};


export function AccountSummaryCard({ className }: AccountSummaryCardProps) {
  const { selectedAccountId, setSelectedAccountId, accounts } = useOpenPositionsContext();
  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);

  return (
    <Card className={cn("shadow-none h-full", className)}>
      <CardHeader className="py-3 px-4">
        {/* Removed CardTitle and icon for "Active Account" */}
        <div className="flex items-center gap-2">
            <Label htmlFor="accountSelectGlobal" className="text-xs font-medium text-muted-foreground shrink-0 sr-only">
                Select Account:
            </Label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger id="accountSelectGlobal" className="flex-1 h-9 text-sm" aria-label="Select active account"> {/* Increased text size slightly */}
                {selectedAccount && getAccountIcon(selectedAccount.type)}
                <SelectValue placeholder="Select account..." />
            </SelectTrigger>
            <SelectContent>
                {accounts.map(acc => (
                <SelectItem key={acc.id} value={acc.id} className="text-sm"> {/* Increased text size slightly */}
                    <div className="flex items-center gap-2">
                    {getAccountIcon(acc.type)}
                    <span>{acc.label} ({acc.number})</span>
                    </div>
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2"> {/* Adjusted pt slightly */}
        {selectedAccount ? (
          <div className="space-y-2">
            <DetailItem
              label="Available to Trade"
              value={`$${selectedAccount.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={<DollarSign />}
            />
            <DetailItem
              label="Buying Power"
              value={`$${selectedAccount.buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={<DollarSign />}
            />
          </div>
        ) : (
          <div className="h-[68px] flex items-center justify-center text-sm text-muted-foreground">
            No account selected or found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

