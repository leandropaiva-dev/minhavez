import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import QueueFormWrapper from '@/components/queue/QueueFormWrapper'

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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {business.name}
          </h1>
          <p className="text-zinc-400">
            {business.business_type && (
              <span className="capitalize">{business.business_type}</span>
            )}
            {business.address && (
              <span className="block text-sm mt-1">{business.address}</span>
            )}
          </p>
        </div>

        {/* Queue Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Pessoas na fila</p>
              <p className="text-3xl font-bold text-white">{queueLength}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-400">Tempo estimado</p>
              <p className="text-3xl font-bold text-blue-500">
                {estimatedWaitTime}min
              </p>
            </div>
          </div>
        </div>

        {/* Join Queue Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Entrar na Fila</h2>
          <QueueFormWrapper businessId={businessId} businessName={business.name} />
        </div>
      </div>
    </div>
  )
}
