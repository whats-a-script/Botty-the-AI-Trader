import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Portfolio } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { ArrowUp, ArrowDown, Wallet } from '@phosphor-icons/react'

interface PortfolioSummaryProps {
  portfolio: Portfolio
  totalValue: number
}

export function PortfolioSummary({ portfolio, totalValue }: PortfolioSummaryProps) {
  const totalPnL = totalValue - portfolio.startingBalance
  const totalPnLPercent = portfolio.startingBalance > 0 
    ? (totalPnL / portfolio.startingBalance) * 100 
    : 0
  const isPositive = totalPnL >= 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet size={24} />
          Portfolio Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-3xl font-bold">{formatPrice(totalValue)}</p>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Cash</p>
            <p className="text-xl font-semibold">{formatPrice(portfolio.cash)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Positions</p>
            <p className="text-xl font-semibold">{portfolio.positions.length}</p>
          </div>
        </div>

        <Separator />

        <div>
          <p className="text-sm text-muted-foreground">Total P&L</p>
          <div className={`text-2xl font-bold flex items-center gap-2 ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
            {formatPrice(Math.abs(totalPnL))}
            <span className="text-lg">({(isFinite(totalPnLPercent) ? totalPnLPercent : 0).toFixed(2)}%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
