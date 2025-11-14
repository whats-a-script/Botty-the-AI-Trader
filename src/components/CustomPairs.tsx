import { useState } from 'react'
import { CustomTradingPair, Asset } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Trash, Coin } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { fetchCoinbasePrice } from '@/lib/coinbase-api'

interface CustomPairsProps {
  customPairs: CustomTradingPair[]
  onAddPair: (pair: CustomTradingPair) => void
  onTogglePair: (pairId: string, enabled: boolean) => void
  onRemovePair: (pairId: string) => void
}

export function CustomPairs({
  customPairs,
  onAddPair,
  onTogglePair,
  onRemovePair
}: CustomPairsProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newPair, setNewPair] = useState({
    symbol: '',
    name: '',
    currencyPair: ''
  })
  const [isValidating, setIsValidating] = useState(false)

  const handleAddPair = async () => {
    if (!newPair.symbol || !newPair.name || !newPair.currencyPair) {
      toast.error('Please fill all fields')
      return
    }

    setIsValidating(true)
    
    try {
      await fetchCoinbasePrice(newPair.currencyPair)
      
      const pair: CustomTradingPair = {
        id: newPair.symbol,
        symbol: newPair.symbol.toUpperCase(),
        name: newPair.name,
        currencyPair: newPair.currencyPair.toUpperCase(),
        enabled: true,
        addedAt: Date.now()
      }
      
      onAddPair(pair)
      toast.success(`Added ${pair.symbol} successfully`)
      
      setNewPair({
        symbol: '',
        name: '',
        currencyPair: ''
      })
      setIsAdding(false)
    } catch (error) {
      toast.error('Invalid currency pair. Please check the symbol and try again.')
    } finally {
      setIsValidating(false)
    }
  }

  const handleRemove = (pairId: string) => {
    onRemovePair(pairId)
    toast.info('Custom pair removed')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Coin size={24} />
                Custom Trading Pairs
              </CardTitle>
              <CardDescription>
                Add custom cryptocurrency pairs from Coinbase
              </CardDescription>
            </div>
            <Dialog open={isAdding} onOpenChange={setIsAdding}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2" size={18} />
                  Add Pair
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Trading Pair</DialogTitle>
                  <DialogDescription>
                    Enter details for the cryptocurrency pair you want to track
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="pair-symbol">Symbol</Label>
                    <Input
                      id="pair-symbol"
                      placeholder="e.g., PEPE"
                      value={newPair.symbol}
                      onChange={(e) => setNewPair({ ...newPair, symbol: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pair-name">Full Name</Label>
                    <Input
                      id="pair-name"
                      placeholder="e.g., Pepe"
                      value={newPair.name}
                      onChange={(e) => setNewPair({ ...newPair, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pair-currency">Currency Pair</Label>
                    <Input
                      id="pair-currency"
                      placeholder="e.g., PEPE-USD"
                      value={newPair.currencyPair}
                      onChange={(e) => setNewPair({ ...newPair, currencyPair: e.target.value.toUpperCase() })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Format: SYMBOL-USD (must be available on Coinbase)
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAdding(false)} disabled={isValidating}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPair} disabled={isValidating || !newPair.symbol || !newPair.name || !newPair.currencyPair}>
                    {isValidating ? 'Validating...' : 'Add Pair'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {customPairs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Coin size={48} className="mx-auto mb-4 opacity-20" />
              <p>No custom pairs added yet</p>
              <p className="text-sm mt-2">Add custom cryptocurrency pairs to track and trade</p>
            </div>
          ) : (
            <div className="space-y-3">
              {customPairs.map((pair) => (
                <div key={pair.id} className="flex items-center justify-between border rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-semibold">{pair.symbol}</div>
                      <div className="text-sm text-muted-foreground">{pair.name}</div>
                    </div>
                    <Badge variant="outline">{pair.currencyPair}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={pair.enabled}
                      onCheckedChange={(enabled) => onTogglePair(pair.id, enabled)}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemove(pair.id)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Popular Pairs to Add</CardTitle>
          <CardDescription>Quick add popular cryptocurrency pairs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {POPULAR_PAIRS.map((pair) => (
              <Button
                key={pair.symbol}
                variant="outline"
                size="sm"
                onClick={() => {
                  const existing = customPairs.find(p => p.symbol === pair.symbol)
                  if (existing) {
                    toast.info('Pair already added')
                    return
                  }
                  onAddPair({
                    id: pair.symbol,
                    symbol: pair.symbol,
                    name: pair.name,
                    currencyPair: pair.currencyPair,
                    enabled: true,
                    addedAt: Date.now()
                  })
                  toast.success(`Added ${pair.symbol}`)
                }}
                disabled={customPairs.some(p => p.symbol === pair.symbol)}
              >
                {pair.symbol}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const POPULAR_PAIRS = [
  { symbol: 'PEPE', name: 'Pepe', currencyPair: 'PEPE-USD' },
  { symbol: 'BONK', name: 'Bonk', currencyPair: 'BONK-USD' },
  { symbol: 'WIF', name: 'dogwifhat', currencyPair: 'WIF-USD' },
  { symbol: 'RENDER', name: 'Render', currencyPair: 'RENDER-USD' },
  { symbol: 'FET', name: 'Fetch.ai', currencyPair: 'FET-USD' },
  { symbol: 'IMX', name: 'Immutable X', currencyPair: 'IMX-USD' },
  { symbol: 'INJ', name: 'Injective', currencyPair: 'INJ-USD' },
  { symbol: 'SEI', name: 'Sei', currencyPair: 'SEI-USD' }
]
