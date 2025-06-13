
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

export type OrderActionType = 'Buy' | 'Short';
export type OrderSystemType = 'Market' | 'Limit';

export interface TradeRequest {
  symbol: string;
  quantity: number;
  action: OrderActionType;
  orderType: OrderSystemType;
  limitPrice?: number;
  // Firestore specific fields (optional for now)
  // id?: string;
  // status?: 'pending' | 'filled' | 'rejected';
  // timestamp?: any; // Firestore Timestamp
}
