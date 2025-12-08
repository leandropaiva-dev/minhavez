import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ConfigurationsTabs from '@/components/dashboard/ConfigurationsTabs'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Get user's business
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!business) {
    redirect('/dashboard')
  }

  return (
    <DashboardLayout
      userName={user.user_metadata?.name}
      userEmail={user.email}
    >
      <main className="p-4 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Configurações de Formulários
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Personalize os formulários de fila e reserva
          </p>
        </div>

        <ConfigurationsTabs businessId={business.id} />
      </main>
    </DashboardLayout>
  )
}
