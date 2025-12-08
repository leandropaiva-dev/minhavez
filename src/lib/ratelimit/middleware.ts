/**
 * ✅ SECURITY: Rate limiting middleware for API routes with exponential backoff
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from './config'
import type { Ratelimit } from '@upstash/ratelimit'

/**
 * Calculate exponential backoff retry-after time
 * @param attemptCount - Number of failed attempts
 * @returns Seconds to wait
 */
function calculateRetryAfter(attemptCount: number): number {
  // Exponential backoff: 60s, 120s, 240s, 480s (max 8 minutes)
  const base = 60
  const maxWait = 480
  const calculated = base * Math.pow(2, Math.min(attemptCount, 3))
  return Math.min(calculated, maxWait)
}

/**
 * Apply rate limiting to API route with exponential backoff
 * @param request - Next.js request
 * @param limiter - Rate limiter instance
 * @param identifier - Custom identifier (default: IP address)
 */
export async function withRateLimit(
  request: NextRequest,
  limiter: Ratelimit | null,
  identifier?: string
): Promise<NextResponse | null> {
  const id = identifier || getClientIp(request.headers)

  const result = await checkRateLimit(id, limiter)

  if (!result.success) {
    // Get attempt count from limiter (if available) or default to 1
    const attemptCount = result.remaining !== undefined ? Math.abs(result.remaining) : 1
    const retryAfter = calculateRetryAfter(attemptCount)

    return NextResponse.json(
      {
        error: result.error,
        retryAfter: retryAfter,
        message: `Tente novamente em ${retryAfter} segundos`,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Reset': new Date(Date.now() + retryAfter * 1000).toISOString(),
        },
      }
    )
  }

  // Return null to continue processing
  return null
}
