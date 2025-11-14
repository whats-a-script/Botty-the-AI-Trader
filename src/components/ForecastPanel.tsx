import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, Sel
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { PriceChart } from './PriceChart'
import { Sparkle, ChartLine, Newspaper, ChatsCircle, TrendUp, TrendDown, Minus, Fire } from '@phosphor-icons/react'
export function ForecastPanel({ assets }: For
  const [forecast, setForecast] = useStat


    if (!selectedAsset) return
    setLoading(tr
 

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
      case 'bea
      setLoading(false)
  }
  }

  const getSentimentColor = (sentiment: 'bullish' | 'bearish' | 'neutral') => {
      default: return 's
      case 'bullish': return 'text-success'
      case 'bearish': return 'text-destructive'
      default: return 'text-muted-foreground'
     
  }

  const getSentimentIcon = (sentiment: 'bullish' | 'bearish' | 'neutral') => {
      <CardContent class
      case 'bullish': return <TrendUp className="w-4 h-4" />
      case 'bearish': return <TrendDown className="w-4 h-4" />
      default: return <Minus className="w-4 h-4" />
    }
  }

  const getSentimentBadgeVariant = (sentiment: 'bullish' | 'bearish' | 'neutral') => {
    switch (sentiment) {
      case 'bullish': return 'default'

      default: return 'secondary'
     
  }

  return (
          
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkle size={24} />
          AI Forecast with News & Social Sentiment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
            <SelectTrigger>
              <SelectValue placeholder="Select an asset to forecast" />
                <span classN
            <SelectContent>
              {assets.map(asset => (
                <SelectItem key={asset.id} value={asset.id}>
                  {asset.symbol} - {asset.name}
                </SelectItem>
                {
            </SelectContent>

        </div>

        <Button 
          className="w-full"
          onClick={handleGenerateForecast}
          disabled={!selectedAsset || loading}
        >
                    {f
            <>Generating Multi-Factor Forecast...</>
               
            <>
                    {forecast.newsSentiment.headline}
              Generate AI Forecast
               
          )}
                 

        {loading && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Analyzing technical indicators, news, and social sentiment...</p>
            <Progress value={undefined} className="w-full" />
          </div>
        )}

        {forecast && selectedAsset && forecast.assetId === selectedAsset.id && (
          <div className="space-y-6 pt-4 border-t">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Confidence</span>
                <span className="text-sm font-bold">{forecast.confidence}%</span>
              </div>
              <Progress value={forecast.confidence} className="w-full" />
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Integrated Analysis</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {forecast.reasoning}
              </p>
            </div>

            <Separator />

            {forecast.newsSentiment && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Newspaper size={16} />
                    News Sentiment
                      <
                  <Badge variant={getSentimentBadgeVariant(forecast.newsSentiment.sentiment)} className="flex items-center gap-1">
                    {getSentimentIcon(forecast.newsSentiment.sentiment)}
                    {forecast.newsSentiment.sentiment}
                  </Badge>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-md space-y-2">
                  <p className="text-xs font-semibold text-foreground">
                    {forecast.newsSentiment.headline}
                    </
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {forecast.newsSentiment.summary}
                  </p>
            <Separator />
                    <span className="text-xs text-muted-foreground">Sources:</span>
                    {forecast.newsSentiment.sources.map((source, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {source}
                      </Badge>
            </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">Sentiment Score</span>
                    <span className={`text-xs font-bold ${getSentimentColor(forecast.newsSentiment.sentiment)}`}>
                      {forecast.newsSentiment.score > 0 ? '+' : ''}{forecast.newsSentiment.score}
    </Card>
                  </div>
                </div>
              </div>


            <Separator />

            {forecast.socialSentiment && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <ChatsCircle size={16} />
                    Social Sentiment

                  <div className="flex items-center gap-2">
                    {forecast.socialSentiment.trending && (
                      <Badge variant="default" className="flex items-center gap-1">

                        Trending
                      </Badge>
                    )}
                    <Badge variant={getSentimentBadgeVariant(forecast.socialSentiment.sentiment)} className="flex items-center gap-1">
                      {getSentimentIcon(forecast.socialSentiment.sentiment)}
                      {forecast.socialSentiment.sentiment}
                    </Badge>
                  </div>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-md space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {forecast.socialSentiment.summary}

                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Discussion Volume</span>
                      <p className="text-sm font-semibold capitalize">{forecast.socialSentiment.volume}</p>

                    <div>
                      <span className="text-xs text-muted-foreground">Sentiment Score</span>
                      <p className={`text-sm font-semibold ${getSentimentColor(forecast.socialSentiment.sentiment)}`}>
                        {forecast.socialSentiment.score > 0 ? '+' : ''}{forecast.socialSentiment.score}
                      </p>
                    </div>


                  <div>
                    <span className="text-xs text-muted-foreground mb-2 block">Key Topics</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {forecast.socialSentiment.keyTopics.map((topic, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

            )}

            <Separator />

            <div>

              <PriceChart 

                forecastData={forecast.predictions}
                height={250}
              />


            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
              <strong>Educational Notice:</strong> This forecast integrates technical analysis, simulated news sentiment, and social media analytics for learning purposes only. 
              AI predictions are inherently uncertain and should not be used for real trading decisions.
            </div>

        )}

    </Card>

}
