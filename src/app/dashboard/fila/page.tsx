import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import QueueManager from '@/components/dashboard/QueueManager'
import { getBusiness } from '@/lib/onboarding/actions'

export default async function QueuePage() {
  console.time('[FILA] Total page load')

  console.time('[FILA] Create supabase client')
  const supabase = await createClient()
  console.timeEnd('[FILA] Create supabase client')

  console.time('[FILA] Get user')
  const { data: { user } } = await supabase.auth.getUser()
  console.timeEnd('[FILA] Get user')

  if (!user) {
    redirect('/auth')
  }

  console.time('[FILA] Get business')
  const { data: business } = await getBusiness()
  console.timeEnd('[FILA] Get business')

  console.timeEnd('[FILA] Total page load')

  return (
    <DashboardLayout
      userName={user.user_metadata?.name}
      userEmail={user.email}
    >
      <main className="p-4 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Fila
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Gerencie a fila de atendimento em tempo real
          </p>
        </div>

        {business?.id && <QueueManager businessId={business.id} />}
      </main>
    </DashboardLayout>
  )
}
