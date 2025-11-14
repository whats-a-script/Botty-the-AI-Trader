import { TradingSignal, Asset } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendUp, TrendDown, Minus, CheckCircle } from '@phosphor-icons/react'
import { formatPrice } from '@/lib/utils'

interface SignalsDashboardProps {
  signals: TradingSignal[]
  assets: Asset[]
  onExecuteSignal: (signal: TradingSignal) => void
}

export function SignalsDashboard({ signals, assets, onExecuteSignal }: SignalsDashboardProps) {
  const sortedSignals = [...signals].sort((a, b) => b.confidence - a.confidence)
  const highConfidenceSignals = sortedSignals.filter(s => s.confidence >= 85 && s.action !== 'hold')

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Active Trading Signals</h3>
        <p className="text-sm text-muted-foreground">
          AI-generated signals with {'>'}=85% confidence
        </p>
      </div>

      {highConfidenceSignals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Minus size={32} className="mx-auto mb-2 opacity-50" />
            <p>No high-confidence signals at the moment</p>
            <p className="text-xs mt-1">Agents are analyzing market conditions</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {highConfidenceSignals.slice(0, 6).map((signal, idx) => {
            const asset = assets.find(a => a.id === signal.assetId)
            if (!asset) return null

            return (
              <Card key={`${signal.assetId}-${idx}`} className="border-l-4" style={{
                borderLeftColor: signal.action === 'buy' ? 'hsl(var(--success))' : 'hsl(var(--destructive))'
              }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {signal.action === 'buy' ? (
                          <TrendUp size={20} className="text-success" />
                        ) : (
                          <TrendDown size={20} className="text-destructive" />
                        )}
                        {asset.symbol}
                        <Badge variant={signal.positionType === 'long' ? 'default' : 'secondary'}>
                          {signal.positionType}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{asset.name}</CardDescription>
                    </div>
                    <Badge 
                      variant={signal.confidence >= 90 ? 'default' : 'secondary'}
                      className="text-sm"
                    >
                      {signal.confidence.toFixed(0)}% confident
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{signal.reasoning}</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs">Current Price</span>
                      <span className="font-medium">{formatPrice(asset.currentPrice)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Leverage</span>
                      <span className="font-medium">{signal.leverage}x</span>
                    </div>
                    {signal.stopLoss && (
                      <div>
                        <span className="text-muted-foreground block text-xs">Stop Loss</span>
                        <span className="font-medium">{formatPrice(signal.stopLoss)}</span>
                      </div>
                    )}
                    {signal.takeProfit && (
                      <div>
                        <span className="text-muted-foreground block text-xs">Take Profit</span>
                        <span className="font-medium">{formatPrice(signal.takeProfit)}</span>
                      </div>
                    )}
                  </div>

                  <Button 
                    className="w-full"
                    variant={signal.action === 'buy' ? 'default' : 'destructive'}
                    onClick={() => onExecuteSignal(signal)}
                  >
                    <CheckCircle className="mr-2" size={16} />
                    Execute {signal.action.toUpperCase()} Order
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
