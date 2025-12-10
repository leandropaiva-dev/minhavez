import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ReservationFormWrapper from '@/components/reservation/ReservationFormWrapper'
import CustomizedPageWrapper from '@/components/public/CustomizedPageWrapper'
import PageTracker from '@/components/analytics/PageTracker'

export default async function ReservationPage({
  params,
}: {
  params: Promise<{ businessId: string }>
}) {
  const { businessId } = await params
  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single()

  if (!business) {
    notFound()
  }

  // Verifica se as reservas estão abertas (toggle manual)
  const isReservationOpen = business.is_reservation_open ?? true

  // Verifica se está dentro do horário configurado
  const now = new Date()
  const { data: isTimeOpen } = await supabase
    .rpc('is_reservation_time_open', {
      p_business_id: businessId,
      p_datetime: now.toISOString()
    })

  const isOpenBySchedule = isTimeOpen ?? true // Se não tem horário configurado, está aberto
  const isTotallyOpen = isReservationOpen && isOpenBySchedule

  return (
    <CustomizedPageWrapper
      businessId={businessId}
      pageType="reservation_form"
      businessName={business.name}
    >
      <PageTracker businessId={businessId} pageType="reservation" pagePath={`/reserva/${businessId}`} />
      {/* Reservation Form Card */}
      <div className="rounded-2xl p-6 sm:p-8" style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        borderWidth: '1px',
        borderRadius: 'var(--card-radius)',
      }}>
        <div className="flex items-center gap-3 mb-6 pb-6" style={{
          borderBottom: '1px solid var(--card-border)',
        }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
            backgroundColor: 'var(--primary-color)',
            opacity: 0.2,
          }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{
              color: 'var(--primary-color)',
            }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>
              {isTotallyOpen ? 'Fazer Reserva' : 'Reservas Fechadas'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-color)', opacity: 0.6 }}>
              {isTotallyOpen ? 'Preencha os dados abaixo' : !isReservationOpen ? 'As reservas estão temporariamente fechadas' : 'Fora do horário de atendimento'}
            </p>
          </div>
        </div>

        {isTotallyOpen ? (
          <ReservationFormWrapper businessId={businessId} businessName={business.name} />
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
            }}>
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#ef4444' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
              {!isReservationOpen ? 'Reservas temporariamente fechadas' : 'Fora do horário de atendimento'}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-color)', opacity: 0.6 }}>
              {!isReservationOpen ? 'As reservas serão reabertas em breve. Tente novamente mais tarde.' : 'Volte durante o horário de funcionamento para fazer uma reserva.'}
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <p className="text-center text-xs mt-6" style={{ color: 'var(--text-color)', opacity: 0.5 }}>
        {isTotallyOpen ? 'Ao fazer uma reserva, você concorda com nossos termos de uso.' : 'Entre em contato para mais informações.'}
      </p>
    </CustomizedPageWrapper>
  )
}
