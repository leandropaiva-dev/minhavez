import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ReservationFormWrapper from '@/components/reservation/ReservationFormWrapper'
import CustomizedPageWrapper from '@/components/public/CustomizedPageWrapper'

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

  return (
    <CustomizedPageWrapper
      businessId={businessId}
      pageType="reservation_form"
      businessName={business.name}
    >
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
              Fazer Reserva
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-color)', opacity: 0.6 }}>
              Preencha os dados abaixo
            </p>
          </div>
        </div>

        <ReservationFormWrapper businessId={businessId} businessName={business.name} />
      </div>

      {/* Footer Info */}
      <p className="text-center text-xs mt-6" style={{ color: 'var(--text-color)', opacity: 0.5 }}>
        Ao fazer uma reserva, você concorda com nossos termos de uso.
      </p>
    </CustomizedPageWrapper>
  )
}
