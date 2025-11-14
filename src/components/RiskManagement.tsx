import { Portfolio } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Warning, CheckCircle, XCircle } from '@phosphor-icons/react'

interface RiskManagementProps {
  portfolio: Portfolio
  totalValue: number
}

export function RiskManagement({ portfolio, totalValue }: RiskManagementProps) {
  const drawdownPercent = portfolio.currentDrawdown || 0
  const riskLevel = drawdownPercent > 15 ? 'high' : drawdownPercent > 10 ? 'medium' : 'low'
  const maxDrawdownPercent = portfolio.maxDrawdown || 0
  
  const leveragedPositions = portfolio.positions.filter(p => p.leverage > 1)
  const totalLeverage = leveragedPositions.length > 0 
    ? leveragedPositions.reduce((sum, p) => sum + p.leverage, 0) / leveragedPositions.length 
    : 1
  
  const positionsValue = portfolio.positions.reduce((sum, p) => 
    sum + (p.quantity * p.currentPrice), 0
  )
  const exposurePercent = totalValue > 0 ? (positionsValue / totalValue) * 100 : 0
  
  const pnlPercent = portfolio.startingBalance > 0 
    ? ((totalValue - portfolio.startingBalance) / portfolio.startingBalance) * 100 
    : 0

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} />
            Risk Management Dashboard
          </CardTitle>
          <CardDescription>Real-time risk metrics and safeguards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Drawdown</span>
              <Badge variant={riskLevel === 'high' ? 'destructive' : riskLevel === 'medium' ? 'secondary' : 'default'}>
                {(isFinite(drawdownPercent) ? drawdownPercent : 0).toFixed(2)}%
              </Badge>
            </div>
            <Progress value={drawdownPercent} max={20} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>Max: {(isFinite(maxDrawdownPercent) ? maxDrawdownPercent : 0).toFixed(2)}%</span>
              <span>20% (Critical)</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Portfolio Exposure</span>
              <span className="text-sm">{(isFinite(exposurePercent) ? exposurePercent : 0).toFixed(1)}%</span>
            </div>
            <Progress value={exposurePercent} max={100} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Average Leverage</span>
              <span className="text-sm">{(isFinite(totalLeverage) ? totalLeverage : 1).toFixed(1)}x</span>
            </div>
            <Progress value={totalLeverage * 10} max={100} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1x</span>
              <span>Max: 10x</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <span className="text-xs text-muted-foreground block">Total P&L</span>
              <span className={`text-lg font-bold ${pnlPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                {pnlPercent >= 0 ? '+' : ''}{(isFinite(pnlPercent) ? pnlPercent : 0).toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Open Positions</span>
              <span className="text-lg font-bold">{portfolio.positions.length}</span>
            </div>
          </div>

          {drawdownPercent > 10 && (
            <Alert variant="destructive">
              <Warning size={16} />
              <AlertDescription>
                <strong>Drawdown Alert:</strong> Portfolio is down {(isFinite(drawdownPercent) ? drawdownPercent : 0).toFixed(1)}%. 
                Consider reducing position sizes or pausing trading.
              </AlertDescription>
            </Alert>
          )}

          {drawdownPercent > 15 && (
            <Alert variant="destructive">
              <XCircle size={16} />
              <AlertDescription>
                <strong>Critical Drawdown:</strong> Emergency protocols activated. 
                New trades are limited to reduce risk.
              </AlertDescription>
            </Alert>
          )}

          {drawdownPercent < 5 && pnlPercent > 0 && (
            <Alert>
              <CheckCircle size={16} />
              <AlertDescription>
                <strong>Strong Performance:</strong> Portfolio is performing well with minimal drawdown.
              </AlertDescription>
            </Alert>
          )}

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Risk Safeguards Active</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-success" />
                <span>Stop Loss / Take Profit automation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-success" />
                <span>Dynamic position sizing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-success" />
                <span>Volatility monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                {drawdownPercent > 15 ? (
                  <Warning size={14} className="text-destructive" />
                ) : (
                  <CheckCircle size={14} className="text-success" />
                )}
                <span>Drawdown protection ({drawdownPercent > 15 ? 'ACTIVE' : 'Standby'})</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
