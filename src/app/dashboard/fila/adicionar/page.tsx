import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AddToQueueForm from '@/components/dashboard/AddToQueueForm'
import { getBusiness } from '@/lib/onboarding/actions'

export default async function AddToQueuePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: business } = await getBusiness()

  if (!business) {
    redirect('/onboarding')
  }

  return (
    <DashboardLayout
      userName={user.user_metadata?.name}
      userEmail={user.email}
    >
      <main className="p-4 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Adicionar Cliente
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Adicione um cliente manualmente na fila
          </p>
        </div>

        <div className="max-w-lg">
          <AddToQueueForm businessId={business.id} />
        </div>
      </main>
    </DashboardLayout>
  )
}
