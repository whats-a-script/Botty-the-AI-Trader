import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useApiKeys } from '@/hooks/use-api-keys'
import { CheckCircle, XCircle, Key } from '@phosphor-icons/react'

interface ApiKeyStatusProps {
  compact?: boolean
  onNavigateToKeys?: () => void
}

export function ApiKeyStatus({ compact = false, onNavigateToKeys }: ApiKeyStatusProps) {
  const { getEnabledAIProviders, getEnabledTradingProviders } = useApiKeys()
  
  const aiProviders = getEnabledAIProviders()
  const tradingProviders = getEnabledTradingProviders()
  const hasAnyKeys = aiProviders.length > 0 || tradingProviders.length > 0

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {hasAnyKeys ? (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            <CheckCircle size={12} className="mr-1" />
            {aiProviders.length + tradingProviders.length} API{aiProviders.length + tradingProviders.length !== 1 ? 's' : ''} Active
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-muted/50">
            <XCircle size={12} className="mr-1" />
            No APIs Configured
          </Badge>
        )}
        {onNavigateToKeys && (
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={onNavigateToKeys}>
            <Key size={12} className="mr-1" />
            Configure
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">API Configuration</h3>
              <p className="text-xs text-muted-foreground">
                Configure API keys to enable trading
              </p>
            </div>
            {onNavigateToKeys && (
              <Button variant="outline" size="sm" onClick={onNavigateToKeys}>
                <Key size={14} className="mr-1.5" />
                Manage Keys
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">AI Providers</span>
              {aiProviders.length > 0 ? (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  <CheckCircle size={10} className="mr-1" />
                  {aiProviders.length} Active
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  <XCircle size={10} className="mr-1" />
                  None
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Trading Platforms</span>
              {tradingProviders.length > 0 ? (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  <CheckCircle size={10} className="mr-1" />
                  {tradingProviders.length} Active
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  <XCircle size={10} className="mr-1" />
                  None
                </Badge>
              )}
            </div>
          </div>

          {!hasAnyKeys && (
            <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
              Configure at least one AI provider API key to enable intelligent trading agents.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
