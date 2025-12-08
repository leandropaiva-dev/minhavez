/**
 * ✅ SECURITY: CSRF Protection for API Routes
 * Validates origin and referer headers to prevent cross-site request forgery
 */

import { NextRequest } from 'next/server'

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  'https://*.vercel.app', // For preview deployments
]

/**
 * Validate CSRF token/origin for state-changing requests
 * @param request - Next.js request
 * @returns true if valid, false if potential CSRF attack
 */
export function validateCSRF(request: NextRequest): boolean {
  // Only validate state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    return true
  }

  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')

  // Check Origin header (most reliable)
  if (origin) {
    const originUrl = new URL(origin)
    const requestHost = host || request.nextUrl.host

    // Must match request host
    if (originUrl.host !== requestHost) {
      // Check if matches allowed patterns
      const isAllowed = ALLOWED_ORIGINS.some((allowed) => {
        if (allowed.includes('*')) {
          const pattern = allowed.replace('*.', '')
          return originUrl.host.endsWith(pattern)
        }
        return new URL(allowed).host === originUrl.host
      })

      if (!isAllowed) {
        console.warn('[CSRF] Invalid origin:', origin, 'expected:', host)
        return false
      }
    }
  }

  // Fallback to Referer if Origin not present
  if (!origin && referer) {
    const refererUrl = new URL(referer)
    const requestHost = host || request.nextUrl.host

    if (refererUrl.host !== requestHost) {
      console.warn('[CSRF] Invalid referer:', referer, 'expected:', host)
      return false
    }
  }

  // If neither Origin nor Referer, reject (potential attack)
  if (!origin && !referer) {
    console.warn('[CSRF] Missing both origin and referer headers')
    return false
  }

  return true
}

/**
 * Middleware wrapper for CSRF validation
 */
export function withCSRFProtection<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<Response> | Response
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    if (!validateCSRF(request)) {
      return new Response(
        JSON.stringify({ error: 'CSRF validation failed' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return handler(request, ...args)
  }
}
