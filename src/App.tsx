import { useEffect, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Asset, Portfolio } from '@/lib/types'
import { initializeCoinbaseAssets, fetchCoinbasePrices, COINBASE_ASSETS, updatePriceWithRealData } from '@/lib/coinbase-api'
import { calculatePortfolioValue, executeTrade, updatePositionPrices } from '@/lib/trading'
import { PortfolioSummary } from '@/components/PortfolioSummary'
import { AssetCard } from '@/components/AssetCard'
import { TradeForm } from '@/components/TradeForm'
import { PositionsTable } from '@/components/PositionsTable'
import { ForecastPanel } from '@/components/ForecastPanel'
import { TradeHistory } from '@/components/TradeHistory'
import { PriceChart } from '@/components/PriceChart'
import { ChartLine, Wallet, Clock, ArrowsClockwise, Spinner } from '@phosphor-icons/react'

const STARTING_BALANCE = 10000

function App() {
  const [portfolioRaw, setPortfolioRaw] = useKV<Portfolio>('portfolio', {
    cash: STARTING_BALANCE,
    positions: [],
    trades: [],
    startingBalance: STARTING_BALANCE
  })
  
  const portfolio = portfolioRaw!
  const setPortfolio = setPortfolioRaw

  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoadingAssets, setIsLoadingAssets] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  useEffect(() => {
    async function loadCoinbaseData() {
      try {
        setIsLoadingAssets(true)
        const coinbaseAssets = await initializeCoinbaseAssets()
        setAssets(coinbaseAssets)
        toast.success('Live Coinbase data loaded')
      } catch (error) {
        console.error('Error loading Coinbase data:', error)
        toast.error('Failed to load live data')
      } finally {
        setIsLoadingAssets(false)
      }
    }
    
    loadCoinbaseData()
  }, [])

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
              startingBalance: STARTING_BALANCE
            }
          }
          return updatePositionPrices(current, assetPriceMap)
        })
      } catch (error) {
        console.error('Error updating prices:', error)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [assets, setPortfolio])

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
          startingBalance: STARTING_BALANCE
        }
      }
      return executeTrade(current, type, assetId, assetSymbol, quantity, assetPrice)
    })
  }

  const handleResetPortfolio = () => {
    setPortfolio({
      cash: STARTING_BALANCE,
      positions: [],
      trades: [],
      startingBalance: STARTING_BALANCE
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AI Trading Simulator</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Live Coinbase data with AI-powered forecasting
              </p>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowsClockwise className="mr-2" size={16} />
                  Reset Portfolio
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <PortfolioSummary portfolio={portfolio} totalValue={totalValue} />
              
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <Tabs defaultValue="trade" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
                <TabsTrigger value="trade" className="flex items-center gap-2">
                  <Wallet size={16} />
                  <span className="hidden sm:inline">Trade</span>
                </TabsTrigger>
                <TabsTrigger value="forecast" className="flex items-center gap-2">
                  <ChartLine size={16} />
                  <span className="hidden sm:inline">Forecast</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <Clock size={16} />
                  <span className="hidden sm:inline">History</span>
                </TabsTrigger>
              </TabsList>

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

              <TabsContent value="forecast">
                <ForecastPanel assets={assets} />
              </TabsContent>

              <TabsContent value="history">
                <TradeHistory trades={portfolio.trades} />
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