
'use server';
/**
 * @fileOverview An AI agent that suggests stock trades.
 * This flow is temporarily disabled to resolve a server startup issue.
 */
import type { OrderActionType, OrderSystemType } from '@/types';

// Mock types to avoid breaking imports elsewhere in the app
export interface TradeSuggestionInput {
  symbol: string;
  currentPrice: number;
  volume: number;
  floatVal: number;
  newsSnippet?: string;
  buyingPower: number;
}
export interface TradeSuggestionOutput {
  action: OrderActionType;
  symbol: string;
  quantity: number;
  orderType: OrderSystemType;
  rationale: string;
  strategy: string;
  entryPrice?: number;
  limitPrice?: number;
  takeProfitPrice?: number;
  stopLossPrice?: number;
}

export async function getTradeSuggestion(input: TradeSuggestionInput): Promise<TradeSuggestionOutput> {
  console.log("getTradeSuggestion is temporarily disabled.", input);
  // Return a very basic mock to prevent breaking any UI that calls this
  return {
    action: 'Buy',
    symbol: input.symbol,
    quantity: 10,
    orderType: 'Market',
    rationale: 'Trade suggestions are temporarily disabled to resolve a server issue.',
    strategy: 'Disabled',
    entryPrice: input.currentPrice,
  };
}
