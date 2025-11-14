import { Asset, PricePoint } from './types'

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'tech-alpha',
    symbol: 'TCHA',
    name: 'Tech Alpha Corp',
    currentPrice: 150.00,
    priceHistory: [],
    volatility: 0.02
  },
  {
    id: 'green-energy',
    symbol: 'GREN',
    name: 'Green Energy Inc',
    currentPrice: 85.50,
    priceHistory: [],
    volatility: 0.03
  },
  {
    id: 'finance-group',
    symbol: 'FING',
    name: 'Finance Group Ltd',
    currentPrice: 220.75,
    priceHistory: [],
    volatility: 0.015
  },
  {
    id: 'bio-pharma',
    symbol: 'BIOP',
    name: 'Bio Pharma Co',
    currentPrice: 95.25,
    priceHistory: [],
    volatility: 0.025
  }
]

export function initializePriceHistory(asset: Asset, periods: number = 100): PricePoint[] {
  const history: PricePoint[] = []
  const now = Date.now()
  const periodMs = 5 * 60 * 1000
  
  let price = asset.currentPrice * 0.9
  
  for (let i = periods; i >= 0; i--) {
    const timestamp = now - (i * periodMs)
    const change = (Math.random() - 0.5) * 2 * asset.volatility * price
    price = Math.max(price + change, price * 0.5)
    history.push({ timestamp, price })
  }
  
  return history
}

export function generatePriceUpdate(currentPrice: number, volatility: number): number {
  const change = (Math.random() - 0.48) * volatility * currentPrice
  const newPrice = currentPrice + change
  return Math.max(newPrice, currentPrice * 0.8)
}

export function calculateReturns(priceHistory: PricePoint[]): number {
  if (priceHistory.length < 2) return 0
  const first = priceHistory[0].price
  const last = priceHistory[priceHistory.length - 1].price
  return ((last - first) / first) * 100
}
