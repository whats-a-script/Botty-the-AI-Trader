import { useEffect, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Asset, Portfolio, AgentConfig, TradingSignal, AgentPerformance, AgentMessage, CustomTradingPair } from '@/lib/types'
import { initializeCoinbaseAssets, fetchCoinbasePrices, COINBASE_ASSETS, updatePriceWithRealData, fetchCoinbasePrice } from '@/lib/coinbase-api'
import { calculatePortfolioValue, executeTrade, updatePositionPrices } from '@/lib/trading'
import { PortfolioSummary } from '@/components/PortfolioSummary'
import { AssetCard } from '@/components/AssetCard'
import { TradeForm } from '@/components/TradeForm'
import { PositionsTable } from '@/components/PositionsTable'
import { ForecastPanel } from '@/components/ForecastPanel'
import { TradeHistory } from '@/components/TradeHistory'
import { PriceChart } from '@/components/PriceChart'
import { AgentManager } from '@/components/AgentManager'
import { SignalsDashboard } from '@/components/SignalsDashboard'
import { RiskManagement } from '@/components/RiskManagement'
import { TradeJournal } from '@/components/TradeJournal'
import { AgentCommunication } from '@/components/AgentCommunication'
import { CustomPairs } from '@/components/CustomPairs'
import { UnifiedAgentPanel } from '@/components/UnifiedAgentPanel'
import { RateLimitInfo } from '@/components/RateLimitWarning'
import { generateTradingSignal, checkStopLossAndTakeProfit, adjustStrategyBasedOnPerformance } from '@/lib/ai-agents'
import { getUnifiedAgentDecision } from '@/lib/unified-agent'
import { ChartLine, Wallet, Clock, ArrowsClockwise, Spinner, User as UserIcon, Robot, Shield, BookOpen, Lightning, Chats, Coin, UsersThree } from '@phosphor-icons/react'

const STARTING_BALANCE = 10000

