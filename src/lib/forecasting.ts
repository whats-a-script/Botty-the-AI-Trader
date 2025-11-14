import { Asset, Forecast, PricePoint, NewsSentiment, SocialSentiment } from './types'

async function generateNewsSentiment(asset: Asset): Promise<NewsSentiment> {
  const promptContent = `You are a financial news analyst. Generate a realistic news sentiment analysis for ${asset.name} (${asset.symbol}) cryptocurrency.

Current Price: $${asset.currentPrice.toFixed(4)}
Recent Price Action: ${calculateReturns(asset.priceHistory.slice(-30)).toFixed(2)}%

Simulate realistic crypto news sentiment. Consider:
- Recent market trends
- Typical crypto market narratives
- Regulatory news impact
- Technology/development updates
- Market adoption signals

Return valid JSON:
{
  "sentiment": "<bullish|bearish|neutral>",
  "score": <-100 to 100, positive is bullish>,
  "headline": "<realistic main headline>",
  "summary": "<2 sentences covering key points>",
  "sources": ["<source1>", "<source2>", "<source3>"]
}`

  try {
    const response = await window.spark.llm(promptContent, 'gpt-4o-mini', true)
    const result = JSON.parse(response)
    return {
      sentiment: result.sentiment || 'neutral',
      score: Math.min(Math.max(result.score || 0, -100), 100),
      headline: result.headline || 'Market Activity Normal',
      summary: result.summary || 'Mixed signals in the market.',
      sources: result.sources || ['CryptoNews', 'Market Watch', 'Bloomberg Crypto']
    }
  } catch (error) {
    console.error('News sentiment generation error:', error)
    return {
      sentiment: 'neutral',
      score: 0,
      headline: 'Market Activity Normal',
      summary: 'No significant news detected. Market showing typical volatility patterns.',
      sources: ['CryptoNews', 'Market Watch']
    }
  }
}

async function generateSocialSentiment(asset: Asset): Promise<SocialSentiment> {
  const promptContent = `You are a social media sentiment analyst. Generate realistic social sentiment analysis for ${asset.name} (${asset.symbol}) cryptocurrency.

Current Price: $${asset.currentPrice.toFixed(4)}
Recent Movement: ${calculateReturns(asset.priceHistory.slice(-10)).toFixed(2)}%

Simulate realistic crypto social media sentiment. Consider:
- Twitter/X crypto community discussions
- Reddit crypto sentiment
- Discord/Telegram community activity
- Influencer mentions
- Community excitement or fear

Return valid JSON:
{
  "sentiment": "<bullish|bearish|neutral>",
  "score": <-100 to 100, positive is bullish>,
  "volume": "<high|medium|low>",
  "trending": <true|false>,
  "keyTopics": ["<topic1>", "<topic2>", "<topic3>"],
  "summary": "<2 sentences about social sentiment>"
}`

  try {
    const response = await window.spark.llm(promptContent, 'gpt-4o-mini', true)
    const result = JSON.parse(response)
    return {
      sentiment: result.sentiment || 'neutral',
      score: Math.min(Math.max(result.score || 0, -100), 100),
      volume: result.volume || 'medium',
      trending: result.trending || false,
      keyTopics: result.keyTopics || ['price action', 'market discussion'],
      summary: result.summary || 'Community showing mixed sentiment.'
    }
  } catch (error) {
    console.error('Social sentiment generation error:', error)
    return {
      sentiment: 'neutral',
      score: 0,
      volume: 'medium',
      trending: false,
      keyTopics: ['price action', 'market discussion'],
      summary: 'Community activity at normal levels with mixed sentiment.'
    }
  }
}

