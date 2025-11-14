export class RateLimiter {
  private queue: Array<{
    reject: (error: any) =
  private processing = false
    reject: (error: any) => void
  }> = []
  private processing = false
  private lastRequestTime = 0
  constructor(
  private maxRetries: number
  private retryDelay: number

    this.maxRe
    minDelay: number = 1000,

    retryDelay: number = 2000
     
    this.minDelay = minDelay
    this.maxRetries = maxRetries
    this.retryDelay = retryDelay
   

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject })
      this.processQueue()
      
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return

          }

      if (lastError) {
      }

  }
  private delay(ms: number): Promise<void> {
  }
  getQueueLength(): number {
  }












































