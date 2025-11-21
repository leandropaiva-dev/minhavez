import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ReservationForm from '@/components/public/ReservationForm'

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
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-2">
            {business.name}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Faça sua reserva
          </p>
        </div>

        {/* Reservation Form */}
        <ReservationForm businessId={business.id} />
      </div>
    </div>
  )
}
