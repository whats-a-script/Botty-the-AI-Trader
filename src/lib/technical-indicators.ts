import { PricePoint } from './types'

export function calculateRSI(priceHistory: PricePoint[]): number {
  if (priceHistory.length < 15) return 50
  
  const changes: number[] = []
  for (let i = 1; i < priceHistory.length; i++) {
    changes.push(priceHistory[i].price - priceHistory[i - 1].price)
  }
  
  const recentChanges = changes.slice(-14)
  const gains = recentChanges.filter(c => c > 0).reduce((sum, c) => sum + c, 0) / 14
  const losses = Math.abs(recentChanges.filter(c => c < 0).reduce((sum, c) => sum + c, 0)) / 14
  
  if (losses === 0) return 100
  const rs = gains / losses
  return 100 - (100 / (1 + rs))
}

export function detectTrend(priceHistory: PricePoint[]): string {
  if (priceHistory.length < 3) return 'neutral'
  
  const recent = priceHistory.slice(-10)
  const older = priceHistory.slice(-20, -10)
  
  if (recent.length === 0 || older.length === 0) return 'neutral'
  
  const recentAvg = recent.reduce((sum, p) => sum + p.price, 0) / recent.length
  const olderAvg = older.reduce((sum, p) => sum + p.price, 0) / older.length
  
  const diff = ((recentAvg - olderAvg) / olderAvg) * 100
  
  if (diff > 2) return 'strong uptrend'
  if (diff > 0.5) return 'uptrend'
  if (diff < -2) return 'strong downtrend'
  if (diff < -0.5) return 'downtrend'
  return 'neutral'
}

export function calculateMomentum(priceHistory: PricePoint[]): number {
  if (priceHistory.length < 10) return 0
  
  const recent = priceHistory.slice(-5)
  const older = priceHistory.slice(-10, -5)
  
  if (recent.length === 0 || older.length === 0) return 0
  
  const recentAvg = recent.reduce((sum, p) => sum + p.price, 0) / recent.length
  const olderAvg = older.reduce((sum, p) => sum + p.price, 0) / older.length
  
  return ((recentAvg - olderAvg) / olderAvg) * 100
}

export function calculateVolatilityTrend(priceHistory: PricePoint[]): string {
  if (priceHistory.length < 30) return 'stable'
  
  const recent = priceHistory.slice(-15)
  const older = priceHistory.slice(-30, -15)
  
  const recentVol = calculateStdDev(recent.map(p => p.price))
  const olderVol = calculateStdDev(older.map(p => p.price))
  
  const volChange = ((recentVol - olderVol) / olderVol) * 100
  
  if (volChange > 20) return 'increasing'
  if (volChange < -20) return 'decreasing'
  return 'stable'
}

export function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2))
  const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length
  return Math.sqrt(variance)
}

export function calculateSupportResistance(priceHistory: PricePoint[], currentPrice: number) {
  if (priceHistory.length < 20) {
    return {
      support: currentPrice * 0.95,
      resistance: currentPrice * 1.05,
      distanceFromSupport: 5,
      distanceFromResistance: 5
    }
  }
  
  const prices = priceHistory.map(p => p.price)
  const sortedPrices = [...prices].sort((a, b) => a - b)
  
  const support = sortedPrices[Math.floor(sortedPrices.length * 0.1)]
  const resistance = sortedPrices[Math.floor(sortedPrices.length * 0.9)]
  
  const distanceFromSupport = ((currentPrice - support) / support) * 100
  const distanceFromResistance = ((resistance - currentPrice) / currentPrice) * 100
  
  return {
    support,
    resistance,
    distanceFromSupport,
    distanceFromResistance
  }
}

export function calculateReturns(priceHistory: PricePoint[]): number {
  if (priceHistory.length < 2) return 0
  const first = priceHistory[0].price
  const last = priceHistory[priceHistory.length - 1].price
  return ((last - first) / first) * 100
}

export function calculatePriceStrength(priceHistory: PricePoint[]): string {
  if (priceHistory.length < 5) return 'neutral'
  
  const recent = priceHistory.slice(-5)
  let upCount = 0
  
  for (let i = 1; i < recent.length; i++) {
    if (recent[i].price > recent[i - 1].price) upCount++
  }
  
  const strength = upCount / (recent.length - 1)
  
  if (strength >= 0.75) return 'strong bullish'
  if (strength >= 0.6) return 'bullish'
  if (strength <= 0.25) return 'strong bearish'
  if (strength <= 0.4) return 'bearish'
  return 'neutral'
}

export function calculateMACD(priceHistory: PricePoint[]): { macd: number; signal: number; histogram: number } {
  if (priceHistory.length < 26) {
    return { macd: 0, signal: 0, histogram: 0 }
  }
  
  const prices = priceHistory.map(p => p.price)
  const ema12 = calculateEMA(prices, 12)
  const ema26 = calculateEMA(prices, 26)
  const macd = ema12 - ema26
  
  const macdLine = [macd]
  const signal = calculateEMA(macdLine, 9)
  const histogram = macd - signal
  
  return { macd, signal, histogram }
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0
  
  const multiplier = 2 / (period + 1)
  let ema = prices.slice(0, period).reduce((sum, p) => sum + p, 0) / period
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema
  }
  
  return ema
}

export function calculateBollingerBands(priceHistory: PricePoint[], period: number = 20, stdDevMultiplier: number = 2) {
  if (priceHistory.length < period) {
    const currentPrice = priceHistory[priceHistory.length - 1]?.price || 0
    return {
      upper: currentPrice * 1.02,
      middle: currentPrice,
      lower: currentPrice * 0.98
    }
  }
  
  const prices = priceHistory.slice(-period).map(p => p.price)
  const sma = prices.reduce((sum, p) => sum + p, 0) / period
  const stdDev = calculateStdDev(prices)
  
  return {
    upper: sma + (stdDev * stdDevMultiplier),
    middle: sma,
    lower: sma - (stdDev * stdDevMultiplier)
  }
}
