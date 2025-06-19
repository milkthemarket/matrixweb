
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { DollarSign, Briefcase, Landmark, NotebookText, Wallet } from "lucide-react";
import { cn } from '@/lib/utils';

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
    if (!type) return <Briefcase className="h-4 w-4 text-primary" />;
    if (type === 'margin') return <Briefcase className="h-4 w-4 text-primary" />;
    if (type === 'ira') return <Landmark className="h-4 w-4 text-primary" />;
    if (type === 'paper') return <NotebookText className="h-4 w-4 text-primary" />;
    return <Briefcase className="h-4 w-4 text-primary" />;
};


export function AccountSummaryCard({ className }: AccountSummaryCardProps) {
  const { selectedAccountId, accounts } = useOpenPositionsContext();
  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);

  return (
    <Card className={cn("shadow-none", className)}>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base font-headline flex items-center text-foreground">
            {selectedAccount ? getAccountIcon(selectedAccount.type) : <Wallet className="h-4 w-4 text-primary" />}
            <span className="ml-2">{selectedAccount ? `${selectedAccount.label} (${selectedAccount.number})` : "Account Summary"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-1">
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
          <div className="h-[68px] flex items-center justify-center text-sm text-muted-foreground"> {/* Adjusted height to match approx 2 lines of detail */}
            No account selected or found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
