import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendUp, TrendDown } from '@phosphor-icons/react'
import { Asset } from '@/lib/types'
import { calculateReturns, formatPrice } from '@/lib/utils'

interface AssetCardProps {
  asset: Asset
  onClick?: () => void
}

export function AssetCard({ asset, onClick }: AssetCardProps) {
  const returns = calculateReturns(asset.priceHistory)
  const isPositive = returns >= 0

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{asset.symbol}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{asset.name}</p>
          </div>
          <Badge variant={isPositive ? 'default' : 'destructive'} className="flex items-center gap-1">
            {isPositive ? <TrendUp size={14} /> : <TrendDown size={14} />}
            {returns.toFixed(2)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">
          {formatPrice(asset.currentPrice)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Vol: {(asset.volatility * 100).toFixed(1)}%
        </p>
      </CardContent>
    </Card>
  )
}
