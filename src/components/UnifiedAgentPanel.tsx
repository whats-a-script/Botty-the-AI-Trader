import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Asset, AgentConfig, Portfolio } from '@/lib/types'
import { getUnifiedAgentDecision, UnifiedAgentDecision } from '@/lib/unified-agent'
import { Robot, CheckCircle, Warning, Clock, TrendUp, TrendDown, Minus, Lightning, Play, Stop } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface UnifiedAgentPanelProps {
  assets: Asset[]
  agents: AgentConfig[]
  portfolio: Portfolio
  autoTradeEnabled: boolean
  onToggleAutoTrade: (enabled: boolean) => void
  onExecuteSignal: (assetId: string, action: 'buy' | 'sell', quantity: number) => void
}

export function UnifiedAgentPanel({ assets, agents, portfolio, autoTradeEnabled, onToggleAutoTrade, onExecuteSignal }: UnifiedAgentPanelProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string>('')
  const [decision, setDecision] = useState<UnifiedAgentDecision | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const enabledAgents = agents.filter(a => a.enabled)

  const handleToggleAutoTrade = (checked: boolean) => {
    if (checked && enabledAgents.length === 0) {
      toast.error('Enable at least one agent before starting auto-trading')
      return
    }
    if (checked && portfolio.currentDrawdown > 15) {
      toast.error('Cannot enable auto-trading: Drawdown limit exceeded')
      return
    }
    onToggleAutoTrade(checked)
    toast.success(checked ? 'Auto-trading enabled - agents will scan every 60 seconds' : 'Auto-trading disabled')
  }

  const handleAnalyze = async () => {
    if (!selectedAssetId) return

    const asset = assets.find(a => a.id === selectedAssetId)
    if (!asset) return

    setIsAnalyzing(true)
    try {
      const result = await getUnifiedAgentDecision(asset, enabledAgents, portfolio)
      setDecision(result)
      toast.success('Unified agent analysis complete')
    } catch (error) {
      console.error('Error analyzing asset:', error)
      toast.error('Failed to analyze asset')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleExecute = () => {
    if (!decision || !selectedAssetId) return

    const asset = assets.find(a => a.id === selectedAssetId)
    if (!asset) return

    if (decision.signal.action === 'buy' || decision.signal.action === 'sell') {
      onExecuteSignal(
        selectedAssetId,
        decision.signal.action,
        decision.signal.suggestedQuantity
      )
    }
  }

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'execute':
        return 'text-success'
      case 'wait':
        return 'text-accent'
      default:
        return 'text-muted-foreground'
    }
  }

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'execute':
        return <CheckCircle size={20} weight="fill" className="text-success" />
      case 'wait':
        return <Clock size={20} className="text-accent" />
      default:
        return <Warning size={20} className="text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      <Card className={autoTradeEnabled ? 'border-accent shadow-lg' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Robot size={24} />
                Unified Agent System
              </CardTitle>
              <CardDescription>
                {enabledAgents.length} enabled agents work together to analyze and trade
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {autoTradeEnabled && (
                <Badge variant="default" className="animate-pulse">
                  <Lightning size={14} className="mr-1" weight="fill" />
                  Auto-Trading Active
                </Badge>
              )}
              <div className="flex items-center gap-2">
                <Switch
                  checked={autoTradeEnabled}
                  onCheckedChange={handleToggleAutoTrade}
                  disabled={enabledAgents.length === 0}
                />
                <span className="text-sm font-medium">
                  {autoTradeEnabled ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {autoTradeEnabled && (
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-accent font-medium">
                <Play size={16} weight="fill" />
                Auto-Trading Mode Active
              </div>
              <p className="text-sm text-muted-foreground">
                Unified agents automatically scan top assets every 60 seconds. Trades are executed when all agents reach 70%+ confidence consensus.
              </p>
              <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                <div className="bg-background rounded p-2">
                  <div className="text-muted-foreground">Safety Threshold</div>
                  <div className="font-medium">70% Confidence</div>
                </div>
                <div className="bg-background rounded p-2">
                  <div className="text-muted-foreground">Scan Interval</div>
                  <div className="font-medium">60 seconds</div>
                </div>
                <div className="bg-background rounded p-2">
                  <div className="text-muted-foreground">Max Drawdown</div>
                  <div className="font-medium">15%</div>
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div>
            <div className="text-sm font-medium mb-3">Manual Analysis</div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset to analyze" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.slice(0, 20).map(asset => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.symbol} - ${asset.currentPrice.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !selectedAssetId || enabledAgents.length === 0}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Button>
            </div>
          </div>

          {enabledAgents.length === 0 && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              Enable at least one agent in the "Agents" tab to use unified trading
            </div>
          )}
        </CardContent>
      </Card>

      {decision && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Unified Decision</span>
                <Badge 
                  variant={decision.signal.action === 'buy' ? 'default' : decision.signal.action === 'sell' ? 'destructive' : 'secondary'}
                  className="text-base px-4 py-1"
                >
                  {decision.signal.action.toUpperCase()}
                </Badge>
              </CardTitle>
              <CardDescription>
                Consensus from {decision.consensus.totalAgents} agents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Confidence</span>
                  <span className="text-sm font-bold">{decision.signal.confidence.toFixed(1)}%</span>
                </div>
                <Progress value={decision.signal.confidence} className="h-2" />
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{decision.consensus.buyVotes}</div>
                  <div className="text-xs text-muted-foreground">Buy Votes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">{decision.consensus.sellVotes}</div>
                  <div className="text-xs text-muted-foreground">Sell Votes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">{decision.consensus.holdVotes}</div>
                  <div className="text-xs text-muted-foreground">Hold Votes</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Recommendation</span>
                  <div className="flex items-center gap-2">
                    {getRecommendationIcon(decision.executionRecommendation)}
                    <span className={`text-sm font-semibold ${getRecommendationColor(decision.executionRecommendation)}`}>
                      {decision.executionRecommendation.toUpperCase()}
                    </span>
                  </div>
                </div>

                {decision.consensus.isUnanimous && (
                  <Badge variant="outline" className="w-full justify-center">
                    <CheckCircle size={14} className="mr-1" weight="fill" />
                    Unanimous Decision
                  </Badge>
                )}

                {decision.consensus.conflictingOpinions && (
                  <Badge variant="outline" className="w-full justify-center border-yellow-500/50">
                    <Warning size={14} className="mr-1" />
                    Conflicting Opinions Detected
                  </Badge>
                )}
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="text-sm font-medium">Reasoning</div>
                <p className="text-sm text-muted-foreground">{decision.reasoning}</p>
              </div>

              {(decision.signal.action === 'buy' || decision.signal.action === 'sell') && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Suggested Quantity</div>
                    <div className="font-medium">{decision.signal.suggestedQuantity.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Leverage</div>
                    <div className="font-medium">{decision.signal.leverage}x</div>
                  </div>
                  {decision.signal.takeProfit && (
                    <div>
                      <div className="text-muted-foreground">Take Profit</div>
                      <div className="font-medium text-success">${decision.signal.takeProfit.toFixed(2)}</div>
                    </div>
                  )}
                  {decision.signal.stopLoss && (
                    <div>
                      <div className="text-muted-foreground">Stop Loss</div>
                      <div className="font-medium text-destructive">${decision.signal.stopLoss.toFixed(2)}</div>
                    </div>
                  )}
                </div>
              )}

              {decision.executionRecommendation === 'execute' && (
                <Button 
                  onClick={handleExecute}
                  className="w-full"
                  size="lg"
                  variant={decision.signal.action === 'buy' ? 'default' : 'destructive'}
                >
                  Execute {decision.signal.action.toUpperCase()} Trade
                </Button>
              )}

              {decision.executionRecommendation === 'wait' && (
                <Button 
                  onClick={handleExecute}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  Execute Anyway (Not Recommended)
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Individual Agent Votes</CardTitle>
              <CardDescription>
                See how each agent voted on this decision
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {decision.agentVotes.map((vote, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Robot size={16} />
                        <span className="font-medium">{vote.agentName}</span>
                        <Badge variant="outline" className="text-xs">
                          Weight: {vote.weight.toFixed(1)}x
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {vote.vote.action === 'buy' && <TrendUp size={16} className="text-success" />}
                        {vote.vote.action === 'sell' && <TrendDown size={16} className="text-destructive" />}
                        {vote.vote.action === 'hold' && <Minus size={16} className="text-muted-foreground" />}
                        <Badge 
                          variant={vote.vote.action === 'buy' ? 'default' : vote.vote.action === 'sell' ? 'destructive' : 'secondary'}
                        >
                          {vote.vote.action.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={vote.vote.confidence} className="h-1.5 flex-1" />
                      <span className="text-xs font-medium w-12 text-right">{vote.vote.confidence.toFixed(0)}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{vote.vote.reasoning.slice(0, 150)}...</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
