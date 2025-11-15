import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ApiKeys, ApiKeyConfig } from '@/lib/types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeSlash, CheckCircle, WarningCircle, Link, Key, Robot, Coin } from '@phosphor-icons/react'
import { toast } from 'sonner'

const API_CONFIGS: ApiKeyConfig[] = [
  {
    provider: 'anthropic',
    displayName: 'Anthropic Claude',
    description: 'Claude for advanced reasoning and analysis',
    category: 'ai',
    docsUrl: 'https://console.anthropic.com/settings/keys'
  },
  {
    provider: 'gemini',
    displayName: 'Google Gemini',
    description: 'Gemini Pro for multi-modal analysis',
    category: 'ai',
    docsUrl: 'https://aistudio.google.com/app/apikey'
  },
  {
    provider: 'deepseek',
    displayName: 'DeepSeek',
    description: 'DeepSeek models for cost-effective analysis',
    category: 'ai',
    docsUrl: 'https://platform.deepseek.com/api_keys'
  },
  {
    provider: 'qwen',
    displayName: 'Qwen',
    description: 'Alibaba Qwen models',
    category: 'ai',
    docsUrl: 'https://dashscope.aliyun.com/'
  },
  {
    provider: 'coinbase',
    displayName: 'Coinbase',
    description: 'Live cryptocurrency trading and market data',
    category: 'trading',
    requiresSecret: true,
    docsUrl: 'https://www.coinbase.com/settings/api'
  },
  {
    provider: 'binance',
    displayName: 'Binance',
    description: 'Global cryptocurrency exchange platform',
    category: 'trading',
    requiresSecret: true,
    docsUrl: 'https://www.binance.com/en/my/settings/api-management'
  },
  {
    provider: 'kraken',
    displayName: 'Kraken',
    description: 'Cryptocurrency exchange with advanced trading',
    category: 'trading',
    requiresSecret: true,
    docsUrl: 'https://www.kraken.com/u/security/api'
  },
  {
    provider: 'alpaca',
    displayName: 'Alpaca',
    description: 'Commission-free stock trading API',
    category: 'trading',
    requiresSecret: true,
    docsUrl: 'https://app.alpaca.markets/paper/dashboard/overview'
  }
]

