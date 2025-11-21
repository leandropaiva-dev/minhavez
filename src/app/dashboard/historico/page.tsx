import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import HistoryManager from '@/components/dashboard/HistoryManager'
import { getBusiness } from '@/lib/onboarding/actions'

export default async function HistoryPage() {
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
            Histórico
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Consulte o histórico de atendimentos da fila e reservas
          </p>
        </div>

        <HistoryManager businessId={business?.id || ''} />
      </main>
    </DashboardLayout>
  )
}
