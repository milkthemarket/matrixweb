
"use client"; 

import * as React from 'react';
import { Users, DollarSign, TrendingUp, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { PlaceholderCard } from '@/components/dashboard/PlaceholderCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PageHeader } from "@/components/PageHeader";

const metricCardsData = [
  { 
    title: "Total Active Clients", 
    value: "238", 
    description: <span className="text-[hsl(var(--confirm-green))] text-sm">+5 new clients this month</span>, 
    icon: Users 
  },
  { 
    title: "Average AUM per Client", 
    value: "$51,872", 
    icon: DollarSign 
  },
  { 
    title: "Client Retention Rate", 
    value: "92%", 
    description: <span className="text-sm">Over the last 12 months</span>, 
    icon: TrendingUp 
  },
  { 
    title: "New vs. Lost Clients (QTD)", 
    value: "15 / 3", 
    description: <span className="text-sm">New clients / Lost clients</span>, 
    icon: ArrowRightLeft 
  },
];

const topClientsByAumData = [
  { rank: 1, name: "Client Alpha", aum: 4200000, aumDisplay: "$4.2M" },
  { rank: 2, name: "Client Bravo", aum: 3600000, aumDisplay: "$3.6M" },
  { rank: 3, name: "Client Charlie", aum: 3100000, aumDisplay: "$3.1M" },
  { rank: 4, name: "Client Delta", aum: 2800000, aumDisplay: "$2.8M" },
  { rank: 5, name: "Client Echo", aum: 2500000, aumDisplay: "$2.5M" },
  { rank: 6, name: "Client Foxtrot", aum: 2200000, aumDisplay: "$2.2M" },
  { rank: 7, name: "Client Golf", aum: 1900000, aumDisplay: "$1.9M" },
  { rank: 8, name: "Client Hotel", aum: 1600000, aumDisplay: "$1.6M" },
  { rank: 9, name: "Client India", aum: 1300000, aumDisplay: "$1.3M" },
  { rank: 10, name: "Client Juliett", aum: 1000000, aumDisplay: "$1.0M" },
];

const maxAum = Math.max(...topClientsByAumData.map(client => client.aum), 0);

interface Client65PlusData {
  id: string;
  clientName: string;
  age: number;
  aumDisplay: string;
  primaryBeneficiaryName: string;
  primaryBeneficiaryAge: number;
  relationshipDepthPercent: number;
  beneficiaryIsClient: boolean;
  multipleChildBeneficiaries: boolean;
}

const topClients65PlusWithChildBeneficiariesData: Client65PlusData[] = [
  { id: "c1", clientName: "Eleanor Vance", age: 72, aumDisplay: "$2.4M", primaryBeneficiaryName: "Michael Vance", primaryBeneficiaryAge: 34, relationshipDepthPercent: 85, beneficiaryIsClient: false, multipleChildBeneficiaries: true },
  { id: "c2", clientName: "Arthur Sterling", age: 68, aumDisplay: "$1.8M", primaryBeneficiaryName: "Sophia Sterling", primaryBeneficiaryAge: 29, relationshipDepthPercent: 70, beneficiaryIsClient: true, multipleChildBeneficiaries: false },
  { id: "c3", clientName: "Beatrice Holloway", age: 75, aumDisplay: "$3.1M", primaryBeneficiaryName: "James Holloway", primaryBeneficiaryAge: 40, relationshipDepthPercent: 95, beneficiaryIsClient: false, multipleChildBeneficiaries: true },
  { id: "c4", clientName: "Clarence Bellwether", age: 66, aumDisplay: "$1.2M", primaryBeneficiaryName: "Olivia Bellwether", primaryBeneficiaryAge: 31, relationshipDepthPercent: 60, beneficiaryIsClient: true, multipleChildBeneficiaries: false },
  { id: "c5", clientName: "Dorothy Finch", age: 80, aumDisplay: "$2.9M", primaryBeneficiaryName: "William Finch", primaryBeneficiaryAge: 45, relationshipDepthPercent: 75, beneficiaryIsClient: false, multipleChildBeneficiaries: false },
];

interface AccountWithoutBeneficiary {
  id: string;
  rank: number;
  clientName: string;
  age: number;
  accountType: string;
  aumDisplay: string;
  isHighAum: boolean;
}

const accountsWithoutBeneficiaryData: AccountWithoutBeneficiary[] = [
  { id: "awb1", rank: 1, clientName: "Client Kappa", age: 72, accountType: "Roth IRA", aumDisplay: "$2.1M", isHighAum: true },
  { id: "awb2", rank: 2, clientName: "Client Lambda", age: 66, accountType: "Joint Account", aumDisplay: "$1.8M", isHighAum: true },
  { id: "awb3", rank: 3, clientName: "Client Mu", age: 58, accountType: "Traditional IRA", aumDisplay: "$950K", isHighAum: false },
  { id: "awb4", rank: 4, clientName: "Client Nu", age: 75, accountType: "Brokerage", aumDisplay: "$1.5M", isHighAum: true },
  { id: "awb5", rank: 5, clientName: "Client Xi", age: 69, accountType: "SEP IRA", aumDisplay: "$750K", isHighAum: false },
  { id: "awb6", rank: 6, clientName: "Client Omicron", age: 80, accountType: "Trust Account", aumDisplay: "$1.2M", isHighAum: true },
  { id: "awb7", rank: 7, clientName: "Client Pi", age: 62, accountType: "401(k) Rollover", aumDisplay: "$600K", isHighAum: false },
  { id: "awb8", rank: 8, clientName: "Client Rho", age: 70, accountType: "IRA", aumDisplay: "$550K", isHighAum: false },
  { id: "awb9", rank: 9, clientName: "Client Sigma", age: 67, accountType: "Brokerage", aumDisplay: "$1.1M", isHighAum: true },
  { id: "awb10", rank: 10, clientName: "Client Tau", age: 78, accountType: "Annuity", aumDisplay: "$450K", isHighAum: false },
];

export default function ClientAnalyticsPage() {
  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Client Analytics" />
      <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
      
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {metricCardsData.map((card, index) => (
            <PlaceholderCard
              key={index}
              title={card.title}
              value={card.value}
              description={card.description}
              icon={card.icon}
            />
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <PlaceholderCard title="Top 10 Clients by AUM">
            <div className="space-y-3 mt-1">
              {topClientsByAumData.map((client) => {
                const barWidthPercentage = maxAum > 0 ? (client.aum / maxAum) * 100 : 0;
                return (
                  <div key={client.rank} className="flex items-center justify-between py-2 border-b border-border/10 last:border-b-0">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-muted-foreground w-7 text-right mr-2">{client.rank}.</span>
                      <span className="text-base text-foreground truncate" title={client.name}>{client.name}</span>
                    </div>
                    <div className="flex items-center gap-3 w-2/5 sm:w-1/2">
                      <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-purple-400 rounded-full" 
                          style={{ width: `${barWidthPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-foreground min-w-[50px] text-right">{client.aumDisplay}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </PlaceholderCard>
          <PlaceholderCard title="Top 10 Accounts Without a Beneficiary" icon={AlertTriangle} iconClassName="text-yellow-400">
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead className="text-center">Age</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead className="text-right">AUM</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountsWithoutBeneficiaryData.map((account) => (
                    <TableRow key={account.id} className="hover:bg-muted/20 cursor-pointer">
                      <TableCell className="text-center font-medium">{account.rank}</TableCell>
                      <TableCell>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                              <div className="flex items-center">
                                {account.isHighAum && (
                                  <AlertTriangle className="h-4 w-4 text-destructive mr-2 shrink-0" />
                                )}
                                {account.clientName}
                              </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-popover text-popover-foreground">
                            <p>Tap to initiate beneficiary outreach task</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">{account.age}</TableCell>
                      <TableCell className="text-muted-foreground">{account.accountType}</TableCell>
                      <TableCell className="text-right font-semibold">{account.aumDisplay}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TooltipProvider>
            <p className="mt-4 text-xs text-muted-foreground">
              ⚠️ High AUM accounts are flagged. Top accounts missing beneficiary info, ranked by AUM.
            </p>
          </PlaceholderCard>
        </div>

        <PlaceholderCard title="Top Clients Age 65+ with Children as Beneficiaries" icon={Users}>
          <div className="space-y-4 mt-2">
            {topClients65PlusWithChildBeneficiariesData.map((client) => (
              <div key={client.id} className="p-3 rounded-md border border-border/20 hover:bg-muted/10 transition-colors duration-150 ease-out">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={cn("text-md font-semibold text-foreground", client.multipleChildBeneficiaries && "text-[hsl(var(--confirm-green))]")}>
                    {client.clientName} <span className="text-sm font-normal text-muted-foreground">({client.age})</span>
                  </h4>
                  <span className="text-sm font-semibold text-primary">{client.aumDisplay}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  Beneficiary: {client.primaryBeneficiaryName} ({client.primaryBeneficiaryAge})
                  {!client.beneficiaryIsClient && (
                    <Badge variant="outline" className="ml-2 text-xs bg-yellow-500/10 border-yellow-500/50 text-yellow-400">Not Onboarded</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Relationship Depth: <span className="font-semibold text-primary">{client.relationshipDepthPercent}%</span>
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm">
              Start Next-Gen Outreach
            </Button>
          </div>
        </PlaceholderCard>
      </div>
    </div>
  );
}
