
"use client"; // Required for Tooltip and potential future interactions

import * as React from 'react';
import { Users, DollarSign, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PlaceholderCard } from '@/components/dashboard/PlaceholderCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";

interface EngagementInfo {
  level: "High" | "Medium" | "Low";
  className: string;
}

const getEngagementInfo = (logins: number): EngagementInfo => {
  if (logins >= 15) {
    return { level: "High", className: "text-primary font-semibold" };
  } else if (logins >= 5) {
    return { level: "Medium", className: "text-yellow-400" };
  } else {
    return { level: "Low", className: "text-muted-foreground" };
  }
};

const parseFloatPercentage = (value: string): number => {
  return parseFloat(value.replace('%', ''));
};

export default function ConversionAnalyticsPage() {
  const metricCardsData = [
    {
      title: "Total Non-Managed Accounts",
      value: "245",
      description: "Number of non-managed accounts",
      icon: Users
    },
    {
      title: "Total AUM in Non-Managed",
      value: "$82,000,000",
      description: "Assets not enrolled in managed programs",
      icon: DollarSign
    },
    {
      title: "Estimated Lost Revenue (YTD)",
      value: "$162,000",
      description: "Estimated advisory revenue not earned YTD",
      icon: TrendingDown
    },
  ];

  const topHouseholdsByNonManagedAUMData = [
    { householdName: 'Rodriguez LLC', accounts: 3, managedAUM: '$0', nonManagedAUM: '$2.1M', percentInManaged: '0%', potentialUpside: '$21,000 (est.)' },
    { householdName: 'Smith Family Trust', accounts: 2, managedAUM: '$500K', nonManagedAUM: '$1.8M', percentInManaged: '21.7%', potentialUpside: '$18,000 (est.)' },
    { householdName: 'Chen Holdings', accounts: 5, managedAUM: '$1.2M', nonManagedAUM: '$1.5M', percentInManaged: '44.4%', potentialUpside: '$15,000 (est.)' },
    { householdName: 'Patel Group', accounts: 1, managedAUM: '$0', nonManagedAUM: '$1.3M', percentInManaged: '0%', potentialUpside: '$13,000 (est.)' },
    { householdName: 'Williams Partners', accounts: 4, managedAUM: '$2.5M', nonManagedAUM: '$1.1M', percentInManaged: '69.4%', potentialUpside: '$11,000 (est.)' },
  ];

  const topHouseholdsOutperformanceData = [
    { householdName: 'Thompson Wealth', accounts: 7, managedAUM: '$4.1M', nonManagedAUM: '$1.2M', managedYTD: '12.5%', managedYTDPrev: '10.2%', nonManagedYTD: '6.1%', outperformance: '6.4%', nxiLoginsLast30Days: 18, avgSessionDuration: "7m 22s", lastLoginDaysAgo: 2 },
    { householdName: 'Garcia Investments', accounts: 3, managedAUM: '$2.5M', nonManagedAUM: '$800K', managedYTD: '10.2%', managedYTDPrev: '10.5%', nonManagedYTD: '5.5%', outperformance: '4.7%', nxiLoginsLast30Days: 7, avgSessionDuration: "5m 10s", lastLoginDaysAgo: 5 },
    { householdName: 'Lee Capital', accounts: 5, managedAUM: '$6.0M', nonManagedAUM: '$1.5M', managedYTD: '11.8%', managedYTDPrev: '11.0%', nonManagedYTD: '7.0%', outperformance: '4.8%', nxiLoginsLast30Days: 2, avgSessionDuration: "3m 05s", lastLoginDaysAgo: 14 },
    { householdName: 'Davis & Co.', accounts: 2, managedAUM: '$1.8M', nonManagedAUM: '$500K', managedYTD: '9.5%', managedYTDPrev: '9.8%', nonManagedYTD: '4.2%', outperformance: '5.3%', nxiLoginsLast30Days: 22, avgSessionDuration: "9m 45s", lastLoginDaysAgo: 1 },
    { householdName: 'Miller Trust', accounts: 6, managedAUM: '$3.3M', nonManagedAUM: '$950K', managedYTD: '13.1%', managedYTDPrev: '12.5%', nonManagedYTD: '6.8%', outperformance: '6.3%', nxiLoginsLast30Days: 4, avgSessionDuration: "2m 30s", lastLoginDaysAgo: 25 },
  ];

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Conversion Analytics" />
      <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

        <PlaceholderCard title="Top Households by Non-Managed AUM">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Household Name</TableHead>
                <TableHead className="text-right"># of Accounts</TableHead>
                <TableHead className="text-right">Managed AUM</TableHead>
                <TableHead className="text-right">Non-Managed AUM</TableHead>
                <TableHead className="text-right">% in Managed</TableHead>
                <TableHead className="text-right">Potential Upside</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topHouseholdsByNonManagedAUMData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.householdName}</TableCell>
                  <TableCell className="text-right">{row.accounts}</TableCell>
                  <TableCell className="text-right">{row.managedAUM}</TableCell>
                  <TableCell className="text-right">{row.nonManagedAUM}</TableCell>
                  <TableCell className="text-right">{row.percentInManaged}</TableCell>
                  <TableCell className="text-right text-[hsl(var(--confirm-green))]">{row.potentialUpside}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-4 text-xs text-muted-foreground">
            Top 5 households ranked by non-managed AUM. Estimated potential upside based on a hypothetical 1% advisory fee.
          </p>
        </PlaceholderCard>

        <PlaceholderCard title="Top Households: Managed Outperformance vs. Non-Managed (YTD)">
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Household Name</TableHead>
                  <TableHead className="text-right"># of Accts</TableHead>
                  <TableHead className="text-right">Managed AUM</TableHead>
                  <TableHead className="text-right">Non-Managed AUM</TableHead>
                  <TableHead className="text-right">Managed YTD %</TableHead>
                  <TableHead className="text-right">Non-Managed YTD %</TableHead>
                  <TableHead className="text-right">Outperformance %</TableHead>
                  <TableHead className="text-center">Client Engagement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topHouseholdsOutperformanceData.map((row, index) => {
                  const engagement = getEngagementInfo(row.nxiLoginsLast30Days);
                  const currentYTD = parseFloatPercentage(row.managedYTD);
                  const prevYTD = parseFloatPercentage(row.managedYTDPrev);
                  const trendUp = currentYTD > prevYTD;

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.householdName}</TableCell>
                      <TableCell className="text-right">{row.accounts}</TableCell>
                      <TableCell className="text-right">{row.managedAUM}</TableCell>
                      <TableCell className="text-right">{row.nonManagedAUM}</TableCell>
                      <TableCell className="text-right text-[hsl(var(--confirm-green))]">
                        <div className="flex items-center justify-end gap-1">
                          <span>{row.managedYTD}</span>
                          {trendUp ? (
                            <ArrowUpRight className="text-green-500 h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="text-destructive h-4 w-4" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{row.nonManagedYTD}</TableCell>
                      <TableCell className="text-right text-[hsl(var(--confirm-green))]">{row.outperformance}</TableCell>
                      <TableCell className="text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className={cn("cursor-default", engagement.className)}>
                              {row.nxiLoginsLast30Days} logins ({engagement.level})
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{row.nxiLoginsLast30Days} logins in past 30 days</p>
                            <p>Avg. session: {row.avgSessionDuration}</p>
                            <p>Last login: {row.lastLoginDaysAgo} days ago</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TooltipProvider>
        </PlaceholderCard>
      </div>
    </div>
  );
}
