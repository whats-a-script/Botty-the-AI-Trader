import { Asset, TradingSignal, AgentConfig, TradingMode, AIModel, MultiModelAnalysis, Portfolio } from './types'
import { calculateRSI, detectTrend, calculateMomentum, calculateVolatilityTrend, calculateSupportResistance } from './technical-indicators'

export async function generateTradingSignal(
  asset: Asset,
  config: AgentConfig,
  portfolio: Portfolio
): Promise<TradingSignal> {
  const recentHistory = asset.priceHistory.slice(-60)
  const currentPrice = asset.currentPrice
  
  const rsi = calculateRSI(recentHistory)
  const trend = detectTrend(recentHistory)
  const momentum = calculateMomentum(recentHistory)
  const volatilityTrend = calculateVolatilityTrend(recentHistory)
  const supportResistance = calculateSupportResistance(recentHistory, currentPrice)

  const modeParams = getModeParameters(config.mode)
  const criteriaText = modeParams.criteria.join('\n')
  const currentPriceStr = (isFinite(currentPrice) ? currentPrice : 0).toFixed(4)
  const rsiStr = (isFinite(rsi) ? rsi : 50).toFixed(2)
  const momentumStr = (isFinite(momentum) ? momentum : 0).toFixed(2)
  const volatilityStr = (isFinite(asset.volatility) ? asset.volatility * 100 : 0).toFixed(2)
  const supportStr = (isFinite(supportResistance.support) ? supportResistance.support : 0).toFixed(4)
  const distSupportStr = (isFinite(supportResistance.distanceFromSupport) ? supportResistance.distanceFromSupport : 0).toFixed(1)
  const resistanceStr = (isFinite(supportResistance.resistance) ? supportResistance.resistance : 0).toFixed(4)
  const distResistanceStr = (isFinite(supportResistance.distanceFromResistance) ? supportResistance.distanceFromResistance : 0).toFixed(1)
  const cashStr = (isFinite(portfolio.cash) ? portfolio.cash : 0).toFixed(2)
  const drawdownStr = (isFinite(portfolio.currentDrawdown) ? portfolio.currentDrawdown : 0).toFixed(2)
  const pnlStr = (isFinite(portfolio.totalPnL) ? portfolio.totalPnL : 0).toFixed(2)
  
  const promptText = `You are an expert trading AI for ${config.name} using ${config.model} model.

TRADING MODE: ${config.mode.toUpperCase()}
${modeParams.description}

ASSET: ${asset.name} (${asset.symbol})
Current Price: $${currentPriceStr}

TECHNICAL ANALYSIS:
- RSI (14): ${rsiStr}
- Trend: ${trend}
- Momentum: ${momentumStr}%
- Volatility: ${volatilityStr}% (${volatilityTrend})
- Support: $${supportStr} (${distSupportStr}% away)
- Resistance: $${resistanceStr} (${distResistanceStr}% away)

PORTFOLIO STATE:
- Available Cash: $${cashStr}
- Current Drawdown: ${drawdownStr}%
- Total P&L: $${pnlStr}

RISK PARAMETERS:
- Max Leverage: ${config.maxLeverage}x
- Max Position Size: ${config.maxPositionSize}%
- Stop Loss: ${config.stopLossPercent}%
- Take Profit: ${config.takeProfitPercent}%
- Risk/Reward Ratio: ${config.riskRewardRatio}:1
- Volatility Threshold: ${config.volatilityThreshold}%

DECISION CRITERIA FOR HIGH CONFIDENCE (85%+):
1. ${criteriaText}
2. Clear technical setup with 4+ aligned indicators
3. Risk/reward ratio meets or exceeds target
4. Volatility within acceptable range
5. Position sizing appropriate for account

Analyze and provide a trading decision. Return valid JSON:
{
  "action": "buy|sell|hold|close",
  "confidence": <85-95 for strong setups, lower otherwise>,
  "reasoning": "<specific technical reasons>",
  "positionType": "long|short",
  "suggestedQuantity": <appropriate position size>,
  "takeProfit": <price level>,
  "stopLoss": <price level>,
  "leverage": <1-${config.maxLeverage} based on confidence>
}

Be conservative. High confidence requires clear evidence.`

  try {
    const response = await window.spark.llm(promptText, getModelName(config.model), true)
    const result = JSON.parse(response)
    
    return {
      action: result.action || 'hold',
      assetId: asset.id,
      confidence: Math.min(Math.max(result.confidence || 50, 0), 100),
      reasoning: result.reasoning || 'Analysis complete',
      positionType: result.positionType || 'long',
      suggestedQuantity: result.suggestedQuantity || 0,
      takeProfit: result.takeProfit,
      stopLoss: result.stopLoss,
      leverage: Math.min(result.leverage || 1, config.maxLeverage),
      timestamp: Date.now()
    }
  } catch (error) {
    console.error('Signal generation error:', error)
    return {
      action: 'hold',
      assetId: asset.id,
      confidence: 0,
      reasoning: 'Error generating signal',
      positionType: 'long',
      suggestedQuantity: 0,
      leverage: 1,
      timestamp: Date.now()
    }
  }
}

