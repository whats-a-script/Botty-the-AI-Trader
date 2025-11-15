import { useKV } from '@github/spark/hooks'
import { ApiKeys, ApiProvider } from '@/lib/types'

export function useApiKeys() {
  const [apiKeysRaw, setApiKeysRaw] = useKV<ApiKeys>('api-keys', {})
  const apiKeys = apiKeysRaw || {}
  const setApiKeys = setApiKeysRaw

  const [enabledProvidersRaw] = useKV<Record<string, boolean>>('enabled-providers', {})
  const enabledProviders = enabledProvidersRaw || {}

  const getApiKey = (provider: ApiProvider): string | undefined => {
    return apiKeys[provider]
  }

  const getApiSecret = (provider: ApiProvider): string | undefined => {
    const secretKey = `${provider}Secret` as keyof ApiKeys
    return apiKeys[secretKey]
  }

  const isProviderEnabled = (provider: ApiProvider): boolean => {
    return enabledProviders[provider] ?? false
  }

  const isProviderConfigured = (provider: ApiProvider, requiresSecret = false): boolean => {
    const hasKey = !!apiKeys[provider]
    const hasSecret = !requiresSecret || !!getApiSecret(provider)
    return hasKey && hasSecret
  }

  const getEnabledAIProviders = (): ApiProvider[] => {
    const aiProviders: ApiProvider[] = ['openai', 'anthropic', 'gemini', 'deepseek', 'qwen']
    return aiProviders.filter(p => isProviderEnabled(p) && isProviderConfigured(p))
  }

  const getEnabledTradingProviders = (): ApiProvider[] => {
    const tradingProviders: ApiProvider[] = ['coinbase', 'binance', 'kraken', 'alpaca']
    return tradingProviders.filter(p => isProviderEnabled(p) && isProviderConfigured(p, true))
  }

  return {
    apiKeys,
    setApiKeys,
    getApiKey,
    getApiSecret,
    isProviderEnabled,
    isProviderConfigured,
    getEnabledAIProviders,
    getEnabledTradingProviders
  }
}
