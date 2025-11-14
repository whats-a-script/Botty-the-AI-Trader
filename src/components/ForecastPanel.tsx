import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Sparkle, ChartLine } from '@phosphor-icons/react'
import { Asset, Forecast } from '@/lib/types'
import { PriceChart } from './PriceChart'
import { generateForecast } from '@/lib/forecasting'

interface ForecastPanelProps {
  assets: Asset[]
}

export function ForecastPanel({ assets }: ForecastPanelProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string>('')
  const [forecast, setForecast] = useState<Forecast | null>(null)
  const [loading, setLoading] = useState(false)

  const selectedAsset = assets.find(a => a.id === selectedAssetId)

  const handleGenerateForecast = async () => {
    if (!selectedAsset) return

    setLoading(true)
    try {
      const newForecast = await generateForecast(selectedAsset)
      setForecast(newForecast)
    } catch (error) {
      console.error('Failed to generate forecast:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkle size={24} />
          AI Price Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
            <SelectTrigger>
              <SelectValue placeholder="Select an asset to forecast" />
            </SelectTrigger>
            <SelectContent>
              {assets.map(asset => (
                <SelectItem key={asset.id} value={asset.id}>
                  {asset.symbol} - {asset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          className="w-full"
          onClick={handleGenerateForecast}
          disabled={!selectedAsset || loading}
        >
          {loading ? (
            <>Generating Forecast...</>
          ) : (
            <>
              <ChartLine className="mr-2" size={16} />
              Generate AI Forecast
            </>
          )}
        </Button>

        {loading && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Analyzing market patterns...</p>
            <Progress value={undefined} className="w-full" />
          </div>
        )}

        {forecast && selectedAsset && forecast.assetId === selectedAsset.id && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Confidence Level</span>
                <span className="text-sm font-bold">{forecast.confidence}%</span>
              </div>
              <Progress value={forecast.confidence} className="w-full" />
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Analysis</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {forecast.reasoning}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">Price Projection</h4>
              <PriceChart 
                historicalData={selectedAsset.priceHistory.slice(-30)}
                forecastData={forecast.predictions}
                height={250}
              />
            </div>

            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
              <strong>Educational Notice:</strong> This forecast is for learning purposes only. 
              AI predictions are inherently uncertain and should not be used for real trading decisions.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
