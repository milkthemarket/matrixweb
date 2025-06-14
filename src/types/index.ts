
export type CatalystType = 'fire' | 'news';

export interface Stock {
  id: string;
  symbol: string;
  price: number;
  changePercent: number;
  float: number; // in millions
  volume: number; // in millions
  newsSnippet?: string; // Will be removed from main table display
  lastUpdated: string; // Will be removed from main table display
  catalystType?: CatalystType;
  historicalPrices?: number[]; // For sparkline

  // New fields for customizable columns
  marketCap?: number; // In basic units, e.g., 2.5e12 for 2.5 Trillion
  avgVolume?: number; // in millions
  atr?: number; // Average True Range
  rsi?: number; // Relative Strength Index
  vwap?: number; // Volume Weighted Average Price
  beta?: number;
  high52?: number; // 52-week high
  low52?: number; // 52-week low
  gapPercent?: number; // Today's gap %
  shortFloat?: number; // Short interest as % of float
  instOwn?: number; // Institutional Ownership %
  premarketChange?: number; // Premarket % change
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
export type TradeMode = 'manual' | 'ai';

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
  TIF?: string; // Time-in-Force
}

export interface AISuggestion {
  action: OrderActionType;
  symbol: string;
  quantity: number;
  entryPrice?: number; // For Limit orders, this is the limit price. For Market, it's an estimate.
  takeProfitPrice?: number;
  stopLossPrice?: number;
  rationale: string;
  strategy: string;
  orderType: OrderSystemType; // AI suggests Market or Limit
  limitPrice?: number; // Explicit limit price if orderType is Limit or Stop Limit
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

export interface ColumnConfig<T = Stock> {
  key: keyof T;
  label: string;
  defaultVisible: boolean;
  isToggleable: boolean;
  align?: 'left' | 'right' | 'center';
  format?: (value: any, stock: T) => string | React.ReactNode;
  description?: string; // For tooltips in column selector
}
