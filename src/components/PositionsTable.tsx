import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Position } from '@/lib/types'
import { calculatePositionPnL } from '@/lib/trading'
import { formatPrice } from '@/lib/utils'
import { TrendUp, TrendDown } from '@phosphor-icons/react'

interface PositionsTableProps {
  positions: Position[]
}

export function PositionsTable({ positions }: PositionsTableProps) {
  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No open positions. Start trading to see your holdings here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Leverage</TableHead>
              <TableHead className="text-right">Avg Entry</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">P&L</TableHead>
              <TableHead className="text-right">SL/TP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.map(position => {
              const { pnl, pnlPercent } = calculatePositionPnL(position)
              const isPositive = pnl >= 0
              const currentValue = position.quantity * position.currentPrice

              return (
                <TableRow key={`${position.assetId}-${position.type}`}>
                  <TableCell className="font-medium">{position.symbol}</TableCell>
                  <TableCell>
                    <Badge variant={position.type === 'long' ? 'default' : 'secondary'}>
                      {position.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{position.quantity.toFixed(4)}</TableCell>
                  <TableCell className="text-right">{position.leverage}x</TableCell>
                  <TableCell className="text-right">{formatPrice(position.avgEntryPrice)}</TableCell>
                  <TableCell className="text-right">{formatPrice(position.currentPrice)}</TableCell>
                  <TableCell className="text-right">{formatPrice(currentValue)}</TableCell>
                  <TableCell className={`text-right font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                    <div className="flex items-center justify-end gap-1">
                      {isPositive ? <TrendUp size={14} /> : <TrendDown size={14} />}
                      {formatPrice(Math.abs(pnl))} ({pnlPercent.toFixed(2)}%)
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {position.stopLoss && position.takeProfit ? (
                      <div>
                        <div>SL: {formatPrice(position.stopLoss)}</div>
                        <div>TP: {formatPrice(position.takeProfit)}</div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
