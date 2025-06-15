
export type CatalystType = 'fire' | 'news';

export interface Stock {
  id: string;
  symbol: string;
  name?: string;
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
  metric: keyof Stock | string;
  operator: RuleOperator;
  value: number | string | [number, number];
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
export type TradeMode = 'manual' | 'ai' | 'autopilot';
export type HistoryTradeMode = 'manual' | 'aiAssist' | 'autopilot';
export type TickerSpeed = 'slow' | 'medium' | 'fast';


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
  tradeModeOrigin?: HistoryTradeMode;
  accountId?: string; // Added for associating trade with an account
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
  origin?: HistoryTradeMode;
  accountId?: string; // Added to associate position with an account
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
  tradeModeOrigin?: HistoryTradeMode;
  accountId?: string; // Added for associating history with an account
}

export interface ColumnConfig<T = Stock | TradeHistoryEntry> { // Updated to allow TradeHistoryEntry
  key: keyof T;
  label: string;
  defaultVisible?: boolean; // Made optional for history columns which might all be default visible for export
  isToggleable?: boolean; // Made optional
  isDraggable?: boolean;
  defaultWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any, item: T) => string | React.ReactNode; // Changed 'stock' to 'item' for generality
  description?: string;
}


export interface TradeStatsData {
  totalTrades: number;
  winRate: number; // Percentage
  totalPnL: number; // Dollar amount
  avgReturn: number; // Percentage for individual modes, potentially dollar amount for overall
  largestWin: number;
  largestLoss: number;
  avgHoldTime: string;
  mostTradedSymbol: string;
  winStreak: number;
}

export interface MiloTradeIdea {
  id: string;
  ticker: string;
  reason: string;
  action: string;
  timestamp: string; // ISO string date
}

// For the History Page filter
export type HistoryFilterMode = HistoryTradeMode | 'all';

// Account related types
export interface Account {
  id: string;
  label: string;
  type: 'margin' | 'ira' | 'paper';
  number: string;
  balance: number;
  buyingPower: number;
}

