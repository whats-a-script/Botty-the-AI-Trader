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
  const safeReturns = isFinite(returns) ? returns : 0

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-150 system-button border-border/50"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className={`text-sm font-semibold ${isPositive ? 'text-[#39FF14]' : ''}`}>
              {asset.symbol}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{asset.name}</p>
          </div>
          <Badge variant={isPositive ? 'default' : 'destructive'} className="flex items-center gap-1 text-xs h-5">
            {isPositive ? <TrendUp size={12} /> : <TrendDown size={12} />}
            {safeReturns.toFixed(2)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className={`text-lg font-semibold ${isPositive ? 'text-[#39FF14]' : ''}`}>
          {formatPrice(asset.currentPrice)}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Vol: {((asset.volatility || 0) * 100).toFixed(1)}%
        </p>
      </CardContent>
    </Card>
  )
}
