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
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Wallet size={16} />
          Portfolio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">Total Value</p>
          <p className="text-2xl font-bold">{formatPrice(totalValue)}</p>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Cash</p>
            <p className="text-lg font-semibold">{formatPrice(portfolio.cash)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Positions</p>
            <p className="text-lg font-semibold">{portfolio.positions.length}</p>
          </div>
        </div>

        <Separator />

        <div>
          <p className="text-xs text-muted-foreground">Total P&L</p>
          <div className={`text-xl font-bold flex items-center gap-1.5 ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            {formatPrice(Math.abs(totalPnL))}
            <span className="text-sm">({(isFinite(totalPnLPercent) ? totalPnLPercent : 0).toFixed(2)}%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
