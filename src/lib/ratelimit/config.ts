/**
 * ✅ SECURITY: Rate limiting configuration
 * Protects against brute force, DDoS, and abuse
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Redis client (will use env vars UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

/**
 * Rate limiter for authentication endpoints (login, signup)
 * Limit: 5 requests per minute per IP
 */
export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
      prefix: 'ratelimit:auth',
    })
  : null

/**
 * Rate limiter for public API endpoints (queue join, reservations)
 * Limit: 10 requests per minute per IP
 */
export const publicApiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: 'ratelimit:public',
    })
  : null

/**
 * Rate limiter for coupon redemption
 * Limit: 3 requests per minute per user
 */
export const couponRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 m'),
      analytics: true,
      prefix: 'ratelimit:coupon',
    })
  : null

/**
 * Helper to get client IP from request
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    '127.0.0.1'
  )
}

/**
 * Check rate limit and return appropriate response
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit | null
): Promise<{ success: boolean; error?: string; remaining?: number }> {
  // If rate limiting is not configured, allow all requests (dev mode)
  if (!limiter) {
    return { success: true }
  }

  const { success, remaining } = await limiter.limit(identifier)

  if (!success) {
    return {
      success: false,
      error: 'Muitas requisições. Tente novamente em alguns minutos.',
      remaining: 0,
    }
  }

  return { success: true, remaining }
}
