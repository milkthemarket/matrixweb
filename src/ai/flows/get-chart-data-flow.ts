
'use server';
/**
 * @fileOverview A flow to fetch historical chart data from Alpaca.
 *
 * - getChartData - A function that fetches historical OHLCV bars.
 * - GetChartDataInput - The input type for the getChartData function.
 * - GetChartDataOutput - The return type for the getChartData function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sub } from 'date-fns';

// Input Schema
const GetChartDataInputSchema = z.object({
  symbol: z.string().describe('The stock ticker symbol.'),
  timeframe: z.string().describe('The timeframe for the bars (e.g., 1Day, 15Min).'),
  limit: z.number().int().optional().describe('The maximum number of bars to return.'),
  start: z.string().optional().describe('The start date in ISO 8601 format.'),
  end: z.string().optional().describe('The end date in ISO 8601 format.'),
});
export type GetChartDataInput = z.infer<typeof GetChartDataInputSchema>;

// Output Schema for a single bar
const AlpacaBarSchema = z.object({
  t: z.string().describe('Timestamp'),
  o: z.number().describe('Open price'),
  h: z.number().describe('High price'),
  l: z.number().describe('Low price'),
  c: z.number().describe('Close price'),
  v: z.number().describe('Volume'),
});

// Output Schema for the array of bars
const GetChartDataOutputSchema = z.array(AlpacaBarSchema);
export type GetChartDataOutput = z.infer<typeof GetChartDataOutputSchema>;


// Main exported function
export async function getChartData(input: GetChartDataInput): Promise<GetChartDataOutput> {
  return getChartDataFlow(input);
}


const getChartDataFlow = ai.defineFlow(
  {
    name: 'getChartDataFlow',
    inputSchema: GetChartDataInputSchema,
    outputSchema: GetChartDataOutputSchema,
  },
  async (input) => {
    // Generate mock data based on input for more realistic charts
    const { limit = 50 } = input;
    const now = new Date();
    let currentPrice = 150 + Math.random() * 20;
    
    const mockBars = Array.from({ length: limit }).map((_, i) => {
      const open = currentPrice;
      const close = open + (Math.random() - 0.49) * 2;
      const high = Math.max(open, close) + Math.random();
      const low = Math.min(open, close) - Math.random();
      const volume = 500000 + Math.random() * 1000000;
      const timestamp = sub(now, { days: limit - i });

      currentPrice = close;

      return {
        t: timestamp.toISOString(),
        o: parseFloat(open.toFixed(2)),
        h: parseFloat(high.toFixed(2)),
        l: parseFloat(low.toFixed(2)),
        c: parseFloat(close.toFixed(2)),
        v: Math.floor(volume),
      };
    });

    return mockBars;
  }
);
