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
  const agents = agentsRaw || []
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
        
        setAssets([...coinbaseAssets, ...customAssets])
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
          })
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
    }, 60000)

    return () => clearInterval(interval)
  }, [autoTradeEnabled, agents, assets, portfolio])

  const generateSignalsForAllAgents = async () => {
    if (isGeneratingSignals) return
    
    setIsGeneratingSignals(true)
    const enabledAgents = agents.filter(a => a.enabled)
    
    if (enabledAgents.length === 0) {
      setIsGeneratingSignals(false)
      return
    }

    try {
      const topAssets = assets.slice(0, 10)
      const newSignals: TradingSignal[] = []

      for (const asset of topAssets) {
        try {
          const unifiedDecision = await getUnifiedAgentDecision(asset, enabledAgents, portfolio)
          
          if (unifiedDecision.signal.confidence >= 70 && 
              unifiedDecision.signal.action !== 'hold' &&
              unifiedDecision.executionRecommendation === 'execute') {
            newSignals.push(unifiedDecision.signal)
          }
        } catch (error) {
          console.error(`Error generating unified signal for ${asset.symbol}:`, error)
        }
      }

      setSignals(newSignals)
      
      if (newSignals.length > 0) {
        toast.success(`Unified agents generated ${newSignals.length} high-confidence signals`)
      } else {
        toast.info('No strong signals found - agents recommend waiting')
      }
    } catch (error) {
      console.error('Error generating signals:', error)
      toast.error('Failed to generate signals')
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
      const topAssets = assets.slice(0, 8)
      const executedTrades: string[] = []

      for (const asset of topAssets) {
        try {
          const unifiedDecision = await getUnifiedAgentDecision(asset, enabledAgents, portfolio)
          
          if (unifiedDecision.executionRecommendation === 'execute' && 
              unifiedDecision.signal.confidence >= 70 &&
              (unifiedDecision.signal.action === 'buy' || unifiedDecision.signal.action === 'sell')) {
            
            const quantity = unifiedDecision.signal.suggestedQuantity
            if (quantity > 0) {
              handleTrade(asset.id, unifiedDecision.signal.action, quantity)
              executedTrades.push(`${unifiedDecision.signal.action.toUpperCase()} ${asset.symbol}`)
            }
          }
        } catch (error) {
          console.error(`Error in auto-trade for ${asset.symbol}:`, error)
        }
      }

      if (executedTrades.length > 0) {
        toast.success(`Auto-trading executed ${executedTrades.length} trades: ${executedTrades.join(', ')}`)
      } else {
        toast.info('Auto-trading scan complete - no high-confidence opportunities found')
      }
    } catch (error) {
      console.error('Error in auto-trading:', error)
      toast.error('Auto-trading error occurred')
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
      
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AI Trading Simulator</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Unified multi-agent AI trading with live Coinbase data
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {!isLoadingUser && userInfo && (
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userInfo.avatarUrl} alt={userInfo.login} />
                    <AvatarFallback>
                      <UserIcon size={16} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-sm">
                    <div className="font-medium">{userInfo.login}</div>
                    {userInfo.email && (
                      <div className="text-xs text-muted-foreground">{userInfo.email}</div>
                    )}
                  </div>
                </div>
              )}
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ArrowsClockwise className="mr-2" size={16} />
                    Reset
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reset Portfolio?</DialogTitle>
                    <DialogDescription>
                      This will clear all positions and trades, and reset your balance to ${STARTING_BALANCE.toFixed(2)}.
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="destructive" onClick={handleResetPortfolio}>
                      Reset Portfolio
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoadingAssets ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Spinner className="w-12 h-12 animate-spin mx-auto text-accent" />
              <div>
                <p className="text-lg font-medium">Loading live Coinbase data...</p>
                <p className="text-sm text-muted-foreground">Fetching real-time cryptocurrency prices</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <div className="lg:col-span-1">
                <PortfolioSummary portfolio={portfolio} totalValue={totalValue} />
              </div>
              
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
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

            {selectedAsset && (
              <div className="mb-8">
                <AssetDetailCard asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
              </div>
            )}

            <Tabs defaultValue="unified" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 md:grid-cols-9 lg:w-auto lg:inline-grid">
                <TabsTrigger value="unified" className="flex items-center gap-2">
                  <UsersThree size={16} />
                  <span className="hidden sm:inline">Unified</span>
                </TabsTrigger>
                <TabsTrigger value="agents" className="flex items-center gap-2">
                  <Robot size={16} />
                  <span className="hidden sm:inline">Agents</span>
                </TabsTrigger>
                <TabsTrigger value="communication" className="flex items-center gap-2">
                  <Chats size={16} />
                  <span className="hidden sm:inline">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="pairs" className="flex items-center gap-2">
                  <Coin size={16} />
                  <span className="hidden sm:inline">Pairs</span>
                </TabsTrigger>
                <TabsTrigger value="signals" className="flex items-center gap-2">
                  <Lightning size={16} />
                  <span className="hidden sm:inline">Signals</span>
                </TabsTrigger>
                <TabsTrigger value="risk" className="flex items-center gap-2">
                  <Shield size={16} />
                  <span className="hidden sm:inline">Risk</span>
                </TabsTrigger>
                <TabsTrigger value="trade" className="flex items-center gap-2">
                  <Wallet size={16} />
                  <span className="hidden sm:inline">Trade</span>
                </TabsTrigger>
                <TabsTrigger value="journal" className="flex items-center gap-2">
                  <BookOpen size={16} />
                  <span className="hidden sm:inline">Journal</span>
                </TabsTrigger>
                <TabsTrigger value="forecast" className="flex items-center gap-2">
                  <ChartLine size={16} />
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
                  <div>
                    <h3 className="text-lg font-semibold">Unified Agent Signals</h3>
                    <p className="text-sm text-muted-foreground">
                      All agents work together to generate consensus trading signals
                    </p>
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
          </>
        )}
      </main>
    </div>
  )
}

function AssetDetailCard({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold">{asset.symbol}</h3>
          <p className="text-muted-foreground">{asset.name}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      <PriceChart historicalData={asset.priceHistory} height={300} />
    </div>
  )
}

export default App
