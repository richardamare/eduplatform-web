import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Duration, Effect, Random } from 'effect'
import type { ClassValue } from 'clsx'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export const randomDelay = Effect.gen(function* () {
  const delay = yield* Random.nextIntBetween(1000, 3000)
  yield* Effect.sleep(Duration.millis(delay))
})

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