function App() {
  const [portfolioRaw, setPortfolioRaw] = useKV<Portfolio>('portfolio', {
    cash: STARTING_BALANCE,
    positions: [],
    trades: [],
    startingBalance: STARTING_BALANCE,
    maxDrawdown: 0,
    currentDrawdown: 0,
    totalPnL: 0
  })
  
  const portfolio = portfolioRaw!
  const setPortfolio = setPortfolioRaw

  const [agentsRaw, setAgentsRaw] = useKV<AgentConfig[]>('ai-agents', [])
  const agents = (agentsRaw || []).map(agent => {
    if (!agent.holdingMode) {
      return { ...agent, holdingMode: 'short' as const }
    }
    return agent
  })
  const setAgents = setAgentsRaw

  const [performanceRaw, setPerformanceRaw] = useKV<Record<string, AgentPerformance>>('agent-performance', {})
  const performanceMap = new Map(Object.entries(performanceRaw || {}))
  const setPerformance = (map: Map<string, AgentPerformance>) => {
    setPerformanceRaw(Object.fromEntries(map))
  }

  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoadingAssets, setIsLoadingAssets] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [userInfo, setUserInfo] = useState<Awaited<ReturnType<typeof window.spark.user>> | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [signals, setSignals] = useState<TradingSignal[]>([])
  const [isGeneratingSignals, setIsGeneratingSignals] = useState(false)
  const [autoTradeEnabledRaw, setAutoTradeEnabledRaw] = useKV<boolean>('auto-trade-enabled', false)
  const autoTradeEnabled = autoTradeEnabledRaw || false
  const setAutoTradeEnabled = setAutoTradeEnabledRaw
  
  const [messagesRaw, setMessagesRaw] = useKV<AgentMessage[]>('agent-messages', [])
  const messages = messagesRaw || []
  const setMessages = setMessagesRaw
  
  const [customPairsRaw, setCustomPairsRaw] = useKV<CustomTradingPair[]>('custom-pairs', [])
  const customPairs = customPairsRaw || []
  const setCustomPairs = setCustomPairsRaw

  useEffect(() => {
    async function loadUserInfo() {
      try {
        setIsLoadingUser(true)
        const user = await window.spark.user()
        setUserInfo(user)
      } catch (error) {
        console.error('Error loading user info:', error)
        toast.error('Failed to load account info')
      } finally {
        setIsLoadingUser(false)
      }
    }
    
    loadUserInfo()
  }, [])

  useEffect(() => {
    async function loadCoinbaseData() {
      try {
        setIsLoadingAssets(true)
        const loadTimeout = setTimeout(() => {
          toast.error('Loading is taking longer than expected...')
        }, 5000)
        
        const coinbaseAssets = await initializeCoinbaseAssets()
        clearTimeout(loadTimeout)
        
        const customAssets: Asset[] = []
        for (const pair of customPairs.filter(p => p.enabled)) {
          try {
            const pricePromise = fetchCoinbasePrice(pair.currencyPair)
            const timeoutPromise = new Promise<number>((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 2000)
            )
            
            const price = await Promise.race([pricePromise, timeoutPromise])
            customAssets.push({
              id: pair.id,
              symbol: pair.symbol,
              name: pair.name,
              currentPrice: price,
              priceHistory: [{timestamp: Date.now(), price}],
              volatility: 0.03
            })
          } catch (error) {
            console.error(`Failed to load custom pair ${pair.symbol}:`, error)
          }
        }
        
        const allAssets = [...coinbaseAssets, ...customAssets].sort((a, b) => 
          a.symbol.localeCompare(b.symbol)
        )
        setAssets(allAssets)
        toast.success(`Loaded ${coinbaseAssets.length} crypto assets`)
      } catch (error) {
        console.error('Error loading Coinbase data:', error)
        toast.error('Failed to load data - using fallback prices')
      } finally {
        setIsLoadingAssets(false)
      }
    }
    
    loadCoinbaseData()
  }, [customPairs])

  useEffect(() => {
    if (assets.length === 0) return

    const interval = setInterval(async () => {
      try {
        const currencyPairs = COINBASE_ASSETS.map(a => a.currencyPair)
        const priceMap = await fetchCoinbasePrices(currencyPairs)
        
        setAssets(currentAssets => {
          return currentAssets.map(asset => {
            const coinbaseAsset = COINBASE_ASSETS.find(ca => ca.id === asset.id)
            if (!coinbaseAsset) return asset
            
            const newPrice = priceMap.get(coinbaseAsset.currencyPair)
            if (!newPrice) return asset
            
            return updatePriceWithRealData(asset, newPrice)
          }).sort((a, b) => a.symbol.localeCompare(b.symbol))
        })

        const assetPriceMap = new Map<string, number>()
        assets.forEach(asset => {
          const coinbaseAsset = COINBASE_ASSETS.find(ca => ca.id === asset.id)
          if (coinbaseAsset) {
            const price = priceMap.get(coinbaseAsset.currencyPair)
            if (price) assetPriceMap.set(asset.id, price)
          }
        })

        setPortfolio(current => {
          if (!current) {
            return {
              cash: STARTING_BALANCE,
              positions: [],
              trades: [],
              startingBalance: STARTING_BALANCE,
              maxDrawdown: 0,
              currentDrawdown: 0,
              totalPnL: 0
            }
          }
          const updated = updatePositionPrices(current, assetPriceMap)
          return checkStopLossAndTakeProfit(updated, assetPriceMap)
        })
      } catch (error) {
        console.error('Error updating prices:', error)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [assets, setPortfolio])

  useEffect(() => {
    if (!autoTradeEnabled || agents.length === 0 || assets.length === 0) return
    if (portfolio.currentDrawdown > 15) {
      toast.warning('Auto-trading paused: Drawdown limit reached')
      setAutoTradeEnabled(false)
      return
    }

    const interval = setInterval(async () => {
      await executeAutoTrades()
    }, 30000)

    return () => clearInterval(interval)
  }, [autoTradeEnabled, agents, assets, portfolio])

  const generateSignalsForAllAgents = async () => {
    if (isGeneratingSignals) return
    
    setIsGeneratingSignals(true)
    const enabledAgents = agents.filter(a => a.enabled)
    
    if (enabledAgents.length === 0) {
      toast.warning('Please enable at least one agent first')
      setIsGeneratingSignals(false)
      return
    }

    try {
      const topAssets = assets.slice(0, 5)
      const newSignals: TradingSignal[] = []
      let rateLimitHit = false

      for (const asset of topAssets) {
        try {
          const unifiedDecision = await getUnifiedAgentDecision(asset, enabledAgents, portfolio)
          
          if (unifiedDecision.signal.reasoning?.includes('Rate limit')) {
            rateLimitHit = true
            break
          }
          
          if (unifiedDecision.signal.confidence >= 60 && 
              unifiedDecision.signal.action !== 'hold' &&
              unifiedDecision.executionRecommendation === 'execute') {
            newSignals.push(unifiedDecision.signal)
          }
        } catch (error: any) {
          if (error?.message?.includes('429')) {
            rateLimitHit = true
            break
          }
          console.error(`Error generating unified signal for ${asset.symbol}:`, error)
        }
      }

      if (rateLimitHit) {
        toast.warning('Rate limit reached. Please wait 30 seconds before generating more signals.')
      }

      setSignals(newSignals)
      
      if (newSignals.length > 0) {
        toast.success(`Unified agents generated ${newSignals.length} high-confidence signals`)
      } else if (!rateLimitHit) {
        toast.info('No strong signals found - agents recommend waiting')
      }
    } catch (error: any) {
      console.error('Error generating signals:', error)
      const errorMsg = error?.message?.includes('429')
        ? 'Rate limit reached. Please wait before retrying.'
        : 'Failed to generate signals'
      toast.error(errorMsg)
    } finally {
      setIsGeneratingSignals(false)
    }
  }

  const executeAutoTrades = async () => {
    if (!autoTradeEnabled || isGeneratingSignals) return

    const enabledAgents = agents.filter(a => a.enabled)
    if (enabledAgents.length === 0) {
      toast.warning('No agents enabled for auto-trading')
      setAutoTradeEnabled(false)
      return
    }

    if (portfolio.currentDrawdown > 15) {
      toast.warning('Auto-trading stopped: Drawdown limit reached')
      setAutoTradeEnabled(false)
      return
    }

    setIsGeneratingSignals(true)
    
    try {
      const topAssets = assets.slice(0, 3)
      const executedTrades: string[] = []
      let rateLimitHit = false

      for (const asset of topAssets) {
        try {
          const unifiedDecision = await getUnifiedAgentDecision(asset, enabledAgents, portfolio)
          
          if (unifiedDecision.signal.reasoning?.includes('Rate limit')) {
            rateLimitHit = true
            break
          }
          
          if (unifiedDecision.executionRecommendation === 'execute' && 
              unifiedDecision.signal.confidence >= 60 &&
              (unifiedDecision.signal.action === 'buy' || unifiedDecision.signal.action === 'sell')) {
            
            const quantity = unifiedDecision.signal.suggestedQuantity
            if (quantity > 0) {
              handleTrade(asset.id, unifiedDecision.signal.action, quantity)
              executedTrades.push(`${unifiedDecision.signal.action.toUpperCase()} ${asset.symbol}`)
            }
          }
        } catch (error: any) {
          if (error?.message?.includes('429')) {
            rateLimitHit = true
            toast.warning('Auto-trading paused: Rate limit reached')
            setAutoTradeEnabled(false)
            break
          }
          console.error(`Error in auto-trade for ${asset.symbol}:`, error)
        }
      }

      if (rateLimitHit) {
        toast.warning('Auto-trading paused due to rate limits. Wait 1 minute before re-enabling.')
        setAutoTradeEnabled(false)
      } else if (executedTrades.length > 0) {
        toast.success(`Auto-trading executed ${executedTrades.length} trades: ${executedTrades.join(', ')}`)
      } else {
        toast.info('Auto-trading scan complete - no high-confidence opportunities found')
      }
    } catch (error: any) {
      console.error('Error in auto-trading:', error)
      const errorMsg = error?.message?.includes('429')
        ? 'Auto-trading paused: Rate limit reached'
        : 'Auto-trading error occurred'
      toast.error(errorMsg)
      if (error?.message?.includes('429')) {
        setAutoTradeEnabled(false)
      }
    } finally {
      setIsGeneratingSignals(false)
    }
  }

  const currentPrices = new Map(assets.map(a => [a.id, a.currentPrice]))
  const totalValue = portfolio ? calculatePortfolioValue(portfolio, currentPrices) : STARTING_BALANCE

  const handleTrade = (assetId: string, type: 'buy' | 'sell', quantity: number) => {
    const asset = assets.find(a => a.id === assetId)
    if (!asset || !portfolio) return

    const assetSymbol = asset.symbol
    const assetPrice = asset.currentPrice
    
    setPortfolio(current => {
      if (!current) {
        return {
          cash: STARTING_BALANCE,
          positions: [],
          trades: [],
          startingBalance: STARTING_BALANCE,
          maxDrawdown: 0,
          currentDrawdown: 0,
          totalPnL: 0
        }
      }
      return executeTrade(current, type, assetId, assetSymbol, quantity, assetPrice)
    })
    
    toast.success(`${type === 'buy' ? 'Bought' : 'Sold'} ${quantity} ${assetSymbol}`)
  }

  const handleExecuteSignal = (signal: TradingSignal) => {
    const asset = assets.find(a => a.id === signal.assetId)
    if (!asset) return

    const quantity = signal.suggestedQuantity || 0.01
    handleTrade(signal.assetId, signal.action as 'buy' | 'sell', quantity)
    
    toast.success(`Executed AI signal: ${signal.action} ${asset.symbol} with ${signal.confidence.toFixed(0)}% confidence`)
  }

  const handleResetPortfolio = () => {
    setPortfolio({
      cash: STARTING_BALANCE,
      positions: [],
      trades: [],
      startingBalance: STARTING_BALANCE,
      maxDrawdown: 0,
      currentDrawdown: 0,
      totalPnL: 0
    })
    toast.success('Portfolio reset successfully')
  }

  const handleAgentCreate = (agent: AgentConfig) => {
    setAgents([...agents, agent])
    toast.success(`Created agent: ${agent.name}`)
  }

  const handleAgentUpdate = (updatedAgent: AgentConfig) => {
    setAgents(agents.map(a => a.id === updatedAgent.id ? updatedAgent : a))
    toast.info(`Updated agent: ${updatedAgent.name}`)
  }

  const handleAgentDelete = (agentId: string) => {
    setAgents(agents.filter(a => a.id !== agentId))
    toast.info('Agent deleted')
  }

  const handleNewMessage = (message: AgentMessage) => {
    setMessages((current) => {
      const existing = (current || []).findIndex(m => m.id === message.id)
      if (existing >= 0) {
        const updated = [...(current || [])]
        updated[existing] = message
        return updated
      }
      return [...(current || []), message]
    })
  }

  const handleAddCustomPair = (pair: CustomTradingPair) => {
    setCustomPairs((current) => [...(current || []), pair])
  }

  const handleToggleCustomPair = (pairId: string, enabled: boolean) => {
    setCustomPairs((current) => 
      (current || []).map(p => p.id === pairId ? { ...p, enabled } : p)
    )
  }

  const handleRemoveCustomPair = (pairId: string) => {
    setCustomPairs((current) => (current || []).filter(p => p.id !== pairId))
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      
      <header className="system-toolbar sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/80 hover:bg-destructive transition-colors cursor-pointer"></div>
                <div className="w-3 h-3 rounded-full bg-[oklch(0.75_0.15_60)] hover:bg-[oklch(0.70_0.15_60)] transition-colors cursor-pointer"></div>
                <div className="w-3 h-3 rounded-full bg-success/80 hover:bg-success transition-colors cursor-pointer"></div>
              </div>
              <div className="ml-2">
                <h1 className="text-sm font-semibold tracking-tight">AI Trading Simulator</h1>
                <p className="text-xs text-muted-foreground">
                  Unified multi-agent AI trading
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isLoadingUser && userInfo && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50 border border-border/50">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={userInfo.avatarUrl} alt={userInfo.login} />
                    <AvatarFallback>
                      <UserIcon size={12} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-xs">
                    <div className="font-medium">{userInfo.login}</div>
                  </div>
                </div>
              )}
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="system-button h-7 text-xs">
                    <ArrowsClockwise className="mr-1.5" size={14} />
                    Reset
                  </Button>
                </DialogTrigger>
                <DialogContent className="system-window">
                  <DialogHeader>
                    <DialogTitle>Reset Portfolio?</DialogTitle>
                    <DialogDescription>
                      This will clear all positions and trades, and reset your balance to ${STARTING_BALANCE.toFixed(2)}.
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="destructive" onClick={handleResetPortfolio} className="system-button">
                      Reset Portfolio
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {isLoadingAssets ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4 system-window p-8">
              <Spinner className="w-10 h-10 animate-spin mx-auto text-primary" />
              <div>
                <p className="text-sm font-medium">Loading live Coinbase data...</p>
                <p className="text-xs text-muted-foreground">Fetching real-time cryptocurrency prices</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
              <div className="lg:col-span-1">
                <div className="system-window">
                  <PortfolioSummary portfolio={portfolio} totalValue={totalValue} />
                </div>
              </div>
              
              <div className="lg:col-span-3">
                <div className="system-window p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-2">
                    {assets.map(asset => (
                      <AssetCard
                        key={asset.id}
                        asset={asset}
                        onClick={() => setSelectedAsset(asset)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {selectedAsset && (
              <div className="mb-6">
                <AssetDetailCard asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
              </div>
            )}

            <div className="system-window p-4">
              <Tabs defaultValue="unified" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4 md:grid-cols-9 lg:w-auto lg:inline-grid bg-secondary/30 p-1">
                  <TabsTrigger value="unified" className="flex items-center gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs">
                    <UsersThree size={14} />
                    <span className="hidden sm:inline">Unified</span>
                  </TabsTrigger>
                  <TabsTrigger value="agents" className="flex items-center gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs">
                    <Robot size={14} />
                    <span className="hidden sm:inline">Agents</span>
                  </TabsTrigger>
                  <TabsTrigger value="communication" className="flex items-center gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs">
                    <Chats size={14} />
                    <span className="hidden sm:inline">Chat</span>
                  </TabsTrigger>
                  <TabsTrigger value="pairs" className="flex items-center gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs">
                    <Coin size={14} />
                    <span className="hidden sm:inline">Pairs</span>
                  </TabsTrigger>
                  <TabsTrigger value="signals" className="flex items-center gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs">
                    <Lightning size={14} />
                    <span className="hidden sm:inline">Signals</span>
                  </TabsTrigger>
                  <TabsTrigger value="risk" className="flex items-center gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs">
                    <Shield size={14} />
                    <span className="hidden sm:inline">Risk</span>
                  </TabsTrigger>
                  <TabsTrigger value="trade" className="flex items-center gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs">
                    <Wallet size={14} />
                    <span className="hidden sm:inline">Trade</span>
                  </TabsTrigger>
                  <TabsTrigger value="journal" className="flex items-center gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs">
                    <BookOpen size={14} />
                    <span className="hidden sm:inline">Journal</span>
                  </TabsTrigger>
                  <TabsTrigger value="forecast" className="flex items-center gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs">
                    <ChartLine size={14} />
                    <span className="hidden sm:inline">Forecast</span>
                  </TabsTrigger>
                </TabsList>

              <TabsContent value="unified" className="space-y-6">
                <UnifiedAgentPanel
                  assets={assets}
                  agents={agents}
                  portfolio={portfolio}
                  autoTradeEnabled={autoTradeEnabled}
                  onToggleAutoTrade={setAutoTradeEnabled}
                  onExecuteSignal={handleTrade}
                />
              </TabsContent>

              <TabsContent value="agents" className="space-y-6">
                <AgentManager
                  agents={agents}
                  performance={performanceMap}
                  onAgentCreate={handleAgentCreate}
                  onAgentUpdate={handleAgentUpdate}
                  onAgentDelete={handleAgentDelete}
                />
              </TabsContent>

              <TabsContent value="communication">
                <AgentCommunication 
                  agents={agents}
                  assets={assets}
                  portfolio={portfolio}
                  messages={messages}
                  onNewMessage={handleNewMessage}
                />
              </TabsContent>

              <TabsContent value="pairs">
                <CustomPairs
                  customPairs={customPairs}
                  onAddPair={handleAddCustomPair}
                  onTogglePair={handleToggleCustomPair}
                  onRemovePair={handleRemoveCustomPair}
                />
              </TabsContent>

              <TabsContent value="signals" className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">Unified Agent Signals</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      All agents work together to generate consensus trading signals
                    </p>
                    <RateLimitInfo />
                  </div>
                  <Button 
                    onClick={generateSignalsForAllAgents}
                    disabled={isGeneratingSignals || agents.filter(a => a.enabled).length === 0}
                  >
                    {isGeneratingSignals ? (
                      <>
                        <Spinner className="mr-2 animate-spin" size={16} />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Lightning className="mr-2" size={16} />
                        Generate Unified Signals
                      </>
                    )}
                  </Button>
                </div>
                <SignalsDashboard 
                  signals={signals}
                  assets={assets}
                  onExecuteSignal={handleExecuteSignal}
                />
              </TabsContent>

              <TabsContent value="risk">
                <RiskManagement portfolio={portfolio} totalValue={totalValue} />
              </TabsContent>

              <TabsContent value="trade" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <TradeForm
                    assets={assets}
                    portfolio={portfolio}
                    onTrade={handleTrade}
                  />
                  <div className="lg:col-span-2">
                    <PositionsTable positions={portfolio.positions} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="journal">
                <TradeJournal trades={portfolio.trades} portfolio={portfolio} />
              </TabsContent>

              <TabsContent value="forecast">
                <ForecastPanel assets={assets} />
              </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function AssetDetailCard({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  return (
    <div className="system-window p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">{asset.symbol}</h3>
          <p className="text-sm text-muted-foreground">{asset.name}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="system-button h-8 text-xs">
          Close
        </Button>
      </div>
      <PriceChart historicalData={asset.priceHistory} height={300} />
    </div>
  )
}

export default App
