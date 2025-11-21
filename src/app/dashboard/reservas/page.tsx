import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ReservationsManager from '@/components/dashboard/ReservationsManager'
import { getBusiness } from '@/lib/onboarding/actions'

export default async function ReservationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: business } = await getBusiness()

  return (
    <DashboardLayout
      userName={user.user_metadata?.name}
      userEmail={user.email}
    >
      <main className="p-4 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Reservas
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Gerencie as reservas do seu negócio
          </p>
        </div>

        {business?.id && <ReservationsManager businessId={business.id} />}
      </main>
    </DashboardLayout>
  )
}
