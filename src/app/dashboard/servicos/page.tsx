import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ServicesManager from '@/components/dashboard/ServicesManager'
import { getBusiness } from '@/lib/onboarding/actions'

export default async function ServicesPage() {
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
            Serviços
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Gerencie os serviços oferecidos pelo seu negócio
          </p>
        </div>

        <ServicesManager businessId={business.id} />
      </main>
    </DashboardLayout>
  )
}
