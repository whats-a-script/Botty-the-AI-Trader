import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PricePoint } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateReturns(priceHistory: PricePoint[]): number {
  if (priceHistory.length < 2) return 0
  const first = priceHistory[0].price
  const last = priceHistory[priceHistory.length - 1].price
  return ((last - first) / first) * 100
}

export function formatPrice(price: number): string {
  if (price >= 1000) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  } else if (price >= 1) {
    return `$${price.toFixed(2)}`
  } else {
    return `$${price.toFixed(4)}`
  }
}
