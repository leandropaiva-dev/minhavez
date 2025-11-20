import { NextRequest, NextResponse } from 'next/server'
import { joinQueue } from '@/lib/queue/actions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = await joinQueue({
      businessId: body.businessId,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail,
      partySize: body.partySize,
      notes: body.notes,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ data: result.data }, { status: 200 })
  } catch (error) {
    console.error('Error joining queue:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
