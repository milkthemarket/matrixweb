

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
  id:string;
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

// This type is for the original manual trade log, effectively replaced by TradeHistoryEntry for the /history page
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
  rawQuantityValue?: string;
  rawQuantityMode?: QuantityInputMode;
}

export interface OpenPosition {
  id: string;
  symbol: string;
  entryPrice: number;
  shares: number;
  currentPrice: number; 
}

export interface NewsArticle {
  id: string;
  symbol: string; 
  headline: string;
  timestamp: string; 
  source: string;
  preview: string;
  link: string; 
}

export interface TradeHistoryEntry {
  id: string;
  symbol: string;
  side: OrderActionType;
  totalQty: number;
  orderType: OrderSystemType;
  limitPrice?: number;
  stopPrice?: number;
  trailAmount?: number; 
  TIF: string; // e.g., Day, GTC
  tradingHours: string; // e.g., Include Extended Hours
  placedTime: string; // ISOString
  filledTime: string; // ISOString
  orderStatus: 'Filled' | 'Pending' | 'Canceled' | 'Partially Filled'; // Extended options
  averagePrice: number;
}
