export interface Asset {
  id: string
  symbol: string
  name: string
  currentPrice: number
  priceHistory: PricePoint[]
  volatility: number
}

export interface PricePoint {
  timestamp: number
  price: number
}

export interface Position {
  assetId: string
  symbol: string
  quantity: number
  avgEntryPrice: number
  currentPrice: number
  type: 'long' | 'short'
  leverage: number
  takeProfit?: number
  stopLoss?: number
  openedAt: number
  unrealizedPnL: number
}

export interface Trade {
  id: string
  assetId: string
  symbol: string
  type: 'buy' | 'sell'
  positionType: 'long' | 'short'
  quantity: number
  price: number
  timestamp: number
  total: number
  leverage: number
  pnl?: number
  agentId?: string
  reason?: string
}

export interface Portfolio {
  cash: number
  positions: Position[]
  trades: Trade[]
  startingBalance: number
  maxDrawdown: number
  currentDrawdown: number
  totalPnL: number
}

export interface NewsSentiment {
  sentiment: 'bullish' | 'bearish' | 'neutral'
  score: number
  headline: string
  summary: string
  sources: string[]
}

export interface SocialSentiment {
  sentiment: 'bullish' | 'bearish' | 'neutral'
  score: number
  volume: 'high' | 'medium' | 'low'
  trending: boolean
  keyTopics: string[]
  summary: string
}

export interface Forecast {
  assetId: string
  currentPrice: number
  predictions: PricePoint[]
  confidence: number
  reasoning: string
  timestamp: number
  newsSentiment?: NewsSentiment
  socialSentiment?: SocialSentiment
}

export type TradingMode = 'conservative' | 'moderate' | 'aggressive'
export type HoldingMode = 'scalping' | 'short' | 'long'
export type AgentType = 'single' | 'multi'
export type AIModel = 'gpt-4o' | 'gpt-4o-mini' | 'gemini' | 'deepseek' | 'qwen'

export interface TradingSignal {
  action: 'buy' | 'sell' | 'hold' | 'close'
  assetId: string
  confidence: number
  reasoning: string
  positionType: 'long' | 'short'
  suggestedQuantity: number
  takeProfit?: number
  stopLoss?: number
  leverage: number
  timestamp: number
}

export interface AgentConfig {
  id: string
  name: string
  model: AIModel
  mode: TradingMode
  holdingMode: HoldingMode
  enabled: boolean
  maxLeverage: number
  maxPositionSize: number
  stopLossPercent: number
  takeProfitPercent: number
  riskRewardRatio: number
  volatilityThreshold: number
  canCommunicate: boolean
}

export interface AgentMessage {
  id: string
  fromAgentId: string
  fromAgentName: string
  toAgentId?: string
  messageType: 'broadcast' | 'direct' | 'consensus' | 'question'
  content: string
  signal?: TradingSignal
  timestamp: number
  responses?: AgentMessageResponse[]
}

export interface AgentMessageResponse {
  agentId: string
  agentName: string
  response: string
  agreement: 'agree' | 'disagree' | 'neutral'
  timestamp: number
}

export interface CustomTradingPair {
  id: string
  symbol: string
  name: string
  currencyPair: string
  enabled: boolean
  addedAt: number
}

export interface AgentPerformance {
  agentId: string
  totalTrades: number
  winRate: number
  totalPnL: number
  sharpeRatio: number
  maxDrawdown: number
  avgConfidence: number
  lastActive: number
}

export interface MultiModelAnalysis {
  newsAnalysis?: {
    sentiment: 'bullish' | 'bearish' | 'neutral'
    confidence: number
    summary: string
  }
  technicalAnalysis?: {
    trend: 'up' | 'down' | 'neutral'
    indicators: Record<string, number>
    confidence: number
  }
  riskAnalysis?: {
    portfolioRisk: number
    positionSizing: number
    recommendations: string[]
  }
  finalDecision: TradingSignal
}

export interface TradeJournalEntry {
  trade: Trade
  entrySignal: TradingSignal
  exitSignal?: TradingSignal
  outcome: 'win' | 'loss' | 'open'
  pnl: number
  pnlPercent: number
  holdingPeriod: number
  notes: string
}

export interface NotificationConfig {
  enabled: boolean
  desktop: boolean
  onTradeExecution: boolean
  onPositionClose: boolean
  onDrawdownAlert: boolean
  drawdownThreshold: number
}
