import { useState, useEffect, useRef } from 'react'
import { AgentConfig, AgentMessage, Asset, Portfolio } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Chats, ArrowRight, ThumbsUp, ThumbsDown, Minus, PaperPlaneRight, User, Robot, CheckCircle } from '@phosphor-icons/react'
import { initiateAgentDiscussion, broadcastSignalToAgents } from '@/lib/agent-communication'
import { askUnifiedAgent } from '@/lib/unified-agent'
import { toast } from 'sonner'

interface AgentCommunicationProps {
  agents: AgentConfig[]
  assets: Asset[]
  portfolio: Portfolio
  messages: AgentMessage[]
  onNewMessage: (message: AgentMessage) => void
}

export function AgentCommunication({
  agents,
  assets,
  portfolio,
  messages,
  onNewMessage
}: AgentCommunicationProps) {
  const [selectedAsset, setSelectedAsset] = useState<string>('')
  const [isDiscussing, setIsDiscussing] = useState(false)
  const [userQuestion, setUserQuestion] = useState('')
  const [isAskingAgents, setIsAskingAgents] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const communicatingAgents = agents.filter(a => a.enabled && (a.canCommunicate ?? true))

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleStartDiscussion = async () => {
    if (!selectedAsset || communicatingAgents.length < 2) return
    
    setIsDiscussing(true)
    try {
      const asset = assets.find(a => a.id === selectedAsset)
      if (!asset) return

      const discussionMessages = await initiateAgentDiscussion(
        communicatingAgents,
        asset,
        portfolio
      )
      
      discussionMessages.forEach(msg => onNewMessage(msg))
      toast.success('Agent discussion completed')
    } catch (error) {
      console.error('Discussion error:', error)
      toast.error('Failed to complete discussion')
    } finally {
      setIsDiscussing(false)
    }
  }

  const handleAskAgents = async () => {
    if (!userQuestion.trim() || communicatingAgents.length === 0) return
    
    const userMessage: AgentMessage = {
      id: `user-${Date.now()}`,
      fromAgentId: 'user',
      fromAgentName: 'You',
      content: userQuestion,
      timestamp: Date.now(),
      messageType: 'question',
      responses: []
    }
    
    onNewMessage(userMessage)
    const currentQuestion = userQuestion
    setUserQuestion('')
    setIsAskingAgents(true)
    
    try {
      const result = await askUnifiedAgent(currentQuestion, communicatingAgents, assets, portfolio)
      
      const responses = result.agentContributions.map(contrib => ({
        agentId: contrib.agentName.toLowerCase().replace(/\s+/g, '-'),
        agentName: contrib.agentName,
        response: contrib.response,
        agreement: 'neutral' as const,
        timestamp: Date.now()
      }))

      const updatedUserMessage: AgentMessage = {
        ...userMessage,
        responses
      }

      onNewMessage(updatedUserMessage)

      const unifiedMessage: AgentMessage = {
        id: `unified-${Date.now()}`,
        fromAgentId: 'unified-agent',
        fromAgentName: 'Unified Agent',
        content: result.answer,
        timestamp: Date.now() + 1,
        messageType: 'consensus',
        responses: []
      }

      onNewMessage(unifiedMessage)
      
      toast.success(`Unified response from ${result.agentContributions.length} agents`)
    } catch (error) {
      console.error('Error asking agents:', error)
      toast.error('Failed to get agent responses')
    } finally {
      setIsAskingAgents(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAskAgents()
    }
  }

  const getAgreementColor = (agreement: 'agree' | 'disagree' | 'neutral') => {
    switch (agreement) {
      case 'agree':
        return 'text-success'
      case 'disagree':
        return 'text-destructive'
      default:
        return 'text-muted-foreground'
    }
  }

  const getAgreementIcon = (agreement: 'agree' | 'disagree' | 'neutral') => {
    switch (agreement) {
      case 'agree':
        return <ThumbsUp size={14} className="text-success" />
      case 'disagree':
        return <ThumbsDown size={14} className="text-destructive" />
      default:
        return <Minus size={14} className="text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Chats size={24} />
            Unified Agent Communication
          </CardTitle>
          <CardDescription>
            All agents work together as one unified intelligence to answer questions and analyze trades
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <CheckCircle size={20} className="text-success" weight="fill" />
            <span className="text-sm font-medium">
              Unified Agent Mode: {communicatingAgents.length} agent{communicatingAgents.length !== 1 ? 's' : ''} working together
            </span>
            {communicatingAgents.length > 0 && (
              <span className="text-xs text-muted-foreground">
                ({communicatingAgents.map(a => a.name).join(', ')})
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ask the unified agent</label>
            <p className="text-xs text-muted-foreground">
              Your question will be analyzed by all enabled agents working together to provide a unified answer
            </p>
            <div className="flex gap-2">
              <Input
                id="user-question-input"
                placeholder="e.g., 'With the upcoming XRP ETF, what position is recommended?'"
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isAskingAgents || communicatingAgents.length === 0}
                className="flex-1"
              />
              <Button 
                onClick={handleAskAgents}
                disabled={isAskingAgents || !userQuestion.trim() || communicatingAgents.length === 0}
                size="icon"
              >
                <PaperPlaneRight size={18} weight={isAskingAgents ? "regular" : "fill"} />
              </Button>
            </div>
            {communicatingAgents.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Enable at least one agent to ask questions
              </p>
            )}
          </div>

          <div className="border-t pt-4 space-y-4">
            <div>
              <label className="text-sm font-medium">Agent discussion</label>
              <p className="text-xs text-muted-foreground mb-3">
                Have your agents discuss a specific asset
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset to discuss" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.slice(0, 15).map(asset => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.symbol} - ${asset.currentPrice.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleStartDiscussion}
                disabled={isDiscussing || !selectedAsset || communicatingAgents.length < 2}
              >
                {isDiscussing ? 'Discussing...' : 'Start Discussion'}
              </Button>
            </div>

            {communicatingAgents.length < 2 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">Need at least 2 agents for discussions</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversation History</CardTitle>
          <CardDescription>
            {messages.length} message{messages.length !== 1 ? 's' : ''} exchanged
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Chats size={48} className="mx-auto mb-4 opacity-20" />
                <p>No conversations yet</p>
                <p className="text-sm mt-2">Ask your agents a question or start a discussion</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {message.fromAgentId === 'user' ? (
                            <User size={16} className="text-accent" />
                          ) : (
                            <Robot size={16} className="text-primary" />
                          )}
                          <span className="font-semibold">{message.fromAgentName}</span>
                          {message.toAgentId && (
                            <>
                              <ArrowRight size={14} className="text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {agents.find(a => a.id === message.toAgentId)?.name}
                              </span>
                            </>
                          )}
                        </div>
                        <Badge variant="outline" className="mt-1">
                          {message.messageType}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-sm">{message.content}</p>

                    {message.signal && (
                      <div className="bg-muted/50 rounded p-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={message.signal.action === 'buy' ? 'default' : message.signal.action === 'sell' ? 'destructive' : 'secondary'}>
                            {message.signal.action.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {message.signal.confidence.toFixed(0)}% confident
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{message.signal.reasoning}</p>
                      </div>
                    )}

                    {message.responses && message.responses.length > 0 && (
                      <div className="space-y-2 mt-3 border-t pt-3">
                        <p className="text-xs font-medium text-muted-foreground">
                          {message.fromAgentId === 'user' ? 'Agent Responses:' : 'Responses:'}
                        </p>
                        {message.responses.map((response, idx) => (
                          <div key={idx} className="bg-muted/30 rounded p-3 space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Robot size={14} className="text-primary" />
                                <span className="text-sm font-medium">{response.agentName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {getAgreementIcon(response.agreement)}
                                <span className={`text-xs ${getAgreementColor(response.agreement)}`}>
                                  {response.agreement}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm mt-2">{response.response}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