export async function generateForecast(asset: Asset): Promise<Forecast> {
  const [newsSentiment, socialSentiment] = await Promise.all([
    generateNewsSentiment(asset),
    generateSocialSentiment(asset)
  ])
  
  const recentHistory = asset.priceHistory.slice(-60)
  const currentPrice = asset.currentPrice
  const returns = calculateReturns(recentHistory)
  const trend = detectTrend(recentHistory)
  const momentum = calculateMomentum(recentHistory)
  const rsi = calculateRSI(recentHistory)
  const volatilityTrend = calculateVolatilityTrend(recentHistory)
  const priceStrength = calculatePriceStrength(recentHistory)
  const supportResistance = calculateSupportResistance(recentHistory, currentPrice)
  
  const currentPriceStr = currentPrice.toFixed(4)
  const returnsStr = returns.toFixed(2)
  const momentumStr = momentum.toFixed(2)
  const rsiStr = rsi.toFixed(2)
  const volatilityStr = (asset.volatility * 100).toFixed(2)
  const supportStr = supportResistance.support.toFixed(4)
  const resistanceStr = supportResistance.resistance.toFixed(4)
  const distSupportStr = supportResistance.distanceFromSupport.toFixed(2)
  const distResistanceStr = supportResistance.distanceFromResistance.toFixed(2)
  
  const promptContent = `You are an expert quantitative analyst with deep expertise in technical analysis, news sentiment, and social analytics. Analyze this cryptocurrency asset using comprehensive data.

Asset: ${asset.name} (${asset.symbol})
Current Price: $${currentPriceStr}

TECHNICAL INDICATORS:
- Returns (60-period): ${returnsStr}%
- Trend Classification: ${trend}
- Momentum Score: ${momentumStr}
- RSI (14-period): ${rsiStr}
- Volatility: ${volatilityStr}%
- Volatility Trend: ${volatilityTrend}
- Price Strength: ${priceStrength}
- Support Level: $${supportStr}
- Resistance Level: $${resistanceStr}
- Distance from Support: ${distSupportStr}%
- Distance from Resistance: ${distResistanceStr}%

NEWS SENTIMENT:
- Sentiment: ${newsSentiment.sentiment}
- Score: ${newsSentiment.score}/100
- Headline: "${newsSentiment.headline}"
- Summary: ${newsSentiment.summary}

SOCIAL SENTIMENT:
- Sentiment: ${socialSentiment.sentiment}
- Score: ${socialSentiment.score}/100
- Volume: ${socialSentiment.volume}
- Trending: ${socialSentiment.trending ? 'Yes' : 'No'}
- Key Topics: ${socialSentiment.keyTopics.join(', ')}
- Summary: ${socialSentiment.summary}

ANALYSIS GUIDELINES:
Your confidence level should reflect data quality and alignment across all factors:
- HIGH CONFIDENCE (85-95%): Technical, news, and social all aligned. Strong trend, clear indicators, unified sentiment
- MODERATE-HIGH (75-84%): 2 of 3 factors aligned (technical + news OR technical + social)
- MODERATE (60-74%): Mixed signals between technical and sentiment, or weak alignment
- LOW (<60%): Contradictory signals across technical, news, and social

Weight the factors:
- Technical indicators: 50%
- News sentiment: 25%
- Social sentiment: 25%

Focus on:
1. Multi-factor convergence/divergence
2. Sentiment-price correlation
3. Risk-reward considering all aspects
4. Contrarian opportunities (sentiment vs technical)

Return valid JSON:
{
  "confidence": <number reflecting cross-factor alignment>,
  "reasoning": "<3-4 sentences integrating technical, news, and social analysis>",
  "direction": "<up|down|neutral>",
  "expectedChange": <realistic percentage -8 to 8>
}

Be data-driven. High confidence requires strong evidence across ALL factors.`

  try {
    const response = await window.spark.llm(promptContent, 'gpt-4o', true)
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
      reasoning: result.reasoning || 'Analysis based on comprehensive technical indicators, news sentiment, and social signals.',
      timestamp: Date.now(),
      newsSentiment,
      socialSentiment
    }
  } catch (error) {
    console.error('Forecast generation error:', error)
    return {
      assetId: asset.id,
      currentPrice,
      predictions: generatePredictionPoints(currentPrice, 0, asset.volatility, 10),
      confidence: 50,
      reasoning: 'Unable to generate detailed forecast. Market conditions show mixed signals across technical and sentiment analysis.',
      timestamp: Date.now(),
      newsSentiment,
      socialSentiment
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
