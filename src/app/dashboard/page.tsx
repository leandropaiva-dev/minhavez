import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import MetricCard from '@/components/dashboard/MetricCard'
import MonthlyChart from '@/components/dashboard/MonthlyChart'
import MonthlyTarget from '@/components/dashboard/MonthlyTarget'
import RecentQueue from '@/components/dashboard/RecentQueue'
import QRCodeCard from '@/components/dashboard/QRCodeCard'
import { getBusiness } from '@/lib/onboarding/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: business } = await getBusiness()

  // Buscar dados reais da fila
  let queueStats = {
    currentQueue: 0,
    todayAttended: 0,
    avgWaitTime: 0,
  }

  if (business?.id) {
    // Fila atual (pessoas esperando)
    const { count: currentQueue } = await supabase
      .from('queue_entries')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id)
      .eq('status', 'waiting')

    // Atendidos hoje
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count: todayAttended } = await supabase
      .from('queue_entries')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id)
      .in('status', ['completed', 'attending'])
      .gte('joined_at', today.toISOString())

    // Tempo médio de espera (calculado baseado em entradas concluídas hoje)
    const { data: completedToday } = await supabase
      .from('queue_entries')
      .select('joined_at, attended_at')
      .eq('business_id', business.id)
      .eq('status', 'completed')
      .gte('joined_at', today.toISOString())
      .not('attended_at', 'is', null)

    let avgWaitTime = 15 // padrão
    if (completedToday && completedToday.length > 0) {
      const totalWaitMinutes = completedToday.reduce((sum, entry) => {
        const joined = new Date(entry.joined_at).getTime()
        const attended = new Date(entry.attended_at!).getTime()
        return sum + (attended - joined) / 60000 // converter para minutos
      }, 0)
      avgWaitTime = Math.round(totalWaitMinutes / completedToday.length)
    }

    queueStats = {
      currentQueue: currentQueue || 0,
      todayAttended: todayAttended || 0,
      avgWaitTime,
    }
  }

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
            value={queueStats.currentQueue}
            iconName="users"
            subtitle="clientes esperando"
          />
          <MetricCard
            title="Atendidos Hoje"
            value={queueStats.todayAttended}
            iconName="clock"
            subtitle="clientes atendidos"
          />
          <MetricCard
            title="Tempo Médio"
            value={`${queueStats.avgWaitTime}min`}
            iconName="trending-up"
            subtitle="tempo de espera"
          />
        </div>

        {/* Charts and QR Code Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
          <div className="lg:col-span-2">
            <MonthlyChart />
          </div>
          <div className="space-y-4 lg:space-y-6">
            <MonthlyTarget
              percentage={75.55}
              target={20000}
              revenue={20000}
              today={3287}
            />
            {business?.id && (
              <QRCodeCard
                businessId={business.id}
                businessName={business.name || 'Meu Negócio'}
              />
            )}
          </div>
        </div>

        {/* Recent Queue Table */}
        {business?.id && (
          await (async () => {
            const { data: queueEntries } = await supabase
              .from('queue_entries')
              .select('id, customer_name, customer_phone, position, joined_at, status')
              .eq('business_id', business.id)
              .eq('status', 'waiting')
              .order('position', { ascending: true })
              .limit(10)

            return <RecentQueue entries={queueEntries || []} />
          })()
        )}
      </main>
    </DashboardLayout>
  )
}
