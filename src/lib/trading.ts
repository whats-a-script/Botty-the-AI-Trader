import { Portfolio, Position, Trade } from './types'

export function calculatePortfolioValue(portfolio: Portfolio, currentPrices: Map<string, number>): number {
  const positionsValue = portfolio.positions.reduce((sum, pos) => {
    const currentPrice = currentPrices.get(pos.assetId) || pos.currentPrice
    return sum + (pos.quantity * currentPrice)
  }, 0)
  
  return portfolio.cash + positionsValue
}

export function calculatePositionPnL(position: Position): { pnl: number; pnlPercent: number } {
  const currentValue = position.quantity * position.currentPrice
  const costBasis = position.quantity * position.avgEntryPrice
  const pnl = currentValue - costBasis
  const pnlPercent = (pnl / costBasis) * 100
  
  return { pnl, pnlPercent }
}

export function canExecuteTrade(
  portfolio: Portfolio,
  type: 'buy' | 'sell',
  assetId: string,
  quantity: number,
  price: number
): { canExecute: boolean; reason?: string } {
  if (quantity <= 0) {
    return { canExecute: false, reason: 'Quantity must be greater than zero' }
  }
  
  if (type === 'buy') {
    const cost = quantity * price
    if (portfolio.cash < cost) {
      return { canExecute: false, reason: `Insufficient funds. Need $${cost.toFixed(2)}, have $${portfolio.cash.toFixed(2)}` }
    }
  } else {
    const position = portfolio.positions.find(p => p.assetId === assetId)
    if (!position || position.quantity < quantity) {
      return { canExecute: false, reason: `Insufficient holdings. Have ${position?.quantity || 0}, trying to sell ${quantity}` }
    }
  }
  
  return { canExecute: true }
}

export function executeTrade(
  portfolio: Portfolio,
  type: 'buy' | 'sell',
  assetId: string,
  symbol: string,
  quantity: number,
  price: number
): Portfolio {
  const trade: Trade = {
    id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    assetId,
    symbol,
    type,
    quantity,
    price,
    timestamp: Date.now(),
    total: quantity * price
  }
  
  const newPortfolio = { ...portfolio }
  newPortfolio.trades = [...portfolio.trades, trade]
  
  if (type === 'buy') {
    newPortfolio.cash -= trade.total
    
    const existingPosition = newPortfolio.positions.find(p => p.assetId === assetId)
    if (existingPosition) {
      const totalQuantity = existingPosition.quantity + quantity
      const totalCost = (existingPosition.quantity * existingPosition.avgEntryPrice) + trade.total
      existingPosition.quantity = totalQuantity
      existingPosition.avgEntryPrice = totalCost / totalQuantity
      existingPosition.currentPrice = price
    } else {
      newPortfolio.positions = [...newPortfolio.positions, {
        assetId,
        symbol,
        quantity,
        avgEntryPrice: price,
        currentPrice: price
      }]
    }
  } else {
    newPortfolio.cash += trade.total
    
    const position = newPortfolio.positions.find(p => p.assetId === assetId)
    if (position) {
      position.quantity -= quantity
      if (position.quantity === 0) {
        newPortfolio.positions = newPortfolio.positions.filter(p => p.assetId !== assetId)
      }
    }
  }
  
  return newPortfolio
}

export function updatePositionPrices(portfolio: Portfolio, currentPrices: Map<string, number>): Portfolio {
  return {
    ...portfolio,
    positions: portfolio.positions.map(pos => ({
      ...pos,
      currentPrice: currentPrices.get(pos.assetId) || pos.currentPrice
    }))
  }
}
