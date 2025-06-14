
"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Stock } from '@/types';

interface ChartPreviewProps {
  stock: Stock;
}

// Helper to generate simple mock data if no historical prices available
const generateMockPriceData = (basePrice: number) => {
  const data = [];
  let currentPrice = basePrice;
  for (let i = 0; i < 10; i++) {
    data.push({ name: `T-${9-i}`, price: parseFloat(currentPrice.toFixed(2)) });
    currentPrice += (Math.random() - 0.5) * (basePrice * 0.02); // Fluctuate by up to 2%
    currentPrice = Math.max(0.01, currentPrice); // Ensure price is positive
  }
  return data;
};


export function ChartPreview({ stock }: ChartPreviewProps) {
  const chartData = stock.historicalPrices && stock.historicalPrices.length > 1 
    ? stock.historicalPrices.map((price, index) => ({ name: `P${index}`, price }))
    : generateMockPriceData(stock.price);
  
  const strokeColor = stock.changePercent >= 0 ? "hsl(var(--chart-2))" : "hsl(var(--chart-5))"; // Uses Cyber Cyan (chart-2) for up, Red (chart-5) for down

  return (
    <Card className="w-64 shadow-md bg-popover/[.05] border-border/[.1] backdrop-blur-md"> {/* Quantum Black Styling */}
      <CardHeader className="p-3">
        <CardTitle className="text-base font-semibold text-popover-foreground">{stock.symbol} - Price Trend</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">Last 10 periods (mock data)</CardDescription>
      </CardHeader>
      <CardContent className="p-0 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <XAxis dataKey="name" hide />
            <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide/>
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'hsla(var(--background), 0.8)', // Semi-transparent dark background for tooltip
                borderColor: 'hsla(var(--border), 0.1)', // Subtle border, white at 10% opacity
                borderRadius: 'var(--radius)',
                backdropFilter: 'blur(4px)', // Light blur for tooltip itself
                WebkitBackdropFilter: 'blur(4px)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }} // White label
              itemStyle={{ color: strokeColor }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            />
            <Line type="monotone" dataKey="price" stroke={strokeColor} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
