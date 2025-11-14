import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trade } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { Clock } from '@phosphor-icons/react'

interface TradeHistoryProps {
  trades: Trade[]
}

export function TradeHistory({ trades }: TradeHistoryProps) {
  const sortedTrades = [...trades].sort((a, b) => b.timestamp - a.timestamp)

  if (trades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={24} />
            Trade History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No trades yet. Execute your first trade to start tracking your history.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock size={24} />
          Trade History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTrades.map(trade => {
              const date = new Date(trade.timestamp)
              const timeStr = date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })

              return (
                <TableRow key={trade.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {timeStr}
                  </TableCell>
                  <TableCell>
                    <Badge variant={trade.type === 'buy' ? 'default' : 'secondary'}>
                      {trade.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{trade.symbol}</TableCell>
                  <TableCell className="text-right">{trade.quantity}</TableCell>
                  <TableCell className="text-right">{formatPrice(trade.price)}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatPrice(trade.total)}
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
