
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
  historicalPrices?: number[];

  marketCap?: number;
  avgVolume?: number;
  atr?: number;
  rsi?: number;
  vwap?: number;
  beta?: number;
  high52?: number;
  low52?: number;
  gapPercent?: number;
  shortFloat?: number;
  instOwn?: number;
  premarketChange?: number;
}

export type RuleOperator = '>' | '<' | '>=' | '<=' | '==' | '!=' | 'between' | 'contains';

export interface RuleCriterion {
  metric: keyof Stock | string; // keyof Stock for type safety, string for flexibility
  operator: RuleOperator;
  value: number | string | [number, number]; // Single value, string, or tuple for 'between'
}

export interface AlertRule {
  id: string;
  name: string;
  isActive: boolean;
  criteria: RuleCriterion[];
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
export type TradeMode = 'manual' | 'ai' | 'auto';

export interface TradeRequest {
  symbol: string;
  quantity: number;
  action: OrderActionType;
  orderType: OrderSystemType;
  limitPrice?: number;
  stopPrice?: number;
  trailingOffset?: number;
  rawQuantityValue?: string;
  rawQuantityMode?: QuantityInputMode;
  TIF?: string;
}

export interface AISuggestion {
  action: OrderActionType;
  symbol: string;
  quantity: number;
  entryPrice?: number;
  takeProfitPrice?: number;
  stopLossPrice?: number;
  rationale: string;
  strategy: string;
  orderType: OrderSystemType;
  limitPrice?: number;
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
  TIF: string;
  tradingHours: string;
  placedTime: string;
  filledTime: string;
  orderStatus: 'Filled' | 'Pending' | 'Canceled' | 'Partially Filled';
  averagePrice: number;
}

export interface ColumnConfig<T = Stock> {
  key: keyof T;
  label: string;
  defaultVisible: boolean;
  isToggleable: boolean;
  align?: 'left' | 'right' | 'center';
  format?: (value: any, stock: T) => string | React.ReactNode;
  description?: string;
}

