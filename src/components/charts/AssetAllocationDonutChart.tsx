"use client";

import * as React from "react"
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { asset: "US Equities", value: 40, fill: "var(--chart-1)" },
  { asset: "International Equities", value: 20, fill: "var(--chart-2)" },
  { asset: "Fixed Income", value: 25, fill: "var(--chart-3)" },
  { asset: "Alternatives", value: 10, fill: "var(--chart-4)" },
  { asset: "Cash & Equivalents", value: 5, fill: "var(--chart-5)" },
];

const chartConfig = {
  value: {
    label: "Allocation",
  },
  "US Equities": {
    label: "US Equities",
    color: "hsl(var(--chart-1))",
  },
  "International Equities": {
    label: "International Equities",
    color: "hsl(var(--chart-2))",
  },
  "Fixed Income": {
    label: "Fixed Income",
    color: "hsl(var(--chart-3))",
  },
  "Alternatives": {
    label: "Alternatives",
    color: "hsl(var(--chart-4))",
  },
  "Cash & Equivalents": {
    label: "Cash & Equivalents",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function AssetAllocationDonutChart() {
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-full"
    >
      <ResponsiveContainer>
        <PieChart>
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel nameKey="asset" formatter={(value, name) => [`${value}%`, name]} />}
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="asset"
            innerRadius="60%"
            strokeWidth={5}
          >
             {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
