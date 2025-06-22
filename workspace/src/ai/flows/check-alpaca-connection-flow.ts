'use server';
/**
 * @fileOverview A flow to check the connection to the Alpaca API.
 *
 * - checkAlpacaConnection - A function that fetches account details from Alpaca.
 * - AlpacaAccount - The return type for the checkAlpacaConnection function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import axios from 'axios';

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
    const apiKey = process.env.ALPACA_API_KEY_ID;
    const apiSecret = process.env.ALPACA_SECRET_KEY;

    if (!apiKey || !apiSecret) {
      throw new Error('Alpaca API keys are not configured in environment variables.');
    }

    try {
      const response = await axios.get("https://paper-api.alpaca.markets/v2/account", {
        headers: {
          "APCA-API-KEY-ID": apiKey,
          "APCA-API-SECRET-KEY": apiSecret,
          "Content-Type": "application/json"
        }
      });
      
      // Validate the response against our Zod schema
      const validatedData = AlpacaAccountSchema.parse(response.data);
      return validatedData;

    } catch (error: any) {
      console.error("Alpaca connection failed:", error.response?.data || error.message);
      if (axios.isAxiosError(error)) {
        throw new Error(`Alpaca API Error: ${error.response?.status} ${JSON.stringify(error.response?.data)}`);
      }
      throw new Error(`Alpaca connection failed: ${error.message}`);
    }
  }
);
