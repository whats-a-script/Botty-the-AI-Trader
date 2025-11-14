import { Asset, PricePoint } from './types'

const COINBASE_API_BASE = 'https://api.coinbase.com/v2'

interface CoinbaseSpotPrice {
  data: {
    amount: string
    currency: string
  }
}

interface CoinbaseHistoricalData {
  data: {
    prices: Array<{
      price: string
      time: string
    }>
  }
}

export const COINBASE_ASSETS = [
  {
    id: 'BTC',
    symbol: 'BTC',
    name: 'Bitcoin',
    currencyPair: 'BTC-USD'
  },
  {
    id: 'ETH',
    symbol: 'ETH',
    name: 'Ethereum',
    currencyPair: 'ETH-USD'
  },
  {
    id: 'SOL',
    symbol: 'SOL',
    name: 'Solana',
    currencyPair: 'SOL-USD'
  },
  {
    id: 'DOGE',
    symbol: 'DOGE',
    name: 'Dogecoin',
    currencyPair: 'DOGE-USD'
  }
]

export async function fetchCoinbasePrice(currencyPair: string): Promise<number> {
  try {
    const response = await fetch(`${COINBASE_API_BASE}/prices/${currencyPair}/spot`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data: CoinbaseSpotPrice = await response.json()
    return parseFloat(data.data.amount)
  } catch (error) {
    console.error(`Error fetching price for ${currencyPair}:`, error)
    throw error
  }
}

export async function fetchCoinbasePrices(currencyPairs: string[]): Promise<Map<string, number>> {
  const priceMap = new Map<string, number>()
  
  await Promise.all(
    currencyPairs.map(async (pair) => {
      try {
        const price = await fetchCoinbasePrice(pair)
        priceMap.set(pair, price)
      } catch (error) {
        console.error(`Failed to fetch ${pair}:`, error)
      }
    })
  )
  
  return priceMap
}

export async function initializeCoinbaseAssets(): Promise<Asset[]> {
  const assets: Asset[] = []
  
  for (const coinbaseAsset of COINBASE_ASSETS) {
    try {
      const price = await fetchCoinbasePrice(coinbaseAsset.currencyPair)
      const priceHistory = await fetchHistoricalData(coinbaseAsset.currencyPair)
      
      assets.push({
        id: coinbaseAsset.id,
        symbol: coinbaseAsset.symbol,
        name: coinbaseAsset.name,
        currentPrice: price,
        priceHistory,
        volatility: calculateVolatility(priceHistory)
      })
    } catch (error) {
      console.error(`Failed to initialize ${coinbaseAsset.symbol}:`, error)
    }
  }
  
  return assets
}

async function fetchHistoricalData(currencyPair: string): Promise<PricePoint[]> {
  const periods = 100
  
  try {
    const priceHistory: PricePoint[] = []
    const now = new Date()
    const intervalMinutes = 5
    
    for (let i = periods; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * intervalMinutes * 60 * 1000))
      const dateStr = date.toISOString().split('T')[0]
      
      try {
        const response = await fetch(`${COINBASE_API_BASE}/prices/${currencyPair}/spot?date=${dateStr}`)
        if (response.ok) {
          const data: CoinbaseSpotPrice = await response.json()
          priceHistory.push({
            timestamp: date.getTime(),
            price: parseFloat(data.data.amount)
          })
        }
      } catch (error) {
        console.error(`Error fetching historical data for ${dateStr}:`, error)
      }
      
      if (i > 0 && i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    if (priceHistory.length === 0) {
      const currentPrice = await fetchCoinbasePrice(currencyPair)
      return generateFallbackHistory(currentPrice, periods)
    }
    
    return priceHistory
  } catch (error) {
    console.error(`Error fetching historical data for ${currencyPair}:`, error)
    const currentPrice = await fetchCoinbasePrice(currencyPair)
    return generateFallbackHistory(currentPrice, periods)
  }
}

function generateFallbackHistory(currentPrice: number, periods: number): PricePoint[] {
  const history: PricePoint[] = []
  const now = Date.now()
  const periodMs = 5 * 60 * 1000
  let price = currentPrice * 0.95
  
  for (let i = periods; i >= 0; i--) {
    const timestamp = now - (i * periodMs)
    const change = (Math.random() - 0.5) * 0.02 * price
    price = price + change
    history.push({ timestamp, price })
  }
  
  return history
}

function calculateVolatility(priceHistory: PricePoint[]): number {
  if (priceHistory.length < 2) return 0.02
  
  const returns: number[] = []
  for (let i = 1; i < priceHistory.length; i++) {
    const returnPct = (priceHistory[i].price - priceHistory[i-1].price) / priceHistory[i-1].price
    returns.push(returnPct)
  }
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length
  const stdDev = Math.sqrt(variance)
  
  return Math.max(0.01, Math.min(0.05, stdDev))
}

export function updatePriceWithRealData(asset: Asset, newPrice: number): Asset {
  return {
    ...asset,
    currentPrice: newPrice,
    priceHistory: [
      ...asset.priceHistory,
      { timestamp: Date.now(), price: newPrice }
    ].slice(-100)
  }
}
