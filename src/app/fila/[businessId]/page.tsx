import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import QueueFormWrapper from '@/components/queue/QueueFormWrapper'
import CustomizedPageWrapper from '@/components/public/CustomizedPageWrapper'

interface PageProps {
  params: Promise<{
    businessId: string
  }>
}

export default async function QueuePage({ params }: PageProps) {
  const { businessId } = await params
  const supabase = await createClient()

  // Busca informações do negócio
  const { data: business, error } = await supabase
    .from('businesses')
    .select('id, name, business_type, address')
    .eq('id', businessId)
    .single()

  if (error || !business) {
    notFound()
  }

  // Conta quantas pessoas na fila
  const { count } = await supabase
    .from('queue_entries')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('status', 'waiting')

  const queueLength = count || 0
  const estimatedWaitTime = queueLength * 15 // 15 min por pessoa

  return (
    <CustomizedPageWrapper
      businessId={businessId}
      pageType="queue_form"
      businessName={business.name}
    >
      {/* Queue Status Card */}
      <div className="rounded-2xl p-6 mb-6" style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        borderWidth: '1px',
        borderRadius: 'var(--card-radius)',
      }}>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-xl" style={{
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}>
            <p className="text-sm mb-1" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
              Pessoas na fila
            </p>
            <p className="text-4xl font-bold" style={{ color: 'var(--text-color)' }}>
              {queueLength}
            </p>
          </div>
          <div className="text-center p-4 rounded-xl" style={{
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}>
            <p className="text-sm mb-1" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
              Tempo estimado
            </p>
            <p className="text-4xl font-bold" style={{ color: 'var(--primary-color)' }}>
              {estimatedWaitTime}<span className="text-lg">min</span>
            </p>
          </div>
        </div>
      </div>

      {/* Join Queue Form Card */}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>
              Entrar na Fila
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-color)', opacity: 0.6 }}>
              Preencha seus dados abaixo
            </p>
          </div>
        </div>

        <QueueFormWrapper businessId={businessId} businessName={business.name} />
      </div>

      {/* Footer Info */}
      <p className="text-center text-xs mt-6" style={{ color: 'var(--text-color)', opacity: 0.5 }}>
        Você receberá atualizações sobre sua posição na fila.
      </p>
    </CustomizedPageWrapper>
  )
}
