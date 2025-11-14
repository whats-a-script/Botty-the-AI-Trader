import { useState } from 'react'
import { AgentConfig, TradingMode, AIModel, AgentPerformance } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Robot, Play, Pause, Trash, TrendUp, TrendDown } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface AgentManagerProps {
  agents: AgentConfig[]
  performance: Map<string, AgentPerformance>
  onAgentUpdate: (agent: AgentConfig) => void
  onAgentDelete: (agentId: string) => void
  onAgentCreate: (agent: AgentConfig) => void
}

export function AgentManager({
  agents,
  performance,
  onAgentUpdate,
  onAgentDelete,
  onAgentCreate
}: AgentManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newAgent, setNewAgent] = useState<Partial<AgentConfig>>({
    name: '',
    model: 'gpt-4o-mini',
    mode: 'moderate',
    enabled: true,
    maxLeverage: 3,
    maxPositionSize: 10,
    stopLossPercent: 2,
    takeProfitPercent: 4,
    riskRewardRatio: 2,
    volatilityThreshold: 5,
    canCommunicate: true
  })

  const handleCreateAgent = () => {
    if (!newAgent.name) return
    
    const agent: AgentConfig = {
      id: `agent-${Date.now()}`,
      name: newAgent.name,
      model: newAgent.model as AIModel,
      mode: newAgent.mode as TradingMode,
      enabled: newAgent.enabled || true,
      maxLeverage: newAgent.maxLeverage || 3,
      maxPositionSize: newAgent.maxPositionSize || 10,
      stopLossPercent: newAgent.stopLossPercent || 2,
      takeProfitPercent: newAgent.takeProfitPercent || 4,
      riskRewardRatio: newAgent.riskRewardRatio || 2,
      volatilityThreshold: newAgent.volatilityThreshold || 5,
      canCommunicate: newAgent.canCommunicate ?? true
    }
    
    onAgentCreate(agent)
    setIsCreating(false)
    setNewAgent({
      name: '',
      model: 'gpt-4o-mini',
      mode: 'moderate',
      enabled: true,
      maxLeverage: 3,
      maxPositionSize: 10,
      stopLossPercent: 2,
      takeProfitPercent: 4,
      riskRewardRatio: 2,
      volatilityThreshold: 5,
      canCommunicate: true
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Trading Agents</h2>
          <p className="text-sm text-muted-foreground">
            Manage your autonomous trading agents
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Robot className="mr-2" size={18} />
              Create Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Trading Agent</DialogTitle>
              <DialogDescription>
                Configure a new AI agent with custom parameters
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input
                  id="agent-name"
                  placeholder="e.g., Momentum Trader"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-model">AI Model</Label>
                  <Select 
                    value={newAgent.model} 
                    onValueChange={(value) => setNewAgent({ ...newAgent, model: value as AIModel })}
                  >
                    <SelectTrigger id="agent-model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o (Advanced)</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast)</SelectItem>
                      <SelectItem value="deepseek">DeepSeek (Technical)</SelectItem>
                      <SelectItem value="qwen">Qwen (Crowd Analysis)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent-mode">Trading Mode</Label>
                  <Select 
                    value={newAgent.mode} 
                    onValueChange={(value) => setNewAgent({ ...newAgent, mode: value as TradingMode })}
                  >
                    <SelectTrigger id="agent-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Max Leverage: {newAgent.maxLeverage}x</Label>
                <Slider
                  value={[newAgent.maxLeverage || 3]}
                  onValueChange={([value]) => setNewAgent({ ...newAgent, maxLeverage: value })}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Max Position Size: {newAgent.maxPositionSize}%</Label>
                <Slider
                  value={[newAgent.maxPositionSize || 10]}
                  onValueChange={([value]) => setNewAgent({ ...newAgent, maxPositionSize: value })}
                  min={1}
                  max={50}
                  step={1}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stop Loss: {newAgent.stopLossPercent}%</Label>
                  <Slider
                    value={[newAgent.stopLossPercent || 2]}
                    onValueChange={([value]) => setNewAgent({ ...newAgent, stopLossPercent: value })}
                    min={0.5}
                    max={10}
                    step={0.5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Take Profit: {newAgent.takeProfitPercent}%</Label>
                  <Slider
                    value={[newAgent.takeProfitPercent || 4]}
                    onValueChange={([value]) => setNewAgent({ ...newAgent, takeProfitPercent: value })}
                    min={1}
                    max={20}
                    step={0.5}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Risk/Reward Ratio: {newAgent.riskRewardRatio}:1</Label>
                <Slider
                  value={[newAgent.riskRewardRatio || 2]}
                  onValueChange={([value]) => setNewAgent({ ...newAgent, riskRewardRatio: value })}
                  min={1}
                  max={5}
                  step={0.5}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="can-communicate"
                  checked={newAgent.canCommunicate ?? true}
                  onCheckedChange={(canCommunicate) => setNewAgent({ ...newAgent, canCommunicate })}
                />
                <Label htmlFor="can-communicate">Enable Agent Communication</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAgent} disabled={!newAgent.name}>
                Create Agent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const perf = performance.get(agent.id)
          
          return (
            <Card key={agent.id} className={agent.enabled ? 'border-accent' : 'opacity-60'}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Robot size={20} />
                      {agent.name}
                    </CardTitle>
                    <CardDescription>
                      {agent.model} • {agent.mode}
                    </CardDescription>
                  </div>
                  <Switch
                    checked={agent.enabled}
                    onCheckedChange={(enabled) => onAgentUpdate({ ...agent, enabled })}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {perf && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">P&L</span>
                      <span className={perf.totalPnL >= 0 ? 'text-success' : 'text-destructive'}>
                        ${(isFinite(perf.totalPnL) ? perf.totalPnL : 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Win Rate</span>
                      <span>{(isFinite(perf.winRate) ? perf.winRate * 100 : 0).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Trades</span>
                      <span>{perf.totalTrades || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confidence</span>
                      <Badge variant={perf.avgConfidence >= 85 ? 'default' : 'secondary'}>
                        {(isFinite(perf.avgConfidence) ? perf.avgConfidence : 0).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Leverage</span>
                    <span>{agent.maxLeverage}x</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Position Size</span>
                    <span>{agent.maxPositionSize}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>SL / TP</span>
                    <span>{agent.stopLossPercent}% / {agent.takeProfitPercent}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Communication</span>
                    <Badge variant={agent.canCommunicate ? 'default' : 'secondary'} className="text-xs">
                      {agent.canCommunicate ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>

                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onAgentDelete(agent.id)}
                >
                  <Trash className="mr-2" size={16} />
                  Delete Agent
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
