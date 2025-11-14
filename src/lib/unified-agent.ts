import { Asset, TradingSignal, AgentConfig, Portfolio } from './types'
import { generateTradingSignal } from './ai-agents'

export interface UnifiedAgentDecision {
  signal: TradingSignal
  agentVotes: {
    agentId: string
    agentName: string
    vote: TradingSignal
    weight: number
  }[]
  consensus: {
    totalAgents: number
    buyVotes: number
    sellVotes: number
    holdVotes: number
    averageConfidence: number
    isUnanimous: boolean
    conflictingOpinions: boolean
  }
  reasoning: string
  executionRecommendation: 'execute' | 'wait' | 'skip'
}

export async function getUnifiedAgentDecision(
  asset: Asset,
  agents: AgentConfig[],
  portfolio: Portfolio
): Promise<UnifiedAgentDecision> {
  const enabledAgents = agents.filter(a => a.enabled)
  
  if (enabledAgents.length === 0) {
    return {
      signal: createDefaultSignal(asset),
      agentVotes: [],
      consensus: {
        totalAgents: 0,
        buyVotes: 0,
        sellVotes: 0,
        holdVotes: 0,
        averageConfidence: 0,
        isUnanimous: false,
        conflictingOpinions: false
      },
      reasoning: 'No agents enabled',
      executionRecommendation: 'skip'
    }
  }

  const votes = await Promise.all(
    enabledAgents.map(async (agent) => {
      const signal = await generateTradingSignal(asset, agent, portfolio)
      const weight = calculateAgentWeight(agent, portfolio)
      
      return {
        agentId: agent.id,
        agentName: agent.name,
        vote: signal,
        weight
      }
    })
  )

  const buyVotes = votes.filter(v => v.vote.action === 'buy').length
  const sellVotes = votes.filter(v => v.vote.action === 'sell').length
  const holdVotes = votes.filter(v => v.vote.action === 'hold').length
  const closeVotes = votes.filter(v => v.vote.action === 'close').length

  const totalWeight = votes.reduce((sum, v) => sum + v.weight, 0)
  const weightedBuyScore = votes
    .filter(v => v.vote.action === 'buy')
    .reduce((sum, v) => sum + (v.weight * v.vote.confidence), 0)
  const weightedSellScore = votes
    .filter(v => v.vote.action === 'sell')
    .reduce((sum, v) => sum + (v.weight * v.vote.confidence), 0)

  const averageConfidence = votes.reduce((sum, v) => sum + v.vote.confidence, 0) / votes.length

  const allSameAction = votes.every(v => v.vote.action === votes[0].vote.action)
  const hasConflict = (buyVotes > 0 && sellVotes > 0) || (buyVotes > 0 && closeVotes > 0) || (sellVotes > 0 && closeVotes > 0)

  let finalAction: 'buy' | 'sell' | 'hold' | 'close' = 'hold'
  let finalConfidence = averageConfidence

  if (weightedBuyScore > weightedSellScore && weightedBuyScore > totalWeight * 50) {
    finalAction = 'buy'
    finalConfidence = (weightedBuyScore / totalWeight)
  } else if (weightedSellScore > weightedBuyScore && weightedSellScore > totalWeight * 50) {
    finalAction = 'sell'
    finalConfidence = (weightedSellScore / totalWeight)
  } else if (closeVotes > votes.length / 2) {
    finalAction = 'close'
  }

  const bestVote = votes.reduce((best, current) => 
    current.vote.confidence > best.vote.confidence ? current : best
  )

  const unifiedSignal: TradingSignal = {
    action: finalAction,
    assetId: asset.id,
    confidence: finalConfidence,
    reasoning: generateUnifiedReasoning(votes, finalAction, hasConflict),
    positionType: bestVote.vote.positionType,
    suggestedQuantity: calculateUnifiedQuantity(votes, portfolio),
    takeProfit: bestVote.vote.takeProfit,
    stopLoss: bestVote.vote.stopLoss,
    leverage: calculateUnifiedLeverage(votes),
    timestamp: Date.now()
  }

  const executionRecommendation = determineExecutionRecommendation(
    unifiedSignal,
    hasConflict,
    allSameAction,
    portfolio
  )

  return {
    signal: unifiedSignal,
    agentVotes: votes,
    consensus: {
      totalAgents: votes.length,
      buyVotes,
      sellVotes,
      holdVotes,
      averageConfidence,
      isUnanimous: allSameAction,
      conflictingOpinions: hasConflict
    },
    reasoning: unifiedSignal.reasoning,
    executionRecommendation
  }
}

