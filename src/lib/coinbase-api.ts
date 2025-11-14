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
    id: 'USDT',
    symbol: 'USDT',
    name: 'Tether',
    currencyPair: 'USDT-USD'
  },
  {
    id: 'BNB',
    symbol: 'BNB',
    name: 'BNB',
    currencyPair: 'BNB-USD'
  },
  {
    id: 'SOL',
    symbol: 'SOL',
    name: 'Solana',
    currencyPair: 'SOL-USD'
  },
  {
    id: 'USDC',
    symbol: 'USDC',
    name: 'USD Coin',
    currencyPair: 'USDC-USD'
  },
  {
    id: 'XRP',
    symbol: 'XRP',
    name: 'XRP',
    currencyPair: 'XRP-USD'
  },
  {
    id: 'ADA',
    symbol: 'ADA',
    name: 'Cardano',
    currencyPair: 'ADA-USD'
  },
  {
    id: 'AVAX',
    symbol: 'AVAX',
    name: 'Avalanche',
    currencyPair: 'AVAX-USD'
  },
  {
    id: 'DOGE',
    symbol: 'DOGE',
    name: 'Dogecoin',
    currencyPair: 'DOGE-USD'
  },
  {
    id: 'DOT',
    symbol: 'DOT',
    name: 'Polkadot',
    currencyPair: 'DOT-USD'
  },
  {
    id: 'MATIC',
    symbol: 'MATIC',
    name: 'Polygon',
    currencyPair: 'MATIC-USD'
  },
  {
    id: 'LINK',
    symbol: 'LINK',
    name: 'Chainlink',
    currencyPair: 'LINK-USD'
  },
  {
    id: 'UNI',
    symbol: 'UNI',
    name: 'Uniswap',
    currencyPair: 'UNI-USD'
  },
  {
    id: 'LTC',
    symbol: 'LTC',
    name: 'Litecoin',
    currencyPair: 'LTC-USD'
  },
  {
    id: 'ATOM',
    symbol: 'ATOM',
    name: 'Cosmos',
    currencyPair: 'ATOM-USD'
  },
  {
    id: 'SHIB',
    symbol: 'SHIB',
    name: 'Shiba Inu',
    currencyPair: 'SHIB-USD'
  },
  {
    id: 'XLM',
    symbol: 'XLM',
    name: 'Stellar',
    currencyPair: 'XLM-USD'
  },
  {
    id: 'ALGO',
    symbol: 'ALGO',
    name: 'Algorand',
    currencyPair: 'ALGO-USD'
  },
  {
    id: 'FIL',
    symbol: 'FIL',
    name: 'Filecoin',
    currencyPair: 'FIL-USD'
  },
  {
    id: 'AAVE',
    symbol: 'AAVE',
    name: 'Aave',
    currencyPair: 'AAVE-USD'
  },
  {
    id: 'NEAR',
    symbol: 'NEAR',
    name: 'NEAR Protocol',
    currencyPair: 'NEAR-USD'
  },
  {
    id: 'APT',
    symbol: 'APT',
    name: 'Aptos',
    currencyPair: 'APT-USD'
  },
  {
    id: 'OP',
    symbol: 'OP',
    name: 'Optimism',
    currencyPair: 'OP-USD'
  },
  {
    id: 'ARB',
    symbol: 'ARB',
    name: 'Arbitrum',
    currencyPair: 'ARB-USD'
  },
  {
    id: 'MKR',
    symbol: 'MKR',
    name: 'Maker',
    currencyPair: 'MKR-USD'
  },
  {
    id: 'GRT',
    symbol: 'GRT',
    name: 'The Graph',
    currencyPair: 'GRT-USD'
  },
  {
    id: 'SNX',
    symbol: 'SNX',
    name: 'Synthetix',
    currencyPair: 'SNX-USD'
  },
  {
    id: 'CRV',
    symbol: 'CRV',
    name: 'Curve DAO',
    currencyPair: 'CRV-USD'
  },
  {
    id: 'SAND',
    symbol: 'SAND',
    name: 'The Sandbox',
    currencyPair: 'SAND-USD'
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
  const fallbackPrices: Record<string, number> = {
    'BTC': 95000,
    'ETH': 3400,
    'USDT': 1.0,
    'BNB': 650,
    'SOL': 190,
    'USDC': 1.0,
    'XRP': 2.5,
    'ADA': 0.95,
    'AVAX': 38,
    'DOGE': 0.35,
    'DOT': 7.2,
    'MATIC': 0.45,
    'LINK': 22,
    'UNI': 12,
    'LTC': 105,
    'ATOM': 10,
    'SHIB': 0.000025,
    'XLM': 0.38,
    'ALGO': 0.32,
    'FIL': 5.5,
    'AAVE': 310,
    'NEAR': 5.8,
    'APT': 9.5,
    'OP': 2.3,
    'ARB': 0.85,
    'MKR': 1550,
    'GRT': 0.28,
    'SNX': 3.2,
    'CRV': 0.92,
    'SAND': 0.48
  }
  
  const assetPromises = COINBASE_ASSETS.map(async (coinbaseAsset) => {
    try {
      const pricePromise = fetchCoinbasePrice(coinbaseAsset.currencyPair)
      const timeoutPromise = new Promise<number>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      )
      
      let price: number
      try {
        price = await Promise.race([pricePromise, timeoutPromise])
      } catch {
        price = fallbackPrices[coinbaseAsset.id] || 100
      }
      
      const priceHistory = generateFallbackHistory(price, 100)
      
      return {
        id: coinbaseAsset.id,
        symbol: coinbaseAsset.symbol,
        name: coinbaseAsset.name,
        currentPrice: price,
        priceHistory,
        volatility: calculateVolatility(priceHistory)
      }
    } catch (error) {
      console.error(`Failed to initialize ${coinbaseAsset.symbol}:`, error)
      const fallbackPrice = fallbackPrices[coinbaseAsset.id] || 100
      const priceHistory = generateFallbackHistory(fallbackPrice, 100)
      
      return {
        id: coinbaseAsset.id,
        symbol: coinbaseAsset.symbol,
        name: coinbaseAsset.name,
        currentPrice: fallbackPrice,
        priceHistory,
        volatility: 0.02
      }
    }
  })
  
  const results = await Promise.all(assetPromises)
  return results.filter(Boolean)
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
