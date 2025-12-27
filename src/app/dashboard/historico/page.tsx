import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import HistoryManager from '@/components/dashboard/HistoryManager'
import { getBusiness } from '@/lib/onboarding/actions'

export default async function HistoryPage() {
  console.time('[HISTORICO] Total page load')

  console.time('[HISTORICO] Create supabase client')
  const supabase = await createClient()
  console.timeEnd('[HISTORICO] Create supabase client')

  console.time('[HISTORICO] Get user')
  const { data: { user } } = await supabase.auth.getUser()
  console.timeEnd('[HISTORICO] Get user')

  if (!user) {
    redirect('/auth')
  }

  console.time('[HISTORICO] Get business')
  const { data: business } = await getBusiness()
  console.timeEnd('[HISTORICO] Get business')

  console.timeEnd('[HISTORICO] Total page load')

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