export async function generateMultiModelSignal(
  asset: Asset,
  portfolio: Portfolio,
  configs: AgentConfig[]
): Promise<MultiModelAnalysis> {
  const signals = await Promise.all(
    configs.map(config => generateTradingSignal(asset, config, portfolio))
  )

  const newsAnalysisAgent = configs.find(c => c.name.includes('News') || c.model === 'gpt-4o')
  const technicalAnalysisAgent = configs.find(c => c.name.includes('Technical'))
  const riskAnalysisAgent = configs.find(c => c.name.includes('Risk'))

  let newsAnalysis
  if (newsAnalysisAgent) {
    newsAnalysis = await analyzeMarketSentiment(asset, newsAnalysisAgent)
  }

  let technicalAnalysis
  if (technicalAnalysisAgent) {
    technicalAnalysis = await analyzeTechnicalIndicators(asset)
  }

  let riskAnalysis
  if (riskAnalysisAgent) {
    riskAnalysis = await analyzeRisk(portfolio, asset)
  }

  const avgConfidence = signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length
  const buySignals = signals.filter(s => s.action === 'buy').length
  const sellSignals = signals.filter(s => s.action === 'sell').length

  let finalAction: 'buy' | 'sell' | 'hold' | 'close' = 'hold'
  if (buySignals > signals.length / 2 && avgConfidence > 70) {
    finalAction = 'buy'
  } else if (sellSignals > signals.length / 2 && avgConfidence > 70) {
    finalAction = 'sell'
  }

  const bestSignal = signals.reduce((best, current) => 
    current.confidence > best.confidence ? current : best
  )

  return {
    newsAnalysis,
    technicalAnalysis,
    riskAnalysis,
    finalDecision: {
      ...bestSignal,
      action: finalAction,
      confidence: avgConfidence,
      reasoning: `Multi-model consensus: ${signals.map(s => `${s.confidence.toFixed(0)}% ${s.action}`).join(', ')}`
    }
  }
}

async function analyzeMarketSentiment(asset: Asset, config: AgentConfig) {
  const currentPriceStr = asset.currentPrice.toFixed(4)
  const prompt = `Analyze market sentiment for ${asset.name} (${asset.symbol}).
Current price: $${currentPriceStr}

Based on current market conditions and typical crypto market sentiment patterns, provide:
{
  "sentiment": "bullish|bearish|neutral",
  "confidence": <number 0-100>,
  "summary": "<brief explanation>"
}`

  try {
    const response = await window.spark.llm(prompt, getModelName(config.model), true)
    return JSON.parse(response)
  } catch {
    return {
      sentiment: 'neutral' as const,
      confidence: 50,
      summary: 'Unable to determine sentiment'
    }
  }
}

