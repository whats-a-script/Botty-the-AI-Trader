import { Trade, Portfolio } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatPrice } from '@/lib/utils'
import { TrendUp, TrendDown } from '@phosphor-icons/react'

interface TradeJournalProps {
  trades: Trade[]
  portfolio: Portfolio
}

export function TradeJournal({ trades, portfolio }: TradeJournalProps) {
  const recentTrades = [...trades].reverse().slice(0, 50)
  
  const stats = {
    total: trades.length,
    profitable: trades.filter(t => t.pnl && t.pnl > 0).length,
    losses: trades.filter(t => t.pnl && t.pnl < 0).length,
    avgPnL: trades.length > 0 ? trades.reduce((sum, t) => sum + (t.pnl || 0), 0) / trades.length : 0,
    totalVolume: trades.reduce((sum, t) => sum + t.total, 0)
  }
  
  const winRate = stats.total > 0 ? (stats.profitable / stats.total) * 100 : 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Trades</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">{stats.profitable}</div>
            <p className="text-xs text-muted-foreground">Wins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">{stats.losses}</div>
            <p className="text-xs text-muted-foreground">Losses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{(isFinite(winRate) ? winRate : 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className={`text-2xl font-bold ${stats.avgPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
              ${(isFinite(stats.avgPnL) ? stats.avgPnL : 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Avg P&L</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Leverage</TableHead>
                  <TableHead>P&L</TableHead>
                  <TableHead>Agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTrades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="text-xs">
                      {new Date(trade.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">{trade.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={trade.type === 'buy' ? 'default' : 'secondary'}>
                        {trade.type === 'buy' ? (
                          <TrendUp size={12} className="mr-1" />
                        ) : (
                          <TrendDown size={12} className="mr-1" />
                        )}
                        {trade.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{trade.positionType}</Badge>
                    </TableCell>
                    <TableCell>{(trade.quantity || 0).toFixed(4)}</TableCell>
                    <TableCell>{formatPrice(trade.price)}</TableCell>
                    <TableCell>{trade.leverage}x</TableCell>
                    <TableCell>
                      {trade.pnl !== undefined ? (
                        <span className={trade.pnl >= 0 ? 'text-success' : 'text-destructive'}>
                          {trade.pnl >= 0 ? '+' : ''}${(isFinite(trade.pnl) ? trade.pnl : 0).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {trade.agentId ? trade.agentId.split('-')[0] : 'Manual'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {recentTrades.length > 0 && recentTrades[0].reason && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Trade Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{recentTrades[0].reason}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
