

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
  sentiment?: 'Positive' | 'Negative' | 'Neutral';
  newsSentimentPercent?: number;
  topNewsKeyword?: string;
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

  peRatio?: number;
  dividendYield?: number;
  sector?: string;
  earningsDate?: string;

  // New fields for FundamentalsCard
  open?: number;
  high?: number;
  low?: number;
  prevClose?: number;
  turnoverPercent?: number;
  turnoverValue?: number;
  peRatioTTM?: number;
  peRatioForecast?: number;
  priceToBook?: number;
  priceToSales?: number;
  epsTTM?: number;
  sharesOutstanding?: number; // full number, not millions
  freeFloatShares?: number; // full number, not millions
  bookValuePerShare?: number;
  exDividendDate?: string; // YYYY-MM-DD
  lotSize?: number;
  afterHoursPrice?: number;
  afterHoursChange?: number;
  afterHoursChangePercent?: number;
  analystRating?: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
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
export type OptionOrderActionType = 'Buy' | 'Sell';
export type OptionType = 'Call' | 'Put';
export type OrderSystemType = 'Market' | 'Limit' | 'Stop' | 'Stop Limit' | 'Trailing Stop';
export type QuantityInputMode = 'Shares' | 'DollarAmount' | 'PercentOfBuyingPower';
export type TradeMode = 'manual' | 'autopilot';
export type HistoryTradeMode = 'manual' | 'aiAssist' | 'autopilot';
export type TickerSpeed = 'slow' | 'medium' | 'fast';
export type SoundOption = 'default' | 'chime' | 'bell' | 'moo' | 'off';
export type NotificationSoundEvent = 'mooAlert' | 'tradePlaced' | 'tradeClosed';


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
  accountId?: string;
  allowExtendedHours?: boolean;
  takeProfit?: number;
  stopLoss?: number;
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
  accountId?: string;
}

export interface NewsArticle {
  id: string;
  symbol: string;
  headline: string;
  timestamp: string; // Ensure this is an ISO string
  source: string;
  preview: string;
  link: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  content?: string; // Optional full HTML content for modal
  paragraphs?: string[]; // Optional paragraphs for modal
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
  placedTime: string; // ISO string format
  filledTime: string; // ISO string format
  orderStatus: 'Filled' | 'Pending' | 'Canceled' | 'Partially Filled';
  averagePrice: number;
  tradeModeOrigin?: HistoryTradeMode;
  accountId?: string;
  takeProfit?: number;
  stopLoss?: number;
}

export interface ColumnConfig<T = Stock | TradeHistoryEntry> {
  key: keyof T | string;
  label: string;
  defaultVisible?: boolean;
  isToggleable?: boolean;
  isDraggable?: boolean;
  defaultWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any, item: T, context?: any) => string | React.ReactNode;
  description?: string;
}


export interface TradeStatsData {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  avgReturn: number;
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
  timestamp: string; // ISO string format
}

export type HistoryFilterMode = HistoryTradeMode | 'all';

export interface Account {
  id: string;
  label: string;
  type: 'margin' | 'ira' | 'paper';
  number: string;
  balance: number;
  buyingPower: number;
}

// Options Page Specific Types
export interface OptionContract {
  id: string;
  strike: number;
  type: OptionType;
  expirationDate: string; // ISO string format or YYYY-MM-DD
  daysToExpiration: number;
  ask: number;
  bid: number;
  lastPrice?: number;
  change: number;
  percentChange: number;
  breakeven: number;
  toBreakevenPercent?: number;
  volume?: number;
  openInterest?: number;
  impliedVolatility?: number;
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
}

export interface OptionsTickerInfo {
  symbol: string;
  lastPrice: number;
  priceChange: number;
  priceChangePercent: number;
  marketStatus: 'Market Open' | 'Market Closed' | 'Pre-Market' | 'Post-Market' | 'Late Close' | 'Halted';
}

export interface OptionTradeRequest {
  contract: OptionContract;
  action: OptionOrderActionType;
  quantity: number;
  orderType: 'Market' | 'Limit';
  limitPrice?: number;
  accountId: string;
}

export interface OptionContractDetails {
  bidSize: number;
  askSize: number;
  mark: number;
  high: number;
  low: number;
  previousClose: number;
  lastTrade: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

// Moo Alerts Page Specific Types
export type MooAlertSentiment = 'Positive' | 'Negative' | 'Neutral';

export interface MooAlertItem {
  id: string;
  symbol: string;
  headline: string;
  fullText: string;
  time: string; // Could be "HH:mm" or relative like "Now"
  timestamp?: string; // Optional ISO string for precise timing for formatDistanceToNow
  sentiment: MooAlertSentiment;
  currentPrice: number;
  premarketChangePercent?: number;
  criteria: {
    news: boolean;
    volume: boolean;
    chart: boolean;
    shortable: boolean;
  };
  source?: string;
  sourceType?: 'Rule' | 'Manual Screener' | 'News Feed';
  suggestedAction?: OrderActionType;
  suggestedEntryPrice?: number;
  suggestedTargetPrice?: number;
  suggestedStopLossPrice?: number;
  targetGainPercent?: number;
  stopLossRiskPercent?: number;
  suggestedOrderType?: OrderSystemType;
  suggestedQuantity?: number;
}
