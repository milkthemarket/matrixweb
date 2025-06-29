
'use server';
/**
 * @fileOverview A flow to check the connection to the Alpaca API.
 *
 * - checkAlpacaConnection - A function that fetches account details from Alpaca.
 * - AlpacaAccount - The return type for the checkAlpacaConnection function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the expected output schema based on Alpaca's account response
const AlpacaAccountSchema = z.object({
  id: z.string(),
  account_number: z.string(),
  status: z.string(),
  currency: z.string(),
  buying_power: z.string(),
  regt_buying_power: z.string(),
  daytrading_buying_power: z.string(),
  cash: z.string(),
  portfolio_value: z.string(),
  equity: z.string(),
  last_equity: z.string(),
  long_market_value: z.string(),
  short_market_value: z.string(),
  initial_margin: z.string(),
  maintenance_margin: z.string(),
  last_maintenance_margin: z.string(),
  sma: z.string(),
  daytrade_count: z.number(),
  created_at: z.string(),
});
export type AlpacaAccount = z.infer<typeof AlpacaAccountSchema>;

// This is the main function that will be called from the frontend
export async function checkAlpacaConnection(): Promise<AlpacaAccount> {
  return checkAlpacaConnectionFlow();
}

const checkAlpacaConnectionFlow = ai.defineFlow(
  {
    name: 'checkAlpacaConnectionFlow',
    inputSchema: z.void(),
    outputSchema: AlpacaAccountSchema,
  },
  async () => {
    // Return static mock data instead of making an API call
    return {
      id: "mock-account-id-123",
      account_number: "PA12345678",
      status: "ACTIVE",
      currency: "USD",
      buying_power: "100000.00",
      regt_buying_power: "200000.00",
      daytrading_buying_power: "400000.00",
      cash: "50000.00",
      portfolio_value: "150000.00",
      equity: "150000.00",
      last_equity: "149000.00",
      long_market_value: "100000.00",
      short_market_value: "0.00",
      initial_margin: "50000.00",
      maintenance_margin: "30000.00",
      last_maintenance_margin: "29800.00",
      sma: "100000",
      daytrade_count: 0,
      created_at: new Date().toISOString(),
    };
  }
);
