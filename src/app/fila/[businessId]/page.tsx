import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import QueueFormWrapper from '@/components/queue/QueueFormWrapper'
import Link from 'next/link'

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
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors text-sm">
            ← Voltar
          </Link>
          <span className="text-xs text-zinc-500">Powered by MinhaVez</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-lg">
          {/* Business Info */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
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

          {/* Queue Status Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-zinc-950 rounded-xl">
                <p className="text-sm text-zinc-400 mb-1">Pessoas na fila</p>
                <p className="text-4xl font-bold text-white">{queueLength}</p>
              </div>
              <div className="text-center p-4 bg-zinc-950 rounded-xl">
                <p className="text-sm text-zinc-400 mb-1">Tempo estimado</p>
                <p className="text-4xl font-bold text-blue-500">{estimatedWaitTime}<span className="text-lg">min</span></p>
              </div>
            </div>
          </div>

          {/* Join Queue Form Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-zinc-800">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Entrar na Fila</h2>
                <p className="text-sm text-zinc-400">Preencha seus dados abaixo</p>
              </div>
            </div>

            <QueueFormWrapper businessId={businessId} businessName={business.name} />
          </div>

          {/* Footer Info */}
          <p className="text-center text-xs text-zinc-500 mt-6">
            Você receberá atualizações sobre sua posição na fila.
          </p>
        </div>
      </main>
    </div>
  )
}
