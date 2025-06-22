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
import axios from 'axios';

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
    const { symbol, timeframe, limit, start, end } = input;
    const apiKey = process.env.APCA_API_KEY_ID;
    const apiSecret = process.env.APCA_API_SECRET_KEY;

    if (!apiKey || !apiSecret) {
      throw new Error('Alpaca API keys are not configured in environment variables.');
    }

    try {
      // Manually construct query parameters for robustness
      const queryParams = new URLSearchParams({
        timeframe,
        adjustment: 'raw',
        feed: 'iex', // Required for free data plan
      });
      if (limit) queryParams.append('limit', String(limit));
      if (start) queryParams.append('start', start);
      if (end) queryParams.append('end', end);
      
      const url = `https://data.alpaca.markets/v2/stocks/${symbol}/bars?${queryParams.toString()}`;

      const response = await axios.get(url, {
        headers: {
          'APCA-API-KEY-ID': apiKey,
          'APCA-API-SECRET-KEY': apiSecret,
        },
      });

      const bars = response.data.bars || []; // Handle cases where no bars are returned
      const validatedData = GetChartDataOutputSchema.parse(bars);
      return validatedData;

    } catch (error: any) {
      console.error(`Failed to fetch Alpaca chart data for ${symbol}:`, error.response?.data || error.message);
      if (axios.isAxiosError(error)) {
        // More specific error for 404 not found
        if (error.response?.status === 404) {
            throw new Error(`Symbol '${symbol}' not found in Alpaca data.`);
        }
        
        // Don't JSON.stringify if the response is HTML
        const errorDetails = (typeof error.response?.data === 'string' && error.response.data.startsWith('<'))
          ? "Received an HTML error page from the server."
          : JSON.stringify(error.response?.data);

        throw new Error(`Alpaca API Error: ${error.response?.status} ${errorDetails}`);
      }
      throw new Error(`Failed to fetch chart data for ${symbol}: ${error.message}`);
    }
  }
);
