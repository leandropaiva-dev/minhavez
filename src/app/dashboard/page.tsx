import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import MetricCard from '@/components/dashboard/MetricCard'
import MonthlyChart from '@/components/dashboard/MonthlyChart'
import MonthlyTarget from '@/components/dashboard/MonthlyTarget'
import RecentQueue from '@/components/dashboard/RecentQueue'
import { getBusiness } from '@/lib/onboarding/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: business } = await getBusiness()

  return (
    <DashboardLayout
      businessName={business?.name}
      userName={user.user_metadata?.name}
      userEmail={user.email}
    >
      <main className="p-4 lg:p-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6">
          <MetricCard
            title="Fila Atual"
            value={5}
            iconName="users"
            trend={{ value: 11.01, isPositive: true }}
            subtitle="clientes esperando"
          />
          <MetricCard
            title="Atendidos Hoje"
            value={23}
            iconName="clock"
            trend={{ value: 9.05, isPositive: false }}
            subtitle="clientes atendidos"
          />
          <MetricCard
            title="Tempo Médio"
            value="15min"
            iconName="trending-up"
            trend={{ value: 5.2, isPositive: true }}
            subtitle="tempo de espera"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
          <div className="lg:col-span-2">
            <MonthlyChart />
          </div>
          <div>
            <MonthlyTarget
              percentage={75.55}
              target={20000}
              revenue={20000}
              today={3287}
            />
          </div>
        </div>

        {/* Recent Queue Table */}
        <RecentQueue />
      </main>
    </DashboardLayout>
  )
}
