import { useState, useEffect } from 'react'
import { AgentConfig, AgentMessage, Asset, Portfolio } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Chats, ArrowRight, ThumbsUp, ThumbsDown, Minus } from '@phosphor-icons/react'
import { initiateAgentDiscussion, broadcastSignalToAgents } from '@/lib/agent-communication'

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

  const communicatingAgents = agents.filter(a => a.enabled && a.canCommunicate)

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
    } catch (error) {
      console.error('Discussion error:', error)
    } finally {
      setIsDiscussing(false)
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
            Agent Communication
          </CardTitle>
          <CardDescription>
            Enable agents to discuss and reach consensus on trading decisions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{communicatingAgents.length} agents can communicate</span>
            {communicatingAgents.length < 2 && (
              <Badge variant="secondary">Need at least 2 agents</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Discussion History</CardTitle>
          <CardDescription>
            {messages.length} messages exchanged
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Chats size={48} className="mx-auto mb-4 opacity-20" />
                <p>No agent discussions yet</p>
                <p className="text-sm mt-2">Start a discussion to see agent communication</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
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
                        <p className="text-xs font-medium text-muted-foreground">Responses:</p>
                        {message.responses.map((response, idx) => (
                          <div key={idx} className="bg-muted/30 rounded p-2 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{response.agentName}</span>
                              <div className="flex items-center gap-1">
                                {getAgreementIcon(response.agreement)}
                                <span className={`text-xs ${getAgreementColor(response.agreement)}`}>
                                  {response.agreement}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs">{response.response}</p>
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
