
'use server';
/**
 * @fileOverview An AI agent that suggests stock trades.
 *
 * - getTradeSuggestion - A function that handles the trade suggestion process.
 * - TradeSuggestionInput - The input type for the getTradeSuggestion function.
 * - TradeSuggestionOutput - The return type for the getTradeSuggestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { OrderActionType, OrderSystemType } from '@/types';

const TradeSuggestionInputSchema = z.object({
  symbol: z.string().describe('The stock ticker symbol.'),
  currentPrice: z.number().describe('The current market price of the stock.'),
  volume: z.number().describe('The current trading volume in millions.'),
  floatVal: z.number().describe('The stock float in millions.'), // Renamed from float to floatVal
  newsSnippet: z.string().optional().describe('A recent news snippet related to the stock.'),
  buyingPower: z.number().describe('The available buying power for the trade.'),
});
export type TradeSuggestionInput = z.infer<typeof TradeSuggestionInputSchema>;

const TradeSuggestionOutputSchema = z.object({
  action: z.enum(['Buy', 'Sell', 'Short']).describe('The suggested trade action: Buy, Sell, or Short.'),
  symbol: z.string().describe('The stock ticker symbol.'),
  quantity: z.number().int().positive().describe('The suggested number of shares to trade. Must be a whole positive number.'),
  orderType: z.enum(['Market', 'Limit', 'Stop', 'Stop Limit', 'Trailing Stop']).describe('The suggested order type.'),
  entryPrice: z.number().optional().describe('Suggested entry price. For Limit orders, this is the limit price. For Market, an estimate.'),
  limitPrice: z.number().optional().describe('The specific limit price if the orderType is Limit or Stop Limit.'),
  takeProfitPrice: z.number().optional().describe('Suggested take profit price level.'),
  stopLossPrice: z.number().optional().describe('Suggested stop loss price level.'),
  rationale: z.string().describe('The reasoning behind the trade suggestion.'),
  strategy: z.string().describe('The trading strategy employed for this suggestion.'),
});
export type TradeSuggestionOutput = z.infer<typeof TradeSuggestionOutputSchema>;


export async function getTradeSuggestion(input: TradeSuggestionInput): Promise<TradeSuggestionOutput> {
  // !!! MOCK IMPLEMENTATION !!!
  // In a real scenario, this would call the Genkit flow with the AI model.
  // For now, we return a hardcoded suggestion based on the input symbol.

  console.log("AI Mock: Received input for suggestion:", input);

  const mockActions: OrderActionType[] = ['Buy', 'Sell', 'Short'];
  const mockOrderTypes: OrderSystemType[] = ['Market', 'Limit'];
  const randomAction = mockActions[Math.floor(Math.random() * mockActions.length)];
  const randomOrderType = mockOrderTypes[Math.floor(Math.random() * mockOrderTypes.length)];
  
  let calculatedQuantity = 10; // Default
  if (input.buyingPower && input.currentPrice > 0) {
    // Suggest using ~10% of buying power for mock, ensure whole shares
    const maxSpend = input.buyingPower * 0.1;
    calculatedQuantity = Math.max(1, Math.floor(maxSpend / input.currentPrice));
  }
  
  let mockEntryPrice: number | undefined = undefined;
  let mockLimitPrice: number | undefined = undefined;

  if (randomOrderType === 'Limit') {
    mockLimitPrice = parseFloat((input.currentPrice * (randomAction === 'Buy' ? 0.99 : 1.01)).toFixed(2)); // 1% away for limit
    mockEntryPrice = mockLimitPrice;
  } else { // Market order
    mockEntryPrice = input.currentPrice;
  }

  const mockSuggestion: TradeSuggestionOutput = {
    action: randomAction,
    symbol: input.symbol,
    quantity: calculatedQuantity,
    orderType: randomOrderType,
    entryPrice: mockEntryPrice,
    limitPrice: mockLimitPrice,
    takeProfitPrice: parseFloat((input.currentPrice * (randomAction === 'Buy' || randomAction === 'Short' ? 1.05 : 0.95)).toFixed(2)), // 5% take profit
    stopLossPrice: parseFloat((input.currentPrice * (randomAction === 'Buy' || randomAction === 'Short' ? 0.98 : 1.02)).toFixed(2)), // 2% stop loss
    rationale: `This is a mock suggestion for ${input.symbol}. The decision is based on simulated market conditions and technical indicators. Current price is ${input.currentPrice}. Suggested action: ${randomAction}.`,
    strategy: "Mock Strategy Engine - Trend Following with Volatility Check",
  };
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  return mockSuggestion;

  // Actual Genkit flow call would be:
  // return getTradeSuggestionFlow(input);
}


const tradeSuggestionPrompt = ai.definePrompt({
  name: 'tradeSuggestionPrompt',
  input: { schema: TradeSuggestionInputSchema },
  output: { schema: TradeSuggestionOutputSchema },
  prompt: `You are an expert trading assistant AI. Your goal is to provide a single, actionable trade suggestion based on the provided stock data and available buying power.

Stock Data:
- Symbol: {{{symbol}}}
- Current Price: \${{{currentPrice}}}
- Volume (Millions): {{{volume}}}
- Float (Millions): {{{floatVal}}}
- Recent News Snippet: "{{{newsSnippet}}}"
- Available Buying Power: \${{{buyingPower}}}

Your Task:
1.  Analyze the provided data.
2.  Decide on a trade action: 'Buy', 'Sell', or 'Short'.
3.  Determine the number of shares (quantity). This should be a whole number. Consider the buyingPower and currentPrice to suggest a reasonable quantity (e.g., aim to use a portion of buying power, not all of it).
4.  Suggest an order type: 'Market' or 'Limit'.
5.  If 'Limit' order, provide a 'limitPrice'. This 'limitPrice' should also be your 'entryPrice'.
6.  If 'Market' order, the 'entryPrice' can be the 'currentPrice'.
7.  Provide a 'takeProfitPrice' and a 'stopLossPrice'. These should be reasonably distanced from the entry/current price.
8.  Write a concise 'rationale' explaining why you are suggesting this trade, referencing the provided data.
9.  State the 'strategy' used (e.g., "Breakout Strategy", "Mean Reversion", "News Catalyst Play").

Output Format:
Return a JSON object matching the defined output schema. Ensure all fields are correctly populated. 'quantity' must be an integer.
Example for Buy Limit:
{
  "action": "Buy",
  "symbol": "XYZ",
  "quantity": 50,
  "orderType": "Limit",
  "entryPrice": 150.20,
  "limitPrice": 150.20,
  "takeProfitPrice": 155.00,
  "stopLossPrice": 148.00,
  "rationale": "XYZ is showing strong bullish momentum after breaking a key resistance level, with increasing volume. News snippet indicates positive sentiment.",
  "strategy": "Momentum Breakout Strategy"
}
Example for Sell Market:
{
  "action": "Sell",
  "symbol": "ABC",
  "quantity": 100,
  "orderType": "Market",
  "entryPrice": 25.50,
  "takeProfitPrice": 24.00,
  "stopLossPrice": 26.00,
  "rationale": "ABC has hit a major resistance and shows signs of reversal on high volume. Selling now to lock in profits or avoid further downturn.",
  "strategy": "Resistance Reversal Strategy"
}
Focus on providing a single, complete, and actionable trade suggestion.
`,
});

const getTradeSuggestionFlow = ai.defineFlow(
  {
    name: 'getTradeSuggestionFlow',
    inputSchema: TradeSuggestionInputSchema,
    outputSchema: TradeSuggestionOutputSchema,
  },
  async (input) => {
    // For now, this flow will also return the mock data for testing purposes.
    // Replace with actual prompt call when ready for real AI.
    // const { output } = await tradeSuggestionPrompt(input);
    // return output!;
    
    // Using the same mock logic as the exported wrapper function:
    const mockActions: OrderActionType[] = ['Buy', 'Sell', 'Short'];
    const mockOrderTypes: OrderSystemType[] = ['Market', 'Limit'];
    const randomAction = mockActions[Math.floor(Math.random() * mockActions.length)];
    const randomOrderType = mockOrderTypes[Math.floor(Math.random() * mockOrderTypes.length)];
    
    let calculatedQuantity = 10;
    if (input.buyingPower && input.currentPrice > 0) {
      const maxSpend = input.buyingPower * (Math.random() * 0.15 + 0.05); // Use 5-20% of buying power
      calculatedQuantity = Math.max(1, Math.floor(maxSpend / input.currentPrice));
    }
    
    let mockEntryPrice: number | undefined = undefined;
    let mockLimitPrice: number | undefined = undefined;

    if (randomOrderType === 'Limit') {
      const priceDirection = (randomAction === 'Buy' ? -1 : 1); // Buy limit below, sell limit above
      mockLimitPrice = parseFloat((input.currentPrice + priceDirection * input.currentPrice * (Math.random()*0.015 + 0.005)).toFixed(2)); // 0.5-1.5% away
      mockEntryPrice = mockLimitPrice;
    } else {
      mockEntryPrice = input.currentPrice;
    }

    const takeProfitMultiplier = (randomAction === 'Buy' || randomAction === 'Short' ? (1 + (Math.random()*0.06+0.02)) : (1 - (Math.random()*0.06+0.02)) ); // 2-8% TP
    const stopLossMultiplier = (randomAction === 'Buy' || randomAction === 'Short' ? (1 - (Math.random()*0.03+0.01)) : (1 + (Math.random()*0.03+0.01)) ); // 1-4% SL


    const mockSuggestion: TradeSuggestionOutput = {
      action: randomAction,
      symbol: input.symbol,
      quantity: calculatedQuantity,
      orderType: randomOrderType,
      entryPrice: mockEntryPrice,
      limitPrice: mockLimitPrice,
      takeProfitPrice: parseFloat((input.currentPrice * takeProfitMultiplier).toFixed(2)),
      stopLossPrice: parseFloat((input.currentPrice * stopLossMultiplier).toFixed(2)),
      rationale: `This is a mock AI suggestion for ${input.symbol}. Based on simulated analysis, a ${randomAction} action is proposed with ${randomOrderType} order. Float: ${input.floatVal}M, Volume: ${input.volume}M.`,
      strategy: `Mock Strategy: ${randomAction === 'Buy' ? 'Bullish Momentum': randomAction === 'Sell' ? 'Bearish Reversal' : 'Volatility Play'}`,
    };
    return mockSuggestion;
  }
);