export async function askUnifiedAgent(
  question: string,
  agents: AgentConfig[],
  assets: Asset[],
  portfolio: Portfolio
): Promise<{
  answer: string
  agentContributions: {
    agentName: string
    response: string
    confidence: number
  }[]
  consensus: string
}> {
  const enabledAgents = agents.filter(a => a.enabled)
  
  if (enabledAgents.length === 0) {
    return {
      answer: 'No agents are currently enabled to answer questions.',
      agentContributions: [],
      consensus: 'Unable to provide answer'
    }
  }

  const portfolioContext = `Portfolio: $${portfolio.cash.toFixed(2)} cash, ${portfolio.positions.length} positions, ${portfolio.totalPnL >= 0 ? '+' : ''}$${portfolio.totalPnL.toFixed(2)} P&L`
  const marketContext = `Market: Top assets - ${assets.slice(0, 5).map(a => `${a.symbol} ($${a.currentPrice.toFixed(2)})`).join(', ')}`

  const contributions = await Promise.all(
    enabledAgents.map(async (agent) => {
      try {
        const promptContent = `You are ${agent.name}, an AI trading agent with ${agent.mode} trading mode.

${portfolioContext}
${marketContext}

User Question: "${question}"

Provide a concise, specific answer from your perspective as a ${agent.mode} trader. Be actionable and reference specific assets or strategies when relevant. Keep your response to 2-3 sentences.`

        const promptText = window.spark.llmPrompt([promptContent], promptContent)
        const response = await window.spark.llm(promptText, 'gpt-4o-mini')
        
        if (!response || response.trim().length === 0) {
          throw new Error('Empty response from LLM')
        }
        
        return {
          agentName: agent.name,
          response: response.trim(),
          confidence: agent.mode === 'conservative' ? 70 : agent.mode === 'moderate' ? 80 : 85
        }
      } catch (error) {
        console.error(`Error getting response from ${agent.name}:`, error)
        return {
          agentName: agent.name,
          response: `Error: ${error instanceof Error ? error.message : 'Unable to respond at this time'}`,
          confidence: 0
        }
      }
    })
  )

  const validContributions = contributions.filter(c => c.confidence > 0)
  
  if (validContributions.length === 0) {
    return {
      answer: 'All agents failed to generate responses. Please try again.',
      agentContributions: contributions,
      consensus: 'Error occurred'
    }
  }

  const consensusPromptContent = `You are a unified AI trading agent synthesizing input from multiple expert agents.

User Question: "${question}"

${portfolioContext}
${marketContext}

Agent Responses:
${validContributions.map(c => `- ${c.agentName}: ${c.response}`).join('\n')}

Synthesize these responses into one coherent, actionable answer that represents the unified perspective of all agents. If agents disagree, acknowledge the different viewpoints. Be specific and direct. Keep to 3-4 sentences.`
  
  try {
    const consensusPromptText = window.spark.llmPrompt([consensusPromptContent], consensusPromptContent)
    const unifiedAnswer = await window.spark.llm(consensusPromptText, 'gpt-4o')
    
    return {
      answer: unifiedAnswer.trim(),
      agentContributions: contributions,
      consensus: validContributions.length === enabledAgents.length && validContributions.every(c => 
        validContributions[0].response.toLowerCase().includes('buy') === c.response.toLowerCase().includes('buy')
      ) ? 'Strong consensus' : 'Mixed perspectives'
    }
  } catch (error) {
    console.error('Error generating unified answer:', error)
    
    return {
      answer: validContributions[0].response,
      agentContributions: contributions,
      consensus: 'Error synthesizing - showing primary response'
    }
  }
}

function calculateAgentWeight(agent: AgentConfig, portfolio: Portfolio): number {
  let weight = 1.0

  if (agent.mode === 'conservative' && portfolio.currentDrawdown > 10) {
    weight *= 1.5
  }
  
  if (agent.mode === 'aggressive' && portfolio.totalPnL > portfolio.startingBalance * 0.1) {
    weight *= 1.2
  }
  
  return weight
}

function generateUnifiedReasoning(
  votes: { agentName: string; vote: TradingSignal; weight: number }[],
  finalAction: string,
  hasConflict: boolean
): string {
  const actionCounts: Record<string, number> = {}
  votes.forEach(v => {
    actionCounts[v.vote.action] = (actionCounts[v.vote.action] || 0) + 1
  })

  const summary = Object.entries(actionCounts)
    .map(([action, count]) => `${count}x ${action}`)
    .join(', ')

  if (hasConflict) {
    return `Unified decision: ${finalAction}. Agent votes: ${summary}. Conflicting signals detected - proceeding with weighted consensus based on confidence and agent performance.`
  }

  return `Unified decision: ${finalAction}. Agent consensus: ${summary}. ${votes[0].vote.reasoning.slice(0, 100)}...`
}

function calculateUnifiedQuantity(
  votes: { vote: TradingSignal }[],
  portfolio: Portfolio
): number {
  const quantities = votes
    .map(v => v.vote.suggestedQuantity)
    .filter(q => q > 0)
  
  if (quantities.length === 0) return 0
  
  const avgQuantity = quantities.reduce((sum, q) => sum + q, 0) / quantities.length
  const maxSafeQuantity = (portfolio.cash * 0.1) / 50000
  
  return Math.min(avgQuantity, maxSafeQuantity)
}

function calculateUnifiedLeverage(votes: { vote: TradingSignal }[]): number {
  const leverages = votes.map(v => v.vote.leverage)
  const avgLeverage = leverages.reduce((sum, l) => sum + l, 0) / leverages.length
  
  return Math.round(Math.min(avgLeverage, 3))
}

function determineExecutionRecommendation(
  signal: TradingSignal,
  hasConflict: boolean,
  isUnanimous: boolean,
  portfolio: Portfolio
): 'execute' | 'wait' | 'skip' {
  if (signal.action === 'hold') return 'skip'
  
  if (portfolio.currentDrawdown > 15) return 'skip'
  
  if (isUnanimous && signal.confidence >= 80) return 'execute'
  
  if (hasConflict && signal.confidence < 75) return 'wait'
  
  if (signal.confidence >= 70) return 'execute'
  
  if (signal.confidence >= 60) return 'wait'
  
  return 'skip'
}

function createDefaultSignal(asset: Asset): TradingSignal {
  return {
    action: 'hold',
    assetId: asset.id,
    confidence: 0,
    reasoning: 'No agents available',
    positionType: 'long',
    suggestedQuantity: 0,
    leverage: 1,
    timestamp: Date.now()
  }
}
