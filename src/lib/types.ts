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
}

export interface Trade {
  id: string
  assetId: string
  symbol: string
  type: 'buy' | 'sell'
  quantity: number
  price: number
  timestamp: number
  total: number
}

export interface Portfolio {
  cash: number
  positions: Position[]
  trades: Trade[]
  startingBalance: number
}

export interface Forecast {
  assetId: string
  currentPrice: number
  predictions: PricePoint[]
  confidence: number
  reasoning: string
  timestamp: number
}
