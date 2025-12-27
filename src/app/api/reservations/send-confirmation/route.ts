import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { getReservationConfirmationHTML } from '@/lib/email/templates/reservation-confirmation-html'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { reservationId } = await request.json()
    console.log('[Email API] Recebido reservationId:', reservationId)

    if (!reservationId) {
      return NextResponse.json(
        { error: 'reservationId é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    console.log('[Email API] Supabase client criado')

    // Buscar dados da reserva e customização da página
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .select(`
        *,
        businesses (
          id,
          name,
          user_id
        )
      `)
      .eq('id', reservationId)
      .single()

    if (reservationError || !reservation) {
      return NextResponse.json(
        { error: 'Reserva não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o usuário é dono do negócio
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || reservation.businesses.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      )
    }

    // Verificar se tem email
    if (!reservation.customer_email) {
      return NextResponse.json(
        { error: 'Reserva não possui email cadastrado' },
        { status: 400 }
      )
    }

    // Buscar logo do negócio
    const { data: customization } = await supabase
      .from('page_customizations')
      .select('logo_url')
      .eq('business_id', reservation.businesses.id)
      .eq('page_type', 'reservation_form')
      .single()

    // Formatar data e hora
    const reservationDate = new Date(reservation.reservation_date)
    const formattedDate = reservationDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const formattedTime = reservation.reservation_time || 'A confirmar'

    // Gerar HTML do email
    console.log('[Email API] Preparando envio para:', reservation.customer_email)

    const emailHtml = getReservationConfirmationHTML({
      customerName: reservation.customer_name,
      businessName: reservation.businesses.name,
      reservationDate: formattedDate,
      reservationTime: formattedTime,
      partySize: reservation.party_size || undefined,
      notes: reservation.notes || undefined,
      logoUrl: customization?.logo_url || undefined,
    })

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'MinhaVez <noreply@resend.dev>',
      to: reservation.customer_email,
      subject: `Reserva Confirmada - ${reservation.businesses.name}`,
      html: emailHtml,
    })

    if (emailError) {
      console.error('[Email API] Erro ao enviar email:', emailError)
      return NextResponse.json(
        { error: 'Erro ao enviar email', details: emailError },
        { status: 500 }
      )
    }

    console.log('[Email API] Email enviado com sucesso:', emailData?.id)

    return NextResponse.json({
      success: true,
      emailId: emailData?.id,
      message: 'Email de confirmação enviado com sucesso',
    })
  } catch (error) {
    console.error('[Email API] Erro na API de confirmação:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
