import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ReservationFormWrapper from '@/components/reservation/ReservationFormWrapper'
import Link from 'next/link'

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

          {/* Reservation Form Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-zinc-800">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Fazer Reserva</h2>
                <p className="text-sm text-zinc-400">Preencha os dados abaixo</p>
              </div>
            </div>

            <ReservationFormWrapper businessId={businessId} businessName={business.name} />
          </div>

          {/* Footer Info */}
          <p className="text-center text-xs text-zinc-500 mt-6">
            Ao fazer uma reserva, você concorda com nossos termos de uso.
          </p>
        </div>
      </main>
    </div>
  )
}
