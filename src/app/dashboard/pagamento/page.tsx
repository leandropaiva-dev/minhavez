import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import PaymentManager from '@/components/dashboard/PaymentManager'
import { getBusiness } from '@/lib/onboarding/actions'

export default async function PaymentPage() {
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
            Pagamento
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Gerencie sua assinatura e pagamentos
          </p>
        </div>

        <PaymentManager
          subscriptionStatus={business?.subscription_status || 'trial'}
          trialEndsAt={business?.trial_ends_at || null}
          stripeCustomerId={business?.stripe_customer_id || null}
        />
      </main>
    </DashboardLayout>
  )
}
