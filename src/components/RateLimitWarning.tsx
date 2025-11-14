import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Clock, Info } from '@phosphor-icons/react'

interface RateLimitWarningProps {
  show: boolean
}

export function RateLimitWarning({ show }: RateLimitWarningProps) {
  if (!show) return null

  return (
    <Alert className="mb-4 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
      <Clock className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-200">Rate Limit Active</AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-300">
        The AI agents are being rate-limited to prevent overloading the system. 
        Requests are automatically queued and retried. Please wait 30-60 seconds between large operations.
      </AlertDescription>
    </Alert>
  )
}

interface RateLimitInfoProps {
  className?: string
}

export function RateLimitInfo({ className = '' }: RateLimitInfoProps) {
  return (
    <div className={`text-xs text-muted-foreground flex items-center gap-1 ${className}`}>
      <Info size={12} />
      <span>Rate limiting active: max 1 request per 1.5 seconds</span>
    </div>
  )
}
