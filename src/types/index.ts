
export type CatalystType = 'fire' | 'news';

export interface Stock {
  id: string;
  symbol: string;
  price: number;
  changePercent: number;
  float: number; // in millions
  volume: number; // in millions
  newsSnippet?: string;
  lastUpdated: string;
  catalystType?: CatalystType;
  historicalPrices?: number[]; // For sparkline
}

export interface AlertRule {
  id: string;
  name: string;
  changePercentThreshold: number;
  floatThreshold: number; // in millions
  isActive: boolean;
}

export interface TradeAlert {
  id: string;
  symbol: string;
  message: string;
  timestamp: string;
  source?: string;
}

export interface TradeLogEntry {
  id: string;
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  notes?: string;
  tradeDate: string;
}

export type OrderActionType = 'Buy' | 'Sell' | 'Short';
export type OrderSystemType = 'Market' | 'Limit' | 'Stop' | 'Stop Limit' | 'Trailing Stop';
export type QuantityInputMode = 'Shares' | 'DollarAmount' | 'PercentOfBuyingPower';

export interface TradeRequest {
  symbol: string;
  quantity: number; // Final calculated/entered shares
  action: OrderActionType;
  orderType: OrderSystemType;
  limitPrice?: number;
  stopPrice?: number;
  trailingOffset?: number; // Could be points or percentage based on broker
  // Optional: add rawQuantityValue and quantityMode for logging
  rawQuantityValue?: string;
  rawQuantityMode?: QuantityInputMode;
}

