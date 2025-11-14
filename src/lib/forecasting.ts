import { Asset, Forecast, PricePoint } from './types'

export async function generateForecast(asset: Asset): Promise<Forecast> {
  const recentHistory = asset.priceHistory.slice(-60)
  const currentPrice = asset.currentPrice
  const returns = calculateReturns(recentHistory)
  const trend = detectTrend(recentHistory)
  const momentum = calculateMomentum(recentHistory)
  const rsi = calculateRSI(recentHistory)
  const volatilityTrend = calculateVolatilityTrend(recentHistory)
  const priceStrength = calculatePriceStrength(recentHistory)
  const supportResistance = calculateSupportResistance(recentHistory, currentPrice)
  
  const promptText = `You are an expert quantitative analyst with deep expertise in technical analysis and market microstructure. Analyze this cryptocurrency asset using the comprehensive data provided.

Asset: ${asset.name} (${asset.symbol})
Current Price: $${currentPrice.toFixed(4)}

TECHNICAL INDICATORS:
- Returns (60-period): ${returns.toFixed(2)}%
- Trend Classification: ${trend}
- Momentum Score: ${momentum.toFixed(2)}
- RSI (14-period): ${rsi.toFixed(2)}
- Volatility: ${(asset.volatility * 100).toFixed(2)}%
- Volatility Trend: ${volatilityTrend}
- Price Strength: ${priceStrength}
- Support Level: $${supportResistance.support.toFixed(4)}
- Resistance Level: $${supportResistance.resistance.toFixed(4)}
- Distance from Support: ${supportResistance.distanceFromSupport.toFixed(2)}%
- Distance from Resistance: ${supportResistance.distanceFromResistance.toFixed(2)}%

ANALYSIS GUIDELINES:
Your confidence level should reflect data quality and indicator alignment:
- HIGH CONFIDENCE (85-95%): Clear directional signals with 4+ aligned indicators, strong trend, RSI in normal range (30-70), low volatility, clear support/resistance levels
- MODERATE-HIGH (75-84%): 3 aligned indicators, established trend, moderate volatility
- MODERATE (60-74%): Mixed signals, transitional phase
- LOW (<60%): High uncertainty, contradictory indicators

Focus on:
1. Indicator convergence/divergence
2. Technical pattern strength
3. Risk-reward ratio based on support/resistance
4. Volatility regime and stability

Return valid JSON:
{
  "confidence": <number 85-95 if indicators strongly align, otherwise lower>,
  "reasoning": "<2-3 sentences with specific indicator references>",
  "direction": "<up|down|neutral>",
  "expectedChange": <realistic percentage -8 to 8>
}

Be data-driven. High confidence requires strong evidence.`

  try {
    const response = await window.spark.llm(promptText, 'gpt-4o', true)
    const result = JSON.parse(response)
    
    const predictions = generatePredictionPoints(
      currentPrice,
      result.expectedChange || 0,
      asset.volatility,
      10
    )
    
    return {
      assetId: asset.id,
      currentPrice,
      predictions,
      confidence: Math.min(Math.max(result.confidence || 50, 0), 100),
      reasoning: result.reasoning || 'Analysis based on comprehensive technical indicators and price action.',
      timestamp: Date.now()
    }
  } catch (error) {
    console.error('Forecast generation error:', error)
    return {
      assetId: asset.id,
      currentPrice,
      predictions: generatePredictionPoints(currentPrice, 0, asset.volatility, 10),
      confidence: 50,
      reasoning: 'Unable to generate detailed forecast. Market conditions show mixed signals.',
      timestamp: Date.now()
    }
  }
}

function calculateReturns(priceHistory: PricePoint[]): number {
  if (priceHistory.length < 2) return 0
  const first = priceHistory[0].price
  const last = priceHistory[priceHistory.length - 1].price
  return ((last - first) / first) * 100
}

function detectTrend(priceHistory: PricePoint[]): string {
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

function calculateMomentum(priceHistory: PricePoint[]): number {
  if (priceHistory.length < 10) return 0
  
  const recent = priceHistory.slice(-5)
  const older = priceHistory.slice(-10, -5)
  
  if (recent.length === 0 || older.length === 0) return 0
  
  const recentAvg = recent.reduce((sum, p) => sum + p.price, 0) / recent.length
  const olderAvg = older.reduce((sum, p) => sum + p.price, 0) / older.length
  
  return ((recentAvg - olderAvg) / olderAvg) * 100
}

function calculateRSI(priceHistory: PricePoint[]): number {
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

function calculateVolatilityTrend(priceHistory: PricePoint[]): string {
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

function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2))
  const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length
  return Math.sqrt(variance)
}

function calculatePriceStrength(priceHistory: PricePoint[]): string {
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

function calculateSupportResistance(priceHistory: PricePoint[], currentPrice: number) {
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

function generatePredictionPoints(
  startPrice: number,
  expectedChangePercent: number,
  volatility: number,
  periods: number
): PricePoint[] {
  const points: PricePoint[] = []
  const now = Date.now()
  const periodMs = 5 * 60 * 1000
  
  let price = startPrice
  const targetPrice = startPrice * (1 + expectedChangePercent / 100)
  const changePerPeriod = (targetPrice - startPrice) / periods
  
  for (let i = 1; i <= periods; i++) {
    const randomNoise = (Math.random() - 0.5) * volatility * price * 0.5
    price = price + changePerPeriod + randomNoise
    points.push({
      timestamp: now + (i * periodMs),
      price: Math.max(price, startPrice * 0.7)
    })
  }
  
  return points
}
