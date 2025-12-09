import { NextRequest, NextResponse } from 'next/server'
import { joinQueue } from '@/lib/queue/actions'
import { withRateLimit } from '@/lib/ratelimit/middleware'
import { publicApiRateLimiter } from '@/lib/ratelimit/config'
import { validateContentType, validateBodySize, sanitizeObject } from '@/lib/security/validation'
import { logger } from '@/lib/security/logger'

export async function POST(request: NextRequest) {
  // ✅ SECURITY: Validate Content-Type
  if (!validateContentType(request)) {
    return NextResponse.json(
      { error: 'Content-Type deve ser application/json' },
      { status: 415 }
    )
  }

  // ✅ SECURITY: Validate body size (max 1MB)
  if (!validateBodySize(request, 1024 * 1024)) {
    return NextResponse.json(
      { error: 'Requisição muito grande' },
      { status: 413 }
    )
  }

  // ✅ SECURITY: Apply rate limiting
  const rateLimitResponse = await withRateLimit(request, publicApiRateLimiter)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const rawBody = await request.json()

    // ✅ SECURITY: Sanitize input
    const body = sanitizeObject(rawBody)

    const result = await joinQueue({
      businessId: body.businessId,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail,
      partySize: body.partySize,
      notes: body.notes,
      selectedService: body.selectedService,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ data: result.data }, { status: 200 })
  } catch (error) {
    logger.error('Error joining queue', error, { path: request.nextUrl.pathname })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
