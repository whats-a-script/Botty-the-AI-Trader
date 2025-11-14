import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowUp, ArrowDown } from '@phosphor-icons/react'
import { Asset, Portfolio } from '@/lib/types'
import { canExecuteTrade } from '@/lib/trading'
import { toast } from 'sonner'

interface TradeFormProps {
  assets: Asset[]
  portfolio: Portfolio
  onTrade: (assetId: string, type: 'buy' | 'sell', quantity: number) => void
}

export function TradeForm({ assets, portfolio, onTrade }: TradeFormProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string>('')
  const [quantity, setQuantity] = useState<string>('')
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')

  const selectedAsset = assets.find(a => a.id === selectedAssetId)
  const estimatedTotal = selectedAsset && quantity ? parseFloat(quantity) * selectedAsset.currentPrice : 0

  const handleTrade = () => {
    if (!selectedAsset || !quantity) {
      toast.error('Please select an asset and enter quantity')
      return
    }

    const qty = parseFloat(quantity)
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    const validation = canExecuteTrade(portfolio, tradeType, selectedAsset.id, qty, selectedAsset.currentPrice)
    
    if (!validation.canExecute) {
      toast.error(validation.reason || 'Cannot execute trade')
      return
    }

    onTrade(selectedAsset.id, tradeType, qty)
    setQuantity('')
    toast.success(`${tradeType === 'buy' ? 'Bought' : 'Sold'} ${qty} ${selectedAsset.symbol}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execute Trade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={tradeType === 'buy' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setTradeType('buy')}
          >
            <ArrowUp className="mr-2" size={16} />
            Buy
          </Button>
          <Button
            variant={tradeType === 'sell' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setTradeType('sell')}
          >
            <ArrowDown className="mr-2" size={16} />
            Sell
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="asset-select">Asset</Label>
          <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
            <SelectTrigger id="asset-select">
              <SelectValue placeholder="Select an asset" />
            </SelectTrigger>
            <SelectContent>
              {assets.map(asset => (
                <SelectItem key={asset.id} value={asset.id}>
                  {asset.symbol} - ${asset.currentPrice.toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
          />
        </div>

        {selectedAsset && quantity && (
          <div className="p-3 bg-muted rounded-md">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated Total:</span>
              <span className="font-semibold">${estimatedTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        <Button 
          className="w-full" 
          onClick={handleTrade}
          disabled={!selectedAsset || !quantity}
        >
          Execute {tradeType === 'buy' ? 'Buy' : 'Sell'} Order
        </Button>

        <div className="text-xs text-muted-foreground">
          Available Cash: ${portfolio.cash.toFixed(2)}
        </div>
      </CardContent>
    </Card>
  )
}
