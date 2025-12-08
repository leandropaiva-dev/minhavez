/**
 * ✅ SECURITY: Timing attack protection
 * Prevents attackers from learning information through response time differences
 */

/**
 * Constant-time string comparison
 * Prevents timing attacks when comparing secrets/tokens
 * @param a - First string
 * @param b - Second string
 * @returns true if equal, false otherwise
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false
  }

  // Always compare full length to prevent length leaking
  const length = Math.max(a.length, b.length)
  let result = a.length === b.length ? 0 : 1

  for (let i = 0; i < length; i++) {
    const aChar = i < a.length ? a.charCodeAt(i) : 0
    const bChar = i < b.length ? b.charCodeAt(i) : 0
    result |= aChar ^ bChar
  }

  return result === 0
}

/**
 * Add artificial delay to prevent timing attacks on authentication
 * Makes response time consistent regardless of success/failure
 * @param minMs - Minimum delay in milliseconds (default: 100ms)
 */
export async function addConstantDelay(minMs: number = 100): Promise<void> {
  const delay = Math.random() * 50 + minMs // Add 100-150ms random delay
  await new Promise((resolve) => setTimeout(resolve, delay))
}

/**
 * Execute function with constant timing
 * Useful for login/authentication to prevent timing attacks
 * @param fn - Async function to execute
 * @param minMs - Minimum time in milliseconds
 */
export async function withConstantTiming<T>(
  fn: () => Promise<T>,
  minMs: number = 200
): Promise<T> {
  const start = Date.now()

  try {
    const result = await fn()
    const elapsed = Date.now() - start
    const remaining = minMs - elapsed

    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining))
    }

    return result
  } catch (error) {
    const elapsed = Date.now() - start
    const remaining = minMs - elapsed

    // Even on error, wait the full time to prevent timing leaks
    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining))
    }

    throw error
  }
}

/**
 * Generate cryptographically secure random string
 * @param length - Length of string
 * @returns Random string
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    // Fallback for Node.js
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeCrypto = require('crypto')
    nodeCrypto.randomFillSync(array)
  }

  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}
