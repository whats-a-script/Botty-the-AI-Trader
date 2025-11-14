import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Position } from '@/lib/types'
import { calculatePositionPnL } from '@/lib/trading'
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
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Avg Entry</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">P&L</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.map(position => {
              const { pnl, pnlPercent } = calculatePositionPnL(position)
              const isPositive = pnl >= 0
              const currentValue = position.quantity * position.currentPrice

              return (
                <TableRow key={position.assetId}>
                  <TableCell className="font-medium">{position.symbol}</TableCell>
                  <TableCell className="text-right">{position.quantity}</TableCell>
                  <TableCell className="text-right">${position.avgEntryPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${position.currentPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${currentValue.toFixed(2)}</TableCell>
                  <TableCell className={`text-right font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                    <div className="flex items-center justify-end gap-1">
                      {isPositive ? <TrendUp size={14} /> : <TrendDown size={14} />}
                      ${Math.abs(pnl).toFixed(2)} ({pnlPercent.toFixed(2)}%)
                    </div>
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
