export class RateLimiter {
  private queue: Array<{
    fn: () => Promise<any>
    resolve: (value: any) => void
    reject: (error: any) => void
  }> = []
  private processing = false
  private lastRequestTime = 0
  private minDelay: number
  private maxRetries: number
  private retryDelay: number

  constructor(
    minDelay: number = 1000,
    maxRetries: number = 3,
    retryDelay: number = 2000
  ) {
    this.minDelay = minDelay
    this.maxRetries = maxRetries
    this.retryDelay = retryDelay
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject })
      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return

    this.processing = true

    while (this.queue.length > 0) {
      const item = this.queue.shift()!
      
      const now = Date.now()
      const timeSinceLastRequest = now - this.lastRequestTime
      if (timeSinceLastRequest < this.minDelay) {
        await this.delay(this.minDelay - timeSinceLastRequest)
      }

      this.lastRequestTime = Date.now()

      let lastError: any
      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        try {
          const result = await item.fn()
          item.resolve(result)
          lastError = null
          break
        } catch (error: any) {
          lastError = error
          
          if (error?.message?.includes('429') || error?.message?.includes('rate limit')) {
            const backoffDelay = this.retryDelay * Math.pow(2, attempt)
            console.warn(`Rate limit hit, retrying in ${backoffDelay}ms (attempt ${attempt + 1}/${this.maxRetries + 1})`)
            
            if (attempt < this.maxRetries) {
              await this.delay(backoffDelay)
            }
          } else {
            break
          }
        }
      }

      if (lastError) {
        item.reject(lastError)
      }
    }

    this.processing = false
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  getQueueLength(): number {
    return this.queue.length
  }
}

export const llmRateLimiter = new RateLimiter(1500, 3, 3000)
