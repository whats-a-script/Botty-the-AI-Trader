import { AgentConfig, AgentMessage, AgentMessageResponse, Asset, Portfolio, TradingSignal } from './types'
import { generateTradingSignal } from './ai-agents'

export async function initiateAgentDiscussion(
  agents: AgentConfig[],
  asset: Asset,
  portfolio: Portfolio
): Promise<AgentMessage[]> {
  const messages: AgentMessage[] = []
  
  const initiatingAgent = agents[0]
  const signal = await generateTradingSignal(asset, initiatingAgent, portfolio)
  
  const broadcastMessage: AgentMessage = {
    id: `msg-${Date.now()}`,
    fromAgentId: initiatingAgent.id,
    fromAgentName: initiatingAgent.name,
    messageType: 'broadcast',
    content: `I've analyzed ${asset.symbol} and recommend ${signal.action}. Looking for consensus.`,
    signal,
    timestamp: Date.now(),
    responses: []
  }
  
  const otherAgents = agents.filter(a => a.id !== initiatingAgent.id)
  
  for (const agent of otherAgents) {
    const response = await generateAgentResponse(agent, asset, signal, portfolio)
    broadcastMessage.responses!.push(response)
  }
  
  messages.push(broadcastMessage)
  
  const consensusMessage = await generateConsensusMessage(agents, asset, broadcastMessage)
  messages.push(consensusMessage)
  
  return messages
}

async function generateAgentResponse(
  agent: AgentConfig,
  asset: Asset,
  originalSignal: TradingSignal,
  portfolio: Portfolio
): Promise<AgentMessageResponse> {
  const agentSignal = await generateTradingSignal(asset, agent, portfolio)
  
  const promptContent = `You are ${agent.name}, an AI trading agent reviewing a colleague's analysis.

Original recommendation: ${originalSignal.action} ${asset.symbol} with ${originalSignal.confidence}% confidence.
Reasoning: ${originalSignal.reasoning}

Your analysis shows: ${agentSignal.action} with ${agentSignal.confidence}% confidence.
Your reasoning: ${agentSignal.reasoning}

Provide a brief response (2-3 sentences) and indicate if you agree, disagree, or are neutral.
Return JSON:
{
  "response": "your response",
  "agreement": "agree|disagree|neutral"
}`

  try {
    const promptText = window.spark.llmPrompt([promptContent], promptContent)
    const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
    const result = JSON.parse(response)
    
    return {
      agentId: agent.id,
      agentName: agent.name,
      response: result.response || 'No response',
      agreement: result.agreement || 'neutral',
      timestamp: Date.now()
    }
  } catch (error) {
    console.error('Error generating agent response:', error)
    return {
      agentId: agent.id,
      agentName: agent.name,
      response: 'Unable to provide response',
      agreement: 'neutral',
      timestamp: Date.now()
    }
  }
}

async function generateConsensusMessage(
  agents: AgentConfig[],
  asset: Asset,
  discussionMessage: AgentMessage
): Promise<AgentMessage> {
  const responses = discussionMessage.responses || []
  const agreeCount = responses.filter(r => r.agreement === 'agree').length
  const disagreeCount = responses.filter(r => r.agreement === 'disagree').length
  
  const consensusAgent = agents[Math.floor(agents.length / 2)]
  
  const responsesText = responses.map(r => `- ${r.agentName}: ${r.agreement} - ${r.response}`).join('\n')
  
  const promptContent = `You are a consensus coordinator for AI trading agents.

Asset: ${asset.symbol}
Original proposal: ${discussionMessage.signal?.action} with ${discussionMessage.signal?.confidence}% confidence

Responses:
${responsesText}

Summary: ${agreeCount} agree, ${disagreeCount} disagree, ${responses.length - agreeCount - disagreeCount} neutral

Provide a consensus summary (2-3 sentences) that synthesizes the group's perspective.`

  try {
    const promptText = window.spark.llmPrompt([promptContent], promptContent)
    const consensusContent = await window.spark.llm(promptText, 'gpt-4o-mini', false)
    
    return {
      id: `msg-${Date.now()}-consensus`,
      fromAgentId: consensusAgent.id,
      fromAgentName: 'Consensus',
      messageType: 'consensus',
      content: consensusContent,
      timestamp: Date.now()
    }
  } catch (error) {
    return {
      id: `msg-${Date.now()}-consensus`,
      fromAgentId: consensusAgent.id,
      fromAgentName: 'Consensus',
      messageType: 'consensus',
      content: `Consensus: ${agreeCount} agents agree, ${disagreeCount} disagree. Mixed sentiment on ${asset.symbol}.`,
      timestamp: Date.now()
    }
  }
}

export async function broadcastSignalToAgents(
  fromAgent: AgentConfig,
  signal: TradingSignal,
  agents: AgentConfig[],
  asset: Asset
): Promise<AgentMessage> {
  const message: AgentMessage = {
    id: `msg-${Date.now()}`,
    fromAgentId: fromAgent.id,
    fromAgentName: fromAgent.name,
    messageType: 'broadcast',
    content: `Broadcasting signal for ${asset.symbol}: ${signal.action} at ${signal.confidence}% confidence`,
    signal,
    timestamp: Date.now(),
    responses: []
  }
  
  return message
}

export async function requestAgentOpinion(
  fromAgent: AgentConfig,
  toAgent: AgentConfig,
  asset: Asset,
  portfolio: Portfolio
): Promise<AgentMessage> {
  const toAgentSignal = await generateTradingSignal(asset, toAgent, portfolio)
  
  const message: AgentMessage = {
    id: `msg-${Date.now()}`,
    fromAgentId: fromAgent.id,
    fromAgentName: fromAgent.name,
    toAgentId: toAgent.id,
    messageType: 'direct',
    content: `Requesting opinion on ${asset.symbol}`,
    signal: toAgentSignal,
    timestamp: Date.now()
  }
  
  return message
}
