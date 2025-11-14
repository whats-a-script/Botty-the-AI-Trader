import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Portfolio } from '@/lib/types'
import { formatPrice } from '@/lib/utils'


}
export function Portfo
  const totalPnLPerc
 

    <Card className="border-border/50 shadow-sm">
        <CardTitle className="flex items-center gap-2 tex
          Portfolio
      </CardHeader>
       
          <p className="text-2xl f


          <div>
            <p className="text-lg f
          <div>
            <p className="text
        </div>
        <Separator /
        <div>
          <div className={`text-xl font-b
            {
          </div>
      </CardContent>
  )

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
