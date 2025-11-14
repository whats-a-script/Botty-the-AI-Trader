import { Asset, Forecast, PricePoint } from './types'

export async function generateForecast(asset: Asset): Promise<Forecast> {
  const recentHistory = asset.priceHistory.slice(-20)
  const currentPrice = asset.currentPrice
  const returns = calculateReturns(recentHistory)
  const trend = detectTrend(recentHistory)
  
  const promptText = `You are a financial market analyst. Analyze this asset and provide a short-term price forecast.

Asset: ${asset.name} (${asset.symbol})
Current Price: $${currentPrice.toFixed(2)}
Recent Returns: ${returns.toFixed(2)}%
Trend: ${trend}
Volatility: ${(asset.volatility * 100).toFixed(2)}%

Based on the technical indicators, provide:
1. A confidence level (0-100) for your forecast
2. A brief reasoning (2-3 sentences) explaining the key factors
3. Expected price direction (up/down/neutral)

Return valid JSON with this structure:
{
  "confidence": <number 0-100>,
  "reasoning": "<string>",
  "direction": "<up|down|neutral>",
  "expectedChange": <number representing percentage change, between -10 and 10>
}

Be realistic and acknowledge uncertainty. Educational focus.`

  try {
    const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
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
      reasoning: result.reasoning || 'Analysis based on recent price action and volatility.',
      timestamp: Date.now()
    }
  } catch (error) {
    return {
      assetId: asset.id,
      currentPrice,
      predictions: generatePredictionPoints(currentPrice, 0, asset.volatility, 10),
      confidence: 50,
      reasoning: 'Market conditions show mixed signals. Price may continue current trend with moderate volatility.',
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
  
  const recentAvg = recent.reduce((sum, p) => sum + p.price, 0) / recent.length
  const olderAvg = older.reduce((sum, p) => sum + p.price, 0) / older.length
  
  const diff = ((recentAvg - olderAvg) / olderAvg) * 100
  
  if (diff > 2) return 'strong uptrend'
  if (diff > 0.5) return 'uptrend'
  if (diff < -2) return 'strong downtrend'
  if (diff < -0.5) return 'downtrend'
  return 'neutral'
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