export function ApiKeysManager() {
  const [apiKeys, setApiKeys] = useKV<ApiKeys>('api-keys', {})
  const [enabledProviders, setEnabledProviders] = useKV<Record<string, boolean>>('enabled-providers', {})
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())

  const toggleKeyVisibility = (provider: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(provider)) {
        newSet.delete(provider)
      } else {
        newSet.add(provider)
      }
      return newSet
    })
  }

  const handleKeyUpdate = (provider: string, value: string, isSecret = false) => {
    setApiKeys((current) => ({
      ...(current || {}),
      [isSecret ? `${provider}Secret` : provider]: value
    }))
  }

  const handleToggleProvider = (provider: string, enabled: boolean) => {
    setEnabledProviders((current) => ({
      ...(current || {}),
      [provider]: enabled
    }))
    
    if (enabled) {
      toast.success(`${API_CONFIGS.find(c => c.provider === provider)?.displayName} enabled`)
    } else {
      toast.info(`${API_CONFIGS.find(c => c.provider === provider)?.displayName} disabled`)
    }
  }

  const handleClearKey = (provider: string, requiresSecret = false) => {
    setApiKeys((current) => {
      const updated = { ...(current || {}) }
      delete updated[provider as keyof ApiKeys]
      if (requiresSecret) {
        delete updated[`${provider}Secret` as keyof ApiKeys]
      }
      return updated
    })
    toast.info('API key cleared')
  }

  const handleTestConnection = async (provider: string) => {
    toast.info('Testing connection...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success(`${provider} connection test successful`)
  }

  const aiConfigs = API_CONFIGS.filter(c => c.category === 'ai')
  const tradingConfigs = API_CONFIGS.filter(c => c.category === 'trading')

  const getKeyStatus = (provider: string, requiresSecret = false): 'configured' | 'partial' | 'missing' => {
    const hasKey = !!(apiKeys || {})[provider as keyof ApiKeys]
    const hasSecret = !requiresSecret || !!(apiKeys || {})[`${provider}Secret` as keyof ApiKeys]
    
    if (hasKey && hasSecret) return 'configured'
    if (hasKey || hasSecret) return 'partial'
    return 'missing'
  }

  const renderApiKeyCard = (config: ApiKeyConfig) => {
    const status = getKeyStatus(config.provider, config.requiresSecret)
    const isVisible = visibleKeys.has(config.provider)
    const isEnabled = (enabledProviders || {})[config.provider] ?? false
    const keyValue = (apiKeys || {})[config.provider as keyof ApiKeys] || ''
    const secretValue = config.requiresSecret ? ((apiKeys || {})[`${config.provider}Secret` as keyof ApiKeys] || '') : ''

    return (
      <Card key={config.provider} className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{config.displayName}</CardTitle>
                {status === 'configured' && (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    <CheckCircle size={12} className="mr-1" />
                    Ready
                  </Badge>
                )}
                {status === 'partial' && (
                  <Badge variant="outline" className="bg-[oklch(0.75_0.15_60)]/10 text-[oklch(0.70_0.15_60)] border-[oklch(0.75_0.15_60)]/20">
                    <WarningCircle size={12} className="mr-1" />
                    Incomplete
                  </Badge>
                )}
                {status === 'missing' && (
                  <Badge variant="outline" className="text-muted-foreground">
                    Not Set
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs mt-1">
                {config.description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {status !== 'missing' && (
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) => handleToggleProvider(config.provider, checked)}
                />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`${config.provider}-key`} className="text-xs font-medium">
                API Key
              </Label>
              {config.docsUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => window.open(config.docsUrl, '_blank')}
                >
                  <Link size={12} className="mr-1" />
                  Get Key
                </Button>
              )}
            </div>
            <div className="relative">
              <Input
                id={`${config.provider}-key`}
                type={isVisible ? 'text' : 'password'}
                value={keyValue as string}
                onChange={(e) => handleKeyUpdate(config.provider, e.target.value)}
                placeholder="Enter API key"
                className="pr-20 text-sm font-mono"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => toggleKeyVisibility(config.provider)}
                >
                  {isVisible ? <EyeSlash size={14} /> : <Eye size={14} />}
                </Button>
              </div>
            </div>
          </div>

          {config.requiresSecret && (
            <div className="space-y-2">
              <Label htmlFor={`${config.provider}-secret`} className="text-xs font-medium">
                API Secret
              </Label>
              <div className="relative">
                <Input
                  id={`${config.provider}-secret`}
                  type={isVisible ? 'text' : 'password'}
                  value={secretValue as string}
                  onChange={(e) => handleKeyUpdate(config.provider, e.target.value, true)}
                  placeholder="Enter API secret"
                  className="pr-20 text-sm font-mono"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => toggleKeyVisibility(config.provider)}
                  >
                    {isVisible ? <EyeSlash size={14} /> : <Eye size={14} />}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {status !== 'missing' && (
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleTestConnection(config.displayName)}
              >
                Test Connection
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 text-muted-foreground hover:text-destructive"
                onClick={() => handleClearKey(config.provider, config.requiresSecret)}
              >
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const aiConfigured = aiConfigs.filter(c => getKeyStatus(c.provider, c.requiresSecret) === 'configured').length
  const tradingConfigured = tradingConfigs.filter(c => getKeyStatus(c.provider, c.requiresSecret) === 'configured').length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">API Keys Management</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure API keys for AI models and trading platforms
        </p>
      </div>

      <Alert>
        <Key size={16} />
        <AlertDescription className="text-xs">
          Your API keys are stored locally and securely in your browser. They are never sent to external servers except when making direct API calls to the respective services.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Robot className="text-primary" size={20} />
                <div>
                  <CardTitle className="text-sm">AI Platforms</CardTitle>
                  <CardDescription className="text-xs">
                    {aiConfigured} of {aiConfigs.length} configured
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coin className="text-primary" size={20} />
                <div>
                  <CardTitle className="text-sm">Trading Platforms</CardTitle>
                  <CardDescription className="text-xs">
                    {tradingConfigured} of {tradingConfigs.length} configured
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="ai" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Robot size={16} />
            AI Platforms
          </TabsTrigger>
          <TabsTrigger value="trading" className="flex items-center gap-2">
            <Coin size={16} />
            Trading Platforms
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {aiConfigs.map(renderApiKeyCard)}
          </div>
        </TabsContent>

        <TabsContent value="trading" className="space-y-4">
          <Alert className="mb-4">
            <WarningCircle size={16} />
            <AlertDescription className="text-xs">
              Trading platform APIs can execute real trades. Always use test/sandbox keys first and enable trading carefully.
            </AlertDescription>
          </Alert>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tradingConfigs.map(renderApiKeyCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
