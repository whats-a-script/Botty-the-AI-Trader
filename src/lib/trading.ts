import { Portfolio, Position, Trade } from './types'

export function calculatePortfolioValue(portfolio: Portfolio, currentPrices: Map<string, number>): number {
  const positionsValue = portfolio.positions.reduce((sum, pos) => {
    const currentPrice = currentPrices.get(pos.assetId) || pos.currentPrice
    const posValue = pos.type === 'long' 
      ? pos.quantity * currentPrice * pos.leverage
      : pos.quantity * (2 * pos.avgEntryPrice - currentPrice) * pos.leverage
    return sum + posValue
  }, 0)
  
  return portfolio.cash + positionsValue
}

export function calculatePositionPnL(position: Position): { pnl: number; pnlPercent: number } {
  let pnl: number
  const costBasis = position.quantity * position.avgEntryPrice * position.leverage
  
  if (position.type === 'long') {
    const currentValue = position.quantity * position.currentPrice * position.leverage
    pnl = currentValue - costBasis
  } else {
    const currentValue = position.quantity * position.currentPrice * position.leverage
    const entryValue = position.quantity * position.avgEntryPrice * position.leverage
    pnl = entryValue - currentValue
  }
  
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
  price: number,
  positionType: 'long' | 'short' = 'long',
  leverage: number = 1
): Portfolio {
  const trade: Trade = {
    id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    assetId,
    symbol,
    type,
    positionType,
    quantity,
    price,
    timestamp: Date.now(),
    total: quantity * price,
    leverage
  }
  
  const newPortfolio = { ...portfolio }
  newPortfolio.trades = [...portfolio.trades, trade]
  
  if (type === 'buy') {
    const cost = trade.total / leverage
    newPortfolio.cash -= cost
    
    const existingPosition = newPortfolio.positions.find(p => p.assetId === assetId && p.type === positionType)
    if (existingPosition) {
      const totalQuantity = existingPosition.quantity + quantity
      const totalCost = (existingPosition.quantity * existingPosition.avgEntryPrice) + trade.total
      existingPosition.quantity = totalQuantity
      existingPosition.avgEntryPrice = totalCost / totalQuantity
      existingPosition.currentPrice = price
      const { pnl } = calculatePositionPnL(existingPosition)
      existingPosition.unrealizedPnL = pnl
    } else {
      newPortfolio.positions = [...newPortfolio.positions, {
        assetId,
        symbol,
        quantity,
        avgEntryPrice: price,
        currentPrice: price,
        type: positionType,
        leverage,
        openedAt: Date.now(),
        unrealizedPnL: 0
      }]
    }
  } else {
    const position = newPortfolio.positions.find(p => p.assetId === assetId && p.type === positionType)
    if (position) {
      const { pnl } = calculatePositionPnL(position)
      trade.pnl = pnl
      
      newPortfolio.cash += trade.total / leverage
      newPortfolio.totalPnL = (newPortfolio.totalPnL || 0) + pnl
      
      position.quantity -= quantity
      if (position.quantity <= 0) {
        newPortfolio.positions = newPortfolio.positions.filter(p => !(p.assetId === assetId && p.type === positionType))
      }
    }
  }
  
  const currentValue = calculatePortfolioValue(newPortfolio, new Map())
  const drawdown = ((newPortfolio.startingBalance - currentValue) / newPortfolio.startingBalance) * 100
  newPortfolio.currentDrawdown = Math.max(0, drawdown)
  newPortfolio.maxDrawdown = Math.max(newPortfolio.maxDrawdown || 0, newPortfolio.currentDrawdown)
  
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
