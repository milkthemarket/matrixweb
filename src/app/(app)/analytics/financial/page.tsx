"use client";

import { DollarSign, TrendingUp, CreditCard, Target } from 'lucide-react';
import { PlaceholderCard } from '@/components/dashboard/PlaceholderCard';
import { PlaceholderChart } from '@/components/dashboard/PlaceholderChart';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { PageHeader } from '@/components/PageHeader';

const topMetricCardsData = [
  {
    title: "Total Revenue",
    value: "$2.3M",
    description: <span className="text-[hsl(var(--confirm-green))]">+12% this quarter</span>,
    icon: DollarSign,
  },
  {
    title: "Net Profit Margin",
    value: "18.5%",
    description: <span className="text-[hsl(var(--confirm-green))]">Improved by 2%</span>,
    icon: TrendingUp,
  },
  {
    title: "Operational Costs",
    value: "$850K",
    description: <span className="text-destructive">-3% from last quarter</span>,
    icon: CreditCard,
  },
];

const averageRevenueData = {
  title: "Average Revenue per Client",
  value: "$12,450",
  description: <span className="text-[hsl(var(--confirm-green))]">+5% vs. previous quarter</span>,
  icon: DollarSign,
};

const grossMarginData = {
  title: "Target Gross Margin",
  value: "42%",
  progressNumericValue: 42,
  icon: Target,
};

export default function FinancialAnalyticsPage() {
  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <PageHeader title="Financial Analytics" />
      <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
      
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topMetricCardsData.map((card, index) => (
            <PlaceholderCard
              key={index}
              title={card.title}
              value={card.value}
              description={card.description}
              icon={card.icon}
            />
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <PlaceholderCard
            title={averageRevenueData.title}
            value={averageRevenueData.value}
            description={averageRevenueData.description}
            icon={averageRevenueData.icon}
          />
          <PlaceholderCard
            title={grossMarginData.title}
            value={grossMarginData.value}
            icon={grossMarginData.icon}
          >
            <Progress
              value={grossMarginData.progressNumericValue}
              className={cn(
                "h-3 mt-2",
                grossMarginData.progressNumericValue >= 40 ? "[&>div]:bg-[hsl(var(--chart-3))]" : // Green
                grossMarginData.progressNumericValue >= 30 ? "[&>div]:bg-[hsl(var(--chart-4))]" : // Yellow
                                                              "[&>div]:bg-[hsl(var(--chart-5))]"  // Red
              )}
              aria-label={`Gross Margin ${grossMarginData.progressNumericValue}%`}
            />
          </PlaceholderCard>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <PlaceholderCard title="Revenue vs. Expenses">
            <div className="h-[300px]">
              <PlaceholderChart dataAiHint="revenue expenses" />
            </div>
          </PlaceholderCard>
          <PlaceholderCard title="Cash Flow Projection">
            <div className="h-[300px]">
              <PlaceholderChart dataAiHint="cash flow" />
            </div>
          </PlaceholderCard>
        </div>
      </div>
    </div>
  );
}