async function analyzeTechnicalIndicators(asset: Asset) {
  const recentHistory = asset.priceHistory.slice(-60)
  const trend = detectTrend(recentHistory)
  const rsi = calculateRSI(recentHistory)
  const momentum = calculateMomentum(recentHistory)
  
  return {
    trend: trend.includes('up') ? 'up' as const : trend.includes('down') ? 'down' as const : 'neutral' as const,
    indicators: {
      rsi,
      momentum,
      volatility: asset.volatility * 100
    },
    confidence: 75
  }
}

async function analyzeRisk(portfolio: Portfolio, asset: Asset) {
  const portfolioValue = portfolio.cash + portfolio.positions.reduce((sum, p) => sum + p.quantity * p.currentPrice, 0)
  const portfolioRisk = (portfolio.currentDrawdown / 100) * portfolioValue
  
  return {
    portfolioRisk,
    positionSizing: Math.min(portfolioValue * 0.1, portfolio.cash * 0.5),
    recommendations: [
      portfolio.currentDrawdown > 10 ? 'Reduce position sizes due to drawdown' : 'Normal risk levels',
      asset.volatility > 0.05 ? 'High volatility detected' : 'Volatility acceptable'
    ]
  }
}

function getModeParameters(mode: TradingMode) {
  switch (mode) {
    case 'conservative':
      return {
        description: 'Minimal risk, long-term positions, high confidence threshold',
        criteria: [
          'Strong trend confirmation required',
          'Low volatility preferred',
          'Wide stop losses',
          'Lower leverage (1-3x max)'
        ]
      }
    case 'moderate':
      return {
        description: 'Balanced risk/reward, medium-term holds',
        criteria: [
          'Clear technical setup',
          'Moderate volatility acceptable',
          'Standard risk management',
          'Medium leverage (1-5x)'
        ]
      }
    case 'aggressive':
      return {
        description: 'High risk/reward, short-term trades, quick execution',
        criteria: [
          'Strong momentum plays',
          'Higher volatility acceptable',
          'Tight stop losses',
          'Higher leverage allowed (up to 10x)'
        ]
      }
  }
}

function getModelName(model: AIModel): 'gpt-4o' | 'gpt-4o-mini' {
  switch (model) {
    case 'gpt-4o':
      return 'gpt-4o'
    case 'gemini':
    case 'gpt-4o-mini':
    case 'deepseek':
    case 'qwen':
      return 'gpt-4o-mini'
  }
}

export function checkStopLossAndTakeProfit(portfolio: Portfolio, currentPrices: Map<string, number>): Portfolio {
  let updatedPortfolio = { ...portfolio }
  
  for (const position of portfolio.positions) {
    const currentPrice = currentPrices.get(position.assetId) || position.currentPrice
    
    if (position.stopLoss && currentPrice <= position.stopLoss) {
      console.log(`Stop loss triggered for ${position.symbol} at ${currentPrice}`)
    }
    
    if (position.takeProfit && currentPrice >= position.takeProfit) {
      console.log(`Take profit triggered for ${position.symbol} at ${currentPrice}`)
    }
  }
  
  return updatedPortfolio
}

export function adjustStrategyBasedOnPerformance(
  config: AgentConfig,
  recentTrades: number,
  winRate: number,
  currentDrawdown: number
): AgentConfig {
  const updatedConfig = { ...config }
  
  if (winRate < 0.4 && recentTrades > 5) {
    updatedConfig.maxLeverage = Math.max(1, config.maxLeverage - 1)
    updatedConfig.maxPositionSize = Math.max(5, config.maxPositionSize - 5)
  }
  
  if (currentDrawdown > 15) {
    updatedConfig.maxLeverage = 1
    updatedConfig.maxPositionSize = Math.max(3, config.maxPositionSize * 0.5)
  }
  
  if (winRate > 0.6 && currentDrawdown < 5) {
    updatedConfig.maxLeverage = Math.min(10, config.maxLeverage + 1)
  }
  
  return updatedConfig
}
