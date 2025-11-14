export class RateLimiter {
  private queue: Array<{
    fn: () => Promise<any>
    resolve: (value: any) => void
    reject: (error: any) => void
  }> = []
  private processing = false
  private lastRequestTime = 0

  constructor(
    private minDelay: number = 1000,
    private maxRetries: number = 3,
    private retryDelay: number = 2000
  ) {}

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
      const item = this.queue.shift()
      if (!item) break

      const now = Date.now()
      const timeSinceLastRequest = now - this.lastRequestTime
      if (timeSinceLastRequest < this.minDelay) {
        await this.delay(this.minDelay - timeSinceLastRequest)
      }

      let lastError: any = null
      for (let attempt = 0; attempt < this.maxRetries; attempt++) {
        try {
          this.lastRequestTime = Date.now()
          const result = await item.fn()
          item.resolve(result)
          lastError = null
          break
        } catch (error: any) {
          lastError = error
          if (error?.message?.includes('429') && attempt < this.maxRetries - 1) {
            await this.delay(this.retryDelay * (attempt + 1))
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

const llmRateLimiterInstance = new RateLimiter(1000, 3, 2000)

export { llmRateLimiterInstance as llmRateLimiter }
