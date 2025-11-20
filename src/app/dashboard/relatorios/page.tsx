import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ReportsManager from '@/components/dashboard/ReportsManager'
import { getBusiness } from '@/lib/onboarding/actions'

export default async function ReportsPage() {
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
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Relatórios
          </h1>
          <p className="text-zinc-400">
            Análise detalhada do desempenho do seu negócio
          </p>
        </div>

        <ReportsManager />
      </main>
    </DashboardLayout>
  )
}
